import "server-only";
import { del, list, put } from "@vercel/blob";
import { sql } from "@/shared/server/db";

// Tables that hold secrets or throwaway data are never backed up.
const SKIP = new Set(["pin_attempts", "push_subscriptions"]);
const KEEP_BACKUPS = 8;

/** Every table's rows as one JSON document, so nothing needs updating when new tables appear. */
export async function buildBackup() {
  const tables = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`;

  const data: Record<string, unknown[]> = {};
  for (const { table_name: name } of tables) {
    if (SKIP.has(name as string)) continue;
    data[name as string] = await sql.query(`SELECT * FROM "${name}"`);
  }
  return { app: "pixel-quests", exportedAt: new Date().toISOString(), tables: data };
}

/** Saves a backup to private storage and keeps only the newest few. */
export async function saveBackup(day: string) {
  const backup = await buildBackup();
  await put(`backups/${day}.json`, JSON.stringify(backup), {
    access: "private",
    contentType: "application/json",
    allowOverwrite: true,
    addRandomSuffix: false,
  });

  const { blobs } = await list({ prefix: "backups/" });
  const stale = blobs.sort((a, b) => b.pathname.localeCompare(a.pathname)).slice(KEEP_BACKUPS);
  if (stale.length) await del(stale.map((blob) => blob.pathname));
  return Object.values(backup.tables).reduce((sum, rows) => sum + rows.length, 0);
}
