import { del } from "@vercel/blob";
import { saveBackup } from "@/features/backup/server/backup";
import { periodKey } from "@/shared/lib/time/pht";
import { sql } from "@/shared/server/db";

// Keeps storage inside the free tier: drops evidence photos past the retention window.
const RETENTION_DAYS = 60;

export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const old = await sql`
    SELECT id, evidence_path FROM hits
    WHERE evidence_path IS NOT NULL
      AND created_at < now() - make_interval(days => ${RETENTION_DAYS})`;

  if (old.length) {
    await del(old.map((row) => row.evidence_path as string));
    await sql`UPDATE hits SET evidence_path = NULL WHERE id = ANY(${old.map((row) => row.id)})`;
  }
  await sql`DELETE FROM pin_attempts WHERE at < now() - interval '1 day'`;

  // Sundays (Philippine time): also save a backup of everything except photos.
  const now = Date.now();
  const isSunday = new Date(now + 8 * 60 * 60 * 1000).getUTCDay() === 0;
  const backedUp = isSunday ? await saveBackup(periodKey("daily", now)) : null;

  return Response.json({ deleted: old.length, backedUpRows: backedUp });
}
