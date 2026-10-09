"use client";

import { useState } from "react";
import { pencil } from "@/shared/lib/pixel/icons";
import { PixelSprite } from "@/shared/ui/PixelSprite/PixelSprite";
import "./MonsterNameEditor.css";

const MAX_LENGTH = 12;

type MonsterNameEditorProps = { name: string; onSave: (name: string) => void };

/** Shows a monster's name; tapping it lets her type a new one. */
export function MonsterNameEditor({ name, onSave }: MonsterNameEditorProps) {
  const [editing, setEditing] = useState(false);

  function finish(value: string) {
    const trimmed = value.trim().slice(0, MAX_LENGTH);
    setEditing(false);
    if (trimmed && trimmed !== name) onSave(trimmed);
  }

  if (editing) {
    return (
      <input
        className="monster-name monster-name--editing"
        defaultValue={name}
        maxLength={MAX_LENGTH}
        autoFocus
        aria-label="Monster name"
        onFocus={(event) => event.target.select()}
        onBlur={(event) => finish(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") setEditing(false);
        }}
      />
    );
  }

  return (
    <button type="button" className="monster-name" onClick={() => setEditing(true)} aria-label={`Rename ${name}`}>
      {name}
      <span className="monster-name__pencil" aria-hidden="true">
        <PixelSprite sprite={pencil} label="" />
      </span>
    </button>
  );
}
