/** XP she earns for each monster defeated. */
export const XP_PER_DEFEAT = { daily: 10, weekly: 30 } as const;

const LEVELS = [
  { xp: 0, title: "Rookie" },
  { xp: 30, title: "Squire" },
  { xp: 80, title: "Page" },
  { xp: 150, title: "Knight" },
  { xp: 250, title: "Captain" },
  { xp: 400, title: "Champion" },
  { xp: 600, title: "Hero" },
  { xp: 900, title: "Paladin" },
  { xp: 1300, title: "Legend" },
  { xp: 1800, title: "Mythic" },
];

export type LevelInfo = {
  level: number;
  title: string;
  xp: number;
  /** XP at the start of this level and at the start of the next (null at the top). */
  from: number;
  to: number | null;
};

export function levelFor(xp: number): LevelInfo {
  let index = 0;
  while (index + 1 < LEVELS.length && xp >= LEVELS[index + 1].xp) index++;
  return {
    level: index + 1,
    title: LEVELS[index].title,
    xp,
    from: LEVELS[index].xp,
    to: LEVELS[index + 1]?.xp ?? null,
  };
}

export function xpFor(defeats: { daily: number; weekly: number }) {
  return defeats.daily * XP_PER_DEFEAT.daily + defeats.weekly * XP_PER_DEFEAT.weekly;
}
