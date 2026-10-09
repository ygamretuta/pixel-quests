import type { ReactNode } from "react";
import type { Cell } from "@/features/summary/types";
import "./WeekCell.css";

type WeekCellProps = { state: Cell; label?: string; children?: ReactNode };

/** One day in a week grid: a colored square that says done, missed, rest... */
export function WeekCell({ state, label, children }: WeekCellProps) {
  return (
    <li className={`week-cell week-cell--${state}`} aria-label={label}>
      {children}
    </li>
  );
}

/** The same square, as a plain swatch for the legend. */
export function WeekCellSwatch({ state }: { state: Cell }) {
  return <span className={`week-cell week-cell--${state} week-cell--swatch`} aria-hidden="true" />;
}
