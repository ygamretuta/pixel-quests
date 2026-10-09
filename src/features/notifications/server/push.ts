import "server-only";
import webpush from "web-push";
import { sql } from "@/shared/server/db";

export type PushPayload = { title: string; body: string; url: string; tag?: string };

let configured = false;
function configure() {
  if (configured) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  configured = true;
}

export async function countPushDevices() {
  const rows = await sql`SELECT role, count(*)::int AS n FROM push_subscriptions GROUP BY role`;
  const count = (role: string) => (rows.find((row) => row.role === role)?.n as number | undefined) ?? 0;
  return { parents: count("parent"), children: count("child") };
}

type Device = { endpoint: string; p256dh: string; auth: string };

async function sendToDevices(devices: Device[], payload: PushPayload) {
  configure();
  let sent = 0;

  await Promise.all(
    devices.map(async (device) => {
      try {
        await webpush.sendNotification(
          { endpoint: device.endpoint, keys: { p256dh: device.p256dh, auth: device.auth } },
          JSON.stringify(payload),
          { TTL: 60 * 60 * 24, urgency: "high" },
        );
        sent++;
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await sql`DELETE FROM push_subscriptions WHERE endpoint = ${device.endpoint}`;
        } else {
          console.error("push failed", status);
        }
      }
    }),
  );
  return sent;
}

/** Sends a notification to every phone a parent signed up. Dead subscriptions are cleaned up. */
export async function notifyParents(payload: PushPayload) {
  const devices = await sql`SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE role = 'parent'`;
  return sendToDevices(devices as Device[], payload);
}

/** Sends a reminder to the tablets or phones set up for one child. */
export async function notifyChild(childId: number, payload: PushPayload) {
  const devices = await sql`
    SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE role = 'child' AND child_id = ${childId}`;
  return sendToDevices(devices as Device[], payload);
}
