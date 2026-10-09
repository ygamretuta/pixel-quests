/** Bonus coins for finishing every daily quest this many days in a row. */
export const STREAK_BONUS: Record<number, number> = { 3: 10, 7: 30, 14: 60, 30: 150 };

/** Most streak shields she can hold at once, and what one costs at the merchant. */
export const MAX_SHIELDS = 3;
export const SHIELD_PRICE = 40;

export type Streak = {
  current: number;
  todayPerfect: boolean;
  restToday: boolean;
  /** Shields she is holding. */
  shields: number;
  /** Days a shield saved the streak. */
  shieldDays: string[];
};

/** The next milestone above the current streak, if there is one. */
export function nextMilestone(current: number) {
  return Object.keys(STREAK_BONUS)
    .map(Number)
    .find((days) => days > current);
}
