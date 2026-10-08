import type { Equipped } from "@/features/wardrobe/items";

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
  quests: QuestRow[];
  evidence: EvidenceRow[];
};
