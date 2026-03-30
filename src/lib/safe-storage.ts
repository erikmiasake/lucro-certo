type StorageKind = 'localStorage' | 'sessionStorage';

const memoryFallback = new Map<string, string>();

function getStorage(kind: StorageKind): Storage | null {
  if (typeof window === 'undefined') return null;

  try {
    const storage = window[kind];
    const testKey = `__lucro_real_storage_test__${kind}`;
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return storage;
  } catch {
    return null;
  }
}

function getFallbackKey(kind: StorageKind, key: string) {
  return `${kind}:${key}`;
}

export function safeGetItem(key: string, kind: StorageKind = 'localStorage'): string | null {
  const storage = getStorage(kind);

  if (storage) {
    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  }

  return memoryFallback.get(getFallbackKey(kind, key)) ?? null;
}

export function safeSetItem(key: string, value: string, kind: StorageKind = 'localStorage') {
  const storage = getStorage(kind);

  if (storage) {
    try {
      storage.setItem(key, value);
      return;
    } catch {
      // Fall through to in-memory storage.
    }
  }

  memoryFallback.set(getFallbackKey(kind, key), value);
}

export function safeRemoveItem(key: string, kind: StorageKind = 'localStorage') {
  const storage = getStorage(kind);

  if (storage) {
    try {
      storage.removeItem(key);
    } catch {
      // Ignore storage removal failures.
    }
  }

  memoryFallback.delete(getFallbackKey(kind, key));
}
