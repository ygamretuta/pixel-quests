import "server-only";
import { getBedtimeFor } from "@/features/bedtime/server/bedtime";
import { notifyChild } from "@/features/notifications/server/push";
import { periodKey, startOfPhtDay } from "@/shared/lib/time/pht";
import { isScheduled } from "@/shared/lib/time/schedule";
import { listChildren } from "@/shared/server/child";
import { sql } from "@/shared/server/db";

/** A reminder goes out in the hour after its time, because the scheduler only runs every half hour. */
const WINDOW_MINUTES = 60;

function minutesOf(clock: string) {
  const [hours, minutes] = clock.split(":").map(Number);
  return hours * 60 + minutes;
}

/** Sends the quest reminders that are due right now. Safe to call often: each one goes out once a day. */
export async function sendDueReminders(now: number) {
  const today = periodKey("daily", now);
  const minuteOfDay = Math.floor((now - startOfPhtDay(now)) / 60_000);
  let sent = 0;

  for (const child of await listChildren()) {
    const { asleep } = await getBedtimeFor(child.id, now);
    if (asleep) continue;
    const [resting] = await sql`SELECT 1 FROM rest_days WHERE child_id = ${child.id} AND day = ${today}`;
    if (resting) continue;

    const quests = await sql`
      SELECT q.id, q.title, q.remind_at AS "remindAt", q.max_hp AS "maxHp", q.days,
             (SELECT count(*)::int FROM hits h WHERE h.quest_id = q.id AND h.period = ${today}) AS done
      FROM quests q
      WHERE q.child_id = ${child.id} AND q.active AND q.cadence = 'daily' AND q.remind_at IS NOT NULL`;

    for (const quest of quests) {
      const at = minutesOf(quest.remindAt as string);
      const due =
        isScheduled(quest.days as number, today) &&
        (quest.done as number) < (quest.maxHp as number) &&
        at <= minuteOfDay &&
        minuteOfDay < at + WINDOW_MINUTES;
      if (!due) continue;

      const claimed = await sql`
        INSERT INTO reminders_sent (quest_id, day) VALUES (${quest.id}, ${today})
        ON CONFLICT DO NOTHING RETURNING quest_id`;
      if (!claimed.length) continue;

      sent += await notifyChild(child.id, {
        title: "Quest time!",
        body: quest.title as string,
        url: "/",
        tag: `quest-${quest.id}`,
      });
    }
  }
  return sent;
}
