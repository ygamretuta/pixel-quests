"use client";

import { speak } from "@/shared/lib/speech/speak";
import { speaker } from "@/shared/lib/pixel/icons";
import { PixelSprite } from "@/shared/ui/PixelSprite/PixelSprite";
import "./SpeakButton.css";

/** A small speaker button that reads `text` aloud, for children who can't read yet. */
export function SpeakButton({ text }: { text: string }) {
  return (
    <button type="button" className="speak-button" onClick={() => speak(text)} aria-label="Read aloud">
      <span className="speak-button__icon">
        <PixelSprite sprite={speaker} label="" />
      </span>
    </button>
  );
}
