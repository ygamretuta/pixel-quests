import { connection } from "next/server";
import { notifyParents } from "@/features/notifications/server/push";
import { formatDay } from "@/features/summary/lib/dates";
import { getWeekSummary } from "@/features/summary/server/summary";
import { listChildren } from "@/shared/server/child";

// Runs Sunday evening (see vercel.json) and pushes each child's week to the parents' phones.
export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  await connection();

  const children = await listChildren();
  let sent = 0;
  for (const child of children) {
    const { stats, days } = await getWeekSummary(child.id, null);
    const streak = `${stats.streak} ${stats.streak === 1 ? "day" : "days"}`;
    const who = children.length > 1 ? `${child.name}'s week` : "Her week";

    sent += await notifyParents({
      title: `${who}: ${formatDay(days[0])} - ${formatDay(days[6])}`,
      body: `${stats.questsDone} quests done, ${stats.perfectDays} perfect days, ${stats.coins} coins. Streak: ${streak}.`,
      url: "/summary",
      tag: `weekly-summary-${child.id}`,
    });
  }

  return Response.json({ sent, children: children.length });
}
