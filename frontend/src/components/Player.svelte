<script lang="ts">
  import { Play, Pause, Volume1, Volume2, VolumeX } from "@lucide/svelte/icons";
  import type { CoubData } from "../services/coub-downloader";
  import { getAppContext } from "../context.svelte";
  import { eventBus } from "../services/event-bus";

  type Props = {
    coubData: CoubData;
  };

  let { coubData }: Props = $props();

  let muteButtonRef: HTMLButtonElement;
  let audioEl: HTMLAudioElement;
  let videoEl: HTMLVideoElement;

  let appContext = getAppContext();
  let audioUrl = $state("");
  let videoUrl = $state("");
  let isPlaying = $state(false);

  $effect(() => {
    videoUrl = URL.createObjectURL(coubData.video);
    audioUrl = URL.createObjectURL(coubData.audio);

    isPlaying = false;

    return () => {
      videoEl.pause();
      audioEl.pause();
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  });

  $effect(() => {
    if (audioEl) audioEl.volume = appContext.volume;
  });

  $effect(() => {
    if (isPlaying) {
      if (audioEl.ended) {
        audioEl.currentTime = 0;
        videoEl.currentTime = 0;
      }
      audioEl.play().catch(logError);
      videoEl.play().catch(logError);
    } else {
      audioEl.pause();
      videoEl.pause();
    }
  });

  $effect(() => {
    return eventBus.on("toggle-player", () => {
      isPlaying = !isPlaying;
    });
  });

  $effect(() => {
    return eventBus.on("mute-player", () => {
      muteButtonRef?.click();
    });
  });

  function logError(reason: any) {
    console.error(reason);
  }

  function togglePlay() {
    isPlaying = !isPlaying;
  }

  function onVideoPlay() {
    isPlaying = true;
  }

  function onVideoPause() {
    isPlaying = false;
  }
</script>

<div>
  <div class="ms-pb-1">
    <audio
      class="ms-display-none"
      bind:this={audioEl}
      src={audioUrl}
      preload="auto"
      loop
    ></audio>
    <video
      bind:this={videoEl}
      src={videoUrl}
      onclick={togglePlay}
      onplay={onVideoPlay}
      onpause={onVideoPause}
      loop
      muted
      playsinline
      disablePictureInPicture
    ></video>
  </div>
  <div class="ms-display-flex ms-flex-justify-between">
    <button class="ms-btn ms-primary play-pause-btn" onclick={togglePlay}>
      {#if isPlaying}
        <Pause size="16" />
        <span>Pause</span>
      {:else}
        <Play size="16" />
        <span>Play</span>
      {/if}
    </button>
    <div class="ms-display-flex volume-control">
      <button
        bind:this={muteButtonRef}
        title="Mute"
        class="ms-btn volume-icon mute-btn"
        onclick={() => (appContext.volume = 0)}
      >
        {#if appContext.volume === 0}
          <VolumeX />
        {:else if appContext.volume < 0.5}
          <Volume1 />
        {:else}
          <Volume2 />
        {/if}
      </button>
      <input
        type="range"
        title="Adjust volume"
        class="volume-slider"
        min="0"
        max="1"
        step="0.01"
        bind:value={appContext.volume}
      />
    </div>
  </div>
</div>

<style>
  video {
    width: 100%;
    max-height: 420px;
    object-fit: contain;
    background: black;
    border-radius: 6px;
  }

  .play-pause-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
    width: 100px;
  }

  .mute-btn {
    display: inline-flex;
    align-items: center;
    padding: 0;
  }

  .volume-control {
    gap: 5px;
  }

  .volume-slider {
    cursor: pointer;
    width: 120px;
    accent-color: rgb(var(--primary-bg-color));
  }
</style>
