import type { ReactNode } from "react";
import { cx } from "@/shared/lib/css/cx";
import "./Choice.css";

type ChoiceProps = {
  name: string;
  value: string;
  defaultChecked?: boolean;
  /** Stack a picture above its label. */
  stacked?: boolean;
  children: ReactNode;
};

/** One radio option drawn as a pixel button. */
export function Choice({ name, value, defaultChecked, stacked = false, children }: ChoiceProps) {
  return (
    <label className="choice">
      <input className="choice__input" type="radio" name={name} value={value} defaultChecked={defaultChecked} />
      <span className={cx("choice__box", stacked && "choice__box--stacked")}>{children}</span>
    </label>
  );
}

/** A picture inside a stacked <Choice>. */
export function ChoicePicture({ children }: { children: ReactNode }) {
  return <span className="choice__picture">{children}</span>;
}
