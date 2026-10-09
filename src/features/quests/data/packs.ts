import { EVERY_DAY } from "@/shared/lib/time/schedule";

export type PackQuest = {
  title: string;
  cadence: "daily" | "weekly";
  maxHp: number;
  reward: number;
  sprite: string;
  monsterName: string;
  days?: number;
  remindAt?: string;
};

export type QuestPack = { id: string; title: string; blurb: string; quests: PackQuest[] };

const WEEKDAYS = 0b0011111;
const WEEKEND = 0b1100000;

/** Ready-made sets of quests to add in one tap. */
export const QUEST_PACKS: QuestPack[] = [
  {
    id: "morning",
    title: "Morning routine",
    blurb: "Get ready for the day",
    quests: [
      { title: "Brush teeth", cadence: "daily", maxHp: 1, reward: 5, sprite: "slime", monsterName: "Gloop", remindAt: "07:00" },
      { title: "Get dressed", cadence: "daily", maxHp: 1, reward: 5, sprite: "mushroom", monsterName: "Shroomy" },
      { title: "Make the bed", cadence: "daily", maxHp: 1, reward: 5, sprite: "ghost", monsterName: "Boo" },
    ],
  },
  {
    id: "evening",
    title: "Evening routine",
    blurb: "Wind down for bed",
    quests: [
      { title: "Brush teeth", cadence: "daily", maxHp: 1, reward: 5, sprite: "slime", monsterName: "Gloop", remindAt: "19:30" },
      { title: "Put on pajamas", cadence: "daily", maxHp: 1, reward: 5, sprite: "bat", monsterName: "Batty" },
      { title: "Read a story", cadence: "daily", maxHp: 1, reward: 5, sprite: "robot", monsterName: "Bleep" },
    ],
  },
  {
    id: "school",
    title: "School days",
    blurb: "Monday to Friday",
    quests: [
      { title: "Do homework", cadence: "daily", maxHp: 2, reward: 10, sprite: "gremlin", monsterName: "Grumbo", days: WEEKDAYS },
      { title: "Pack school bag", cadence: "daily", maxHp: 1, reward: 5, sprite: "robot", monsterName: "Bleep", days: WEEKDAYS },
    ],
  },
  {
    id: "weekend",
    title: "Weekend helpers",
    blurb: "Saturday and Sunday, plus a weekly boss",
    quests: [
      { title: "Help with chores", cadence: "daily", maxHp: 1, reward: 10, sprite: "mushroom", monsterName: "Shroomy", days: WEEKEND },
      { title: "Tidy room boss", cadence: "weekly", maxHp: 5, reward: 30, sprite: "gremlin", monsterName: "Grumbo", days: EVERY_DAY },
    ],
  },
];
