import { spritesByKey } from "@/features/monsters/data/monsters";
import { slime } from "@/features/monsters/data/sprites";
import { cx } from "@/shared/lib/css/cx";
import { HpBar } from "@/shared/ui/HpBar/HpBar";
import { panelClass } from "@/shared/ui/Panel/panelClass";
import { PixelSprite } from "@/shared/ui/PixelSprite/PixelSprite";
import "./BossRow.css";

type BossRowProps = { title: string; sprite: string; maxHp: number; hits: number; defeated: boolean };

/** A weekly boss and how much of its health is left. */
export function BossRow({ title, sprite, maxHp, hits, defeated }: BossRowProps) {
  return (
    <div className={cx("boss-row", panelClass())}>
      <div className="boss-row__head">
        <span className="boss-row__thumb">
          <PixelSprite sprite={spritesByKey[sprite] ?? slime} label="" />
        </span>
        <span className="boss-row__title">{title}</span>
        <span className="boss-row__status">{defeated ? "Defeated" : `${hits}/${maxHp}`}</span>
      </div>
      <HpBar max={maxHp} current={maxHp - hits} decorative />
    </div>
  );
}
