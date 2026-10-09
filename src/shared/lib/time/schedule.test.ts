import { describe, expect, it } from "vitest";
import { describeDays, daysFromMask, EVERY_DAY, isScheduled, maskFromDays, weekdayIndex } from "./schedule";

describe("weekday schedules", () => {
  it("numbers Monday as 0 and Sunday as 6", () => {
    expect(weekdayIndex("2026-10-05")).toBe(0); // Monday
    expect(weekdayIndex("2026-10-11")).toBe(6); // Sunday
  });

  it("checks whether a day is on", () => {
    const weekdays = maskFromDays([0, 1, 2, 3, 4]);
    expect(isScheduled(weekdays, "2026-10-09")).toBe(true); // Friday
    expect(isScheduled(weekdays, "2026-10-10")).toBe(false); // Saturday
    expect(isScheduled(EVERY_DAY, "2026-10-10")).toBe(true);
  });

  it("converts between days and masks", () => {
    expect(daysFromMask(maskFromDays([1, 3]))).toEqual([1, 3]);
  });

  it("describes a schedule in words", () => {
    expect(describeDays(EVERY_DAY)).toBe("every day");
    expect(describeDays(0b0011111)).toBe("weekdays");
    expect(describeDays(0b1100000)).toBe("weekends");
    expect(describeDays(maskFromDays([1, 3]))).toBe("Tue, Thu");
  });
});
