import type { Equipped } from "@/features/wardrobe/items";
import type { Streak } from "./streak";

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
