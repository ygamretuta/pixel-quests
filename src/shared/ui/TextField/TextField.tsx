import type { ComponentProps } from "react";
import { cx } from "@/shared/lib/css/cx";
import "./TextField.css";

type TextFieldProps = ComponentProps<"input"> & { label: string };

/** A labelled text/number input. */
export function TextField({ label, className, ...props }: TextFieldProps) {
  return (
    <label className="text-field">
      <span className="text-field__label">{label}</span>
      <input className={cx("text-field__input", className)} {...props} />
    </label>
  );
}
