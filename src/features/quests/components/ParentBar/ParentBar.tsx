"use client";

import { useTransition } from "react";
import { ChildSwitcher } from "@/features/parent/components/ChildSwitcher/ChildSwitcher";
import { toggleRestToday } from "@/features/quests/actions";
import { PixelButton, PixelLinkButton } from "@/shared/ui/PixelButton/PixelButton";
import "./ParentBar.css";

type ParentBarProps = {
  restToday: boolean;
  pendingRewards: number;
  waitingClaims: number;
  kids: { id: number; name: string }[];
  currentChildId: number;
};

/** Parent-mode shortcuts shown under the top bar. */
export function ParentBar({ restToday, pendingRewards, waitingClaims, kids, currentChildId }: ParentBarProps) {
  const [, startTransition] = useTransition();

  return (
    <div className="parent-bar">
      <p className="parent-bar__banner">
        Parent mode{waitingClaims > 0 ? ` · ${waitingClaims} waiting for you` : ""}
      </p>
      <ChildSwitcher kids={kids} currentId={currentChildId} />
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
        <PixelLinkButton href="/settings" className="parent-bar__link">
          Settings
        </PixelLinkButton>
      </div>
    </div>
  );
}
