import "server-only";
import { connection } from "next/server";
import { mondayOf, periodKey, weekDays } from "@/shared/lib/time/pht";
import { isScheduled } from "@/shared/lib/time/schedule";
import { getStreak } from "@/features/quests/server/streak";
import { sql } from "@/shared/server/db";
import type { Cell, WeekSummary } from "@/features/summary/types";

export async function getWeekSummary(childId: number, requestedMonday: string | null): Promise<WeekSummary> {
  await connection();
  const now = Date.now();
  const today = periodKey("daily", now);
  const currentMonday = mondayOf(today);
  const monday = requestedMonday ? mondayOf(requestedMonday) : currentMonday;
  const days = weekDays(monday);

  const [quests, hitRows, bonusRows, streak, restRows] = await Promise.all([
    sql`
      SELECT id, title, cadence, max_hp AS "maxHp", reward, sprite, active, days,
             (created_at AT TIME ZONE 'Asia/Manila')::date::text AS created
      FROM quests WHERE child_id = ${childId} ORDER BY position, id`,
    sql`
      SELECT h.quest_id AS "questId", h.period, count(*)::int AS n, count(h.evidence_path)::int AS proofs
      FROM hits h JOIN quests q ON q.id = h.quest_id
      WHERE q.child_id = ${childId} AND h.period = ANY(${days})
      GROUP BY h.quest_id, h.period`,
    sql`SELECT coalesce(sum(bonus), 0)::int AS bonus FROM streak_bonuses WHERE child_id = ${childId} AND day = ANY(${days})`,
    getStreak(childId, now),
    sql`SELECT day FROM rest_days WHERE child_id = ${childId} AND day = ANY(${days})`,
  ]);
  const restDays = restRows.map((row) => row.day as string);

  const hitMap = new Map(hitRows.map((row) => [`${row.questId}|${row.period}`, row]));
  const hitsFor = (id: string, period: string) => (hitMap.get(`${id}|${period}`)?.n as number | undefined) ?? 0;

  // Quests that were removed still count if they had activity this week.
  const relevant = quests.filter(
    (quest) => quest.active || hitRows.some((row) => row.questId === quest.id),
  );

  const dailyQuests = relevant.filter((quest) => quest.cadence === "daily");
  const dailies = dailyQuests.map((quest) => {
    const cells: Cell[] = days.map((day) => {
      if (day > today) return "future";
      if (quest.created > day) return "na";
      if (!isScheduled(quest.days as number, day)) return "off";
      if (hitsFor(quest.id, day) >= quest.maxHp) return "done";
      if (restDays.includes(day)) return "rest";
      if (streak.shieldDays.includes(day)) return "shield";
      return day === today ? "today" : "miss";
    });
    return {
      id: quest.id as string,
      title: quest.title as string,
      sprite: quest.sprite as string,
      cells,
      doneDays: cells.filter((cell) => cell === "done").length,
    };
  });

  const weeklies = relevant
    .filter((quest) => quest.cadence === "weekly")
    .map((quest) => {
      const hits = hitsFor(quest.id, monday);
      return {
        id: quest.id as string,
        title: quest.title as string,
        sprite: quest.sprite as string,
        maxHp: quest.maxHp as number,
        hits: Math.min(hits, quest.maxHp as number),
        defeated: hits >= quest.maxHp,
      };
    });

  const perfectDays = days.filter((day, index) => {
    const cells = dailies
      .map((daily) => daily.cells[index])
      .filter((cell) => cell !== "off" && cell !== "na" && cell !== "future");
    return cells.length > 0 && cells.every((cell) => cell === "done");
  }).length;

  const coinsFromQuests = relevant.reduce((sum, quest) => {
    if (quest.cadence === "weekly") {
      return sum + (hitsFor(quest.id, monday) >= quest.maxHp ? (quest.reward as number) : 0);
    }
    const doneDays = days.filter((day) => day <= today && hitsFor(quest.id, day) >= quest.maxHp).length;
    return sum + doneDays * (quest.reward as number);
  }, 0);

  const questsDone =
    dailies.reduce((sum, daily) => sum + daily.doneDays, 0) + weeklies.filter((w) => w.defeated).length;
  const photos = hitRows.reduce((sum, row) => sum + (row.proofs as number), 0);

  return {
    monday,
    isCurrentWeek: monday === currentMonday,
    days,
    restDays,
    dailies,
    weeklies,
    stats: {
      questsDone,
      perfectDays,
      coins: coinsFromQuests + (bonusRows[0]?.bonus ?? 0),
      photos,
      streak: streak.current,
    },
    insight: buildInsight(dailies, weeklies, perfectDays),
  };
}

function buildInsight(
  dailies: WeekSummary["dailies"],
  weeklies: WeekSummary["weeklies"],
  perfectDays: number,
) {
  const parts: string[] = [];
  if (perfectDays >= 5) parts.push("Amazing week!");
  else if (perfectDays >= 2) parts.push("Good progress this week.");
  else parts.push("A fresh week is a fresh start.");

  const played = dailies.filter((daily) => daily.cells.some((cell) => cell === "done" || cell === "miss"));
  const misses = played
    .map((daily) => ({ title: daily.title, missed: daily.cells.filter((cell) => cell === "miss").length }))
    .filter((entry) => entry.missed > 0)
    .sort((a, b) => b.missed - a.missed);
  if (misses[0]) parts.push(
      `"${misses[0].title}" was missed most (${misses[0].missed} ${misses[0].missed === 1 ? "day" : "days"}).`,
    );

  const beaten = weeklies.filter((weekly) => weekly.defeated);
  if (beaten.length) parts.push(`Boss defeated: ${beaten.map((weekly) => weekly.title).join(", ")}.`);
  return parts.join(" ");
}
