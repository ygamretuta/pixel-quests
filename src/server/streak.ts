import "server-only";
import { STREAK_BONUS, type Streak } from "@/features/quests/streak";
import { periodKey, shiftDay } from "@/shared/time/pht";
import { sql } from "./db";

const LOOKBACK_DAYS = 90;

/**
 * A "perfect day" is a day on which every daily quest that existed was defeated.
 * The streak counts consecutive perfect days; today only adds to it once it is perfect,
 * and an unfinished today never breaks it.
 */
export async function getStreak(now: number): Promise<Streak> {
  const today = periodKey("daily", now);
  const since = shiftDay(today, -LOOKBACK_DAYS);

  const quests = await sql`
    SELECT id, max_hp AS "maxHp", (created_at AT TIME ZONE 'Asia/Manila')::date::text AS created
    FROM quests WHERE active AND cadence = 'daily'`;
  if (!quests.length) return { current: 0, todayPerfect: false };

  const hits = await sql`
    SELECT quest_id AS "questId", period, count(*)::int AS n
    FROM hits
    WHERE quest_id = ANY(${quests.map((quest) => quest.id as string)})
      AND period >= ${since} AND period <= ${today}
    GROUP BY quest_id, period`;
  const done = new Map(hits.map((hit) => [`${hit.questId}|${hit.period}`, hit.n as number]));

  const isPerfect = (day: string) => {
    const existing = quests.filter((quest) => quest.created <= day);
    return existing.length > 0 && existing.every((quest) => (done.get(`${quest.id}|${day}`) ?? 0) >= quest.maxHp);
  };

  const todayPerfect = isPerfect(today);
  let current = todayPerfect ? 1 : 0;
  for (let day = shiftDay(today, -1); current < LOOKBACK_DAYS && isPerfect(day); day = shiftDay(day, -1)) {
    current++;
  }
  return { current, todayPerfect };
}

/** Pays the one-time bonus when today completes a milestone streak. */
export async function awardStreakBonus(now: number) {
  const { current, todayPerfect } = await getStreak(now);
  const bonus = STREAK_BONUS[current];
  if (!todayPerfect || !bonus) return null;

  const today = periodKey("daily", now);
  const [row] = await sql`
    WITH ins AS (
      INSERT INTO streak_bonuses (day, streak, bonus) VALUES (${today}, ${current}, ${bonus})
      ON CONFLICT DO NOTHING RETURNING bonus
    ), pay AS (
      UPDATE wallet SET coins = coins + ${bonus}
      WHERE id = 1 AND EXISTS (SELECT 1 FROM ins) RETURNING coins
    )
    SELECT (SELECT count(*) FROM ins)::int AS awarded`;
  return row.awarded ? { streak: current, bonus } : null;
}
