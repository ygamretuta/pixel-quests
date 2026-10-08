"use server";

import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { lock, requireParent, unlock, type UnlockResult } from "@/server/auth";
import { sql } from "@/server/db";
import { awardStreakBonus } from "@/server/streak";
import { periodKey } from "@/shared/time/pht";

const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type LogResult =
  | { ok: true; defeated: boolean; bonus: { streak: number; bonus: number } | null }
  | { ok: false; error: "already-defeated" | "bad-file" | "failed" };

export async function unlockParent(pin: string): Promise<UnlockResult> {
  const result = await unlock(pin);
  if (result.ok) revalidatePath("/");
  return result;
}

export async function lockParent() {
  await lock();
  revalidatePath("/");
}

export async function logProgress(formData: FormData): Promise<LogResult> {
  await requireParent();

  const questId = String(formData.get("questId") ?? "");
  const file = formData.get("photo");
  const hasFile = file instanceof File && file.size > 0;
  if (hasFile && (!IMAGE_TYPES.includes(file.type) || file.size > MAX_UPLOAD_BYTES)) {
    return { ok: false, error: "bad-file" };
  }

  const [quest] = await sql`SELECT cadence, max_hp AS "maxHp", reward FROM quests WHERE id = ${questId} AND active`;
  if (!quest) return { ok: false, error: "failed" };
  const period = periodKey(quest.cadence, Date.now());

  let path: string | null = null;
  if (hasFile) {
    const blob = await put(`evidence/${questId}/${period}.jpg`, file, {
      access: "private",
      addRandomSuffix: true,
      contentType: file.type,
    });
    path = blob.pathname;
  }

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
        WHERE id = 1 AND EXISTS (SELECT 1 FROM ins WHERE seq = ${quest.maxHp})
        RETURNING coins
      )
      SELECT (SELECT count(*) FROM ins)::int AS inserted, (SELECT count(*) FROM pay)::int AS paid`;

    if (!row.inserted) {
      if (path) await del(path);
      return { ok: false, error: "already-defeated" };
    }
    const defeated = row.paid > 0;
    const bonus = defeated && quest.cadence === "daily" ? await awardStreakBonus(Date.now()) : null;
    revalidatePath("/");
    return { ok: true, defeated, bonus };
  } catch {
    if (path) await del(path).catch(() => {});
    return { ok: false, error: "failed" };
  }
}

export async function renameMonster(questId: string, name: string) {
  const trimmed = name.trim().slice(0, 12);
  if (!trimmed) return;
  await sql`UPDATE quests SET monster_name = ${trimmed} WHERE id = ${questId}`;
  revalidatePath("/");
}

/** Marks (or unmarks) a day as a rest day. Rest days never break the streak. */
export async function setRestDay(day: string, rest: boolean) {
  await requireParent();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(Date.parse(day))) return;
  if (rest) await sql`INSERT INTO rest_days (day) VALUES (${day}) ON CONFLICT DO NOTHING`;
  else await sql`DELETE FROM rest_days WHERE day = ${day}`;
  revalidatePath("/");
  revalidatePath("/summary");
}

export async function toggleRestToday() {
  await requireParent();
  const today = periodKey("daily", Date.now());
  const [existing] = await sql`SELECT 1 FROM rest_days WHERE day = ${today}`;
  await setRestDay(today, !existing);
}
