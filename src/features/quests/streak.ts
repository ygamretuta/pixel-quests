/** Bonus coins for finishing every daily quest this many days in a row. */
export const STREAK_BONUS: Record<number, number> = { 3: 10, 7: 30, 14: 60, 30: 150 };

export type Streak = { current: number; todayPerfect: boolean };

/** The next milestone above the current streak, if there is one. */
export function nextMilestone(current: number) {
  return Object.keys(STREAK_BONUS)
    .map(Number)
    .find((days) => days > current);
}
