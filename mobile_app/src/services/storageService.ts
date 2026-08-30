import { createMMKV, MMKV } from 'react-native-mmkv';

interface StorageInterface {
  set: (key: string, value: string) => void;
  getString: (key: string) => string | undefined;
  delete: (key: string) => void;
  clearAll: () => void;
}

let storageInstance: StorageInterface;

try {
  const mmkv: MMKV = createMMKV({ id: 'amrutam-mmkv-storage' });
  storageInstance = {
    set: (key, value) => mmkv.set(key, value),
    getString: (key) => mmkv.getString(key),
    delete: (key) => {
      try {
        if (typeof (mmkv as any).delete === 'function') {
          (mmkv as any).delete(key);
        } else if (typeof (mmkv as any).remove === 'function') {
          (mmkv as any).remove(key);
        }
      } catch (err) {
        console.warn('MMKV delete error:', err);
      }
    },
    clearAll: () => {
      try {
        mmkv.clearAll();
      } catch (err) {
        console.warn('MMKV clearAll error:', err);
      }
    },
  };
} catch (error) {
  // Fallback using in-memory / localStorage
  const memoryStorage = new Map<string, string>();
  storageInstance = {
    set: (key, value) => {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      } else {
        memoryStorage.set(key, value);
      }
    },
    getString: (key) => {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key) ?? undefined;
      }
      return memoryStorage.get(key);
    },
    delete: (key) => {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      } else {
        memoryStorage.delete(key);
      }
    },
    clearAll: () => {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      } else {
        memoryStorage.clear();
      }
    },
  };
}

export const Storage = {
  setItem: (key: string, value: any): void => {
    try {
      const stringified = typeof value === 'string' ? value : JSON.stringify(value);
      storageInstance.set(key, stringified);
    } catch (e) {
      console.warn('[Storage] Error setItem:', e);
    }
  },

  getItem: <T>(key: string, defaultValue: T | null = null): T | null => {
    try {
      const val = storageInstance.getString(key);
      if (val === undefined || val === null) return defaultValue;
      try {
        return JSON.parse(val) as T;
      } catch {
        return val as unknown as T;
      }
    } catch (e) {
      return defaultValue;
    }
  },

  removeItem: (key: string): void => {
    try {
      storageInstance.delete(key);
    } catch (e) {
      console.warn('[Storage] Error removeItem:', e);
    }
  },

  clear: (): void => {
    try {
      storageInstance.clearAll();
    } catch (e) {
      console.warn('[Storage] Error clear:', e);
    }
  },
};
