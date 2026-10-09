import { connection } from "next/server";
import { notifyParents } from "@/features/notifications/server/push";
import { getWeekSummary } from "@/features/summary/server/summary";
import { formatDay } from "@/features/summary/lib/dates";

// Runs Sunday evening (see vercel.json) and pushes the week's numbers to the parents' phones.
export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  await connection();

  const summary = await getWeekSummary(null);
  const { stats, days } = summary;
  const streak = `${stats.streak} ${stats.streak === 1 ? "day" : "days"}`;

  const sent = await notifyParents({
    title: `Her week: ${formatDay(days[0])} - ${formatDay(days[6])}`,
    body: `${stats.questsDone} quests done, ${stats.perfectDays} perfect days, ${stats.coins} coins. Streak: ${streak}.`,
    url: "/summary",
    tag: "weekly-summary",
  });

  return Response.json({ sent, questsDone: stats.questsDone });
}
