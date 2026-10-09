import { ICONS_BY_KEY } from "@/features/rewards/data/icons";
import type { Goal } from "@/features/rewards/types";
import { PixelSprite } from "@/shared/ui/PixelSprite/PixelSprite";
import "./GoalBar.css";

type GoalBarProps = { goal: Goal; coins: number };

/** "Saving for Ice cream" with a bar that fills as her coins grow. */
export function GoalBar({ goal, coins }: GoalBarProps) {
  const saved = Math.min(coins, goal.cost);
  const percent = Math.round((saved / goal.cost) * 100);
  const ready = coins >= goal.cost;

  return (
    <div className="goal-bar">
      <span className="goal-bar__icon">
        <PixelSprite sprite={ICONS_BY_KEY[goal.icon] ?? ICONS_BY_KEY.gift} label="" />
      </span>
      <div className="goal-bar__body">
        <span className="goal-bar__label">
          {ready ? `Ready to ask for ${goal.title}!` : `Saving for ${goal.title}`}
        </span>
        <div
          className="goal-bar__track"
          role="progressbar"
          aria-label={`Saving for ${goal.title}`}
          aria-valuemin={0}
          aria-valuemax={goal.cost}
          aria-valuenow={saved}
        >
          <span className="goal-bar__fill" style={{ width: `${percent}%` }} />
        </div>
        <span className="goal-bar__count">
          {saved}/{goal.cost}
        </span>
      </div>
    </div>
  );
}
