"use client";

import { useEffect } from "react";

/** Registers the service worker (offline screen and push) on the live site only. */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}
