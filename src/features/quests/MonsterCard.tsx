"use client";

import { useOptimistic, useState, useTransition } from "react";
import { PixelSprite } from "./PixelSprite";
import type { QuestRow } from "./types";
import { coin, pencil, slime, spritesByKey } from "./sprites";
import { formatCountdown, nextRespawnAt } from "@/shared/time/pht";
import "./monster-card.css";

type MonsterCardProps = {
  quest: QuestRow;
  now: number;
  isParent: boolean;
  /** Bumps each time the parent logs a hit this session; drives the hit/defeat animations. */
  celebrate: number;
  onRename: (questId: string, name: string) => Promise<void>;
  onLog: (quest: QuestRow) => void;
};

const BURST_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export function MonsterCard({ quest, now, isParent, celebrate, onRename, onLog }: MonsterCardProps) {
  const [editing, setEditing] = useState(false);
  const [name, setOptimisticName] = useOptimistic(quest.monsterName);
  const [, startTransition] = useTransition();

  const hp = Math.max(0, quest.maxHp - quest.done);
  const defeated = hp === 0;
  const sprite = spritesByKey[quest.sprite] ?? slime;
  const respawnIn = now ? formatCountdown(nextRespawnAt(quest.cadence, now) - now) : "";

  function saveName(value: string) {
    const trimmed = value.trim().slice(0, 12);
    setEditing(false);
    if (!trimmed || trimmed === name) return;
    startTransition(async () => {
      setOptimisticName(trimmed);
      await onRename(quest.id, trimmed);
    });
  }

  return (
    <article className={`monster-card monster-card--${quest.cadence}`}>
      <header className="monster-card__header">
        <h2 className="monster-card__title">{quest.title}</h2>
        <span className="monster-card__badge">{quest.cadence}</span>
      </header>

      <div className="monster-card__stage">
        <div
          key={celebrate}
          className={
            "monster-card__monster" +
            (defeated ? " monster-card__monster--defeated" : "") +
            (defeated && celebrate === 0 ? " monster-card__monster--settled" : "") +
            (celebrate > 0 && !defeated ? " monster-card__monster--hit" : "")
          }
        >
          <PixelSprite sprite={sprite} label={name} />
        </div>
        {defeated && (
          <>
            {celebrate > 0 && (
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
            )}
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
          aria-label="Monster name"
          onFocus={(event) => event.target.select()}
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
        {defeated && respawnIn ? `Back in ${respawnIn}` : `${hp}/${quest.maxHp} HP`}
      </p>

      {isParent && (
        <button
          type="button"
          className="pixel-button"
          onClick={() => onLog(quest)}
          disabled={defeated}
        >
          {defeated ? "Defeated" : "Log progress"}
        </button>
      )}
    </article>
  );
}
