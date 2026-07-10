<script lang="ts">
  import { Download, X } from "@lucide/svelte/icons";
  import type { CoubData } from "../services/coub-downloader";
  import { serialize } from "../services/coub-serializer";
  import { eventBus } from "../services/event-bus";
  import Player from "./Player.svelte";
  import { sanitizeFilename } from "../services/utils";

  type Props = {
    coubData: CoubData;
    onClose?: () => void;
  };

  let downloadButtonRef: HTMLButtonElement;
  let closeButtonRef: HTMLButtonElement;
  let { coubData, onClose }: Props = $props();

  $effect(() => {
    return eventBus.on("download", () => {
      downloadButtonRef?.click();
    });
  });

  $effect(() => {
    return eventBus.on("close-player", () => {
      closeButtonRef?.click();
    });
  });

  async function download() {
    const coubBlob = await serialize(coubData);

    const a = document.createElement("a");
    try {
      const title = sanitizeFilename(coubData.title);

      a.href = URL.createObjectURL(coubBlob);
      a.download = `${title} [${coubData.permalink}].coub`;
      a.click();
    } finally {
      URL.revokeObjectURL(a.href);
    }
  }
</script>

<section>
  <div class="ms-card ms-fill">
    <div
      class="ms-card-title ms-display-flex ms-flex-justify-between ms-flex-align-items-center"
    >
      <h2>{coubData.title}</h2>
      <div class="actions">
        <button
          bind:this={downloadButtonRef}
          title="Download"
          onclick={download}
        >
          <Download />
        </button>
        <button bind:this={closeButtonRef} title="Close" onclick={onClose}>
          <X />
        </button>
      </div>
    </div>
    <div class="ms-card-content ms-pb-0">
      <Player {coubData} />
      <dl class="ms-pl-1">
        <dt class="ms-text-light">
          <strong>Author</strong>
        </dt>
        <dd class="ms-ml-1">{coubData.author}</dd>
        <dt class="ms-text-light">
          <strong>URL</strong>
        </dt>
        <dd class="ms-ml-1">
          <a href={coubData.url}>{coubData.url}</a>
        </dd>
        <dt class="ms-text-light">
          <strong>Created</strong>
        </dt>
        <dd class="ms-ml-1">{coubData.createdAt.toLocaleDateString()}</dd>
      </dl>
    </div>
  </div>
</section>

<style>
  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5rem 1rem;
  }

  .actions {
    flex-shrink: 0;
    white-space: nowrap;
  }

  .actions button {
    padding: 0.2rem;
    color: rgb(var(--light-text-color));
    line-height: 0;
  }

  .actions button:hover {
    color: rgb(var(--main-text-color));
  }
</style>
