const PREFIX = 'idrecette.v2.';

/** Lecture localStorage tolérante (navigation privée, stockage bloqué, JSON corrompu). */
export function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* stockage indisponible : l'app continue en mémoire */
  }
}

/**
 * Petit store observable. Avec `persist`, la valeur est relue et sauvegardée dans localStorage.
 * @template T
 * @param {T} initial
 * @param {{ persist?: string, sanitize?: (v: any) => T }} [options]
 */
export function createStore(initial, { persist, sanitize } = {}) {
  let value = persist ? readStorage(persist, initial) : initial;
  if (sanitize) value = sanitize(value);
  const listeners = new Set();

  return {
    get: () => value,
    set(next) {
      value = typeof next === 'function' ? next(value) : next;
      if (persist) writeStorage(persist, value);
      listeners.forEach((fn) => fn(value));
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
