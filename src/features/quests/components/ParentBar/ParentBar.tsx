"use client";

import { useTransition } from "react";
import { toggleRestToday } from "@/features/quests/actions";
import { PixelButton, PixelLinkButton } from "@/shared/ui/PixelButton/PixelButton";
import "./ParentBar.css";

type ParentBarProps = { restToday: boolean; pendingRewards: number };

/** Parent-mode shortcuts shown under the top bar. */
export function ParentBar({ restToday, pendingRewards }: ParentBarProps) {
  const [, startTransition] = useTransition();

  return (
    <div className="parent-bar">
      <p className="parent-bar__banner">Parent mode</p>
      <div className="parent-bar__links">
        <PixelButton
          className="parent-bar__link"
          aria-pressed={restToday}
          onClick={() => startTransition(toggleRestToday)}
        >
          {restToday ? "Rest: ON" : "Rest day"}
        </PixelButton>
        <PixelLinkButton href="/summary" className="parent-bar__link">
          Week
        </PixelLinkButton>
        <PixelLinkButton href="/manage" className="parent-bar__link">
          Quests
        </PixelLinkButton>
        <PixelLinkButton href="/rewards" className="parent-bar__link">
          Rewards{pendingRewards > 0 ? ` (${pendingRewards})` : ""}
        </PixelLinkButton>
      </div>
    </div>
  );
}
