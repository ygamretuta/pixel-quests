"use server";

import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { isAwake } from "@/features/bedtime/server/bedtime";
import { notifyParents } from "@/features/notifications/server/push";
import { requireParent } from "@/features/parent/server/auth";
import { MAX_SHIELDS, SHIELD_PRICE } from "@/features/quests/data/streak";
import { recordHit } from "@/features/quests/server/hits";
import { getStreak } from "@/features/quests/server/streak";
import type { HitOutcome } from "@/features/quests/types";
import { checkPin, isParent } from "@/features/parent/server/auth";
import { awardBadges } from "@/features/trophies/server/trophies";
import { periodKey } from "@/shared/lib/time/pht";
import { isScheduled } from "@/shared/lib/time/schedule";
import { getChild, getChildId } from "@/shared/server/child";
import { sql } from "@/shared/server/db";

const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type LogResult =
  | ({ ok: true } & HitOutcome)
  | { ok: false; error: "already-defeated" | "bad-file" | "failed" };

export async function logProgress(formData: FormData): Promise<LogResult> {
  await requireParent();
  const childId = await getChildId();

  const questId = String(formData.get("questId") ?? "");
  const file = formData.get("photo");
  const hasFile = file instanceof File && file.size > 0;
  if (hasFile && (!IMAGE_TYPES.includes(file.type) || file.size > MAX_UPLOAD_BYTES)) {
    return { ok: false, error: "bad-file" };
  }

  const [quest] = await sql`SELECT cadence FROM quests WHERE id = ${questId} AND child_id = ${childId} AND active`;
  if (!quest) return { ok: false, error: "failed" };

  let path: string | null = null;
  if (hasFile) {
    const blob = await put(`evidence/${questId}/${periodKey(quest.cadence, Date.now())}.jpg`, file, {
      access: "private",
      addRandomSuffix: true,
      contentType: file.type,
    });
    path = blob.pathname;
  }

  const result = await recordHit(childId, questId, path);
  if (!result.ok && path) await del(path).catch(() => {});
  revalidatePath("/");
  return result;
}

/** One-tap approval of an "I did it!" (no photo). */
export async function approveClaim(questId: string): Promise<LogResult> {
  await requireParent();
  const result = await recordHit(await getChildId(), questId, null);
  revalidatePath("/");
  return result;
}

export async function dismissClaim(questId: string) {
  await requireParent();
  await sql`
    UPDATE claims SET status = 'dismissed'
    WHERE quest_id = ${questId} AND status = 'pending' AND child_id = ${await getChildId()}`;
  revalidatePath("/");
}

export type ClaimResult = { ok: true } | { ok: false; error: "sleeping" | "off" | "done" | "waiting" };

/** She says she did it. A parent gets a message and approves with one tap. */
export async function claimQuest(questId: string): Promise<ClaimResult> {
  if (!(await isAwake())) return { ok: false, error: "sleeping" };
  const child = await getChild();

  const [quest] = await sql`
    SELECT title, cadence, max_hp AS "maxHp", days FROM quests
    WHERE id = ${questId} AND child_id = ${child.id} AND active`;
  if (!quest) return { ok: false, error: "off" };

  const now = Date.now();
  const today = periodKey("daily", now);
  if (quest.cadence === "daily" && !isScheduled(quest.days, today)) return { ok: false, error: "off" };

  const period = periodKey(quest.cadence, now);
  const [{ n }] = await sql`SELECT count(*)::int AS n FROM hits WHERE quest_id = ${questId} AND period = ${period}`;
  if (n >= quest.maxHp) return { ok: false, error: "done" };

  const inserted = await sql`
    INSERT INTO claims (child_id, quest_id, period) VALUES (${child.id}, ${questId}, ${period})
    ON CONFLICT (quest_id, period) WHERE status = 'pending' DO NOTHING
    RETURNING id`;
  if (!inserted.length) return { ok: false, error: "waiting" };

  after(() =>
    notifyParents({
      title: `${child.name} says she did it!`,
      body: quest.title,
      url: "/",
      tag: `claim-${questId}`,
    }).catch(() => {}),
  );
  revalidatePath("/");
  return { ok: true };
}

export async function renameMonster(questId: string, name: string) {
  if (!(await isAwake())) return;
  const trimmed = name.trim().slice(0, 12);
  if (!trimmed) return;
  await sql`UPDATE quests SET monster_name = ${trimmed} WHERE id = ${questId} AND child_id = ${await getChildId()}`;
  revalidatePath("/");
}

/** Marks (or unmarks) a day as a rest day. Rest days never break the streak. */
export async function setRestDay(day: string, rest: boolean) {
  await requireParent();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(Date.parse(day))) return;
  const childId = await getChildId();
  if (rest) {
    await sql`INSERT INTO rest_days (child_id, day) VALUES (${childId}, ${day}) ON CONFLICT DO NOTHING`;
  } else {
    await sql`DELETE FROM rest_days WHERE child_id = ${childId} AND day = ${day}`;
  }
  revalidatePath("/");
  revalidatePath("/summary");
}

export async function toggleRestToday() {
  await requireParent();
  const today = periodKey("daily", Date.now());
  const [existing] = await sql`SELECT 1 FROM rest_days WHERE child_id = ${await getChildId()} AND day = ${today}`;
  await setRestDay(today, !existing);
}

export type ShieldResult = { ok: true } | { ok: false; error: "poor" | "full" | "wrong" | "locked" };

/** A streak shield saves one missed day. Like other purchases it needs a grown-up. */
export async function buyShield(pin?: string): Promise<ShieldResult> {
  if (!(await isParent())) {
    const approval = await checkPin(pin ?? "");
    if (!approval.ok) return approval;
  }
  const childId = await getChildId();
  const { shields } = await getStreak(childId, Date.now());
  if (shields >= MAX_SHIELDS) return { ok: false, error: "full" };

  const [row] = await sql`
    WITH pay AS (
      UPDATE wallet SET coins = coins - ${SHIELD_PRICE}
      WHERE child_id = ${childId} AND coins >= ${SHIELD_PRICE} RETURNING coins
    ), ins AS (
      INSERT INTO shield_purchases (child_id) SELECT ${childId} FROM pay RETURNING id
    )
    SELECT (SELECT count(*) FROM ins)::int AS bought`;
  if (!row.bought) return { ok: false, error: "poor" };

  await awardBadges(childId);
  revalidatePath("/shop");
  revalidatePath("/");
  return { ok: true };
}
