"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { buyItem, takeOff, wearItem } from "./actions";
import { characterLayers, merchant, previewLayers } from "./character";
import { PET_SPRITES, equippedPet } from "./pets";
import { ITEMS, SLOT_LABELS, SLOTS, type Equipped, type Item } from "./items";
import { coin } from "@/features/quests/sprites";
import { useSound } from "@/shared/audio/SoundProvider";
import { PixelSprite } from "@/shared/pixel/PixelSprite";
import "./shop.css";

type ShopProps = { coins: number; owned: string[]; equipped: Equipped };

const GREETING = "Welcome, hero! Spend your coins on shiny armor!";

export function Shop({ coins, owned, equipped }: ShopProps) {
  const { play } = useSound();
  const [pending, startTransition] = useTransition();
  const [said, setSaid] = useState(GREETING);
  const pet = equippedPet(equipped);

  function buy(item: Item) {
    startTransition(async () => {
      const result = await buyItem(item.id);
      if (result.ok) {
        play("coin");
        play("defeat");
        setSaid(`You got the ${item.name}! Looking great!`);
      } else {
        setSaid(result.error === "poor" ? "Come back with more coins!" : GREETING);
      }
    });
  }

  function toggle(item: Item) {
    startTransition(async () => {
      if (equipped[item.slot] === item.id) {
        await takeOff(item.slot);
        setSaid(`Back to basics!`);
      } else {
        await wearItem(item.id);
        play("hit");
        setSaid(`The ${item.name} suits you!`);
      }
    });
  }

  return (
    <main className="shop">
      <header className="shop__hud">
        <Link href="/" className="pixel-button pixel-button--secondary shop__back">
          Quests
        </Link>
        <div className="shop__coins" aria-label={`${coins} coins`}>
          <div className="shop__coin">
            <PixelSprite sprite={coin} label="Coins" />
          </div>
          <span>{coins}</span>
        </div>
      </header>

      <section className="shop__scene">
        <div className="shop__hero">
          <div className="shop__hero-body">
            <PixelSprite sprite={characterLayers(equipped)} label="Your hero" />
          </div>
          {pet && (
            <div className="shop__pet">
              <PixelSprite sprite={pet} label="Your pet" />
            </div>
          )}
        </div>
        <div className="shop__merchant">
          <PixelSprite sprite={merchant} label="The merchant" />
        </div>
        <p className="shop__bubble">{said}</p>
      </section>

      {SLOTS.map((slot) => (
        <section key={slot} className="shop__group">
          <h2 className="shop__title">{SLOT_LABELS[slot]}</h2>
          <ul className="shop__items">
            {ITEMS.filter((item) => item.slot === slot).map((item) => {
              const isOwned = owned.includes(item.id);
              const isWorn = equipped[item.slot] === item.id;
              return (
                <li key={item.id} className={"shop__item" + (isWorn ? " shop__item--worn" : "")}>
                  <div className="shop__preview">
                    <PixelSprite
                      sprite={item.pet ? PET_SPRITES[item.pet] : previewLayers(item)}
                      label={item.name}
                    />
                  </div>
                  <span className="shop__name">{item.name}</span>
                  {isOwned ? (
                    <button
                      type="button"
                      className="pixel-button"
                      disabled={pending}
                      onClick={() => toggle(item)}
                    >
                      {isWorn ? "Take off" : "Wear"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="pixel-button shop__buy"
                      disabled={pending || coins < item.price}
                      onClick={() => buy(item)}
                    >
                      <span className="shop__price-coin">
                        <PixelSprite sprite={coin} label="" />
                      </span>
                      {item.price}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </main>
  );
}
