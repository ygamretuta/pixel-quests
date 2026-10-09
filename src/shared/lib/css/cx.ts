/** Joins class names, skipping falsy values: cx("a", isOn && "a--on"). */
export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}
