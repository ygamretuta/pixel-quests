import { del } from "@vercel/blob";
import { sql } from "@/server/db";

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

  return Response.json({ deleted: old.length });
}
