const safeJSONParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const safeLocalStorageGet = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const localStorageSet = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
};

const localStorageRemove = (key: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
};

export const localStorageUtils = {
  get: <T>(key: string, fallback: T): T => {
    const stored = safeLocalStorageGet(key);
    return safeJSONParse(stored, fallback);
  },

  set: <T>(key: string, value: T): void => {
    localStorageSet(key, JSON.stringify(value));
  },

  remove: (key: string): void => {
    localStorageRemove(key);
  },

  has: (key: string): boolean => {
    return safeLocalStorageGet(key) !== null;
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.clear();
    } catch {
      console.warn('Failed to clear localStorage');
    }
  }
};

export const { get, set, remove, has, clear } = localStorageUtils; 