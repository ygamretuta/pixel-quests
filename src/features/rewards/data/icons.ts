import { mirror } from "@/shared/lib/pixel/mirror";
import type { Sprite } from "@/shared/ui/PixelSprite/PixelSprite";

export const REWARD_ICONS: { key: string; label: string; sprite: Sprite }[] = [
  {
    key: "gift",
    label: "Gift",
    sprite: {
      rows: mirror(["..rr", ".rrr", "llll", "bbbr", "bbbr", "bbbr", "bbbr", "llll"]),
      palette: { b: "#ff7a9c", l: "#c2467a", r: "#ffd34d" },
    },
  },
  {
    key: "icecream",
    label: "Ice cream",
    sprite: {
      rows: mirror(["..pp", ".ppp", "ppwp", "pppp", "yyyy", ".yyy", "..yy", "...y"]),
      palette: { p: "#ff9bb0", w: "#ffd1e3", y: "#e0b050" },
    },
  },
  {
    key: "popcorn",
    label: "Movie",
    sprite: {
      rows: mirror(["..wy", ".wyw", "wywy", "rsrs", "rsrs", "rsrs", ".rsr", ".rsr"]),
      palette: { w: "#fff6c9", y: "#ffd34d", r: "#e0405a", s: "#ffffff" },
    },
  },
  {
    key: "star",
    label: "Star",
    sprite: {
      rows: mirror(["...y", "..yy", "yyyy", ".yyL", "..yy", ".yyy", ".yy.", "yy.."]),
      palette: { y: "#ffd34d", L: "#fff3b0" },
    },
  },
  {
    key: "ball",
    label: "Play",
    sprite: {
      rows: mirror(["..oo", ".oww", "owkw", "owww", "owww", "owkw", ".oww", "..oo"]),
      palette: { o: "#8a8fb8", w: "#ffffff", k: "#444466" },
    },
  },
  {
    key: "heart",
    label: "Heart",
    sprite: {
      rows: mirror([".rr.", "rLrr", "rrrr", "rrrr", ".rrr", "..rr", "...r", "...."]),
      palette: { r: "#ff4d6d", L: "#ffb3c0" },
    },
  },
];

export const ICONS_BY_KEY: Record<string, Sprite> = Object.fromEntries(
  REWARD_ICONS.map((icon) => [icon.key, icon.sprite]),
);
