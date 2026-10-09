export type BadgeStats = {
  defeats: number;
  bosses: number;
  perfectDays: number;
  bestStreak: number;
  items: number;
  dexTypes: number;
  photos: number;
  treats: number;
  shields: number;
};

export type Badge = {
  id: string;
  title: string;
  hint: string;
  /** Medal ribbon color. */
  color: string;
  earned: (stats: BadgeStats) => boolean;
};

export const BADGES: Badge[] = [
  { id: "first-win", title: "First Victory", hint: "Defeat your first monster", color: "#5be37d", earned: (s) => s.defeats >= 1 },
  { id: "slayer-10", title: "Monster Slayer", hint: "Defeat 10 monsters", color: "#4fc3f7", earned: (s) => s.defeats >= 10 },
  { id: "hunter-50", title: "Monster Hunter", hint: "Defeat 50 monsters", color: "#c45be3", earned: (s) => s.defeats >= 50 },
  { id: "legend-100", title: "Legend", hint: "Defeat 100 monsters", color: "#ffd34d", earned: (s) => s.defeats >= 100 },
  { id: "boss-beater", title: "Boss Beater", hint: "Defeat a weekly boss", color: "#ff7a59", earned: (s) => s.bosses >= 1 },
  { id: "perfect-day", title: "Perfect Day", hint: "Finish every daily quest in one day", color: "#5be3e3", earned: (s) => s.perfectDays >= 1 },
  { id: "fire-3", title: "On Fire", hint: "3 perfect days in a row", color: "#ff7a59", earned: (s) => s.bestStreak >= 3 },
  { id: "fire-7", title: "Unstoppable", hint: "7 perfect days in a row", color: "#ff4d6d", earned: (s) => s.bestStreak >= 7 },
  { id: "fire-30", title: "Marathon Hero", hint: "30 perfect days in a row", color: "#ffd34d", earned: (s) => s.bestStreak >= 30 },
  { id: "shopper", title: "First Purchase", hint: "Buy something from the merchant", color: "#4fc3f7", earned: (s) => s.items >= 1 },
  { id: "fashion", title: "Fashionista", hint: "Own 8 pieces of gear", color: "#ff9bb0", earned: (s) => s.items >= 8 },
  { id: "collector", title: "Monster Collector", hint: "Defeat 4 kinds of monster", color: "#c45be3", earned: (s) => s.dexTypes >= 4 },
  { id: "proof", title: "Picture Perfect", hint: "Send 10 proof photos", color: "#5be37d", earned: (s) => s.photos >= 10 },
  { id: "treat", title: "Treat Earned", hint: "Earn a real-life reward", color: "#ffd34d", earned: (s) => s.treats >= 1 },
  { id: "shield", title: "Safe and Sound", hint: "Buy a streak shield", color: "#4fc3f7", earned: (s) => s.shields >= 1 },
];

export const BADGES_BY_ID = Object.fromEntries(BADGES.map((badge) => [badge.id, badge]));

/** Ids of every badge these stats qualify for. */
export function qualifyingBadges(stats: BadgeStats) {
  return BADGES.filter((badge) => badge.earned(stats)).map((badge) => badge.id);
}
