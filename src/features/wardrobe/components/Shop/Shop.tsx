"use client";

import { useState, useTransition, type ReactNode } from "react";
import { PinDialog } from "@/features/parent/components/PinDialog/PinDialog";
import { buyItem, takeOff, wearItem } from "@/features/wardrobe/actions";
import { ShopItem } from "@/features/wardrobe/components/ShopItem/ShopItem";
import { ShopScene } from "@/features/wardrobe/components/ShopScene/ShopScene";
import { ITEMS, SLOT_LABELS, SLOTS, type Equipped, type Item } from "@/features/wardrobe/data/items";
import { useSound } from "@/shared/audio/SoundProvider/SoundProvider";
import { CoinBalance } from "@/shared/ui/CoinBalance/CoinBalance";
import { PixelLinkButton } from "@/shared/ui/PixelButton/PixelButton";
import "./Shop.css";

type ShopProps = {
  coins: number;
  owned: string[];
  equipped: Equipped;
  isParent: boolean;
  /** Extra things the merchant sells that other features own (e.g. streak shields). */
  boosts?: ReactNode;
};

const GREETING = "Welcome, hero! Spend your coins on shiny armor!";

export function Shop({ coins, owned, equipped, isParent, boosts }: ShopProps) {
  const { play } = useSound();
  const [pending, startTransition] = useTransition();
  const [said, setSaid] = useState(GREETING);
  const [approving, setApproving] = useState<Item | null>(null);

  /** Runs the purchase; resolves ok unless the PIN itself was rejected. */
  async function purchase(
    item: Item,
    pin?: string,
  ): Promise<{ ok: true } | { ok: false; error: "wrong" | "locked" }> {
    const result = await buyItem(item.id, pin);
    if (result.ok) {
      play("coin");
      play("defeat");
      setSaid(`You got the ${item.name}! Looking great!`);
      return { ok: true };
    }
    if (result.error === "wrong" || result.error === "locked") {
      return { ok: false, error: result.error };
    }
    setSaid(result.error === "poor" ? "Come back with more coins!" : GREETING);
    return { ok: true };
  }

  function buy(item: Item) {
    if (isParent) startTransition(async () => void (await purchase(item)));
    else setApproving(item);
  }

  function toggle(item: Item) {
    startTransition(async () => {
      if (equipped[item.slot] === item.id) {
        await takeOff(item.slot);
        setSaid("Back to basics!");
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
        <div className="shop__links">
          <PixelLinkButton href="/" variant="secondary">
            Quests
          </PixelLinkButton>
          <PixelLinkButton href="/treats" variant="secondary">
            Treats
          </PixelLinkButton>
        </div>
        <CoinBalance amount={coins} />
      </header>

      <ShopScene equipped={equipped} said={said} />

      {boosts}

      {SLOTS.map((slot) => (
        <section key={slot} className="shop__group">
          <h2 className="shop__title">{SLOT_LABELS[slot]}</h2>
          <ul className="shop__items">
            {ITEMS.filter((item) => item.slot === slot).map((item) => (
              <ShopItem
                key={item.id}
                item={item}
                owned={owned.includes(item.id)}
                worn={equipped[item.slot] === item.id}
                affordable={coins >= item.price}
                busy={pending}
                onBuy={buy}
                onToggle={toggle}
              />
            ))}
          </ul>
        </section>
      ))}

      {approving && (
        <PinDialog
          title="Ask a grown-up"
          confirmLabel="Buy"
          onSubmit={(pin) => purchase(approving, pin)}
          onClose={() => setApproving(null)}
        />
      )}
    </main>
  );
}
