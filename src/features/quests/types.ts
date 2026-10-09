import type { Equipped } from "@/features/wardrobe/data/items";
import type { Streak } from "@/features/quests/data/streak";

export type QuestRow = {
  id: string;
  title: string;
  monsterName: string;
  cadence: "daily" | "weekly";
  maxHp: number;
  reward: number;
  sprite: string;
  done: number;
};

export type EvidenceRow = { id: number; questTitle: string; createdAt: string };

export type Board = {
  asOf: number;
  coins: number;
  equipped: Equipped;
  streak: Streak;
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
};

export type StreakBonus = { streak: number; bonus: number };
