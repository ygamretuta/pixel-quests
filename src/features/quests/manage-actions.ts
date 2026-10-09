"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireParent } from "@/features/parent/server/auth";
import { MONSTERS } from "@/features/monsters/data/monsters";
import { QUEST_PACKS } from "@/features/quests/data/packs";
import { isClock } from "@/shared/lib/time/bedtime";
import { EVERY_DAY, maskFromDays } from "@/shared/lib/time/schedule";
import { getChildId } from "@/shared/server/child";
import { sql } from "@/shared/server/db";

export type SaveResult = { ok: true } | { ok: false; error: string };

function refresh() {
  revalidatePath("/manage");
  revalidatePath("/");
}

function whole(value: FormDataEntryValue | null, min: number, max: number) {
  const number = Number(value);
  return Number.isInteger(number) && number >= min && number <= max ? number : null;
}

export async function saveQuest(formData: FormData): Promise<SaveResult> {
  await requireParent();
  const childId = await getChildId();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const monsterName = String(formData.get("monsterName") ?? "").trim().slice(0, 12);
  const cadence = formData.get("cadence");
  const sprite = String(formData.get("sprite") ?? "");
  const maxHp = whole(formData.get("maxHp"), 1, 10);
  const reward = whole(formData.get("reward"), 1, 100);
  const dayChoices = formData.getAll("days").map(Number).filter((day) => Number.isInteger(day) && day >= 0 && day <= 6);
  const remind = String(formData.get("remindAt") ?? "");

  if (!title || title.length > 40) return { ok: false, error: "Give the quest a name (up to 40 letters)." };
  if (cadence !== "daily" && cadence !== "weekly") return { ok: false, error: "Pick daily or weekly." };
  if (!MONSTERS.some((monster) => monster.key === sprite)) return { ok: false, error: "Pick a monster." };
  if (maxHp === null) return { ok: false, error: "HP must be 1 to 10." };
  if (reward === null) return { ok: false, error: "Reward must be 1 to 100 coins." };
  if (cadence === "daily" && dayChoices.length === 0) return { ok: false, error: "Pick at least one day." };
  if (remind && !isClock(remind)) return { ok: false, error: "Pick a valid reminder time." };

  const name = monsterName || "Monster";
  const days = cadence === "weekly" ? EVERY_DAY : maskFromDays(dayChoices);
  const remindAt = cadence === "daily" && remind ? remind : null;

  if (id) {
    const updated = await sql`
      UPDATE quests
      SET title = ${title}, monster_name = ${name}, cadence = ${cadence}, max_hp = ${maxHp},
          reward = ${reward}, sprite = ${sprite}, days = ${days}, remind_at = ${remindAt}
      WHERE id = ${id} AND child_id = ${childId} AND active
      RETURNING id`;
    if (!updated.length) return { ok: false, error: "That quest no longer exists." };
  } else {
    await sql`
      INSERT INTO quests (id, title, monster_name, cadence, max_hp, reward, sprite, position, child_id, days, remind_at)
      VALUES (${randomUUID().slice(0, 8)}, ${title}, ${name}, ${cadence}, ${maxHp}, ${reward}, ${sprite},
              (SELECT coalesce(max(position), 0) + 1 FROM quests), ${childId}, ${days}, ${remindAt})`;
  }
  refresh();
  return { ok: true };
}

/** Adds the chosen quests from a ready-made pack, skipping any she already has by name. */
export async function addQuestPack(packId: string, titles: string[]): Promise<SaveResult> {
  await requireParent();
  const pack = QUEST_PACKS.find((entry) => entry.id === packId);
  if (!pack) return { ok: false, error: "That pack is gone." };
  const childId = await getChildId();

  const existing = await sql`SELECT lower(title) AS title FROM quests WHERE child_id = ${childId} AND active`;
  const have = new Set(existing.map((row) => row.title as string));
  const chosen = pack.quests.filter((quest) => titles.includes(quest.title) && !have.has(quest.title.toLowerCase()));
  if (!chosen.length) return { ok: false, error: "Nothing new to add. She already has those." };

  for (const quest of chosen) {
    await sql`
      INSERT INTO quests (id, title, monster_name, cadence, max_hp, reward, sprite, position, child_id, days, remind_at)
      VALUES (${randomUUID().slice(0, 8)}, ${quest.title}, ${quest.monsterName}, ${quest.cadence}, ${quest.maxHp},
              ${quest.reward}, ${quest.sprite}, (SELECT coalesce(max(position), 0) + 1 FROM quests), ${childId},
              ${quest.days ?? EVERY_DAY}, ${quest.remindAt ?? null})`;
  }
  refresh();
  return { ok: true };
}

/** Hides a quest from the board. Its history stays in the database. */
export async function archiveQuest(id: string) {
  await requireParent();
  await sql`UPDATE quests SET active = false WHERE id = ${id} AND child_id = ${await getChildId()}`;
  refresh();
}

export async function restoreQuest(id: string) {
  await requireParent();
  await sql`
    UPDATE quests
    SET active = true, position = (SELECT coalesce(max(position), 0) + 1 FROM quests)
    WHERE id = ${id} AND child_id = ${await getChildId()}`;
  refresh();
}

/** Moves a quest one place up or down among the active quests. */
export async function moveQuest(id: string, direction: "up" | "down") {
  await requireParent();
  const rows = await sql`SELECT id FROM quests WHERE child_id = ${await getChildId()} AND active ORDER BY position, id`;
  const ids = rows.map((row) => row.id as string);
  const from = ids.indexOf(id);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from < 0 || to < 0 || to >= ids.length) return;

  [ids[from], ids[to]] = [ids[to], ids[from]];
  await sql`
    UPDATE quests q SET position = o.pos
    FROM unnest(${ids}::text[]) WITH ORDINALITY AS o(id, pos)
    WHERE q.id = o.id`;
  refresh();
}
