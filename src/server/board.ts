import "server-only";
import { connection } from "next/server";
import { periodKey } from "@/shared/time/pht";
import type { Board, QuestRow } from "@/features/quests/types";
import { sql } from "./db";
import { countPendingRewards } from "./rewards";
import { getStreak } from "./streak";
import { getEquipped } from "./wardrobe";

export async function getBoard(withEvidence: boolean): Promise<Board> {
  await connection(); // request-time only: the current time must never be prerendered
  const now = Date.now();
  const daily = periodKey("daily", now);
  const weekly = periodKey("weekly", now);

  const [quests, wallet, evidence, equipped, streak, pendingRewards] = await Promise.all([
    sql`
      SELECT q.id, q.title, q.monster_name AS "monsterName", q.cadence, q.max_hp AS "maxHp",
             q.reward, q.sprite,
             (SELECT count(*)::int FROM hits h
              WHERE h.quest_id = q.id
                AND h.period = CASE q.cadence WHEN 'daily' THEN ${daily} ELSE ${weekly} END) AS done
      FROM quests q WHERE q.active ORDER BY q.position`,
    sql`SELECT coins FROM wallet WHERE id = 1`,
    withEvidence
      ? sql`
          SELECT h.id, q.title AS "questTitle", h.created_at AS "createdAt"
          FROM hits h JOIN quests q ON q.id = h.quest_id
          WHERE h.evidence_path IS NOT NULL
          ORDER BY h.created_at DESC LIMIT 12`
      : Promise.resolve([]),
    getEquipped(),
    getStreak(now),
    withEvidence ? countPendingRewards() : Promise.resolve(0),
  ]);

  return {
    asOf: now,
    coins: wallet[0]?.coins ?? 0,
    equipped,
    streak,
    pendingRewards,
    quests: quests as QuestRow[],
    evidence: (evidence as { id: string; questTitle: string; createdAt: Date }[]).map((row) => ({
      id: Number(row.id),
      questTitle: row.questTitle,
      createdAt: new Date(row.createdAt).toISOString(),
    })),
  };
}

export type ManagedQuest = {
  id: string;
  title: string;
  monsterName: string;
  cadence: "daily" | "weekly";
  maxHp: number;
  reward: number;
  sprite: string;
  active: boolean;
};

export async function getManagedQuests(): Promise<ManagedQuest[]> {
  await connection();
  const rows = await sql`
    SELECT id, title, monster_name AS "monsterName", cadence, max_hp AS "maxHp", reward, sprite, active
    FROM quests ORDER BY position, id`;
  return rows as ManagedQuest[];
}
