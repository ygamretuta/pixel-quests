import { startOfPhtDay } from "@/shared/lib/time/pht";

export type BedtimeSettings = {
  enabled: boolean;
  /** "HH:MM" in Philippine time, 24-hour. */
  bedtime: string;
  /** "HH:MM" in Philippine time, 24-hour. */
  wake: string;
};

export const DEFAULT_BEDTIME: BedtimeSettings = { enabled: false, bedtime: "20:00", wake: "06:00" };

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;

export function isClock(value: unknown): value is string {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function minutesOf(clock: string) {
  const [hours, minutes] = clock.split(":").map(Number);
  return hours * 60 + minutes;
}

/** "20:00" -> "8:00 PM" */
export function formatClock(clock: string) {
  const [hours, minutes] = clock.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export type BedtimeState = {
  asleep: boolean;
  /** UTC timestamp when it flips: wake-up time while asleep, bedtime while awake. Null when the lock is off. */
  nextChange: number | null;
};

/** Is the app asleep right now, and when does that change? Handles bedtimes that cross midnight. */
export function bedtimeState(now: number, settings: BedtimeSettings): BedtimeState {
  const bed = minutesOf(settings.bedtime);
  const wake = minutesOf(settings.wake);
  if (!settings.enabled || bed === wake) return { asleep: false, nextChange: null };

  const dayStart = startOfPhtDay(now);
  const current = Math.floor((now - dayStart) / MINUTE_MS);
  const asleep = bed < wake ? current >= bed && current < wake : current >= bed || current < wake;

  const target = asleep ? wake : bed;
  let nextChange = dayStart + target * MINUTE_MS;
  if (nextChange <= now) nextChange += DAY_MS;
  return { asleep, nextChange };
}
