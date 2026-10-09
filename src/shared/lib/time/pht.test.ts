import { describe, expect, it } from "vitest";
import { formatCountdown, mondayOf, nextRespawnAt, periodKey, shiftDay, weekDays } from "./pht";

const pht = (iso: string) => Date.parse(`${iso}+08:00`);

describe("Philippine time periods", () => {
  it("rolls the day over at 12:00 AM PHT, not UTC", () => {
    expect(periodKey("daily", pht("2026-10-08T23:59:00"))).toBe("2026-10-08");
    expect(periodKey("daily", pht("2026-10-09T00:00:00"))).toBe("2026-10-09");
    // 4 PM UTC is already midnight in the Philippines
    expect(periodKey("daily", Date.parse("2026-10-08T16:00:00Z"))).toBe("2026-10-09");
  });

  it("starts the week on Monday", () => {
    expect(periodKey("weekly", pht("2026-10-11T23:59:00"))).toBe("2026-10-05"); // Sunday
    expect(periodKey("weekly", pht("2026-10-12T00:00:00"))).toBe("2026-10-12"); // Monday
  });

  it("knows when the next respawn is", () => {
    const thursday = pht("2026-10-08T15:00:00");
    expect(nextRespawnAt("daily", thursday)).toBe(pht("2026-10-09T00:00:00"));
    expect(nextRespawnAt("weekly", thursday)).toBe(pht("2026-10-12T00:00:00"));
  });

  it("moves and groups day keys", () => {
    expect(shiftDay("2026-10-31", 1)).toBe("2026-11-01");
    expect(shiftDay("2026-03-01", -1)).toBe("2026-02-28");
    expect(mondayOf("2026-10-11")).toBe("2026-10-05");
    expect(weekDays("2026-10-05")).toEqual([
      "2026-10-05",
      "2026-10-06",
      "2026-10-07",
      "2026-10-08",
      "2026-10-09",
      "2026-10-10",
      "2026-10-11",
    ]);
  });

  it("formats countdowns", () => {
    expect(formatCountdown(30 * 60_000)).toBe("30m");
    expect(formatCountdown(5 * 3_600_000 + 26 * 60_000)).toBe("5h 26m");
    expect(formatCountdown(2 * 86_400_000 + 15 * 3_600_000)).toBe("2d 15h");
    expect(formatCountdown(0)).toBe("1m");
  });
});
