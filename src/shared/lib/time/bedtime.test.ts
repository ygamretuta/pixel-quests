import { describe, expect, it } from "vitest";
import { bedtimeState, formatClock, isClock, type BedtimeSettings } from "./bedtime";

const pht = (iso: string) => Date.parse(`${iso}+08:00`);
const night: BedtimeSettings = { enabled: true, bedtime: "20:00", wake: "06:00" };

describe("bedtime", () => {
  it("is awake in the daytime and tells when bedtime starts", () => {
    const state = bedtimeState(pht("2026-10-09T15:00:00"), night);
    expect(state.asleep).toBe(false);
    expect(state.nextChange).toBe(pht("2026-10-09T20:00:00"));
  });

  it("is asleep from bedtime, through midnight, until wake-up", () => {
    for (const time of ["2026-10-09T20:00:00", "2026-10-09T23:30:00", "2026-10-10T00:30:00", "2026-10-10T05:59:00"]) {
      expect(bedtimeState(pht(time), night).asleep).toBe(true);
    }
    const morning = bedtimeState(pht("2026-10-10T06:00:00"), night);
    expect(morning.asleep).toBe(false);
  });

  it("points at wake-up while asleep", () => {
    expect(bedtimeState(pht("2026-10-09T23:30:00"), night).nextChange).toBe(pht("2026-10-10T06:00:00"));
    expect(bedtimeState(pht("2026-10-10T00:30:00"), night).nextChange).toBe(pht("2026-10-10T06:00:00"));
  });

  it("supports a same-day window such as a nap", () => {
    const nap = { enabled: true, bedtime: "13:00", wake: "15:00" };
    expect(bedtimeState(pht("2026-10-09T14:00:00"), nap).asleep).toBe(true);
    expect(bedtimeState(pht("2026-10-09T16:00:00"), nap).asleep).toBe(false);
  });

  it("never locks when switched off or when both times match", () => {
    expect(bedtimeState(pht("2026-10-09T23:00:00"), { ...night, enabled: false })).toEqual({
      asleep: false,
      nextChange: null,
    });
    expect(bedtimeState(pht("2026-10-09T23:00:00"), { ...night, wake: "20:00" }).asleep).toBe(false);
  });

  it("validates and formats clock times", () => {
    expect(isClock("08:05")).toBe(true);
    expect(isClock("24:00")).toBe(false);
    expect(isClock("8:05")).toBe(false);
    expect(formatClock("20:00")).toBe("8:00 PM");
    expect(formatClock("00:30")).toBe("12:30 AM");
    expect(formatClock("12:00")).toBe("12:00 PM");
  });
});
