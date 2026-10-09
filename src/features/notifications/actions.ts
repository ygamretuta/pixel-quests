"use server";

import { revalidatePath } from "next/cache";
import { requireParent } from "@/features/parent/server/auth";
import { notifyParents } from "@/features/notifications/server/push";
import { sql } from "@/shared/server/db";

export type PushSubscriptionJson = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function saveSubscription(subscription: PushSubscriptionJson) {
  await requireParent();
  const { endpoint, keys } = subscription;
  if (!endpoint.startsWith("https://") || !keys?.p256dh || !keys?.auth) return;

  await sql`
    INSERT INTO push_subscriptions (endpoint, p256dh, auth) VALUES (${endpoint}, ${keys.p256dh}, ${keys.auth})
    ON CONFLICT (endpoint) DO UPDATE SET p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth`;
  revalidatePath("/settings");
}

export async function removeSubscription(endpoint: string) {
  await requireParent();
  await sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint}`;
  revalidatePath("/settings");
}

/** Sends a test message to every signed-up phone. Returns how many accepted it. */
export async function sendTestNotification() {
  await requireParent();
  return notifyParents({
    title: "Pixel Quests",
    body: "Notifications are working! You'll hear about reward requests here.",
    url: "/settings",
    tag: "test",
  });
}
