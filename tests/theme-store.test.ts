import { beforeEach, describe, expect, it } from "vitest";
import { useThemeStore } from "../lib/stores/theme-store";

const STORAGE_KEY = "dessertrip-theme";

function createStorageMock(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key) {
      return values.get(key) ?? null;
    },
    key(index) {
      return Array.from(values.keys())[index] ?? null;
    },
    removeItem(key) {
      values.delete(key);
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}

function installBrowserMocks(options?: { prefersDark?: boolean; storage?: Storage }) {
  const storage = options?.storage ?? createStorageMock();
  const prefersDark = options?.prefersDark ?? false;

  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
    writable: true,
  });

  Object.defineProperty(globalThis, "window", {
    value: {
      localStorage: storage,
      matchMedia: () =>
        ({
          matches: prefersDark,
          media: "(prefers-color-scheme: dark)",
          onchange: null,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
          addListener: () => undefined,
          removeListener: () => undefined,
          dispatchEvent: () => false,
        }) as MediaQueryList,
    },
    configurable: true,
    writable: true,
  });

  return storage;
}

describe("theme store", () => {
  beforeEach(() => {
    useThemeStore.setState({
      theme: "pastel",
      drawerOpen: false,
      hydrated: false,
    });
  });

  it("uses the system preference when no stored theme exists", () => {
    installBrowserMocks({ prefersDark: true });

    useThemeStore.getState().hydrateTheme();

    expect(useThemeStore.getState().theme).toBe("dark");
    expect(useThemeStore.getState().hydrated).toBe(true);
  });

  it("prefers a stored theme over the system preference", () => {
    const storage = installBrowserMocks({ prefersDark: false });
    storage.setItem(STORAGE_KEY, "dark");

    useThemeStore.getState().hydrateTheme();

    expect(useThemeStore.getState().theme).toBe("dark");
  });

  it("persists manual toggles and restores them on the next hydrate", () => {
    const storage = installBrowserMocks({ prefersDark: false });
    const store = useThemeStore.getState();

    store.hydrateTheme();
    store.toggleTheme();
    store.setDrawerOpen(true);

    expect(useThemeStore.getState().theme).toBe("dark");
    expect(useThemeStore.getState().drawerOpen).toBe(true);
    expect(storage.getItem(STORAGE_KEY)).toBe("dark");

    useThemeStore.setState({
      theme: "pastel",
      drawerOpen: false,
      hydrated: false,
    });

    useThemeStore.getState().hydrateTheme();

    expect(useThemeStore.getState().theme).toBe("dark");
    expect(useThemeStore.getState().hydrated).toBe(true);
  });
});
