import "server-only";
import { connection } from "next/server";
import { BADGES, BADGES_BY_ID, qualifyingBadges, type BadgeStats } from "@/features/trophies/data/badges";
import { levelFor, xpFor, type LevelInfo } from "@/features/trophies/data/levels";
import { sql } from "@/shared/server/db";

export async function getLevel(childId: number): Promise<LevelInfo> {
  const rows = await sql`SELECT cadence, count(*)::int AS n FROM defeats WHERE child_id = ${childId} GROUP BY cadence`;
  const count = (cadence: string) => (rows.find((row) => row.cadence === cadence)?.n as number | undefined) ?? 0;
  return levelFor(xpFor({ daily: count("daily"), weekly: count("weekly") }));
}

async function getStats(childId: number): Promise<BadgeStats> {
  const [row] = await sql`
    SELECT
      (SELECT count(*) FROM defeats WHERE child_id = ${childId})::int AS defeats,
      (SELECT count(*) FROM defeats WHERE child_id = ${childId} AND cadence = 'weekly')::int AS bosses,
      (SELECT count(*) FROM perfect_days WHERE child_id = ${childId})::int AS "perfectDays",
      (SELECT coalesce(max(streak), 0) FROM streak_bonuses WHERE child_id = ${childId})::int AS "bestStreak",
      (SELECT count(*) FROM owned_items WHERE child_id = ${childId})::int AS items,
      (SELECT count(DISTINCT sprite) FROM defeats WHERE child_id = ${childId})::int AS "dexTypes",
      (SELECT count(*) FROM hits h JOIN quests q ON q.id = h.quest_id
        WHERE q.child_id = ${childId} AND h.evidence_path IS NOT NULL)::int AS photos,
      (SELECT count(*) FROM reward_requests r JOIN rewards w ON w.id = r.reward_id
        WHERE w.child_id = ${childId} AND r.status = 'approved')::int AS treats,
      (SELECT count(*) FROM shield_purchases WHERE child_id = ${childId})::int AS shields`;
  return row as BadgeStats;
}

/** Saves any badge she has newly qualified for and returns their titles, for a "new badge!" message. */
export async function awardBadges(childId: number) {
  const wanted = qualifyingBadges(await getStats(childId));
  if (!wanted.length) return [];
  const rows = await sql`
    INSERT INTO badges_earned (child_id, badge)
    SELECT ${childId}, badge FROM unnest(${wanted}::text[]) AS badge
    ON CONFLICT DO NOTHING
    RETURNING badge`;
  return rows.map((row) => BADGES_BY_ID[row.badge as string]?.title).filter(Boolean) as string[];
}

export type TrophyData = {
  level: LevelInfo;
  badges: { id: string; title: string; hint: string; color: string; earned: boolean }[];
  /** Monsters defeated per kind, e.g. { slime: 12 }. */
  dex: Record<string, number>;
  defeats: number;
};

export async function getTrophies(childId: number): Promise<TrophyData> {
  await connection();
  const [level, earned, dexRows] = await Promise.all([
    getLevel(childId),
    sql`SELECT badge FROM badges_earned WHERE child_id = ${childId}`,
    sql`SELECT sprite, count(*)::int AS n FROM defeats WHERE child_id = ${childId} GROUP BY sprite`,
  ]);
  const earnedIds = new Set(earned.map((row) => row.badge as string));
  const dex = Object.fromEntries(dexRows.map((row) => [row.sprite as string, row.n as number]));

  return {
    level,
    badges: BADGES.map(({ id, title, hint, color }) => ({ id, title, hint, color, earned: earnedIds.has(id) })),
    dex,
    defeats: Object.values(dex).reduce((sum, n) => sum + n, 0),
  };
}
