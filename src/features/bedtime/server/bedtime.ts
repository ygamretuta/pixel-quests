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

const KEY = "bedtime";

export async function getBedtimeSettings(): Promise<BedtimeSettings> {
  const [row] = await sql`SELECT value FROM settings WHERE key = ${KEY}`;
  const value = row?.value as Partial<BedtimeSettings> | undefined;
  return {
    enabled: value?.enabled === true,
    bedtime: isClock(value?.bedtime) ? value.bedtime : DEFAULT_BEDTIME.bedtime,
    wake: isClock(value?.wake) ? value.wake : DEFAULT_BEDTIME.wake,
  };
}

export async function saveBedtimeSettings(settings: BedtimeSettings) {
  await sql`
    INSERT INTO settings (key, value) VALUES (${KEY}, ${JSON.stringify(settings)}::jsonb)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
}

export async function getBedtime(): Promise<{ settings: BedtimeSettings } & BedtimeState> {
  await connection(); // reads the clock, so it must run at request time
  const settings = await getBedtimeSettings();
  return { settings, ...bedtimeState(Date.now(), settings) };
}

/** Kid actions call this: they are blocked while the app sleeps, unless a parent is signed in. */
export async function isAwake() {
  const { asleep } = await getBedtime();
  return !asleep || (await isParent());
}
