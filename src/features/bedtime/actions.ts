"use server";

import { revalidatePath } from "next/cache";
import { requireParent } from "@/features/parent/server/auth";
import { saveBedtimeSettings } from "@/features/bedtime/server/bedtime";
import { isClock } from "@/shared/lib/time/bedtime";
import { getChildId } from "@/shared/server/child";

export type SaveBedtimeResult = { ok: true } | { ok: false; error: string };

export async function saveBedtime(formData: FormData): Promise<SaveBedtimeResult> {
  await requireParent();

  const bedtime = formData.get("bedtime");
  const wake = formData.get("wake");
  if (!isClock(bedtime) || !isClock(wake)) return { ok: false, error: "Pick a bedtime and a wake-up time." };
  if (bedtime === wake) return { ok: false, error: "Bedtime and wake-up time can't be the same." };

  await saveBedtimeSettings(await getChildId(), { enabled: formData.get("enabled") === "on", bedtime, wake });
  for (const path of ["/", "/shop", "/treats", "/settings"]) revalidatePath(path);
  return { ok: true };
}
