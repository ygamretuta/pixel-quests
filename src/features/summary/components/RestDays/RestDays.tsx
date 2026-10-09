"use client";

import { useTransition } from "react";
import { setRestDay } from "@/features/quests/actions";
import { WEEKDAY_LETTERS } from "@/features/summary/lib/dates";
import { cx } from "@/shared/lib/css/cx";
import "./RestDays.css";

type RestDaysProps = { days: string[]; restDays: string[] };

/** Parent control: tap a day to mark it as a rest day (sick day, trip) so the streak survives. */
export function RestDays({ days, restDays }: RestDaysProps) {
  const [pending, startTransition] = useTransition();

  return (
    <section className="rest-days">
      <h2 className="rest-days__title">Rest days</h2>
      <p className="rest-days__hint">Tap a day off so the streak is safe.</p>
      <ol className="rest-days__list">
        {days.map((day, index) => {
          const on = restDays.includes(day);
          return (
            <li key={day}>
              <button
                type="button"
                className={cx("rest-days__button", on && "rest-days__button--on")}
                aria-pressed={on}
                aria-label={`${day}: ${on ? "rest day" : "regular day"}`}
                disabled={pending}
                onClick={() => startTransition(() => setRestDay(day, !on))}
              >
                {WEEKDAY_LETTERS[index]}
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
