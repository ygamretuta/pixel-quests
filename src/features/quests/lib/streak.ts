import { isScheduled } from "@/shared/lib/time/schedule";
import { shiftDay } from "@/shared/lib/time/pht";

export type StreakQuest = {
  id: string;
  maxHp: number;
  /** Day the quest was created ("YYYY-MM-DD"). */
  created: string;
  /** Weekday bit mask (see shared/lib/time/schedule). */
  days: number;
};

export type StreakInput = {
  today: string;
  quests: StreakQuest[];
  /** Hits logged per `${questId}|${day}`. */
  hits: Map<string, number>;
  restDays: Set<string>;
  /** The day each shield was bought. */
  shieldPurchases: string[];
  lookbackDays: number;
};

export type StreakResult = {
  current: number;
  todayPerfect: boolean;
  shields: number;
  shieldDays: string[];
};

/**
 * Walks the last N days oldest to newest.
 *  - A perfect day (every quest scheduled that day defeated) adds one.
 *  - A day with nothing scheduled, or marked as a rest day, changes nothing.
 *  - A missed day spends a shield if she has one; otherwise the streak resets.
 *  - Today only counts once it is perfect, and an unfinished today never breaks anything.
 */
export function computeStreak(input: StreakInput): StreakResult {
  const { today, quests, hits, restDays, shieldPurchases, lookbackDays } = input;
  const since = shiftDay(today, -lookbackDays);

  let shields = shieldPurchases.filter((day) => day < since).length;
  let current = 0;
  let todayPerfect = false;
  const shieldDays: string[] = [];

  for (let day = since; day <= today; day = shiftDay(day, 1)) {
    shields += shieldPurchases.filter((purchase) => purchase === day).length;

    const scheduled = quests.filter((quest) => quest.created <= day && isScheduled(quest.days, day));
    if (scheduled.length === 0) continue;

    const perfect = scheduled.every((quest) => (hits.get(`${quest.id}|${day}`) ?? 0) >= quest.maxHp);

    if (day === today) {
      todayPerfect = perfect;
      if (perfect) current++;
    } else if (perfect) {
      current++;
    } else if (restDays.has(day)) {
      continue;
    } else if (shields > 0) {
      shields--;
      shieldDays.push(day);
    } else {
      current = 0;
    }
  }

  return { current, todayPerfect, shields, shieldDays };
}
