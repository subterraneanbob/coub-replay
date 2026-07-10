interface External {
  __coubData: string?;
  sendMessage: (message: string) => void;
  receiveMessage: (callback: (message: string) => void) => void;
}

interface Saucer {
  exposed: {
    load_input_file: () => Promise<{ ok: boolean; data: string }>;
    cors_proxy_get: (
      url: string,
    ) => Promise<{ status: number; data: string; error: string }>;
  };
}

interface Window {
  saucer: Saucer;
}
