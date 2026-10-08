"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { cancelRequest, requestReward } from "./actions";
import { ICONS_BY_KEY } from "./icons";
import type { Reward, RewardRequest } from "./types";
import { coin } from "@/features/quests/sprites";
import { useSound } from "@/shared/audio/SoundProvider";
import { PixelSprite } from "@/shared/pixel/PixelSprite";
import "./rewards.css";

type TreatsProps = {
  coins: number;
  rewards: Reward[];
  pending: RewardRequest[];
  recent: RewardRequest[];
};

const HELLO = "Real treats! Save up coins, then ask a grown-up.";

export function Treats({ coins, rewards, pending, recent }: TreatsProps) {
  const { play } = useSound();
  const [busy, startTransition] = useTransition();
  const [said, setSaid] = useState(HELLO);
  const waitingFor = new Set(pending.map((request) => request.rewardId));

  function ask(reward: Reward) {
    startTransition(async () => {
      const result = await requestReward(reward.id);
      if (result.ok) {
        play("coin");
        setSaid(`You asked for ${reward.title}! Now wait for a grown-up.`);
      } else if (result.error === "poor") {
        setSaid("Not enough coins yet. Keep going!");
      } else if (result.error === "waiting") {
        setSaid("You already asked for that one!");
      } else {
        setSaid("That treat is gone.");
      }
    });
  }

  function cancel(request: RewardRequest) {
    startTransition(async () => {
      await cancelRequest(request.id);
      setSaid("No problem! Your coins are back.");
    });
  }

  return (
    <main className="treats">
      <header className="treats__hud">
        <Link href="/" className="pixel-button pixel-button--secondary treats__link">
          Quests
        </Link>
        <div className="treats__coins" aria-label={`${coins} coins`}>
          <div className="treats__coin">
            <PixelSprite sprite={coin} label="Coins" />
          </div>
          <span>{coins}</span>
        </div>
      </header>

      <h1 className="treats__title">Treats</h1>
      <p className="treats__say" role="status">
        {said}
      </p>

      {pending.length > 0 && (
        <section className="treats__section">
          <h2 className="treats__subtitle">Waiting for a grown-up</h2>
          <ul className="treats__list">
            {pending.map((request) => (
              <li key={request.id} className="treats__card treats__card--waiting">
                <span className="treats__icon">
                  <PixelSprite sprite={ICONS_BY_KEY[rewards.find((r) => r.id === request.rewardId)?.icon ?? "gift"] ?? ICONS_BY_KEY.gift} label="" />
                </span>
                <span className="treats__name">{request.title}</span>
                <button
                  type="button"
                  className="pixel-button pixel-button--secondary"
                  disabled={busy}
                  onClick={() => cancel(request)}
                >
                  Never mind
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="treats__section">
        <h2 className="treats__subtitle">Rewards</h2>
        {rewards.length === 0 && (
          <p className="treats__empty">No treats yet. Ask a grown-up to add some!</p>
        )}
        <ul className="treats__list">
          {rewards.map((reward) => {
            const waiting = waitingFor.has(reward.id);
            return (
              <li key={reward.id} className="treats__card">
                <span className="treats__icon">
                  <PixelSprite sprite={ICONS_BY_KEY[reward.icon] ?? ICONS_BY_KEY.gift} label="" />
                </span>
                <span className="treats__name">{reward.title}</span>
                <button
                  type="button"
                  className="pixel-button treats__ask"
                  disabled={busy || waiting || coins < reward.cost}
                  onClick={() => ask(reward)}
                >
                  <span className="treats__price-coin">
                    <PixelSprite sprite={coin} label="" />
                  </span>
                  {waiting ? "Asked" : reward.cost}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {recent.length > 0 && (
        <section className="treats__section">
          <h2 className="treats__subtitle">You earned</h2>
          <ul className="treats__list">
            {recent.map((request) => (
              <li key={request.id} className="treats__card treats__card--done">
                <span className="treats__name">{request.title}</span>
                <span className="treats__date">
                  {new Date(request.createdAt).toLocaleDateString("en-PH", {
                    timeZone: "Asia/Manila",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
