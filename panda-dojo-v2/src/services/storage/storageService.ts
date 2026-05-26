function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function getStorage<T>(key: string, fallback: T): T {
  if (!isStorageAvailable()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setStorage<T>(key: string, value: T): T {
  if (!isStorageAvailable()) return value;
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

export function removeStorage(key: string): void {
  if (!isStorageAvailable()) return;
  localStorage.removeItem(key);
}

export function updateStorage<T>(key: string, updater: (current: T) => T, fallback: T): T {
  const current = getStorage<T>(key, fallback);
  const next = updater(current);
  setStorage(key, next);
  return next;
}
