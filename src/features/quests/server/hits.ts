import "server-only";
import { settlePerfectDay } from "@/features/quests/server/streak";
import type { HitOutcome } from "@/features/quests/types";
import { awardBadges, getLevel } from "@/features/trophies/server/trophies";
import { XP_PER_DEFEAT } from "@/features/trophies/data/levels";
import { periodKey } from "@/shared/lib/time/pht";
import { sql } from "@/shared/server/db";

export type RecordHitResult =
  | ({ ok: true } & HitOutcome)
  | { ok: false; error: "already-defeated" | "failed" };

/**
 * The one place a hit is recorded: adds the hit, pays the coins when it defeats the monster,
 * then settles streaks, XP and badges. `path` is the evidence photo, if any.
 */
export async function recordHit(childId: number, questId: string, path: string | null): Promise<RecordHitResult> {
  const [quest] = await sql`
    SELECT cadence, max_hp AS "maxHp", reward, sprite FROM quests
    WHERE id = ${questId} AND child_id = ${childId} AND active`;
  if (!quest) return { ok: false, error: "failed" };

  const now = Date.now();
  const period = periodKey(quest.cadence, now);

  try {
    const [row] = await sql`
      WITH cur AS (
        SELECT count(*)::int AS n FROM hits WHERE quest_id = ${questId} AND period = ${period}
      ), ins AS (
        INSERT INTO hits (quest_id, period, seq, evidence_path)
        SELECT ${questId}, ${period}, cur.n + 1, ${path} FROM cur WHERE cur.n < ${quest.maxHp}
        RETURNING seq
      ), pay AS (
        UPDATE wallet SET coins = coins + ${quest.reward}
        WHERE child_id = ${childId} AND EXISTS (SELECT 1 FROM ins WHERE seq = ${quest.maxHp})
        RETURNING coins
      )
      SELECT (SELECT count(*) FROM ins)::int AS inserted, (SELECT count(*) FROM pay)::int AS paid`;

    if (!row.inserted) return { ok: false, error: "already-defeated" };

    // Any "I did it!" waiting for this quest is answered by the hit.
    await sql`UPDATE claims SET status = 'approved' WHERE quest_id = ${questId} AND period = ${period} AND status = 'pending'`;

    const defeated = row.paid > 0;
    if (!defeated) return { ok: true, defeated, bonus: null, badges: [], levelUp: null };

    await sql`
      INSERT INTO defeats (child_id, quest_id, period, sprite, cadence)
      VALUES (${childId}, ${questId}, ${period}, ${quest.sprite}, ${quest.cadence})
      ON CONFLICT (quest_id, period) DO NOTHING`;

    const bonus = quest.cadence === "daily" ? await settlePerfectDay(childId, now) : null;
    const [level, badges] = await Promise.all([getLevel(childId), awardBadges(childId)]);
    const gained = XP_PER_DEFEAT[quest.cadence as "daily" | "weekly"];
    const before = level.xp - gained;
    const levelUp =
      before < level.from ? { level: level.level, title: level.title } : null; // crossed into this level just now

    return { ok: true, defeated, bonus, badges, levelUp };
  } catch {
    return { ok: false, error: "failed" };
  }
}
