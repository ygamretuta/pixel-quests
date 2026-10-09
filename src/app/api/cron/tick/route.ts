import { connection } from "next/server";
import { sendDueReminders } from "@/features/quests/server/reminders";

// Called every 30 minutes by the GitHub Actions workflow in .github/workflows/tick.yml
// (Vercel's free cron is limited to once a day).
export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  await connection();
  return Response.json({ reminders: await sendDueReminders(Date.now()) });
}
