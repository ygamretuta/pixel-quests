import "server-only";
import { connection } from "next/server";

import { getStreak } from "@/features/quests/server/streak";
import type { Board, ManagedQuest, QuestRow } from "@/features/quests/types";
import { countPendingRewards, getGoal } from "@/features/rewards/server/rewards";
import { getLevel } from "@/features/trophies/server/trophies";
import { getEquipped } from "@/features/wardrobe/server/wardrobe";
import { periodKey } from "@/shared/lib/time/pht";
import { weekdayIndex } from "@/shared/lib/time/schedule";
import { getChild, listChildren } from "@/shared/server/child";
import { sql } from "@/shared/server/db";

export async function getBoard(withEvidence: boolean): Promise<Board> {
  await connection(); // request-time only: the current time must never be prerendered
  const now = Date.now();
  const today = periodKey("daily", now);
  const weekly = periodKey("weekly", now);
  const weekday = weekdayIndex(today);
  const child = await getChild();
  const childId = child.id;

  const [quests, wallet, evidence, equipped, streak, level, goal, pendingRewards, children] = await Promise.all([
    sql`
      SELECT q.id, q.title, q.monster_name AS "monsterName", q.cadence, q.max_hp AS "maxHp",
             q.reward, q.sprite,
             (SELECT count(*)::int FROM hits h
              WHERE h.quest_id = q.id
                AND h.period = CASE q.cadence WHEN 'daily' THEN ${today} ELSE ${weekly} END) AS done,
             EXISTS (SELECT 1 FROM claims c
                     WHERE c.quest_id = q.id AND c.status = 'pending'
                       AND c.period = CASE q.cadence WHEN 'daily' THEN ${today} ELSE ${weekly} END) AS claimed
      FROM quests q
      WHERE q.child_id = ${childId} AND q.active
        AND (q.cadence = 'weekly' OR ((q.days >> ${weekday}) & 1) = 1)
      ORDER BY q.position`,
    sql`SELECT coins FROM wallet WHERE child_id = ${childId}`,
    withEvidence
      ? sql`
          SELECT h.id, q.title AS "questTitle", h.created_at AS "createdAt"
          FROM hits h JOIN quests q ON q.id = h.quest_id
          WHERE q.child_id = ${childId} AND h.evidence_path IS NOT NULL
          ORDER BY h.created_at DESC LIMIT 12`
      : Promise.resolve([]),
    getEquipped(childId),
    getStreak(childId, now),
    getLevel(childId),
    getGoal(childId),
    withEvidence ? countPendingRewards() : Promise.resolve(0),
    listChildren(),
  ]);

  return {
    asOf: now,
    child,
    children,
    coins: wallet[0]?.coins ?? 0,
    equipped,
    streak,
    level,
    goal,
    pendingRewards,
    quests: quests as QuestRow[],
    evidence: (evidence as { id: string; questTitle: string; createdAt: Date }[]).map((row) => ({
      id: Number(row.id),
      questTitle: row.questTitle,
      createdAt: new Date(row.createdAt).toISOString(),
    })),
  };
}

export async function getManagedQuests(childId: number): Promise<ManagedQuest[]> {
  await connection();
  const rows = await sql`
    SELECT id, title, monster_name AS "monsterName", cadence, max_hp AS "maxHp", reward, sprite, active,
           days, remind_at AS "remindAt"
    FROM quests WHERE child_id = ${childId} ORDER BY position, id`;
  return rows as ManagedQuest[];
}
