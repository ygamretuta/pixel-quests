"use client";

import { useActionState, type ReactNode } from "react";
import { PixelButton } from "@/shared/ui/PixelButton/PixelButton";
import { panelClass } from "@/shared/ui/Panel/panelClass";
import "./FormDialog.css";

/** The text fields from the last submit, so a failed submit does not wipe what was typed. */
export type FormValues = Record<string, string>;

type FormState = { error: string | null; values: FormValues };

type FormDialogProps = {
  title: string;
  hint?: string;
  submitLabel: string;
  pendingLabel?: string;
  /** Runs on submit. Return an error message to keep the dialog open, or null when finished. */
  action: (formData: FormData) => Promise<string | null>;
  onClose: () => void;
  /** Receives the last submitted values so fields can use them as `defaultValue`. */
  children: (values: FormValues) => ReactNode;
};

function showModalOnMount(dialog: HTMLDialogElement | null) {
  if (dialog && !dialog.open) dialog.showModal();
}

function textValues(formData: FormData): FormValues {
  const values: FormValues = {};
  for (const [key, value] of formData) {
    if (typeof value === "string") values[key] = value;
  }
  return values;
}

export function FormDialog({
  title,
  hint,
  submitLabel,
  pendingLabel = "Saving...",
  action,
  onClose,
  children,
}: FormDialogProps) {
  const [state, submit, pending] = useActionState<FormState, FormData>(
    async (_previous, formData) => {
      const error = await action(formData);
      if (error === null) onClose();
      return { error, values: textValues(formData) };
    },
    { error: null, values: {} },
  );

  return (
    <dialog ref={showModalOnMount} className={`dialog ${panelClass("raised")}`} onClose={onClose}>
      <form className="dialog__form" action={submit}>
        <h2 className="dialog__title">{title}</h2>
        {hint && <p className="dialog__hint">{hint}</p>}
        {children(state.values)}
        {state.error && (
          <p className="dialog__error" role="alert">
            {state.error}
          </p>
        )}
        <div className="dialog__actions">
          <PixelButton variant="secondary" className="dialog__button" onClick={onClose}>
            Cancel
          </PixelButton>
          <PixelButton type="submit" className="dialog__button" disabled={pending}>
            {pending ? pendingLabel : submitLabel}
          </PixelButton>
        </div>
      </form>
    </dialog>
  );
}
