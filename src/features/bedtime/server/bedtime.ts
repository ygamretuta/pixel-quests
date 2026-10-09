import "server-only";
import { connection } from "next/server";
import { isParent } from "@/features/parent/server/auth";
import {
  DEFAULT_BEDTIME,
  bedtimeState,
  isClock,
  type BedtimeSettings,
  type BedtimeState,
} from "@/shared/lib/time/bedtime";
import { sql } from "@/shared/server/db";

import { getChildId } from "@/shared/server/child";

const KEY = "bedtime";

export async function getBedtimeSettings(childId: number): Promise<BedtimeSettings> {
  const [row] = await sql`SELECT value FROM settings WHERE child_id = ${childId} AND key = ${KEY}`;
  const value = row?.value as Partial<BedtimeSettings> | undefined;
  return {
    enabled: value?.enabled === true,
    bedtime: isClock(value?.bedtime) ? value.bedtime : DEFAULT_BEDTIME.bedtime,
    wake: isClock(value?.wake) ? value.wake : DEFAULT_BEDTIME.wake,
  };
}

export async function saveBedtimeSettings(childId: number, settings: BedtimeSettings) {
  await sql`
    INSERT INTO settings (child_id, key, value) VALUES (${childId}, ${KEY}, ${JSON.stringify(settings)}::jsonb)
    ON CONFLICT (child_id, key) DO UPDATE SET value = EXCLUDED.value`;
}

/** Bedtime state for one child, read at the given time. */
export async function getBedtimeFor(childId: number, now: number) {
  const settings = await getBedtimeSettings(childId);
  return { settings, ...bedtimeState(now, settings) };
}

/** Bedtime state for the child this device plays as. */
export async function getBedtime(): Promise<{ settings: BedtimeSettings } & BedtimeState> {
  await connection(); // reads the clock, so it must run at request time
  return getBedtimeFor(await getChildId(), Date.now());
}

/** Kid actions call this: they are blocked while the app sleeps, unless a parent is signed in. */
export async function isAwake() {
  const { asleep } = await getBedtime();
  return !asleep || (await isParent());
}
