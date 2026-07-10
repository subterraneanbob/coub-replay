<script lang="ts">
  import { eventBus } from "../services/event-bus";

  let { accept = "*", onChange } = $props();

  let fileInputRef: HTMLInputElement;
  let fileName: string | undefined = $state("");
  let isDragOver = $state(false);

  $effect(() => {
    return eventBus.on("open-file-dialog", () => {
      fileInputRef?.click();
    });
  });

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragOver = true;
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    isDragOver = false;
  }

  function handleDrop(e: DragEvent) {
    const files = e.dataTransfer?.files;

    if (files && files.length > 0) {
      fileInputRef.files = files;
      handleChange();
    }
  }

  function handleChange() {
    const file = fileInputRef.files?.[0];

    if (file) {
      fileName = file.name;
      onChange(file);
    }
  }
</script>

<label for="dropZoneInput" class="dropzone" class:dropzone-over={isDragOver}>
  {#if fileName}
    <span>{fileName}</span>
  {:else}
    <span>Drag & drop files here or click to load</span>
  {/if}
  <input
    bind:this={fileInputRef}
    id="dropZoneInput"
    type="file"
    {accept}
    onchange={handleChange}
    ondragenter={handleDragOver}
    ondragleave={handleDragLeave}
    ondragover={handleDragOver}
    ondrop={(e) => {
      handleDragLeave(e);
      handleDrop(e);
    }}
  />
</label>

<style>
  * {
    --main-text-color: rgb(255, 255, 255);
    --light-text-color: rgb(190, 190, 190);
    --default-border-radius: 0.5rem;
  }

  .dropzone {
    display: flex;
    max-width: 100%;
    height: 200px;
    padding: 25px;
    position: relative;
    align-items: center;
    justify-content: center;
    text-align: center;
    cursor: pointer;
    color: var(--light-text-color);
    border: 2px dashed var(--light-text-color);
    border-radius: var(--default-border-radius);
    background-color: transparent;
    transition: color 0.3s ease border-color 0.3s ease;
  }

  .dropzone:hover,
  .dropzone.dropzone-over {
    color: var(--main-text-color);
    border-color: var(--main-text-color);
  }

  .dropzone input[type="file"] {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
</style>
