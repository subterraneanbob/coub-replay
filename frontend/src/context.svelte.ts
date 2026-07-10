import { createContext } from "svelte";

type AppContext = {
  volume: number;
};

function loadVolume(): number {
  try {
    const v = localStorage.getItem("volume") ?? "0.3";
    return v ? Math.min(Math.max(parseFloat(v), 0), 1) : 1;
  } catch {
    return 0.3;
  }
}

const [getAppContext, setAppContext] = createContext<AppContext>();

function provideAppContext() {
  const ctx: AppContext = $state({ volume: loadVolume() });

  $effect(() => {
    try {
      localStorage.setItem("volume", String(ctx.volume));
    } catch {}
  });

  setAppContext(ctx);
}

export { provideAppContext, getAppContext };
