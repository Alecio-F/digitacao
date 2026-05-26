export function getStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

export function setStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

export function removeStorage(key) {
  localStorage.removeItem(key);
}

export function updateStorage(key, updater, fallback = null) {
  const current = getStorage(key, fallback);
  const next = updater(current);
  setStorage(key, next);
  return next;
}
