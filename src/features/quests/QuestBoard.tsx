"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { lockParent, renameMonster, toggleRestToday, unlockParent } from "./actions";
import { LogDialog, PinDialog } from "./ParentDialogs";
import { MonsterCard } from "./MonsterCard";
import { PixelSprite } from "@/shared/pixel/PixelSprite";
import { coin, flame, padlock } from "./sprites";
import { ICONS_BY_KEY } from "@/features/rewards/icons";
import { nextMilestone } from "./streak";
import { characterLayers } from "@/features/wardrobe/character";
import { equippedPet } from "@/features/wardrobe/pets";
import type { Board as BoardData, QuestRow } from "./types";
import { useSound } from "@/shared/audio/SoundProvider";
import { nextRespawnAt } from "@/shared/time/pht";
import { useNow } from "@/shared/time/useNow";
import "./quest-board.css";

type QuestBoardProps = { board: BoardData; isParent: boolean };

function Board({ board, isParent }: QuestBoardProps) {
  const router = useRouter();
  const now = useNow();
  const pet = equippedPet(board.equipped);
  const { play, muted, toggleMute } = useSound();
  const [celebrations, setCelebrations] = useState<Record<string, number>>({});
  const [pinOpen, setPinOpen] = useState(false);
  const [logging, setLogging] = useState<QuestRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // When a respawn time passes while the app is open, reload the data (monsters are back).
  const nextReset = Math.min(
    nextRespawnAt("daily", board.asOf),
    nextRespawnAt("weekly", board.asOf),
  );
  useEffect(() => {
    if (now && now >= nextReset) router.refresh();
  }, [now, nextReset, router]);

  function onLogged(
    questId: string,
    defeated: boolean,
    bonus: { streak: number; bonus: number } | null,
  ) {
    setCelebrations((current) => ({ ...current, [questId]: (current[questId] ?? 0) + 1 }));
    if (defeated) {
      play("defeat");
      play("coin");
    } else {
      play("hit");
    }
    if (bonus) {
      setToast(`${bonus.streak}-day streak! +${bonus.bonus} bonus coins`);
      setTimeout(() => setToast(null), 5000);
    }
  }

  const { current: streakDays } = board.streak;
  const upNext = nextMilestone(streakDays);

  return (
    <main className="quest-board">
      <header className="quest-board__hud">
        <Link href="/shop" className="quest-board__hero" aria-label="Visit the merchant">
          <PixelSprite sprite={characterLayers(board.equipped)} label="Your hero" />
        </Link>
        {pet && (
          <div className="quest-board__pet">
            <PixelSprite sprite={pet} label="Your pet" />
          </div>
        )}
        <div className="quest-board__coins" aria-label={`${board.coins} coins`}>
          <div className="quest-board__coin">
            <PixelSprite sprite={coin} label="Coins" />
          </div>
          <span>{board.coins}</span>
        </div>
        <Link href="/shop" className="quest-board__icon-button quest-board__shop">
          SHOP
        </Link>
        <Link href="/treats" className="quest-board__icon-button" aria-label="Treats">
          <span className="quest-board__gift">
            <PixelSprite sprite={ICONS_BY_KEY.gift} label="" />
          </span>
        </Link>
        <button
          type="button"
          className="quest-board__icon-button"
          onClick={toggleMute}
          aria-pressed={muted}
          aria-label={muted ? "Turn sound on" : "Turn sound off"}
        >
          {muted ? "OFF" : "ON"}
        </button>
        <button
          type="button"
          className="quest-board__icon-button"
          onClick={() =>
            isParent ? startTransition(async () => lockParent()) : setPinOpen(true)
          }
          aria-label={isParent ? "Leave parent mode" : "Parent mode"}
        >
          {isParent ? (
            "EXIT"
          ) : (
            <span className="quest-board__padlock">
              <PixelSprite sprite={padlock} label="" />
            </span>
          )}
        </button>
      </header>

      {isParent && (
        <div className="quest-board__parent-bar">
          <p className="quest-board__banner">Parent mode</p>
          <div className="quest-board__parent-links">
            <button
              type="button"
              className="pixel-button quest-board__manage"
              aria-pressed={board.streak.restToday}
              onClick={() => startTransition(async () => toggleRestToday())}
            >
              {board.streak.restToday ? "Rest: ON" : "Rest day"}
            </button>
            <Link href="/summary" className="pixel-button quest-board__manage">
              Week
            </Link>
            <Link href="/manage" className="pixel-button quest-board__manage">
              Quests
            </Link>
            <Link href="/rewards" className="pixel-button quest-board__manage">
              Rewards{board.pendingRewards > 0 ? ` (${board.pendingRewards})` : ""}
            </Link>
          </div>
        </div>
      )}

      <div
        className={"quest-board__streak" + (streakDays > 0 ? " quest-board__streak--lit" : "")}
        aria-label={`${streakDays} day streak`}
      >
        <span className="quest-board__flame">
          <PixelSprite sprite={flame} label="" />
        </span>
        <span>
          {streakDays} day streak
          {upNext ? ` · ${upNext} days = bonus!` : ""}
        </span>
      </div>

      {board.streak.restToday && (
        <p className="quest-board__rest">Rest day! Your streak is safe. You can still fight if you want.</p>
      )}

      <h1 className="quest-board__title">Today&apos;s Quests</h1>
      <div className="quest-board__grid">
        {board.quests.map((quest) => (
          <MonsterCard
            key={quest.id}
            quest={quest}
            now={now}
            isParent={isParent}
            celebrate={celebrations[quest.id] ?? 0}
            onRename={renameMonster}
            onLog={setLogging}
          />
        ))}
      </div>

      {isParent && board.evidence.length > 0 && (
        <section className="quest-board__proof">
          <h2 className="quest-board__subtitle">Recent proof</h2>
          <ul className="quest-board__proof-list">
            {board.evidence.map((item) => (
              <li key={item.id} className="quest-board__proof-item">
                <a href={`/api/evidence/${item.id}`} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="quest-board__proof-image"
                    src={`/api/evidence/${item.id}`}
                    alt={`Proof for ${item.questTitle}`}
                    loading="lazy"
                  />
                </a>
                <span className="quest-board__proof-caption">
                  {item.questTitle}
                  <br />
                  {new Date(item.createdAt).toLocaleDateString("en-PH", {
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

      {toast && (
        <p className="quest-board__toast" role="status">
          {toast}
        </p>
      )}

      {pinOpen && !isParent && (
        <PinDialog onSubmit={unlockParent} onClose={() => setPinOpen(false)} />
      )}
      {logging && (
        <LogDialog quest={logging} onClose={() => setLogging(null)} onLogged={onLogged} />
      )}
    </main>
  );
}

export const QuestBoard = Board;
