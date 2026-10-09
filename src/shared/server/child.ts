import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { sql } from "@/shared/server/db";

export type Child = { id: number; name: string };

export const CHILD_COOKIE = "pq_child";

/** Everyone who plays, oldest first. */
export const listChildren = cache(async (): Promise<Child[]> => {
  const rows = await sql`SELECT id, name FROM children ORDER BY id`;
  return rows as Child[];
});

/**
 * The child this device plays as. A parent picks it once per device (see selectChild);
 * without a pick it is the first child.
 */
export const getChild = cache(async (): Promise<Child> => {
  const children = await listChildren();
  const picked = Number((await cookies()).get(CHILD_COOKIE)?.value);
  return children.find((child) => child.id === picked) ?? children[0];
});

export async function getChildId() {
  return (await getChild()).id;
}
