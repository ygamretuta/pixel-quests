import "server-only";
import { STREAK_BONUS, type Streak } from "@/features/quests/data/streak";
import { computeStreak } from "@/features/quests/lib/streak";
import { periodKey, shiftDay } from "@/shared/lib/time/pht";
import { sql } from "@/shared/server/db";

const LOOKBACK_DAYS = 120;

export async function getStreak(childId: number, now: number): Promise<Streak> {
  const today = periodKey("daily", now);
  const since = shiftDay(today, -LOOKBACK_DAYS);

  const [quests, restRows, purchases] = await Promise.all([
    sql`
      SELECT id, max_hp AS "maxHp", days,
             (created_at AT TIME ZONE 'Asia/Manila')::date::text AS created
      FROM quests WHERE child_id = ${childId} AND active AND cadence = 'daily'`,
    sql`SELECT day FROM rest_days WHERE child_id = ${childId} AND day >= ${since} AND day <= ${today}`,
    sql`SELECT (at AT TIME ZONE 'Asia/Manila')::date::text AS day FROM shield_purchases WHERE child_id = ${childId}`,
  ]);
  const restDays = new Set(restRows.map((row) => row.day as string));

  const hitRows = quests.length
    ? await sql`
        SELECT quest_id AS "questId", period, count(*)::int AS n
        FROM hits
        WHERE quest_id = ANY(${quests.map((quest) => quest.id as string)})
          AND period >= ${since} AND period <= ${today}
        GROUP BY quest_id, period`
    : [];

  const result = computeStreak({
    today,
    quests: quests as { id: string; maxHp: number; created: string; days: number }[],
    hits: new Map(hitRows.map((hit) => [`${hit.questId}|${hit.period}`, hit.n as number])),
    restDays,
    shieldPurchases: purchases.map((row) => row.day as string),
    lookbackDays: LOOKBACK_DAYS,
  });

  return { ...result, restToday: restDays.has(today) };
}

/** Records a perfect day and pays the one-time bonus when today completes a milestone streak. */
export async function settlePerfectDay(childId: number, now: number) {
  const streak = await getStreak(childId, now);
  if (!streak.todayPerfect) return null;

  const today = periodKey("daily", now);
  await sql`INSERT INTO perfect_days (child_id, day) VALUES (${childId}, ${today}) ON CONFLICT DO NOTHING`;

  const bonus = STREAK_BONUS[streak.current];
  if (!bonus) return null;

  const [row] = await sql`
    WITH ins AS (
      INSERT INTO streak_bonuses (child_id, day, streak, bonus)
      VALUES (${childId}, ${today}, ${streak.current}, ${bonus})
      ON CONFLICT (child_id, day) DO NOTHING RETURNING bonus
    ), pay AS (
      UPDATE wallet SET coins = coins + ${bonus}
      WHERE child_id = ${childId} AND EXISTS (SELECT 1 FROM ins) RETURNING coins
    )
    SELECT (SELECT count(*) FROM ins)::int AS awarded`;
  return row.awarded ? { streak: streak.current, bonus } : null;
}

/** How many streak shields she is holding right now. */
export async function getShieldCount(childId: number) {
  return (await getStreak(childId, Date.now())).shields;
}
