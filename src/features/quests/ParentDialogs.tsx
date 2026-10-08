"use client";

import { useState, useTransition } from "react";
import { logProgress, unlockParent } from "./actions";
import type { QuestRow } from "./types";
import { resizeImage } from "@/shared/images/resizeImage";
import "./parent-dialogs.css";

function openOnMount(element: HTMLDialogElement | null) {
  if (element && !element.open) element.showModal();
}

export function PinDialog({ onClose }: { onClose: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await unlockParent(pin);
      if (result.ok) {
        onClose();
      } else {
        setPin("");
        setError(result.error === "locked" ? "Too many tries. Wait 10 minutes." : "Wrong PIN");
      }
    });
  }

  return (
    <dialog ref={openOnMount} className="dialog" onClose={onClose}>
      <form className="dialog__form" onSubmit={submit}>
        <h2 className="dialog__title">Parent PIN</h2>
        <input
          className="dialog__input"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          maxLength={8}
          autoFocus
          aria-label="Parent PIN"
          value={pin}
          onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}
        />
        {error && <p className="dialog__error" role="alert">{error}</p>}
        <div className="dialog__actions">
          <button type="button" className="pixel-button pixel-button--secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="pixel-button" disabled={pending || pin.length < 4}>
            {pending ? "..." : "Unlock"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

type LogDialogProps = {
  quest: QuestRow;
  onClose: () => void;
  onLogged: (questId: string, defeated: boolean) => void;
};

const ERRORS = {
  "already-defeated": "This monster is already defeated.",
  "bad-file": "That photo can't be used. Try another.",
  failed: "Something went wrong. Try again.",
} as const;

export function LogDialog({ quest, onClose, onLogged }: LogDialogProps) {
  const [photo, setPhoto] = useState<{ file: File; preview: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function choose(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (photo) URL.revokeObjectURL(photo.preview);
    setPhoto(file ? { file, preview: URL.createObjectURL(file) } : null);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      setError(null);
      try {
        const formData = new FormData();
        formData.set("questId", quest.id);
        if (photo) formData.set("photo", await resizeImage(photo.file));
        const result = await logProgress(formData);
        if (result.ok) {
          onLogged(quest.id, result.defeated);
          onClose();
        } else {
          setError(ERRORS[result.error]);
        }
      } catch {
        setError(ERRORS.failed);
      }
    });
  }

  return (
    <dialog ref={openOnMount} className="dialog" onClose={onClose}>
      <form className="dialog__form" onSubmit={submit}>
        <h2 className="dialog__title">{quest.title}</h2>
        <p className="dialog__hint">Add a photo or screenshot as proof (optional).</p>
        <input
          className="dialog__file"
          type="file"
          accept="image/*"
          aria-label="Proof photo"
          onChange={choose}
        />
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="dialog__preview" src={photo.preview} alt="Chosen proof" />
        )}
        {error && <p className="dialog__error" role="alert">{error}</p>}
        <div className="dialog__actions">
          <button type="button" className="pixel-button pixel-button--secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="pixel-button" disabled={pending}>
            {pending ? "Saving..." : "Hit!"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
