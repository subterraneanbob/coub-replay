const bus = new EventTarget();

type EventName =
  | "open-file-dialog"
  | "toggle-player"
  | "mute-player"
  | "close-player"
  | "download";

const eventBus = {
  emit(eventName: EventName, detail = null) {
    const event = new CustomEvent(eventName, { detail });
    bus.dispatchEvent(event);
  },

  on(eventName: EventName, callback: EventListenerOrEventListenerObject) {
    bus.addEventListener(eventName, callback);
    return () => bus.removeEventListener(eventName, callback);
  },
};

export { eventBus };
