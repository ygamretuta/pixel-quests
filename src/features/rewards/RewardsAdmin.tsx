"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { approveRequest, denyRequest, saveReward, setRewardActive } from "./actions";
import { ICONS_BY_KEY, REWARD_ICONS } from "./icons";
import type { Reward, RewardRequest } from "./types";
import { PixelSprite } from "@/shared/pixel/PixelSprite";
import "@/features/quests/manage/manage.css";
import "./rewards.css";

function openOnMount(element: HTMLDialogElement | null) {
  if (element && !element.open) element.showModal();
}

const BLANK: Reward = { id: "", title: "", cost: 50, icon: "gift", active: true };

function RewardForm({ reward, onClose }: { reward: Reward; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await saveReward(formData);
      if (result.ok) onClose();
      else setError(result.error);
    });
  }

  return (
    <dialog ref={openOnMount} className="dialog manage__dialog" onClose={onClose}>
      <form className="dialog__form" onSubmit={submit}>
        <h2 className="dialog__title">{reward.id ? "Edit reward" : "New reward"}</h2>
        <input type="hidden" name="id" value={reward.id} />

        <label className="manage__field">
          <span className="manage__label">Reward</span>
          <input
            className="manage__input"
            name="title"
            defaultValue={reward.title}
            maxLength={30}
            placeholder="Ice cream"
            required
          />
        </label>

        <label className="manage__field">
          <span className="manage__label">Costs (coins)</span>
          <input
            className="manage__input"
            name="cost"
            type="number"
            inputMode="numeric"
            min={1}
            max={1000}
            defaultValue={reward.cost}
            required
          />
        </label>

        <fieldset className="manage__field manage__monsters">
          <legend className="manage__label">Picture</legend>
          {REWARD_ICONS.map((icon) => (
            <label key={icon.key} className="manage__choice">
              <input type="radio" name="icon" value={icon.key} defaultChecked={reward.icon === icon.key} />
              <span className="manage__choice-box manage__monster">
                <span className="manage__monster-sprite">
                  <PixelSprite sprite={icon.sprite} label="" />
                </span>
                {icon.label}
              </span>
            </label>
          ))}
        </fieldset>

        {error && <p className="dialog__error" role="alert">{error}</p>}
        <div className="dialog__actions">
          <button type="button" className="pixel-button pixel-button--secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="pixel-button" disabled={pending}>
            {pending ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

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
    <main className="treats treats--admin">
      <header className="treats__hud">
        <Link href="/" className="pixel-button pixel-button--secondary treats__link">
          Back
        </Link>
        <button type="button" className="pixel-button" onClick={() => setEditing(BLANK)}>
          + Add reward
        </button>
      </header>

      <h1 className="treats__title">Rewards</h1>

      <section className="treats__section">
        <h2 className="treats__subtitle">Asking for {pending.length === 0 ? "nothing yet" : `(${pending.length})`}</h2>
        <ul className="treats__list">
          {pending.map((request) => (
            <li key={request.id} className="treats__card treats__card--waiting">
              <span className="treats__name">
                {request.title}
                <span className="treats__date">{request.cost} coins held</span>
              </span>
              <div className="treats__buttons">
                <button
                  type="button"
                  className="pixel-button"
                  disabled={busy}
                  onClick={() => startTransition(async () => approveRequest(request.id))}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="pixel-button pixel-button--secondary"
                  disabled={busy}
                  onClick={() => startTransition(async () => denyRequest(request.id))}
                >
                  Not now
                </button>
              </div>
            </li>
          ))}
        </ul>
        {pending.length > 0 && (
          <p className="treats__empty">Approve = she earned it (coins are spent). Not now = coins go back.</p>
        )}
      </section>

      <section className="treats__section">
        <h2 className="treats__subtitle">Her rewards</h2>
        {active.length === 0 && <p className="treats__empty">No rewards yet. Add the first one!</p>}
        <ul className="treats__list">
          {active.map((reward) => (
            <li key={reward.id} className="treats__card">
              <span className="treats__icon">
                <PixelSprite sprite={ICONS_BY_KEY[reward.icon] ?? ICONS_BY_KEY.gift} label="" />
              </span>
              <span className="treats__name">
                {reward.title}
                <span className="treats__date">{reward.cost} coins</span>
              </span>
              <div className="treats__buttons">
                <button type="button" className="pixel-button" onClick={() => setEditing(reward)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="pixel-button pixel-button--secondary"
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm(`Remove "${reward.title}"?`)) {
                      startTransition(async () => setRewardActive(reward.id, false));
                    }
                  }}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {removed.length > 0 && (
        <section className="treats__section">
          <h2 className="treats__subtitle">Removed</h2>
          <ul className="treats__list">
            {removed.map((reward) => (
              <li key={reward.id} className="treats__card treats__card--done">
                <span className="treats__name">{reward.title}</span>
                <button
                  type="button"
                  className="pixel-button"
                  disabled={busy}
                  onClick={() => startTransition(async () => setRewardActive(reward.id, true))}
                >
                  Restore
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {history.length > 0 && (
        <section className="treats__section">
          <h2 className="treats__subtitle">Recent</h2>
          <ul className="treats__list">
            {history.map((request) => (
              <li key={request.id} className="treats__card treats__card--done">
                <span className="treats__name">
                  {request.title}
                  <span className="treats__date">{request.status === "approved" ? "earned" : "not now"}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {editing && <RewardForm key={editing.id || "new"} reward={editing} onClose={() => setEditing(null)} />}
    </main>
  );
}
