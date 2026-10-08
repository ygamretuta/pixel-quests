"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { lockParent, renameMonster } from "./actions";
import { LogDialog, PinDialog } from "./ParentDialogs";
import { MonsterCard } from "./MonsterCard";
import { PixelSprite } from "@/shared/pixel/PixelSprite";
import { coin, padlock } from "./sprites";
import { characterLayers } from "@/features/wardrobe/character";
import type { Board as BoardData, QuestRow } from "./types";
import { useSound } from "@/shared/audio/SoundProvider";
import { nextRespawnAt } from "@/shared/time/pht";
import { useNow } from "@/shared/time/useNow";
import "./quest-board.css";

type QuestBoardProps = { board: BoardData; isParent: boolean };

function Board({ board, isParent }: QuestBoardProps) {
  const router = useRouter();
  const now = useNow();
  const { play, muted, toggleMute } = useSound();
  const [celebrations, setCelebrations] = useState<Record<string, number>>({});
  const [pinOpen, setPinOpen] = useState(false);
  const [logging, setLogging] = useState<QuestRow | null>(null);
  const [, startTransition] = useTransition();

  // When a respawn time passes while the app is open, reload the data (monsters are back).
  const nextReset = Math.min(
    nextRespawnAt("daily", board.asOf),
    nextRespawnAt("weekly", board.asOf),
  );
  useEffect(() => {
    if (now && now >= nextReset) router.refresh();
  }, [now, nextReset, router]);

  function onLogged(questId: string, defeated: boolean) {
    setCelebrations((current) => ({ ...current, [questId]: (current[questId] ?? 0) + 1 }));
    if (defeated) {
      play("defeat");
      play("coin");
    } else {
      play("hit");
    }
  }

  return (
    <main className="quest-board">
      <header className="quest-board__hud">
        <Link href="/shop" className="quest-board__hero" aria-label="Visit the merchant">
          <PixelSprite sprite={characterLayers(board.equipped)} label="Your hero" />
        </Link>
        <div className="quest-board__coins" aria-label={`${board.coins} coins`}>
          <div className="quest-board__coin">
            <PixelSprite sprite={coin} label="Coins" />
          </div>
          <span>{board.coins}</span>
        </div>
        <Link href="/shop" className="quest-board__icon-button quest-board__shop">
          SHOP
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

      {isParent && <p className="quest-board__banner">Parent mode</p>}

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

      {pinOpen && !isParent && <PinDialog onClose={() => setPinOpen(false)} />}
      {logging && (
        <LogDialog quest={logging} onClose={() => setLogging(null)} onLogged={onLogged} />
      )}
    </main>
  );
}

export const QuestBoard = Board;
