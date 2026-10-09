import { describe, expect, it } from "vitest";
import { BADGES, qualifyingBadges, type BadgeStats } from "./badges";
import { levelFor, xpFor } from "./levels";

const none: BadgeStats = {
  defeats: 0,
  bosses: 0,
  perfectDays: 0,
  bestStreak: 0,
  items: 0,
  dexTypes: 0,
  photos: 0,
  treats: 0,
  shields: 0,
};

describe("levels", () => {
  it("starts at level 1 and moves up at the thresholds", () => {
    expect(levelFor(0)).toMatchObject({ level: 1, title: "Rookie", to: 30 });
    expect(levelFor(29).level).toBe(1);
    expect(levelFor(30)).toMatchObject({ level: 2, title: "Squire", from: 30, to: 80 });
  });

  it("tops out without a next level", () => {
    expect(levelFor(99999)).toMatchObject({ level: 10, to: null });
  });

  it("gives more XP for bosses", () => {
    expect(xpFor({ daily: 3, weekly: 1 })).toBe(60);
  });
});

describe("badges", () => {
  it("awards nothing at the start", () => {
    expect(qualifyingBadges(none)).toEqual([]);
  });

  it("awards each badge at its goal", () => {
    expect(qualifyingBadges({ ...none, defeats: 1 })).toEqual(["first-win"]);
    expect(qualifyingBadges({ ...none, defeats: 10 })).toEqual(["first-win", "slayer-10"]);
    expect(qualifyingBadges({ ...none, bestStreak: 7 })).toEqual(["fire-3", "fire-7"]);
  });

  it("has unique ids", () => {
    expect(new Set(BADGES.map((badge) => badge.id)).size).toBe(BADGES.length);
  });
});
