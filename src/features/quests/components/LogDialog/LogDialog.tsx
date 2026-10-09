"use client";

import { useState } from "react";
import { logProgress } from "@/features/quests/actions";
import type { HitOutcome, QuestRow } from "@/features/quests/types";
import { resizeImage } from "@/shared/lib/images/resizeImage";
import { FormDialog } from "@/shared/ui/FormDialog/FormDialog";
import "./LogDialog.css";

type LogDialogProps = {
  quest: QuestRow;
  onClose: () => void;
  onLogged: (questId: string, outcome: HitOutcome) => void;
};

const ERRORS = {
  "already-defeated": "This monster is already defeated.",
  "bad-file": "That photo can't be used. Try another.",
  failed: "Something went wrong. Try again.",
} as const;

export function LogDialog({ quest, onClose, onLogged }: LogDialogProps) {
  const [preview, setPreview] = useState<string | null>(null);

  function choose(file: File | undefined) {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function log(formData: FormData) {
    try {
      const body = new FormData();
      body.set("questId", quest.id);
      const photo = formData.get("photo");
      if (photo instanceof File && photo.size > 0) body.set("photo", await resizeImage(photo));

      const result = await logProgress(body);
      if (result.ok) {
        onLogged(quest.id, result);
        return null;
      }
      choose(undefined); // the form resets its file input after an error
      return ERRORS[result.error];
    } catch {
      choose(undefined);
      return ERRORS.failed;
    }
  }

  return (
    <FormDialog
      title={quest.title}
      hint="Add a photo or screenshot as proof (optional)."
      submitLabel="Hit!"
      action={log}
      onClose={onClose}
    >
      {() => (
        <>
          <input
            className="log-dialog__file"
            name="photo"
            type="file"
            accept="image/*"
            aria-label="Proof photo"
            onChange={(event) => choose(event.target.files?.[0])}
          />
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="log-dialog__preview" src={preview} alt="Chosen proof" />
          )}
        </>
      )}
    </FormDialog>
  );
}
