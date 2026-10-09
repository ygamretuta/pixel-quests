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
  const [row] = await sql`SELECT count(*)::int AS n FROM push_subscriptions`;
  return row.n as number;
}

/** Sends a notification to every phone a parent signed up. Dead subscriptions are cleaned up. */
export async function notifyParents(payload: PushPayload) {
  configure();
  const devices = await sql`SELECT endpoint, p256dh, auth FROM push_subscriptions`;
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
