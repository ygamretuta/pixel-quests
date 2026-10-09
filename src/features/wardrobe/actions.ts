"use server";

import { revalidatePath } from "next/cache";
import { isAwake } from "@/features/bedtime/server/bedtime";
import { checkPin, isParent } from "@/features/parent/server/auth";
import { awardBadges } from "@/features/trophies/server/trophies";
import { getChildId } from "@/shared/server/child";
import { sql } from "@/shared/server/db";
import { ITEMS_BY_ID, SLOTS, type Slot } from "@/features/wardrobe/data/items";

export type BuyResult =
  | { ok: true }
  | { ok: false; error: "poor" | "owned" | "unknown" | "wrong" | "locked" };

function refresh() {
  revalidatePath("/shop");
  revalidatePath("/");
}

/** Buying needs a parent: either already in parent mode, or the PIN given with the purchase. */
export async function buyItem(itemId: string, pin?: string): Promise<BuyResult> {
  const item = ITEMS_BY_ID[itemId];
  if (!item) return { ok: false, error: "unknown" };

  if (!(await isParent())) {
    const approval = await checkPin(pin ?? "");
    if (!approval.ok) return approval;
  }

  const childId = await getChildId();
  const [owned] = await sql`SELECT 1 FROM owned_items WHERE child_id = ${childId} AND item_id = ${item.id}`;
  if (owned) return { ok: false, error: "owned" };

  // One statement: pay, record ownership, and wear it. Price always comes from the catalog.
  const [row] = await sql`
    WITH pay AS (
      UPDATE wallet SET coins = coins - ${item.price}
      WHERE child_id = ${childId} AND coins >= ${item.price}
      RETURNING coins
    ), own AS (
      INSERT INTO owned_items (child_id, item_id) SELECT ${childId}, ${item.id} FROM pay
      ON CONFLICT DO NOTHING
      RETURNING item_id
    ), wear AS (
      INSERT INTO equipped (child_id, slot, item_id) SELECT ${childId}, ${item.slot}, item_id FROM own
      ON CONFLICT (child_id, slot) DO UPDATE SET item_id = EXCLUDED.item_id
      RETURNING slot
    )
    SELECT (SELECT count(*) FROM own)::int AS bought, (SELECT count(*) FROM wear)::int AS worn`;

  if (!row.bought) return { ok: false, error: "poor" };
  await awardBadges(childId);
  refresh();
  return { ok: true };
}

export async function wearItem(itemId: string) {
  if (!(await isAwake())) return;
  const item = ITEMS_BY_ID[itemId];
  if (!item) return;
  const childId = await getChildId();
  await sql`
    INSERT INTO equipped (child_id, slot, item_id)
    SELECT ${childId}, ${item.slot}, item_id FROM owned_items WHERE child_id = ${childId} AND item_id = ${item.id}
    ON CONFLICT (child_id, slot) DO UPDATE SET item_id = EXCLUDED.item_id`;
  refresh();
}

export async function takeOff(slot: Slot) {
  if (!(await isAwake())) return;
  if (!SLOTS.includes(slot)) return;
  await sql`DELETE FROM equipped WHERE child_id = ${await getChildId()} AND slot = ${slot}`;
  refresh();
}
