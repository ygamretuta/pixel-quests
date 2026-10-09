"use client";

import { FormDialog } from "@/shared/ui/FormDialog/FormDialog";
import "./PinDialog.css";

type PinResult = { ok: true } | { ok: false; error: "wrong" | "locked" };

type PinDialogProps = {
  title?: string;
  confirmLabel?: string;
  /** Resolves ok to close the dialog; a rejected PIN shows an error and clears the field. */
  onSubmit: (pin: string) => Promise<PinResult>;
  onClose: () => void;
};

const MESSAGES = { wrong: "Wrong PIN", locked: "Too many tries. Wait 10 minutes." } as const;

export function PinDialog({
  title = "Parent PIN",
  confirmLabel = "Unlock",
  onSubmit,
  onClose,
}: PinDialogProps) {
  async function check(formData: FormData) {
    const result = await onSubmit(String(formData.get("pin") ?? ""));
    return result.ok ? null : MESSAGES[result.error];
  }

  return (
    <FormDialog
      title={title}
      submitLabel={confirmLabel}
      pendingLabel="..."
      action={check}
      onClose={onClose}
    >
      {() => (
        <input
          className="pin-dialog__input"
          name="pin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]{4,8}"
          minLength={4}
          maxLength={8}
          autoComplete="off"
          autoFocus
          required
          aria-label="Parent PIN"
          onInput={(event) => {
            event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "");
          }}
        />
      )}
    </FormDialog>
  );
}
