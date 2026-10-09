"use client";

import { useState } from "react";
import { renderSummaryImage, summaryText } from "@/features/summary/lib/shareImage";
import type { WeekSummary } from "@/features/summary/types";
import { PixelButton } from "@/shared/ui/PixelButton/PixelButton";
import "./ShareButtons.css";

export function ShareButtons({ summary }: { summary: WeekSummary }) {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function shareImage() {
    setBusy(true);
    setStatus(null);
    try {
      const blob = await renderSummaryImage(summary);
      const file = new File([blob], `pixel-quests-${summary.monday}.png`, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Pixel Quests weekly summary",
          text: summaryText(summary),
        });
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
    <div className="share-buttons">
      <div className="share-buttons__row">
        <PixelButton className="share-buttons__button" onClick={shareImage} disabled={busy}>
          {busy ? "..." : "Share picture"}
        </PixelButton>
        <PixelButton variant="secondary" className="share-buttons__button" onClick={copyText}>
          Copy text
        </PixelButton>
      </div>
      {status && (
        <p className="share-buttons__status" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
