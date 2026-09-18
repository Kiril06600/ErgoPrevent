import { AppState, Platform } from "react-native";

type AppStorageLike = {
  readonly length: number;
  key: (index: number) => string | null;
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

type AppEventListener = (detail?: unknown) => void;

const listeners = new Map<string, Set<AppEventListener>>();

function getInstalledStorage(): AppStorageLike | null {
  try {
    return (
      globalThis as typeof globalThis & {
        localStorage?: AppStorageLike;
      }
    ).localStorage ?? null;
  } catch {
    return null;
  }
}

export function isAppStorageAvailable() {
  return getInstalledStorage() !== null;
}

export const appStorage: AppStorageLike = {
  get length() {
    try {
      return getInstalledStorage()?.length ?? 0;
    } catch {
      return 0;
    }
  },

  key(index: number) {
    try {
      return getInstalledStorage()?.key(index) ?? null;
    } catch {
      return null;
    }
  },

  getItem(key: string) {
    try {
      return getInstalledStorage()?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },

  setItem(key: string, value: string) {
    try {
      getInstalledStorage()?.setItem(key, value);
    } catch {
      // Storage can be unavailable or full; avoid crashing the interface.
    }
  },

  removeItem(key: string) {
    try {
      getInstalledStorage()?.removeItem(key);
    } catch {
      // Storage can be unavailable; avoid crashing the interface.
    }
  },
};

export function emitAppEvent<T = unknown>(
  eventName: string,
  detail?: T
) {
  const eventListeners = listeners.get(eventName);

  if (!eventListeners) {
    return;
  }

  [...eventListeners].forEach((listener) => {
    listener(detail);
  });
}

export function subscribeAppEvent<T = unknown>(
  eventName: string,
  listener: (detail?: T) => void
) {
  const wrappedListener: AppEventListener = (detail) => {
    listener(detail as T | undefined);
  };

  const currentListeners =
    listeners.get(eventName) ??
    new Set<AppEventListener>();

  currentListeners.add(wrappedListener);
  listeners.set(eventName, currentListeners);

  return () => {
    const eventListeners = listeners.get(eventName);

    if (!eventListeners) {
      return;
    }

    eventListeners.delete(wrappedListener);

    if (eventListeners.size === 0) {
      listeners.delete(eventName);
    }
  };
}

export function subscribeAppRefreshSignals(
  listener: () => void
) {
  const cleanups: (() => void)[] = [];

  if (
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    typeof window.addEventListener === "function"
  ) {
    window.addEventListener("focus", listener);
    window.addEventListener("storage", listener);

    cleanups.push(() => {
      window.removeEventListener("focus", listener);
      window.removeEventListener("storage", listener);
    });

    if (
      typeof document !== "undefined" &&
      typeof document.addEventListener === "function"
    ) {
      document.addEventListener("visibilitychange", listener);

      cleanups.push(() => {
        document.removeEventListener("visibilitychange", listener);
      });
    }
  } else if (Platform.OS !== "web") {
    const subscription = AppState.addEventListener(
      "change",
      (state) => {
        if (state === "active") {
          listener();
        }
      }
    );

    cleanups.push(() => subscription.remove());
  }

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}
