// Philippine Time is UTC+8 with no daylight saving, so a fixed offset is exact.
const PHT_OFFSET_MS = 8 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export type Cadence = "daily" | "weekly";

/** Start of the PHT day (12:00 AM PHT) containing `now`, as a UTC timestamp. */
function startOfPhtDay(now: number) {
  return Math.floor((now + PHT_OFFSET_MS) / DAY_MS) * DAY_MS - PHT_OFFSET_MS;
}

/** Days since Monday (0 = Monday) for the PHT day containing `now`. */
function phtDaysSinceMonday(now: number) {
  const weekday = new Date(now + PHT_OFFSET_MS).getUTCDay();
  return (weekday + 6) % 7;
}

function periodStart(cadence: Cadence, now: number) {
  const dayStart = startOfPhtDay(now);
  return cadence === "daily" ? dayStart : dayStart - phtDaysSinceMonday(now) * DAY_MS;
}

/** Stable id for the current respawn period, e.g. "2026-10-08" (daily) or the week's Monday (weekly). */
export function periodKey(cadence: Cadence, now: number) {
  return new Date(periodStart(cadence, now) + PHT_OFFSET_MS).toISOString().slice(0, 10);
}

/** UTC timestamp of the next respawn: 12:00 AM PHT (daily) or next Monday 12:00 AM PHT (weekly). */
export function nextRespawnAt(cadence: Cadence, now: number) {
  return periodStart(cadence, now) + (cadence === "daily" ? DAY_MS : 7 * DAY_MS);
}

export function formatCountdown(ms: number) {
  const totalMinutes = Math.max(1, Math.ceil(ms / 60_000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/** Moves a "YYYY-MM-DD" day key by whole days. */
export function shiftDay(key: string, days: number) {
  const date = new Date(`${key}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** The Monday of the week containing a day key. */
export function mondayOf(key: string) {
  const weekday = new Date(`${key}T00:00:00Z`).getUTCDay();
  return shiftDay(key, -((weekday + 6) % 7));
}

export function weekDays(monday: string) {
  return Array.from({ length: 7 }, (_, i) => shiftDay(monday, i));
}
