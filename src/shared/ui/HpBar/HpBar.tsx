import { cx } from "@/shared/lib/css/cx";
import "./HpBar.css";

type HpBarProps = {
  max: number;
  current: number;
  /** Hide from assistive tech when the number is already shown as text nearby. */
  decorative?: boolean;
};

export function HpBar({ max, current, decorative = false }: HpBarProps) {
  const a11y = decorative
    ? { "aria-hidden": true }
    : {
        role: "progressbar",
        "aria-label": "Monster health",
        "aria-valuemin": 0,
        "aria-valuemax": max,
        "aria-valuenow": current,
      };

  return (
    <div className="hp-bar" {...a11y}>
      {Array.from({ length: max }, (_, index) => (
        <span
          key={index}
          className={cx("hp-bar__segment", index < current && "hp-bar__segment--full")}
        />
      ))}
    </div>
  );
}
