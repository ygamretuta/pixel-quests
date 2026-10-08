import { gremlin, slime, type Sprite } from "./sprites";

export type Quest = {
  id: string;
  title: string;
  monsterName: string;
  cadence: "daily" | "weekly";
  maxHp: number;
  reward: number;
  sprite: Sprite;
};

export const demoQuests: Quest[] = [
  { id: "teeth", title: "Brush Teeth", monsterName: "Gloop", cadence: "daily", maxHp: 2, reward: 5, sprite: slime },
  { id: "reading", title: "Read a Story", monsterName: "Blip", cadence: "daily", maxHp: 1, reward: 5, sprite: slime },
  { id: "tidy", title: "Tidy Room Boss", monsterName: "Grumbo", cadence: "weekly", maxHp: 5, reward: 25, sprite: gremlin },
];
