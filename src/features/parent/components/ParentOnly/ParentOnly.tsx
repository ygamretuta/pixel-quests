import { PixelLinkButton } from "@/shared/ui/PixelButton/PixelButton";
import "./ParentOnly.css";

/** Shown instead of a parent page when parent mode is locked. */
export function ParentOnly() {
  return (
    <main className="parent-only">
      <p className="parent-only__message">Parents only. Unlock parent mode with the padlock first.</p>
      <PixelLinkButton href="/">Back to quests</PixelLinkButton>
    </main>
  );
}
