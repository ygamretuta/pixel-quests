"use client";

import { useState } from "react";
import type { WeekSummary } from "@/server/summary";
import { renderSummaryImage, summaryText } from "./shareImage";

export function ShareButtons({ summary }: { summary: WeekSummary }) {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function shareImage() {
    setBusy(true);
    setStatus(null);
    try {
      const blob = await renderSummaryImage(summary);
      const file = new File([blob], `pixel-quests-${summary.monday}.png`, { type: "image/png" });
      const text = summaryText(summary);

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Pixel Quests weekly summary", text });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(url);
        setStatus("Picture saved.");
      }
    } catch (error) {
      // Closing the share sheet throws AbortError; that is not a failure.
      if ((error as Error).name !== "AbortError") setStatus("Could not make the picture.");
    } finally {
      setBusy(false);
    }
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(summaryText(summary));
      setStatus("Copied! Paste it in a message.");
    } catch {
      setStatus("Could not copy.");
    }
  }

  return (
    <div className="summary__share">
      <div className="summary__share-buttons">
        <button type="button" className="pixel-button" onClick={shareImage} disabled={busy}>
          {busy ? "..." : "Share picture"}
        </button>
        <button type="button" className="pixel-button pixel-button--secondary" onClick={copyText}>
          Copy text
        </button>
      </div>
      {status && (
        <p className="summary__empty" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
