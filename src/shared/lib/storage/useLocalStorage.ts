"use client";

import { useSyncExternalStore } from "react";

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

function parse<T>(raw: string | null, initial: T): T {
  if (raw === null) return initial;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return initial;
  }
}

/** `initial` must be a stable reference (module constant). */
export function useLocalStorage<T>(key: string, initial: T) {
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  );

  const value = parse(raw, initial);

  function set(next: T | ((previous: T) => T)) {
    const previous = parse(read(key), initial);
    const resolved = typeof next === "function" ? (next as (p: T) => T)(previous) : next;
    try {
      localStorage.setItem(key, JSON.stringify(resolved));
    } catch {}
    listeners.forEach((listener) => listener());
  }

  return [value, set] as const;
}
