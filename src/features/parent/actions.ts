"use server";

import { revalidatePath } from "next/cache";
import { lock, unlock, type UnlockResult } from "@/features/parent/server/auth";

export async function unlockParent(pin: string): Promise<UnlockResult> {
  const result = await unlock(pin);
  if (result.ok) revalidatePath("/");
  return result;
}

export async function lockParent() {
  await lock();
  revalidatePath("/");
}
