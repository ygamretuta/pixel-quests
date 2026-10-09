"use client";

import { useState, useTransition } from "react";
import { PinDialog } from "@/features/parent/components/PinDialog/PinDialog";
import { buyShield } from "@/features/quests/actions";
import { MAX_SHIELDS, SHIELD_PRICE } from "@/features/quests/data/streak";
import { useSound } from "@/shared/audio/SoundProvider/SoundProvider";
import { cx } from "@/shared/lib/css/cx";
import { shield } from "@/shared/lib/pixel/icons";
import { panelClass } from "@/shared/ui/Panel/panelClass";
import { PixelButton } from "@/shared/ui/PixelButton/PixelButton";
import { PixelSprite } from "@/shared/ui/PixelSprite/PixelSprite";
import { PriceTag } from "@/shared/ui/PriceTag/PriceTag";
import "./ShieldBoost.css";

type ShieldBoostProps = { shields: number; coins: number; isParent: boolean };

/** The merchant's streak shield: covers one missed day so the streak survives. */
export function ShieldBoost({ shields, coins, isParent }: ShieldBoostProps) {
  const { play } = useSound();
  const [pending, startTransition] = useTransition();
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function purchase(pin?: string): Promise<{ ok: true } | { ok: false; error: "wrong" | "locked" }> {
    const result = await buyShield(pin);
    if (result.ok) {
      play("coin");
      setNote("Shield ready! It will save one missed day.");
      return { ok: true };
    }
    if (result.error === "wrong" || result.error === "locked") return { ok: false, error: result.error };
    setNote(result.error === "full" ? `You can hold ${MAX_SHIELDS} shields.` : "Not enough coins yet.");
    return { ok: true };
  }

  const full = shields >= MAX_SHIELDS;

  return (
    <section className="shield-boost">
      <h2 className="shield-boost__title">Boosts</h2>
      <div className={cx("shield-boost__card", panelClass())}>
        <span className="shield-boost__icon">
          <PixelSprite sprite={shield} label="" />
        </span>
        <span className="shield-boost__text">
          Streak Shield
          <span className="shield-boost__detail">
            Saves your streak if you miss a day. You have {shields} of {MAX_SHIELDS}.
          </span>
        </span>
        <PixelButton
          className="shield-boost__button"
          disabled={pending || full || coins < SHIELD_PRICE}
          onClick={() => (isParent ? startTransition(async () => void (await purchase())) : setAsking(true))}
        >
          {full ? "Full" : <PriceTag>{SHIELD_PRICE}</PriceTag>}
        </PixelButton>
      </div>
      {note && (
        <p className="shield-boost__note" role="status">
          {note}
        </p>
      )}
      {asking && (
        <PinDialog
          title="Ask a grown-up"
          confirmLabel="Buy"
          onSubmit={(pin) => purchase(pin)}
          onClose={() => setAsking(false)}
        />
      )}
    </section>
  );
}
