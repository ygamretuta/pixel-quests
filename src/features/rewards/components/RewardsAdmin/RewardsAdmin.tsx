"use client";

import { useState, useTransition } from "react";
import { approveRequest, denyRequest, setRewardActive } from "@/features/rewards/actions";
import { RewardCard } from "@/features/rewards/components/RewardCard/RewardCard";
import { RewardForm } from "@/features/rewards/components/RewardForm/RewardForm";
import type { Reward, RewardRequest } from "@/features/rewards/types";
import { PixelButton, PixelLinkButton } from "@/shared/ui/PixelButton/PixelButton";
import "./RewardsAdmin.css";

const BLANK: Reward = { id: "", title: "", cost: 50, icon: "gift", active: true };

type RewardsAdminProps = {
  rewards: Reward[];
  pending: RewardRequest[];
  history: RewardRequest[];
};

export function RewardsAdmin({ rewards, pending, history }: RewardsAdminProps) {
  const [editing, setEditing] = useState<Reward | null>(null);
  const [busy, startTransition] = useTransition();
  const active = rewards.filter((reward) => reward.active);
  const removed = rewards.filter((reward) => !reward.active);

  return (
    <main className="rewards-admin">
      <header className="rewards-admin__hud">
        <PixelLinkButton href="/" variant="secondary">
          Back
        </PixelLinkButton>
        <PixelButton onClick={() => setEditing(BLANK)}>+ Add reward</PixelButton>
      </header>

      <h1 className="rewards-admin__title">Rewards</h1>

      <section className="rewards-admin__section">
        <h2 className="rewards-admin__subtitle">
          Asking for {pending.length === 0 ? "nothing yet" : `(${pending.length})`}
        </h2>
        <ul className="rewards-admin__list">
          {pending.map((request) => (
            <RewardCard key={request.id} tone="waiting" title={request.title} detail={`${request.cost} coins held`}>
              <PixelButton disabled={busy} onClick={() => startTransition(() => approveRequest(request.id))}>
                Approve
              </PixelButton>
              <PixelButton
                variant="secondary"
                disabled={busy}
                onClick={() => startTransition(() => denyRequest(request.id))}
              >
                Not now
              </PixelButton>
            </RewardCard>
          ))}
        </ul>
        {pending.length > 0 && (
          <p className="rewards-admin__note">
            Approve = she earned it (coins are spent). Not now = coins go back.
          </p>
        )}
      </section>

      <section className="rewards-admin__section">
        <h2 className="rewards-admin__subtitle">Her rewards</h2>
        {active.length === 0 && <p className="rewards-admin__note">No rewards yet. Add the first one!</p>}
        <ul className="rewards-admin__list">
          {active.map((reward) => (
            <RewardCard key={reward.id} title={reward.title} icon={reward.icon} detail={`${reward.cost} coins`}>
              <PixelButton onClick={() => setEditing(reward)}>Edit</PixelButton>
              <PixelButton
                variant="secondary"
                disabled={busy}
                onClick={() => {
                  if (window.confirm(`Remove "${reward.title}"?`)) {
                    startTransition(() => setRewardActive(reward.id, false));
                  }
                }}
              >
                Remove
              </PixelButton>
            </RewardCard>
          ))}
        </ul>
      </section>

      {removed.length > 0 && (
        <section className="rewards-admin__section">
          <h2 className="rewards-admin__subtitle">Removed</h2>
          <ul className="rewards-admin__list">
            {removed.map((reward) => (
              <RewardCard key={reward.id} tone="done" title={reward.title}>
                <PixelButton disabled={busy} onClick={() => startTransition(() => setRewardActive(reward.id, true))}>
                  Restore
                </PixelButton>
              </RewardCard>
            ))}
          </ul>
        </section>
      )}

      {history.length > 0 && (
        <section className="rewards-admin__section">
          <h2 className="rewards-admin__subtitle">Recent</h2>
          <ul className="rewards-admin__list">
            {history.map((request) => (
              <RewardCard
                key={request.id}
                tone="done"
                title={request.title}
                detail={request.status === "approved" ? "earned" : "not now"}
              />
            ))}
          </ul>
        </section>
      )}

      {editing && <RewardForm key={editing.id || "new"} reward={editing} onClose={() => setEditing(null)} />}
    </main>
  );
}
