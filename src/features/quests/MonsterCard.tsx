"use client";

import { useState } from "react";
import { PixelSprite } from "./PixelSprite";
import type { Quest } from "./quests";
import "./monster-card.css";

export function MonsterCard({ quest }: { quest: Quest }) {
  const [hp, setHp] = useState(quest.maxHp);
  const [hitCount, setHitCount] = useState(0);
  const defeated = hp === 0;

  function hit() {
    setHp((current) => Math.max(0, current - 1));
    setHitCount((count) => count + 1);
  }

  function respawn() {
    setHp(quest.maxHp);
  }

  return (
    <article className={`monster-card monster-card--${quest.cadence}`}>
      <header className="monster-card__header">
        <h2 className="monster-card__title">{quest.title}</h2>
        <span className="monster-card__badge">{quest.cadence}</span>
      </header>

      <div className="monster-card__stage">
        <div
          key={hitCount}
          className={
            "monster-card__monster" +
            (defeated ? " monster-card__monster--defeated" : "") +
            (hitCount > 0 && !defeated ? " monster-card__monster--hit" : "")
          }
        >
          <PixelSprite sprite={quest.sprite} label={defeated ? "Defeated monster" : quest.title} />
        </div>
        {defeated && <p className="monster-card__reward">+{quest.reward} coins!</p>}
      </div>

      <div
        className="hp-bar"
        role="progressbar"
        aria-label="Monster health"
        aria-valuemin={0}
        aria-valuemax={quest.maxHp}
        aria-valuenow={hp}
      >
        {Array.from({ length: quest.maxHp }, (_, i) => (
          <span
            key={i}
            className={"hp-bar__segment" + (i < hp ? " hp-bar__segment--full" : "")}
          />
        ))}
      </div>
      <p className="monster-card__hp">
        {hp}/{quest.maxHp} HP
      </p>

      {/* Demo control; becomes parent-only evidence approval later. */}
      <button
        type="button"
        className="monster-card__action"
        onClick={defeated ? respawn : hit}
      >
        {defeated ? "Respawn" : "Hit!"}
      </button>
    </article>
  );
}
