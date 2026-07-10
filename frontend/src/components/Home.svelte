<script lang="ts">
  import Download from "./Download.svelte";
  import Divider from "./Divider.svelte";
  import LoadFromFile from "./LoadFromFile.svelte";
  import CoubInfo from "./CoubInfo.svelte";
  import type { CoubData } from "../services/coub-downloader";
  import { provideAppContext } from "../context.svelte";
  import { deserialize } from "../services/coub-serializer";
  import { onMount } from "svelte";

  provideAppContext();
  let initialized = $state(false);
  let coubData: CoubData | null = $state(null);

  onMount(() => {
    initCoubData();
  });

  async function initCoubData() {
    if (window.saucer) {
      try {
        const inputFile = await window.saucer.exposed.load_input_file();

        if (inputFile.ok) {
          const data = await fetch(inputFile.data);
          const bytes = await data.bytes();
          coubData = await deserialize(bytes);
        }
      } catch {}
    }

    initialized = true;
  }

  function setCoubData(data: CoubData) {
    coubData = data;
  }
</script>

{#if initialized}
  {#if coubData}
    <CoubInfo {coubData} onClose={() => (coubData = null)} />
  {:else}
    <Download onCoubDownloaded={setCoubData} />
    <Divider title="OR" />
    <LoadFromFile onCoubLoaded={setCoubData} />
  {/if}
{/if}
