"use client";

import { useTransition } from "react";
import { setRestDay } from "@/features/quests/actions";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

type RestDaysProps = { days: string[]; restDays: string[] };

/** Parent control: tap a day to mark it as a rest day (sick day, trip) so the streak survives. */
export function RestDays({ days, restDays }: RestDaysProps) {
  const [pending, startTransition] = useTransition();

  return (
    <section className="summary__section">
      <h2 className="summary__subtitle">Rest days</h2>
      <p className="summary__empty">Tap a day off so the streak is safe.</p>
      <ol className="summary__cells summary__rest">
        {days.map((day, index) => {
          const on = restDays.includes(day);
          return (
            <li key={day}>
              <button
                type="button"
                className={"summary__rest-button" + (on ? " summary__rest-button--on" : "")}
                aria-pressed={on}
                aria-label={`${day}: ${on ? "rest day" : "regular day"}`}
                disabled={pending}
                onClick={() => startTransition(async () => setRestDay(day, !on))}
              >
                {WEEKDAYS[index]}
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
