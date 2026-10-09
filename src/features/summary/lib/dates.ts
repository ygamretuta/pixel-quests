export const WEEKDAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

/** "Oct 5" for a "YYYY-MM-DD" day key. */
export function formatDay(key: string) {
  return new Date(`${key}T00:00:00Z`).toLocaleDateString("en-PH", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  });
}
