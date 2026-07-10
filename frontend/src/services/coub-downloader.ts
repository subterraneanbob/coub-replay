import { corsProxyGet } from "./cors-proxy";

/**
 * Extracted Coub data.
 */
type CoubData = {
  permalink: string;
  url: string;
  title: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  video: Blob;
  audio: Blob;
};

/**
 * Coub metadata object returned by https://coub.com/api/v2/coubs/{id} endpoint.
 */
type CoubApiMetadataResponse = {
  permalink?: string;
  title?: string;
  channel?: { title?: string };
  created_at?: string;
  updated_at?: string;
  file_versions?: {
    html5?: {
      audio?: { high?: { url?: string }; med?: { url?: string } };
      video?: { high?: { url?: string }; med?: { url?: string } };
    };
  };
};

type HttpGet = (url: string) => Promise<Response>;
type DownloadCoubData = (url: string) => Promise<CoubData>;

/**
 * Extract Coub permalink from user inputs:
 * - URLs like `https://coub.com/view/abc123`
 * - permalinks (short codes) like `abc123`
 *
 * @returns Coub permalink or an empty string when input is invalid.
 */
function extractCoubPermalink(inputUrl: string): string {
  const URL_PREFIX = "https://coub.com/view/";
  const PERMALINK_PATTERN = /^[a-z0-9]{5,}$/;

  let permalink = inputUrl.toLowerCase();

  // Remove URL prefix
  if (permalink.startsWith(URL_PREFIX)) {
    permalink = permalink.slice(URL_PREFIX.length);
  }

  if (!PERMALINK_PATTERN.test(permalink)) {
    return "";
  }

  return permalink;
}

/**
 * Creates a downloader function that retrieves Coub metadata and video/audio tracks data.
 *
 * @param get An HTTP GET implementation. Useful when direct fetch fails with CORS errors.
 * @returns Downloader function that extracts Coub data.
 */
function createDownloader(get: HttpGet): DownloadCoubData {
  async function downloadMetadata(
    coubUrl: string,
  ): Promise<CoubApiMetadataResponse> {
    const permalink = extractCoubPermalink(coubUrl);

    if (!permalink) {
      throw new Error(`Invalid Coub URL: ${coubUrl}`);
    }

    const metadataUrl = `https://coub.com/api/v2/coubs/${encodeURIComponent(permalink)}`;

    const response = await get(metadataUrl);

    if (response.status === 404) {
      throw new Error("Coub not found.");
    }

    if (!response.ok) {
      throw new Error(
        `Coub API error: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }

  async function downloadMedia(
    coubMetadata: CoubApiMetadataResponse,
    type: "video" | "audio",
  ): Promise<Blob> {
    const media = coubMetadata.file_versions?.html5?.[type];
    const mediaUrl = media?.high?.url || media?.med?.url;

    if (!mediaUrl) {
      throw new Error("No video URL available.");
    }

    const response = await get(mediaUrl);

    if (!response.ok) {
      throw new Error(
        `Error downloading ${type}: ${response.status} ${response.statusText}`,
      );
    }

    return await response.blob();
  }

  async function downloadCoubData(coubUrl: string): Promise<CoubData> {
    const coubMetadata = await downloadMetadata(coubUrl);
    const video = await downloadMedia(coubMetadata, "video");
    const audio = await downloadMedia(coubMetadata, "audio");

    const permalink = coubMetadata.permalink || extractCoubPermalink(coubUrl);

    return {
      permalink,
      url: `https://coub.com/view/${encodeURIComponent(permalink)}`,
      title: coubMetadata.title || "Untitled Coub",
      author: coubMetadata.channel?.title || "Unknown Channel",
      createdAt: new Date(coubMetadata.created_at || NaN),
      updatedAt: new Date(coubMetadata.updated_at || NaN),
      video,
      audio,
    };
  }

  return downloadCoubData;
}

let downloader: DownloadCoubData;

if (window.saucer) {
  // Local CORS proxy (Saucer integration)
  downloader = createDownloader(corsProxyGet);
} else if (import.meta.env.VITE_PROXY_URL) {
  // CORS proxy public URL provided via environment variables
  downloader = createDownloader((url) => {
    return fetch(
      `${import.meta.env.VITE_PROXY_URL}?url=${encodeURIComponent(url)}`,
    );
  });
}

async function downloadCoub(permalink: string): Promise<CoubData> {
  if (!downloader) {
    throw new Error(
      "No suitable CORS proxy is configured. Cannot download Coub.",
    );
  }

  try {
    return await downloader(permalink);
  } catch (err) {
    if (err instanceof Error && err.name == "TimeoutError") {
      throw new Error("Request timed out.");
    }

    throw err;
  }
}

export { extractCoubPermalink, downloadCoub };
export type { CoubData };
