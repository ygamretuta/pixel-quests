import "server-only";
import { connection } from "next/server";
import { SLOTS, type Equipped, type Slot } from "@/features/wardrobe/data/items";
import { sql } from "@/shared/server/db";

export async function getEquipped(): Promise<Equipped> {
  const rows = await sql`SELECT slot, item_id AS "itemId" FROM equipped`;
  const equipped: Equipped = {};
  for (const row of rows) {
    if ((SLOTS as readonly string[]).includes(row.slot)) equipped[row.slot as Slot] = row.itemId;
  }
  return equipped;
}

export async function getWardrobe() {
  await connection();
  const [wallet, owned, equipped] = await Promise.all([
    sql`SELECT coins FROM wallet WHERE id = 1`,
    sql`SELECT item_id AS "itemId" FROM owned_items`,
    getEquipped(),
  ]);
  return {
    coins: (wallet[0]?.coins ?? 0) as number,
    owned: owned.map((row) => row.itemId as string),
    equipped,
  };
}
