import { MONSTERS } from "@/features/monsters/data/monsters";
import { silhouette } from "@/features/trophies/lib/silhouette";
import { cx } from "@/shared/lib/css/cx";
import { panelClass } from "@/shared/ui/Panel/panelClass";
import { PixelSprite } from "@/shared/ui/PixelSprite/PixelSprite";
import "./MonsterDex.css";

/** Every kind of monster; the ones she has defeated are in color. */
export function MonsterDex({ dex }: { dex: Record<string, number> }) {
  const met = MONSTERS.filter((monster) => (dex[monster.key] ?? 0) > 0).length;

  return (
    <section className="monster-dex">
      <h2 className="monster-dex__title">
        Monsters {met}/{MONSTERS.length}
      </h2>
      <ul className="monster-dex__list">
        {MONSTERS.map((monster) => {
          const count = dex[monster.key] ?? 0;
          return (
            <li key={monster.key} className={cx("monster-dex__item", panelClass(), count === 0 && "monster-dex__item--unknown")}>
              <span className="monster-dex__sprite">
                <PixelSprite sprite={count > 0 ? monster.sprite : silhouette(monster.sprite)} label="" />
              </span>
              <span className="monster-dex__name">{count > 0 ? monster.label : "???"}</span>
              <span className="monster-dex__count">{count > 0 ? `Defeated x${count}` : "Not met yet"}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
