"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** `initial` must be a stable reference (module constant). */
export function useLocalStorage<T>(key: string, initial: T) {
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  );

  const value = useMemo(() => {
    if (raw === null) return initial;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  }, [raw, initial]);

  const set = useCallback(
    (next: T | ((previous: T) => T)) => {
      const stored = read(key);
      let previous = initial;
      try {
        if (stored !== null) previous = JSON.parse(stored) as T;
      } catch {}
      const resolved = typeof next === "function" ? (next as (p: T) => T)(previous) : next;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {}
      listeners.forEach((listener) => listener());
    },
    [key, initial],
  );

  return [value, set] as const;
}
