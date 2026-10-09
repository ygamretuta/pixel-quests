"use server";

import { revalidatePath } from "next/cache";
import { requireParent } from "@/features/parent/server/auth";
import { notifyChild, notifyParents } from "@/features/notifications/server/push";
import { getChildId } from "@/shared/server/child";
import { sql } from "@/shared/server/db";

export type PushSubscriptionJson = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export type DeviceRole = "parent" | "child";

/** `role` says whose device this is: a grown-up's phone (alerts) or her tablet (reminders). */
export async function saveSubscription(subscription: PushSubscriptionJson, role: DeviceRole) {
  await requireParent();
  const childId = role === "child" ? await getChildId() : null;
  const { endpoint, keys } = subscription;
  if (!endpoint.startsWith("https://") || !keys?.p256dh || !keys?.auth) return;

  await sql`
    INSERT INTO push_subscriptions (endpoint, p256dh, auth, role, child_id)
    VALUES (${endpoint}, ${keys.p256dh}, ${keys.auth}, ${role}, ${childId})
    ON CONFLICT (endpoint) DO UPDATE
      SET p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth, role = EXCLUDED.role, child_id = EXCLUDED.child_id`;
  revalidatePath("/settings");
}

export async function removeSubscription(endpoint: string) {
  await requireParent();
  await sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint}`;
  revalidatePath("/settings");
}

/** Sends a test message to every signed-up device. Returns how many accepted it. */
export async function sendTestNotification() {
  await requireParent();
  const [parents, children] = await Promise.all([
    notifyParents({
      title: "Pixel Quests",
      body: "Notifications are working! You'll hear about reward requests here.",
      url: "/settings",
      tag: "test",
    }),
    notifyChild(await getChildId(), {
      title: "Quest time!",
      body: "This is what a reminder looks like.",
      url: "/",
      tag: "test-child",
    }),
  ]);
  return parents + children;
}

/** Which role this device was set up as, if any. */
export async function getDeviceRole(endpoint: string): Promise<DeviceRole | null> {
  await requireParent();
  const [row] = await sql`SELECT role FROM push_subscriptions WHERE endpoint = ${endpoint}`;
  return (row?.role as DeviceRole | undefined) ?? null;
}
