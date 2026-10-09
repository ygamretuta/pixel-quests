import "server-only";
import { connection } from "next/server";
import type { Goal, Reward, RewardRequest } from "@/features/rewards/types";
import { sql } from "@/shared/server/db";

function toRequest(row: Record<string, unknown>): RewardRequest {
  return {
    id: Number(row.id),
    rewardId: row.rewardId as string,
    title: row.title as string,
    cost: row.cost as number,
    status: row.status as RewardRequest["status"],
    createdAt: new Date(row.createdAt as string).toISOString(),
  };
}

const GOAL_KEY = "goal";

/** The reward she picked to save up for, if it still exists. */
export async function getGoal(childId: number): Promise<Goal | null> {
  const [row] = await sql`
    SELECT r.id AS "rewardId", r.title, r.cost, r.icon
    FROM settings s JOIN rewards r ON r.id = s.value->>'rewardId'
    WHERE s.child_id = ${childId} AND s.key = ${GOAL_KEY} AND r.active AND r.child_id = ${childId}`;
  return (row as Goal | undefined) ?? null;
}

export async function getTreats(childId: number) {
  await connection();
  const [wallet, rewards, pending, recent, goal] = await Promise.all([
    sql`SELECT coins FROM wallet WHERE child_id = ${childId}`,
    sql`SELECT id, title, cost, icon, active FROM rewards WHERE child_id = ${childId} AND active ORDER BY position, id`,
    sql`SELECT r.id, r.reward_id AS "rewardId", r.title, r.cost, r.status, r.created_at AS "createdAt"
        FROM reward_requests r JOIN rewards w ON w.id = r.reward_id
        WHERE w.child_id = ${childId} AND r.status = 'pending' ORDER BY r.created_at`,
    sql`SELECT r.id, r.reward_id AS "rewardId", r.title, r.cost, r.status, r.created_at AS "createdAt"
        FROM reward_requests r JOIN rewards w ON w.id = r.reward_id
        WHERE w.child_id = ${childId} AND r.status = 'approved' ORDER BY r.resolved_at DESC LIMIT 5`,
    getGoal(childId),
  ]);
  return {
    coins: (wallet[0]?.coins ?? 0) as number,
    rewards: rewards as Reward[],
    pending: pending.map(toRequest),
    recent: recent.map(toRequest),
    goal,
  };
}

export async function getRewardsAdmin(childId: number) {
  await connection();
  const [rewards, pending, history] = await Promise.all([
    sql`SELECT id, title, cost, icon, active FROM rewards WHERE child_id = ${childId} ORDER BY position, id`,
    sql`SELECT r.id, r.reward_id AS "rewardId", r.title, r.cost, r.status, r.created_at AS "createdAt"
        FROM reward_requests r JOIN rewards w ON w.id = r.reward_id
        WHERE w.child_id = ${childId} AND r.status = 'pending' ORDER BY r.created_at`,
    sql`SELECT r.id, r.reward_id AS "rewardId", r.title, r.cost, r.status, r.created_at AS "createdAt"
        FROM reward_requests r JOIN rewards w ON w.id = r.reward_id
        WHERE w.child_id = ${childId} AND r.status IN ('approved', 'denied') ORDER BY r.resolved_at DESC LIMIT 8`,
  ]);
  return {
    rewards: rewards as Reward[],
    pending: pending.map(toRequest),
    history: history.map(toRequest),
  };
}

/** Pending reward requests across every child, for the parent's badge. */
export async function countPendingRewards() {
  const [row] = await sql`SELECT count(*)::int AS n FROM reward_requests WHERE status = 'pending'`;
  return row.n as number;
}
