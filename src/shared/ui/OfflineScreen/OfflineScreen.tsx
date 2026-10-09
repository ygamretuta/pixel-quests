"use client";

import { PixelButton } from "@/shared/ui/PixelButton/PixelButton";
import "./OfflineScreen.css";

/** Shown by the service worker when there is no connection. */
export function OfflineScreen() {
  return (
    <main className="offline-screen">
      <h1 className="offline-screen__title">No wifi</h1>
      <p className="offline-screen__message">
        The monsters can&apos;t reach you right now. Check your wifi, then try again.
      </p>
      <PixelButton onClick={() => window.location.reload()}>Try again</PixelButton>
    </main>
  );
}
