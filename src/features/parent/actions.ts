"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { lock, requireParent, unlock, type UnlockResult } from "@/features/parent/server/auth";
import { CHILD_COOKIE, listChildren } from "@/shared/server/child";
import { sql } from "@/shared/server/db";

export async function unlockParent(pin: string): Promise<UnlockResult> {
  const result = await unlock(pin);
  if (result.ok) revalidatePath("/");
  return result;
}

export async function lockParent() {
  await lock();
  revalidatePath("/");
}

const CHILD_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Makes this device play as the chosen child. A grown-up does this once per device. */
export async function selectChild(childId: number) {
  await requireParent();
  const children = await listChildren();
  if (!children.some((child) => child.id === childId)) return;

  (await cookies()).set(CHILD_COOKIE, String(childId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CHILD_COOKIE_MAX_AGE,
  });
  revalidatePath("/", "layout");
}

export type ChildResult = { ok: true } | { ok: false; error: string };

export async function addChild(formData: FormData): Promise<ChildResult> {
  await requireParent();
  const name = String(formData.get("name") ?? "").trim().slice(0, 20);
  if (!name) return { ok: false, error: "Type a name." };

  const [child] = await sql`INSERT INTO children (name) VALUES (${name}) RETURNING id`;
  await sql`INSERT INTO wallet (child_id, coins) VALUES (${child.id}, 0)`;
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function renameChild(childId: number, name: string): Promise<ChildResult> {
  await requireParent();
  const trimmed = name.trim().slice(0, 20);
  if (!trimmed) return { ok: false, error: "Type a name." };
  await sql`UPDATE children SET name = ${trimmed} WHERE id = ${childId}`;
  revalidatePath("/", "layout");
  return { ok: true };
}
