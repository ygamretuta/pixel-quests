"use client";

import { useSyncExternalStore } from "react";

const INTERVAL_MS = 60_000;

function subscribe(callback: () => void) {
  const id = setInterval(callback, INTERVAL_MS);
  return () => clearInterval(id);
}

/** Current time, quantized to the minute. Returns 0 on the server and during hydration. */
export function useNow() {
  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / INTERVAL_MS) * INTERVAL_MS,
    () => 0,
  );
}
