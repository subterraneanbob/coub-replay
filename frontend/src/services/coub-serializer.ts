import * as flatbuffers from "flatbuffers";
import { CoubMetadata, CoubMedia, Coub } from "../coub-replay/serialization";
import { type CoubData } from "../services/coub-downloader";

async function serialize(coubData: CoubData): Promise<Blob> {
  const builder = new flatbuffers.Builder(
    2 * (coubData.video.size + coubData.audio.size),
  );

  const permalink = builder.createString(coubData.permalink);
  const title = builder.createString(coubData.title);
  const author = builder.createString(coubData.author);
  const createdAt = BigInt(coubData.createdAt.getTime());
  const updatedAt = BigInt(coubData.updatedAt.getTime());

  const audioMimeType = builder.createString(coubData.audio.type);
  const audioData = CoubMedia.createAudioDataVector(
    builder,
    await coubData.audio.bytes(),
  );
  const videoMimeType = builder.createString(coubData.video.type);
  const videoData = CoubMedia.createVideoDataVector(
    builder,
    await coubData.video.bytes(),
  );

  CoubMetadata.startCoubMetadata(builder);
  CoubMetadata.addPermalink(builder, permalink);
  CoubMetadata.addTitle(builder, title);
  CoubMetadata.addAuthor(builder, author);
  CoubMetadata.addCreatedAt(builder, createdAt);
  CoubMetadata.addUpdatedAt(builder, updatedAt);
  const coubMetadata = CoubMetadata.endCoubMetadata(builder);

  CoubMedia.startCoubMedia(builder);
  CoubMedia.addAudioMimeType(builder, audioMimeType);
  CoubMedia.addAudioData(builder, audioData);
  CoubMedia.addVideoMimeType(builder, videoMimeType);
  CoubMedia.addVideoData(builder, videoData);
  const coubMedia = CoubMedia.endCoubMedia(builder);

  Coub.startCoub(builder);
  Coub.addMetadata(builder, coubMetadata);
  Coub.addMedia(builder, coubMedia);
  const coub = Coub.endCoub(builder);

  Coub.finishCoubBuffer(builder, coub);

  return new Blob([builder.asUint8Array()] as BlobPart[], {
    type: "application/octet-stream",
  });
}

async function deserialize(byteArr: Uint8Array): Promise<CoubData> {
  const buf = new flatbuffers.ByteBuffer(byteArr);
  const coub = Coub.getRootAsCoub(buf);

  const metadata = coub.metadata()!;
  const media = coub.media()!;

  const permalink = metadata.permalink()!;
  const title = metadata.title()!;
  const author = metadata.author()!;
  const createdAt = new Date(Number(metadata.createdAt()));
  const updatedAt = new Date(Number(metadata.updatedAt()));

  const audioMimeType = media.audioMimeType()!;
  const audioData = media.audioDataArray()!;
  const videoMimeType = media.videoMimeType()!;
  const videoData = media.videoDataArray()!;

  return {
    permalink,
    url: `https://coub.com/view/${encodeURIComponent(permalink)}`,
    title,
    author,
    createdAt,
    updatedAt,
    audio: new Blob([audioData] as BlobPart[], { type: audioMimeType }),
    video: new Blob([videoData] as BlobPart[], { type: videoMimeType }),
  };
}

export { serialize, deserialize };
