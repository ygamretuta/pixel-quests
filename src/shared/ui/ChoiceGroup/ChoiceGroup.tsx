import type { ReactNode } from "react";
import { cx } from "@/shared/lib/css/cx";
import "./ChoiceGroup.css";

type ChoiceGroupProps = {
  legend: string;
  /** Three columns from tablet width up, for picture grids. */
  wide?: boolean;
  children: ReactNode;
};

/** A fieldset of <Choice> radio options laid out in a grid. */
export function ChoiceGroup({ legend, wide = false, children }: ChoiceGroupProps) {
  return (
    <fieldset className={cx("choice-group", wide && "choice-group--wide")}>
      <legend className="choice-group__legend">{legend}</legend>
      {children}
    </fieldset>
  );
}
