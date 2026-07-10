<script lang="ts">
  import {
    extractCoubPermalink,
    downloadCoub,
  } from "../services/coub-downloader";

  let { onCoubDownloaded } = $props();

  let userInput = $state("");
  let coubPermalink = $derived(extractCoubPermalink(userInput));
  let userInputIsInvalid = $derived(Boolean(userInput && !coubPermalink));

  let downloading = $state(false);
  let downloadErrors: Set<string> = $state(new Set());

  async function download() {
    if (!coubPermalink) return;

    downloading = true;
    downloadErrors = new Set();

    try {
      const coubData = await downloadCoub(coubPermalink);
      onCoubDownloaded(coubData);
    } catch (error) {
      if (error instanceof AggregateError) {
        downloadErrors = new Set(error.errors.map((e: Error) => e.message));
      } else if (error instanceof Error) {
        downloadErrors = new Set([error.message]);
      } else {
        downloadErrors = new Set(["Download failed."]);
      }
    } finally {
      downloading = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      download();
    }
  }
</script>

<section>
  <div class="ms-card ms-fill">
    <div class="ms-card-title">
      <h2>Download from URL</h2>
    </div>
    <div class="ms-card-content">
      <input
        type="text"
        id="CoubPermalink"
        placeholder="https://coub.com/view/123abc or 123abc"
        autocomplete="off"
        class={userInputIsInvalid ? "ms-border-primary" : "ms-border-action"}
        bind:value={userInput}
        onkeydown={handleKeydown}
      />
      {#if userInputIsInvalid}
        <span class="ms-under-input ms-text-primary"
          >Invalid URL or permalink.</span
        >
      {/if}
    </div>
    <div class="ms-card-btn">
      <button
        class="ms-btn ms-primary"
        disabled={!coubPermalink || downloading}
        onclick={download}
      >
        {#if downloading}
          <div class="ms-loading ms-small ms-primary"></div>
        {/if}
        Download
      </button>
    </div>
    {#if downloadErrors.size > 0}
      <div class="ms-alert ms-light ms-primary ms-mt-1">
        {#each downloadErrors as e}
          <p>
            {e}
          </p>
        {/each}
      </div>
    {/if}
  </div>
</section>
