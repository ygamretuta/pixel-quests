import { nextMilestone } from "@/features/quests/data/streak";
import type { LevelInfo } from "@/features/trophies/data/levels";
import { cx } from "@/shared/lib/css/cx";
import { flame, shield } from "@/shared/lib/pixel/icons";
import { PixelSprite } from "@/shared/ui/PixelSprite/PixelSprite";
import "./StreakBadge.css";

type StreakBadgeProps = { days: number; shields: number; level: LevelInfo };

/** Level and title, the streak, and any shields she is holding. */
export function StreakBadge({ days, shields, level }: StreakBadgeProps) {
  const upNext = nextMilestone(days);

  return (
    <div className="streak-badge">
      <p className="streak-badge__level">
        Lv {level.level} {level.title}
      </p>
      <div className={cx("streak-badge__streak", days > 0 && "streak-badge__streak--lit")} aria-label={`${days} day streak`}>
        <span className="streak-badge__flame">
          <PixelSprite sprite={flame} label="" />
        </span>
        <span>
          {days} day streak
          {upNext ? ` · ${upNext} days = bonus!` : ""}
        </span>
        {shields > 0 && (
          <span className="streak-badge__shields" aria-label={`${shields} streak ${shields === 1 ? "shield" : "shields"}`}>
            <span className="streak-badge__shield">
              <PixelSprite sprite={shield} label="" />
            </span>
            x{shields}
          </span>
        )}
      </div>
    </div>
  );
}
