import "server-only";
import { connection } from "next/server";
import type { Reward, RewardRequest } from "@/features/rewards/types";
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

export async function getTreats() {
  await connection();
  const [wallet, rewards, pending, recent] = await Promise.all([
    sql`SELECT coins FROM wallet WHERE id = 1`,
    sql`SELECT id, title, cost, icon, active FROM rewards WHERE active ORDER BY position, id`,
    sql`SELECT id, reward_id AS "rewardId", title, cost, status, created_at AS "createdAt"
        FROM reward_requests WHERE status = 'pending' ORDER BY created_at`,
    sql`SELECT id, reward_id AS "rewardId", title, cost, status, created_at AS "createdAt"
        FROM reward_requests WHERE status = 'approved' ORDER BY resolved_at DESC LIMIT 5`,
  ]);
  return {
    coins: (wallet[0]?.coins ?? 0) as number,
    rewards: rewards as Reward[],
    pending: pending.map(toRequest),
    recent: recent.map(toRequest),
  };
}

export async function getRewardsAdmin() {
  await connection();
  const [rewards, pending, history] = await Promise.all([
    sql`SELECT id, title, cost, icon, active FROM rewards ORDER BY position, id`,
    sql`SELECT id, reward_id AS "rewardId", title, cost, status, created_at AS "createdAt"
        FROM reward_requests WHERE status = 'pending' ORDER BY created_at`,
    sql`SELECT id, reward_id AS "rewardId", title, cost, status, created_at AS "createdAt"
        FROM reward_requests WHERE status IN ('approved', 'denied') ORDER BY resolved_at DESC LIMIT 8`,
  ]);
  return {
    rewards: rewards as Reward[],
    pending: pending.map(toRequest),
    history: history.map(toRequest),
  };
}

export async function countPendingRewards() {
  const [row] = await sql`SELECT count(*)::int AS n FROM reward_requests WHERE status = 'pending'`;
  return row.n as number;
}
