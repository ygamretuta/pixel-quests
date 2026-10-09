"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { isAwake } from "@/features/bedtime/server/bedtime";
import { notifyParents } from "@/features/notifications/server/push";
import { requireParent } from "@/features/parent/server/auth";
import { awardBadges } from "@/features/trophies/server/trophies";
import { getChild, getChildId } from "@/shared/server/child";
import { sql } from "@/shared/server/db";
import { REWARD_ICONS } from "@/features/rewards/data/icons";

export type RequestResult = { ok: true } | { ok: false; error: "poor" | "waiting" | "gone" | "sleeping" };
export type SaveResult = { ok: true } | { ok: false; error: string };

function refresh() {
  revalidatePath("/treats");
  revalidatePath("/rewards");
  revalidatePath("/");
}

/** She asks for a real-life reward. The coins are held until a parent answers. */
export async function requestReward(rewardId: string): Promise<RequestResult> {
  if (!(await isAwake())) return { ok: false, error: "sleeping" };
  const child = await getChild();
  const [reward] = await sql`
    SELECT title, cost FROM rewards WHERE id = ${rewardId} AND child_id = ${child.id} AND active`;
  if (!reward) return { ok: false, error: "gone" };

  const [waiting] = await sql`SELECT 1 FROM reward_requests WHERE reward_id = ${rewardId} AND status = 'pending'`;
  if (waiting) return { ok: false, error: "waiting" };

  const [row] = await sql`
    WITH r AS (SELECT id, title, cost FROM rewards WHERE id = ${rewardId} AND child_id = ${child.id} AND active),
    pay AS (
      UPDATE wallet SET coins = coins - (SELECT cost FROM r)
      WHERE child_id = ${child.id} AND coins >= (SELECT cost FROM r)
        AND NOT EXISTS (SELECT 1 FROM reward_requests WHERE reward_id = ${rewardId} AND status = 'pending')
      RETURNING coins
    ), ins AS (
      INSERT INTO reward_requests (reward_id, title, cost)
      SELECT id, title, cost FROM r WHERE EXISTS (SELECT 1 FROM pay)
      RETURNING id
    )
    SELECT (SELECT count(*) FROM ins)::int AS made`;
  if (!row.made) return { ok: false, error: "poor" };

  // Tell the parents' phones after the response is sent, so asking never feels slow.
  after(() =>
    notifyParents({
      title: `${child.name} asked for a reward`,
      body: `${reward.title} (${reward.cost} coins)`,
      url: "/rewards",
      tag: `reward-${rewardId}`,
    }).catch(() => {}),
  );
  refresh();
  return { ok: true };
}

/** Closes a pending request and gives the held coins back to the child who asked. */
async function closeAndRefund(requestId: number, status: "cancelled" | "denied") {
  await sql`
    WITH c AS (
      UPDATE reward_requests r SET status = ${status}, resolved_at = now()
      FROM rewards w
      WHERE r.id = ${requestId} AND r.status = 'pending' AND w.id = r.reward_id
      RETURNING r.cost, w.child_id
    ), refund AS (
      UPDATE wallet SET coins = coins + (SELECT cost FROM c)
      WHERE child_id = (SELECT child_id FROM c) RETURNING coins
    )
    SELECT (SELECT count(*) FROM c)::int AS n`;
  refresh();
}

export async function cancelRequest(requestId: number) {
  if (!(await isAwake())) return;
  await closeAndRefund(requestId, "cancelled");
}

export async function denyRequest(requestId: number) {
  await requireParent();
  await closeAndRefund(requestId, "denied");
}

export async function approveRequest(requestId: number) {
  await requireParent();
  const approved = await sql`
    UPDATE reward_requests r SET status = 'approved', resolved_at = now()
    FROM rewards w
    WHERE r.id = ${requestId} AND r.status = 'pending' AND w.id = r.reward_id
    RETURNING w.child_id`;
  if (approved[0]) await awardBadges(approved[0].child_id as number);
  refresh();
}

export async function saveReward(formData: FormData): Promise<SaveResult> {
  await requireParent();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const icon = String(formData.get("icon") ?? "");
  const cost = Number(formData.get("cost"));
  const childId = await getChildId();

  if (!title || title.length > 30) return { ok: false, error: "Give the reward a name (up to 30 letters)." };
  if (!Number.isInteger(cost) || cost < 1 || cost > 1000) return { ok: false, error: "Cost must be 1 to 1000 coins." };
  if (!REWARD_ICONS.some((entry) => entry.key === icon)) return { ok: false, error: "Pick a picture." };

  if (id) {
    const updated = await sql`
      UPDATE rewards SET title = ${title}, cost = ${cost}, icon = ${icon}
      WHERE id = ${id} AND child_id = ${childId} RETURNING id`;
    if (!updated.length) return { ok: false, error: "That reward no longer exists." };
  } else {
    await sql`
      INSERT INTO rewards (id, title, cost, icon, position, child_id)
      VALUES (${randomUUID().slice(0, 8)}, ${title}, ${cost}, ${icon},
              (SELECT coalesce(max(position), 0) + 1 FROM rewards), ${childId})`;
  }
  refresh();
  return { ok: true };
}

export async function setRewardActive(id: string, active: boolean) {
  await requireParent();
  await sql`UPDATE rewards SET active = ${active} WHERE id = ${id} AND child_id = ${await getChildId()}`;
  refresh();
}

/** She picks the reward she is saving up for (or clears it with null). */
export async function setGoal(rewardId: string | null) {
  if (!(await isAwake())) return;
  const childId = await getChildId();
  if (rewardId === null) {
    await sql`DELETE FROM settings WHERE child_id = ${childId} AND key = 'goal'`;
  } else {
    const [reward] = await sql`SELECT 1 FROM rewards WHERE id = ${rewardId} AND child_id = ${childId} AND active`;
    if (!reward) return;
    await sql`
      INSERT INTO settings (child_id, key, value) VALUES (${childId}, 'goal', ${JSON.stringify({ rewardId })}::jsonb)
      ON CONFLICT (child_id, key) DO UPDATE SET value = EXCLUDED.value`;
  }
  refresh();
}
