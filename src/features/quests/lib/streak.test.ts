import { describe, expect, it } from "vitest";
import { maskFromDays, EVERY_DAY } from "@/shared/lib/time/schedule";
import { computeStreak, type StreakInput, type StreakQuest } from "./streak";

// Thursday 8 Oct 2026. Earlier days: Wed 7, Tue 6, Mon 5, Sun 4.
const TODAY = "2026-10-08";

const teeth: StreakQuest = { id: "teeth", maxHp: 2, created: "2026-09-01", days: EVERY_DAY };
const reading: StreakQuest = { id: "reading", maxHp: 1, created: "2026-09-01", days: EVERY_DAY };

function run(overrides: Partial<StreakInput> & { done?: string[] }) {
  const { done = [], ...rest } = overrides;
  const hits = new Map<string, number>();
  for (const entry of done) {
    // "teeth|2026-10-07" counts as fully done; give every quest enough hits
    hits.set(entry, 5);
  }
  return computeStreak({
    today: TODAY,
    quests: [teeth, reading],
    hits,
    restDays: new Set(),
    shieldPurchases: [],
    lookbackDays: 30,
    ...rest,
  });
}

const both = (day: string) => [`teeth|${day}`, `reading|${day}`];

describe("computeStreak", () => {
  it("counts consecutive perfect days, with today counting once it is perfect", () => {
    const result = run({ done: [...both("2026-10-06"), ...both("2026-10-07")] });
    expect(result).toMatchObject({ current: 2, todayPerfect: false });

    const withToday = run({ done: [...both("2026-10-06"), ...both("2026-10-07"), ...both(TODAY)] });
    expect(withToday).toMatchObject({ current: 3, todayPerfect: true });
  });

  it("does not let an unfinished today break the streak", () => {
    const result = run({ done: [...both("2026-10-07")], });
    expect(result.current).toBe(1);
  });

  it("resets on a missed day", () => {
    const result = run({ done: [...both("2026-10-05"), ...both("2026-10-07")] }); // Tue 6 missed
    expect(result.current).toBe(1);
  });

  it("needs every scheduled quest, not just one", () => {
    const result = run({ done: ["teeth|2026-10-07"] });
    expect(result.current).toBe(0);
  });

  it("keeps the streak over a rest day", () => {
    const result = run({
      done: [...both("2026-10-05"), ...both("2026-10-07")],
      restDays: new Set(["2026-10-06"]),
    });
    expect(result.current).toBe(2);
  });

  it("ignores days a quest is not scheduled", () => {
    // Homework is only Mon-Fri; Sat 3 and Sun 4 do not need it.
    const homework: StreakQuest = { id: "homework", maxHp: 1, created: "2026-09-01", days: maskFromDays([0, 1, 2, 3, 4]) };
    const result = computeStreak({
      today: TODAY,
      quests: [homework],
      hits: new Map([
        ["homework|2026-10-02", 1], // Fri
        ["homework|2026-10-05", 1], // Mon
      ]),
      restDays: new Set(),
      shieldPurchases: [],
      lookbackDays: 10,
    });
    // Fri, (Sat/Sun off), Mon done; Tue 6 and Wed 7 missed, so the run restarts at 0.
    expect(result.current).toBe(0);
    const allDone = computeStreak({
      today: TODAY,
      quests: [homework],
      hits: new Map(["2026-10-02", "2026-10-05", "2026-10-06", "2026-10-07"].map((day) => [`homework|${day}`, 1])),
      restDays: new Set(),
      shieldPurchases: [],
      lookbackDays: 10,
    });
    expect(allDone.current).toBe(4); // the weekend did not break it
  });

  it("does not count days before a quest existed", () => {
    const late: StreakQuest = { ...reading, created: "2026-10-07" };
    const result = computeStreak({
      today: TODAY,
      quests: [late],
      hits: new Map([["reading|2026-10-07", 1]]),
      restDays: new Set(),
      shieldPurchases: [],
      lookbackDays: 30,
    });
    expect(result.current).toBe(1);
  });

  describe("shields", () => {
    // These quests start on Mon 5 Oct, so the days before are not "missed".
    const recent = [
      { ...teeth, created: "2026-10-05" },
      { ...reading, created: "2026-10-05" },
    ];

    it("saves one missed day and is used up", () => {
      const result = run({
        quests: recent,
        done: [...both("2026-10-05"), ...both("2026-10-07")], // Tue 6 missed
        shieldPurchases: ["2026-10-01"],
      });
      expect(result).toMatchObject({ current: 2, shields: 0, shieldDays: ["2026-10-06"] });
    });

    it("does not spend a shield when nothing was missed", () => {
      const result = run({
        quests: recent,
        done: [...both("2026-10-05"), ...both("2026-10-06"), ...both("2026-10-07")],
        shieldPurchases: ["2026-10-01"],
      });
      expect(result).toMatchObject({ current: 3, shields: 1, shieldDays: [] });
    });

    it("cannot save a day from before it was bought", () => {
      const result = run({
        quests: recent,
        done: [...both("2026-10-05"), ...both("2026-10-07")],
        shieldPurchases: ["2026-10-07"], // bought the day after the miss
      });
      expect(result.current).toBe(1);
    });
  });
});
