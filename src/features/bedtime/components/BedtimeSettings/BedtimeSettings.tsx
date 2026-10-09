"use client";

import { useActionState } from "react";
import { saveBedtime } from "@/features/bedtime/actions";
import { formatClock, type BedtimeSettings as Settings } from "@/shared/lib/time/bedtime";
import { cx } from "@/shared/lib/css/cx";
import { panelClass } from "@/shared/ui/Panel/panelClass";
import { PixelButton } from "@/shared/ui/PixelButton/PixelButton";
import { TextField } from "@/shared/ui/TextField/TextField";
import "./BedtimeSettings.css";

type FormState = { message: string | null; error: string | null; values: Record<string, string> | null };

export function BedtimeSettings({ settings, childName }: { settings: Settings; childName: string }) {
  const [state, submit, pending] = useActionState<FormState, FormData>(
    async (_previous, formData) => {
      const result = await saveBedtime(formData);
      const values = Object.fromEntries([...formData].filter(([, value]) => typeof value === "string")) as Record<string, string>;
      return result.ok
        ? { message: "Saved!", error: null, values: null }
        : { message: null, error: result.error, values };
    },
    { message: null, error: null, values: null },
  );

  const typed = state.values;
  const enabled = typed ? typed.enabled === "on" : settings.enabled;

  return (
    <section className={cx("bedtime-settings", panelClass())}>
      <h2 className="bedtime-settings__title">Bedtime for {childName}</h2>
      <p className="bedtime-settings__hint">
        After bedtime the app shows a sleepy screen until morning (Philippine time). You can still get in with your PIN.
      </p>

      <form className="bedtime-settings__form" action={submit}>
        <label className="bedtime-settings__switch">
          <input
            className="bedtime-settings__checkbox"
            type="checkbox"
            name="enabled"
            defaultChecked={enabled}
          />
          <span className="bedtime-settings__switch-label">Lock the app at bedtime</span>
        </label>

        <div className="bedtime-settings__times">
          <TextField label="Bedtime" name="bedtime" type="time" required defaultValue={typed?.bedtime ?? settings.bedtime} />
          <TextField label="Wake up" name="wake" type="time" required defaultValue={typed?.wake ?? settings.wake} />
        </div>

        {state.error && (
          <p className="bedtime-settings__error" role="alert">
            {state.error}
          </p>
        )}
        {state.message && (
          <p className="bedtime-settings__saved" role="status">
            {state.message}
          </p>
        )}
        <PixelButton type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save"}
        </PixelButton>
      </form>

      <p className="bedtime-settings__summary">
        {settings.enabled
          ? `Sleeping ${formatClock(settings.bedtime)} to ${formatClock(settings.wake)}.`
          : "Bedtime lock is off."}
      </p>
    </section>
  );
}
