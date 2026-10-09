import { mirror } from "@/shared/lib/pixel/mirror";
import type { Sprite } from "@/shared/ui/PixelSprite/PixelSprite";
import { gremlin, slime } from "@/features/quests/data/sprites";

const base = { k: "#1b1b3a", w: "#ffffff" };

const ghost: Sprite = {
  rows: mirror([
    "...ooo",
    "..oggg",
    ".ogggg",
    ".ogggg",
    ".ogkgg",
    ".ogkgg",
    ".ogggg",
    ".oggkk",
    ".ogggg",
    ".og.og",
  ]),
  palette: { ...base, o: "#8a8fb8", g: "#e8ebff" },
};

const mushroom: Sprite = {
  rows: mirror([
    "..oooo",
    ".orrrr",
    "orwrrr",
    "orrrrw",
    "orrrrr",
    "oooooo",
    "..osss",
    "..okss",
    "..osss",
    "...ooo",
  ]),
  palette: { ...base, o: "#5a2a2a", r: "#e0405a", s: "#f6e3c2" },
};

const bat: Sprite = {
  rows: mirror([
    "....oo",
    "o..ogg",
    "oo.org",
    "ogoggg",
    "oggggg",
    ".ogogg",
    "..o.og",
    "....oo",
  ]),
  palette: { ...base, o: "#3b2a6b", g: "#7a5cc8", r: "#ff4d6d" },
};

const robot: Sprite = {
  rows: mirror([
    ".....o",
    ".....y",
    "..oooo",
    "..ogll",
    "..ogeg",
    "..ogll",
    "..ooog",
    ".ooggg",
    ".ogggg",
    ".oo..o",
  ]),
  palette: { ...base, o: "#2a3a4a", g: "#9fb3c8", l: "#cfe0f0", e: "#ffd34d", y: "#ff4d6d" },
};

export const MONSTERS = [
  { key: "slime", label: "Slime", sprite: slime },
  { key: "gremlin", label: "Gremlin", sprite: gremlin },
  { key: "ghost", label: "Ghost", sprite: ghost },
  { key: "mushroom", label: "Mushroom", sprite: mushroom },
  { key: "bat", label: "Bat", sprite: bat },
  { key: "robot", label: "Robot", sprite: robot },
];

export const spritesByKey: Record<string, Sprite> = Object.fromEntries(
  MONSTERS.map((monster) => [monster.key, monster.sprite]),
);
