import type { Goal } from "@/features/rewards/types";
import type { LevelInfo } from "@/features/trophies/data/levels";
import type { Equipped } from "@/features/wardrobe/data/items";
import type { Streak } from "./data/streak";

export type QuestRow = {
  id: string;
  title: string;
  monsterName: string;
  cadence: "daily" | "weekly";
  maxHp: number;
  reward: number;
  sprite: string;
  done: number;
  /** She tapped "I did it!" and is waiting for a parent. */
  claimed: boolean;
};

export type EvidenceRow = { id: number; questTitle: string; createdAt: string };

export type Board = {
  asOf: number;
  child: { id: number; name: string };
  /** Everyone who plays; the switcher only shows when there is more than one. */
  children: { id: number; name: string }[];
  coins: number;
  equipped: Equipped;
  streak: Streak;
  level: LevelInfo;
  goal: Goal | null;
  pendingRewards: number;
  quests: QuestRow[];
  evidence: EvidenceRow[];
};

export type ManagedQuest = {
  id: string;
  title: string;
  monsterName: string;
  cadence: "daily" | "weekly";
  maxHp: number;
  reward: number;
  sprite: string;
  active: boolean;
  /** Weekday bit mask, Monday = bit 0. */
  days: number;
  /** "HH:MM" Philippine time for a reminder on her tablet, or null. */
  remindAt: string | null;
};

export type StreakBonus = { streak: number; bonus: number };

/** What happened when a hit was logged, for the celebration. */
export type HitOutcome = {
  defeated: boolean;
  bonus: StreakBonus | null;
  badges: string[];
  levelUp: { level: number; title: string } | null;
};
