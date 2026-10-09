import { nextMilestone } from "@/features/quests/data/streak";
import { flame } from "@/shared/lib/pixel/icons";
import { cx } from "@/shared/lib/css/cx";
import { PixelSprite } from "@/shared/ui/PixelSprite/PixelSprite";
import "./StreakBadge.css";

export function StreakBadge({ days }: { days: number }) {
  const upNext = nextMilestone(days);

  return (
    <div className={cx("streak-badge", days > 0 && "streak-badge--lit")} aria-label={`${days} day streak`}>
      <span className="streak-badge__flame">
        <PixelSprite sprite={flame} label="" />
      </span>
      <span>
        {days} day streak
        {upNext ? ` · ${upNext} days = bonus!` : ""}
      </span>
    </div>
  );
}
