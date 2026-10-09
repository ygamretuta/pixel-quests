/** Which weekdays a quest is on, stored as a bit mask: Monday is bit 0, Sunday is bit 6. */
export const EVERY_DAY = 0b1111111;

export const WEEKDAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** 0 = Monday ... 6 = Sunday for a "YYYY-MM-DD" day key. */
export function weekdayIndex(dayKey: string) {
  return (new Date(`${dayKey}T00:00:00Z`).getUTCDay() + 6) % 7;
}

export function isScheduled(mask: number, dayKey: string) {
  return ((mask >> weekdayIndex(dayKey)) & 1) === 1;
}

export function maskFromDays(days: number[]) {
  return days.reduce((mask, day) => mask | (1 << day), 0);
}

export function daysFromMask(mask: number) {
  return [0, 1, 2, 3, 4, 5, 6].filter((day) => ((mask >> day) & 1) === 1);
}

/** "Every day", "Weekdays", "Mon, Wed" ... */
export function describeDays(mask: number) {
  if (mask === EVERY_DAY) return "every day";
  if (mask === 0b0011111) return "weekdays";
  if (mask === 0b1100000) return "weekends";
  return daysFromMask(mask)
    .map((day) => WEEKDAY_NAMES[day])
    .join(", ");
}
