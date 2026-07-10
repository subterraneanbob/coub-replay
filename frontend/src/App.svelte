<script lang="ts">
  import Home from "./components/Home.svelte";
  import Footer from "./components/Footer.svelte";
  import { eventBus } from "./services/event-bus";
  import { isTargetTyping } from "./services/utils";

  function handleKeydown(event: KeyboardEvent) {
    if (!isTargetTyping(event.target)) {
      if (event.key === "d") {
        event.preventDefault();
        eventBus.emit("download");
      } else if (event.key === "m") {
        event.preventDefault();
        eventBus.emit("mute-player");
      } else if (event.key === "o") {
        event.preventDefault();
        eventBus.emit("open-file-dialog");
      } else if (event.code === "Space") {
        event.preventDefault();
        eventBus.emit("toggle-player");
      } else if (event.code === "Escape") {
        event.preventDefault();
        eventBus.emit("close-player");
      }
    }
  }
</script>

<!-- Global keyboard shortcuts -->
<svelte:window onkeydown={handleKeydown} />
<div class="app-container">
  <main>
    <Home />
  </main>
  <Footer />
</div>

<style>
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    flex: 1;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 0 1rem;
    box-sizing: border-box;
  }
</style>
