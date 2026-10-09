export type Cell = "done" | "miss" | "na" | "future" | "today" | "rest" | "off" | "shield";

export type WeekSummary = {
  monday: string;
  isCurrentWeek: boolean;
  days: string[];
  restDays: string[];
  dailies: { id: string; title: string; sprite: string; cells: Cell[]; doneDays: number }[];
  weeklies: { id: string; title: string; sprite: string; maxHp: number; hits: number; defeated: boolean }[];
  stats: { questsDone: number; perfectDays: number; coins: number; photos: number; streak: number };
  insight: string;
};
