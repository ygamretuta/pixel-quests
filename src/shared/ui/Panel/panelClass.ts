import { cx } from "@/shared/lib/css/cx";
import "./Panel.css";

export type PanelTone = "plain" | "raised" | "highlight" | "stage";

/**
 * Class names for the beveled box every card, tile and dialog is built on.
 * Mix it into an element's own class: `className={cx("monster-card", panelClass("raised"))}`.
 */
export function panelClass(tone: PanelTone = "plain") {
  return cx("panel", tone !== "plain" && `panel--${tone}`);
}
