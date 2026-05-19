import { lazy, type ComponentType } from "react";

const LAZY_RETRY_KEY = "lucro-real-lazy-retry";

function isModuleLoadError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /importing a module script failed|failed to fetch dynamically imported module|load failed|chunkloaderror/i.test(message);
}

export function lazyWithRetry<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      const module = await factory();
      sessionStorage.removeItem(LAZY_RETRY_KEY);
      return module;
    } catch (error) {
      if (typeof window !== "undefined" && isModuleLoadError(error)) {
        const alreadyRetried = sessionStorage.getItem(LAZY_RETRY_KEY) === "true";
        if (!alreadyRetried) {
          sessionStorage.setItem(LAZY_RETRY_KEY, "true");
          window.location.reload();
          return new Promise<{ default: T }>(() => undefined);
        }
      }

      throw error;
    }
  });
}
