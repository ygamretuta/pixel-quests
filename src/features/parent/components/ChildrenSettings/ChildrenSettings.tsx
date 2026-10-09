"use client";

import { useActionState } from "react";
import { addChild, renameChild } from "@/features/parent/actions";
import { cx } from "@/shared/lib/css/cx";
import { panelClass } from "@/shared/ui/Panel/panelClass";
import { PixelButton } from "@/shared/ui/PixelButton/PixelButton";
import { TextField } from "@/shared/ui/TextField/TextField";
import "./ChildrenSettings.css";

type Child = { id: number; name: string };
type FormState = { error: string | null; message: string | null };

function RenameForm({ child }: { child: Child }) {
  const [state, submit, pending] = useActionState<FormState, FormData>(
    async (_previous, formData) => {
      const result = await renameChild(child.id, String(formData.get("name") ?? ""));
      return result.ok ? { error: null, message: "Saved!" } : { error: result.error, message: null };
    },
    { error: null, message: null },
  );

  return (
    <form className="children-settings__row" action={submit}>
      <TextField label="Name" name="name" defaultValue={child.name} maxLength={20} required />
      <PixelButton type="submit" variant="secondary" disabled={pending}>
        {pending ? "..." : "Rename"}
      </PixelButton>
      {(state.error || state.message) && (
        <p className="children-settings__status" role={state.error ? "alert" : "status"}>
          {state.error ?? state.message}
        </p>
      )}
    </form>
  );
}

export function ChildrenSettings({ kids, currentId }: { kids: Child[]; currentId: number }) {
  const [state, submit, pending] = useActionState<FormState, FormData>(
    async (_previous, formData) => {
      const result = await addChild(formData);
      return result.ok ? { error: null, message: "Added! Pick them in the bar at the top." } : { error: result.error, message: null };
    },
    { error: null, message: null },
  );

  return (
    <section className={cx("children-settings", panelClass())}>
      <h2 className="children-settings__title">Kids</h2>
      <p className="children-settings__hint">
        Each child has their own quests, coins, outfit and rewards. To set up a tablet for a child, unlock parent
        mode on it, pick the child at the top of the home screen, then leave parent mode.
      </p>

      {kids.map((child) => (
        <div key={child.id} className="children-settings__child">
          <p className="children-settings__name">
            {child.name}
            {child.id === currentId ? " (this device)" : ""}
          </p>
          <RenameForm child={child} />
        </div>
      ))}

      <form className="children-settings__row" action={submit}>
        <TextField label="Add a child" name="name" maxLength={20} placeholder="Name" required />
        <PixelButton type="submit" disabled={pending}>
          {pending ? "..." : "Add"}
        </PixelButton>
        {(state.error || state.message) && (
          <p className="children-settings__status" role={state.error ? "alert" : "status"}>
            {state.error ?? state.message}
          </p>
        )}
      </form>
    </section>
  );
}
