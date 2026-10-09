"use client";

import { useState, useTransition } from "react";
import { cancelRequest, requestReward, setGoal } from "@/features/rewards/actions";
import { GoalBar } from "@/features/rewards/components/GoalBar/GoalBar";
import { RewardCard } from "@/features/rewards/components/RewardCard/RewardCard";
import type { Goal, Reward, RewardRequest } from "@/features/rewards/types";
import { useSound } from "@/shared/audio/SoundProvider/SoundProvider";
import { CoinBalance } from "@/shared/ui/CoinBalance/CoinBalance";
import { PixelButton, PixelLinkButton } from "@/shared/ui/PixelButton/PixelButton";
import { PriceTag } from "@/shared/ui/PriceTag/PriceTag";
import "./Treats.css";

type TreatsProps = {
  coins: number;
  rewards: Reward[];
  pending: RewardRequest[];
  recent: RewardRequest[];
  goal: Goal | null;
};

const HELLO = "Real treats! Save up coins, then ask a grown-up.";

export function Treats({ coins, rewards, pending, recent, goal }: TreatsProps) {
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
      } else if (result.error === "sleeping") {
        setSaid("Shh! It's bedtime. Ask again in the morning.");
      } else if (result.error === "waiting") {
        setSaid("You already asked for that one!");
      } else {
        setSaid("That treat is gone.");
      }
    });
  }

  function save(reward: Reward) {
    startTransition(async () => {
      const isGoal = goal?.rewardId === reward.id;
      await setGoal(isGoal ? null : reward.id);
      setSaid(isGoal ? "Okay, no goal for now." : `Saving up for ${reward.title}!`);
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
        <PixelLinkButton href="/" variant="secondary">
          Quests
        </PixelLinkButton>
        <CoinBalance amount={coins} />
      </header>

      <h1 className="treats__title">Treats</h1>
      <p className="treats__say" role="status">
        {said}
      </p>

      {goal && <GoalBar goal={goal} coins={coins} />}

      {pending.length > 0 && (
        <section className="treats__section">
          <h2 className="treats__subtitle">Waiting for a grown-up</h2>
          <ul className="treats__list">
            {pending.map((request) => (
              <RewardCard
                key={request.id}
                tone="waiting"
                title={request.title}
                icon={rewards.find((reward) => reward.id === request.rewardId)?.icon ?? "gift"}
              >
                <PixelButton variant="secondary" disabled={busy} onClick={() => cancel(request)}>
                  Never mind
                </PixelButton>
              </RewardCard>
            ))}
          </ul>
        </section>
      )}

      <section className="treats__section">
        <h2 className="treats__subtitle">Rewards</h2>
        {rewards.length === 0 && <p className="treats__empty">No treats yet. Ask a grown-up to add some!</p>}
        <ul className="treats__list">
          {rewards.map((reward) => {
            const waiting = waitingFor.has(reward.id);
            return (
              <RewardCard
                key={reward.id}
                title={reward.title}
                icon={reward.icon}
                detail={goal?.rewardId === reward.id ? "Your goal" : undefined}
                speech={`${reward.title}. It costs ${reward.cost} coins.`}
              >
                <PixelButton disabled={busy || waiting || coins < reward.cost} onClick={() => ask(reward)}>
                  <PriceTag>{waiting ? "Asked" : reward.cost}</PriceTag>
                </PixelButton>
                <PixelButton variant="secondary" disabled={busy} onClick={() => save(reward)}>
                  {goal?.rewardId === reward.id ? "Unsave" : "Save up"}
                </PixelButton>
              </RewardCard>
            );
          })}
        </ul>
      </section>

      {recent.length > 0 && (
        <section className="treats__section">
          <h2 className="treats__subtitle">You earned</h2>
          <ul className="treats__list">
            {recent.map((request) => (
              <RewardCard
                key={request.id}
                tone="done"
                title={request.title}
                detail={new Date(request.createdAt).toLocaleDateString("en-PH", {
                  timeZone: "Asia/Manila",
                  month: "short",
                  day: "numeric",
                })}
              />
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
