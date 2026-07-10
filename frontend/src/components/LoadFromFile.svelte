<script lang="ts">
  import { deserialize } from "../services/coub-serializer";
  import DropZone from "./DropZone.svelte";

  let errorMessage = $state("");
  let { onCoubLoaded } = $props();

  async function onFileChange(file: File) {
    if (!file) return;

    errorMessage = "";

    try {
      const coubBytes = await file.bytes();
      const coubData = await deserialize(coubBytes);
      onCoubLoaded(coubData);
    } catch (err) {
      errorMessage = "Error: Invalid Coub file format.";
    }
  }
</script>

<section>
  <div class="ms-card ms-fill">
    <div class="ms-card-title">
      <h2>
        Load <span class="ms-label ms-action">.coub</span> file
      </h2>
    </div>
    <div class="ms-card-content ms-pb-0">
      <DropZone accept=".coub" onChange={onFileChange} />
      {#if errorMessage}
        <div class="ms-alert ms-light ms-primary ms-mt-1">
          <p>
            {errorMessage}
          </p>
        </div>
      {/if}
    </div>
  </div>
</section>

<style>
  .ms-card .ms-card-title span {
    font-style: normal;
  }
</style>
