"use client";

import Link from "next/link";
import { useTransition } from "react";
import { lockParent } from "@/features/parent/actions";
import { ICONS_BY_KEY } from "@/features/rewards/data/icons";
import { characterLayers } from "@/features/wardrobe/data/character";
import type { Equipped } from "@/features/wardrobe/data/items";
import { equippedPet } from "@/features/wardrobe/data/pets";
import { useSound } from "@/shared/audio/SoundProvider/SoundProvider";
import { padlock } from "@/shared/lib/pixel/icons";
import { CoinBalance } from "@/shared/ui/CoinBalance/CoinBalance";
import { PixelSprite } from "@/shared/ui/PixelSprite/PixelSprite";
import "./QuestHud.css";

type QuestHudProps = {
  coins: number;
  equipped: Equipped;
  isParent: boolean;
  onUnlock: () => void;
};

/** The top bar: her hero and pet, coins, and the shortcuts she can tap. */
export function QuestHud({ coins, equipped, isParent, onUnlock }: QuestHudProps) {
  const { muted, toggleMute } = useSound();
  const [, startTransition] = useTransition();
  const pet = equippedPet(equipped);

  return (
    <header className="quest-hud">
      <Link href="/trophies" className="quest-hud__hero" aria-label="See your trophies">
        <PixelSprite sprite={characterLayers(equipped)} label="Your hero" />
      </Link>
      {pet && (
        <div className="quest-hud__pet">
          <PixelSprite sprite={pet} label="Your pet" />
        </div>
      )}
      <CoinBalance amount={coins} className="quest-hud__coins" />
      <Link href="/shop" className="quest-hud__button quest-hud__button--shop">
        SHOP
      </Link>
      <Link href="/treats" className="quest-hud__button" aria-label="Treats">
        <span className="quest-hud__gift">
          <PixelSprite sprite={ICONS_BY_KEY.gift} label="" />
        </span>
      </Link>
      <button
        type="button"
        className="quest-hud__button"
        onClick={toggleMute}
        aria-pressed={muted}
        aria-label={muted ? "Turn sound on" : "Turn sound off"}
      >
        {muted ? "OFF" : "ON"}
      </button>
      <button
        type="button"
        className="quest-hud__button"
        onClick={() => (isParent ? startTransition(lockParent) : onUnlock())}
        aria-label={isParent ? "Leave parent mode" : "Parent mode"}
      >
        {isParent ? (
          "EXIT"
        ) : (
          <span className="quest-hud__padlock">
            <PixelSprite sprite={padlock} label="" />
          </span>
        )}
      </button>
    </header>
  );
}
