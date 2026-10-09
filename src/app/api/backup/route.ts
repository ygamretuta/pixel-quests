import { buildBackup } from "@/features/backup/server/backup";
import { isParent } from "@/features/parent/server/auth";

export async function GET() {
  if (!(await isParent())) return new Response("Forbidden", { status: 403 });

  const backup = await buildBackup();
  const day = backup.exportedAt.slice(0, 10);
  return new Response(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="pixel-quests-backup-${day}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
