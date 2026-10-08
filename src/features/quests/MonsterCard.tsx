"use client";

import { useState } from "react";
import { PixelSprite } from "./PixelSprite";
import type { Quest } from "./quests";
import { coin, pencil } from "./sprites";
import { useSound } from "@/shared/audio/SoundProvider";
import "./monster-card.css";

type MonsterCardProps = {
  quest: Quest;
  name: string;
  onRename: (name: string) => void;
  onDefeat: (reward: number) => void;
};

const BURST_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export function MonsterCard({ quest, name, onRename, onDefeat }: MonsterCardProps) {
  const [hp, setHp] = useState(quest.maxHp);
  const [hitCount, setHitCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const { play } = useSound();
  const defeated = hp === 0;

  function hit() {
    const next = hp - 1;
    setHp(next);
    setHitCount((count) => count + 1);
    if (next === 0) {
      play("defeat");
      play("coin");
      onDefeat(quest.reward);
    } else {
      play("hit");
    }
  }

  function respawn() {
    setHp(quest.maxHp);
  }

  function saveName(value: string) {
    const trimmed = value.trim();
    if (trimmed) onRename(trimmed);
    setEditing(false);
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
          <PixelSprite sprite={quest.sprite} label={name} />
        </div>
        {defeated && (
          <>
            <div className="monster-card__burst" aria-hidden="true">
              {BURST_ANGLES.map((angle) => (
                <span
                  key={angle}
                  className="monster-card__spark"
                  style={{
                    "--dx": `${Math.round(Math.cos((angle * Math.PI) / 180) * 64)}px`,
                    "--dy": `${Math.round(Math.sin((angle * Math.PI) / 180) * 64)}px`,
                  } as React.CSSProperties}
                />
              ))}
            </div>
            <p className="monster-card__reward">
              <span className="monster-card__coin">
                <PixelSprite sprite={coin} label="" />
              </span>
              +{quest.reward}
            </p>
          </>
        )}
      </div>

      {editing ? (
        <input
          className="monster-card__name-input"
          defaultValue={name}
          maxLength={12}
          autoFocus
          onFocus={(event) => event.target.select()}
          aria-label="Monster name"
          onBlur={(event) => saveName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") setEditing(false);
          }}
        />
      ) : (
        <button
          type="button"
          className="monster-card__name"
          onClick={() => setEditing(true)}
          aria-label={`Rename ${name}`}
        >
          {name}
          <span className="monster-card__pencil" aria-hidden="true">
            <PixelSprite sprite={pencil} label="" />
          </span>
        </button>
      )}

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
