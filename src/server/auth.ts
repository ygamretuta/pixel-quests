import "server-only";
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { sql } from "./db";

const COOKIE = "pq_parent";
const SESSION_DAYS = 30;
const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 10;

function sign(value: string) {
  return createHmac("sha256", process.env.SESSION_SECRET!).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function isParent() {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || !safeEqual(sign(expires), signature)) return false;
  return Number(expires) > Date.now();
}

export async function requireParent() {
  if (!(await isParent())) throw new Error("Parent mode required");
}

function pinMatches(pin: string) {
  const [salt, hash] = process.env.PARENT_PIN_HASH!.split(":");
  const candidate = scryptSync(pin, salt, 32).toString("hex");
  return safeEqual(candidate, hash);
}

export type UnlockResult = { ok: true } | { ok: false; error: "wrong" | "locked" };

export async function unlock(pin: string): Promise<UnlockResult> {
  const [{ recent }] = await sql`
    SELECT count(*)::int AS recent FROM pin_attempts
    WHERE at > now() - make_interval(mins => ${WINDOW_MINUTES})`;
  if (recent >= MAX_ATTEMPTS) return { ok: false, error: "locked" };

  if (!/^\d{4,8}$/.test(pin) || !pinMatches(pin)) {
    await sql`INSERT INTO pin_attempts DEFAULT VALUES`;
    return { ok: false, error: "wrong" };
  }

  await sql`DELETE FROM pin_attempts`;
  const expires = String(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  (await cookies()).set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return { ok: true };
}

export async function lock() {
  (await cookies()).delete(COOKIE);
}
