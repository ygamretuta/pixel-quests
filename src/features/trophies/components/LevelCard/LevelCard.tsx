import type { LevelInfo } from "@/features/trophies/data/levels";
import { cx } from "@/shared/lib/css/cx";
import { panelClass } from "@/shared/ui/Panel/panelClass";
import "./LevelCard.css";

export function LevelCard({ level }: { level: LevelInfo }) {
  const span = level.to === null ? 1 : level.to - level.from;
  const percent = level.to === null ? 100 : Math.round(((level.xp - level.from) / span) * 100);

  return (
    <section className={cx("level-card", panelClass())}>
      <p className="level-card__level">Level {level.level}</p>
      <h2 className="level-card__title">{level.title}</h2>
      <div
        className="level-card__track"
        role="progressbar"
        aria-label="Progress to the next level"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <span className="level-card__fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="level-card__xp">
        {level.to === null ? `${level.xp} XP · top level!` : `${level.xp} / ${level.to} XP to level ${level.level + 1}`}
      </p>
    </section>
  );
}
