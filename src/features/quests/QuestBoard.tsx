"use client";

import { PixelSprite } from "./PixelSprite";
import { MonsterCard } from "./MonsterCard";
import { demoQuests } from "./quests";
import { coin, hero } from "./sprites";
import { SoundProvider, useSound } from "@/shared/audio/SoundProvider";
import { useLocalStorage } from "@/shared/storage/useLocalStorage";
import "./quest-board.css";

const NO_NAMES: Record<string, string> = {};

function Board() {
  const [coins, setCoins] = useLocalStorage("pixel-quests:coins", 0);
  const [names, setNames] = useLocalStorage("pixel-quests:names", NO_NAMES);
  const { muted, toggleMute } = useSound();

  return (
    <main className="quest-board">
      <header className="quest-board__hud">
        <div className="quest-board__hero">
          <PixelSprite sprite={hero} label="Your hero" />
        </div>
        <div className="quest-board__coins" aria-label={`${coins} coins`}>
          <div className="quest-board__coin">
            <PixelSprite sprite={coin} label="Coins" />
          </div>
          <span>{coins}</span>
        </div>
        <button
          type="button"
          className="quest-board__mute"
          onClick={toggleMute}
          aria-pressed={muted}
          aria-label={muted ? "Turn sound on" : "Turn sound off"}
        >
          {muted ? "OFF" : "ON"}
        </button>
      </header>

      <h1 className="quest-board__title">Today&apos;s Quests</h1>
      <div className="quest-board__grid">
        {demoQuests.map((quest) => (
          <MonsterCard
            key={quest.id}
            quest={quest}
            name={names[quest.id] ?? quest.monsterName}
            onRename={(name) => setNames((current) => ({ ...current, [quest.id]: name }))}
            onDefeat={(reward) => setCoins((current) => current + reward)}
          />
        ))}
      </div>
    </main>
  );
}

export function QuestBoard() {
  return (
    <SoundProvider>
      <Board />
    </SoundProvider>
  );
}
