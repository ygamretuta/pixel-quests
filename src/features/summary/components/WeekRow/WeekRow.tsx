import { spritesByKey } from "@/features/quests/data/monsters";
import { slime } from "@/features/quests/data/sprites";
import { WeekCell } from "@/features/summary/components/WeekCell/WeekCell";
import { WEEKDAY_LETTERS, formatDay } from "@/features/summary/lib/dates";
import type { Cell } from "@/features/summary/types";
import { panelClass } from "@/shared/ui/Panel/panelClass";
import { cx } from "@/shared/lib/css/cx";
import { PixelSprite } from "@/shared/ui/PixelSprite/PixelSprite";
import "./WeekRow.css";

const CELL_LABEL: Record<Cell, string> = {
  done: "done",
  miss: "missed",
  na: "not started",
  future: "upcoming",
  today: "in progress",
  rest: "rest day",
};

type WeekRowProps = {
  title: string;
  sprite: string;
  doneDays: number;
  days: string[];
  cells: Cell[];
};

/** A daily quest across Monday to Sunday. */
export function WeekRow({ title, sprite, doneDays, days, cells }: WeekRowProps) {
  return (
    <div className={cx("week-row", panelClass())}>
      <div className="week-row__head">
        <span className="week-row__thumb">
          <PixelSprite sprite={spritesByKey[sprite] ?? slime} label="" />
        </span>
        <span className="week-row__title">{title}</span>
        <span className="week-row__count">{doneDays}/7</span>
      </div>
      <ol className="week-row__cells">
        {cells.map((cell, index) => (
          <WeekCell key={days[index]} state={cell} label={`${formatDay(days[index])}: ${CELL_LABEL[cell]}`}>
            {WEEKDAY_LETTERS[index]}
          </WeekCell>
        ))}
      </ol>
    </div>
  );
}
