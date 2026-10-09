"use client";

import { useOptimistic, useTransition, type CSSProperties } from "react";
import { MonsterNameEditor } from "@/features/quests/components/MonsterNameEditor/MonsterNameEditor";
import { spritesByKey } from "@/features/quests/data/monsters";
import { slime } from "@/features/quests/data/sprites";
import type { QuestRow } from "@/features/quests/types";
import { cx } from "@/shared/lib/css/cx";
import { coin } from "@/shared/lib/pixel/icons";
import { formatCountdown, nextRespawnAt } from "@/shared/lib/time/pht";
import { HpBar } from "@/shared/ui/HpBar/HpBar";
import { panelClass } from "@/shared/ui/Panel/panelClass";
import { PixelButton } from "@/shared/ui/PixelButton/PixelButton";
import { PixelSprite } from "@/shared/ui/PixelSprite/PixelSprite";
import "./MonsterCard.css";

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

function sparkOffset(angle: number): CSSProperties {
  const radians = (angle * Math.PI) / 180;
  return {
    "--dx": `${Math.round(Math.cos(radians) * 64)}px`,
    "--dy": `${Math.round(Math.sin(radians) * 64)}px`,
  } as CSSProperties;
}

export function MonsterCard({ quest, now, isParent, celebrate, onRename, onLog }: MonsterCardProps) {
  const [name, setOptimisticName] = useOptimistic(quest.monsterName);
  const [, startTransition] = useTransition();

  const hp = Math.max(0, quest.maxHp - quest.done);
  const defeated = hp === 0;
  const respawnIn = now ? formatCountdown(nextRespawnAt(quest.cadence, now) - now) : "";

  function rename(next: string) {
    startTransition(async () => {
      setOptimisticName(next);
      await onRename(quest.id, next);
    });
  }

  return (
    <article className={cx("monster-card", `monster-card--${quest.cadence}`, panelClass("raised"))}>
      <header className="monster-card__header">
        <h2 className="monster-card__title">{quest.title}</h2>
        <span className="monster-card__badge">{quest.cadence}</span>
      </header>

      <div className="monster-card__stage">
        <div
          key={celebrate}
          className={cx(
            "monster-card__monster",
            defeated && "monster-card__monster--defeated",
            defeated && celebrate === 0 && "monster-card__monster--settled",
            celebrate > 0 && !defeated && "monster-card__monster--hit",
          )}
        >
          <PixelSprite sprite={spritesByKey[quest.sprite] ?? slime} label={name} />
        </div>
        {defeated && (
          <>
            {celebrate > 0 && (
              <div className="monster-card__burst" aria-hidden="true">
                {BURST_ANGLES.map((angle) => (
                  <span key={angle} className="monster-card__spark" style={sparkOffset(angle)} />
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

      <MonsterNameEditor name={name} onSave={rename} />

      <HpBar max={quest.maxHp} current={hp} />
      <p className="monster-card__hp">
        {defeated && respawnIn ? `Back in ${respawnIn}` : `${hp}/${quest.maxHp} HP`}
      </p>

      {isParent && (
        <PixelButton onClick={() => onLog(quest)} disabled={defeated}>
          {defeated ? "Defeated" : "Log progress"}
        </PixelButton>
      )}
    </article>
  );
}
