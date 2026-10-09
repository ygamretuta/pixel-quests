import type { Sprite } from "@/shared/ui/PixelSprite/PixelSprite";
import { mirror } from "./mirror";

export const coin: Sprite = {
  rows: [".oooo.", "oyyyyo", "oyHyyo", "oyyyyo", "oyyyyo", ".oooo."],
  palette: { o: "#b8860b", y: "#ffd34d", H: "#fff3b0" },
};

export const pencil: Sprite = {
  rows: ["....oo", "...opo", "..oyoo", ".oyoo.", "oyoo..", "opo...", "oo...."],
  palette: { o: "#1b1b3a", p: "#ff7a9c", y: "#ffd34d" },
};

export const padlock: Sprite = {
  rows: [
    "..oooo..",
    ".o....o.",
    ".o....o.",
    "oooooooo",
    "oyyyyyyo",
    "oyyoooyo",
    "oyyyoyyo",
    "oyyyyyyo",
    "oooooooo",
  ],
  palette: { o: "#1b1b3a", y: "#ffd34d" },
};

export const flame: Sprite = {
  rows: mirror(["...r", "..rr", ".rrr", ".rry", "rrry", "rryy", "rryy", "rrry", ".rrr"]),
  palette: { r: "#ff7a59", y: "#ffd34d" },
};

export const moon: Sprite = {
  rows: [
    "..............",
    "....ooo.......",
    "..ooyyo.......",
    ".oyyyo........",
    ".oyyHo........",
    ".oyHyo........",
    "oyHyyyo.......",
    "oyyyyyyo......",
    ".oyyyyyyo...o.",
    ".oyyyyyyyoooo.",
    ".oyyyyyyyyyo..",
    "..ooyyyyyyo...",
    "....oooooo....",
    "..............",
  ],
  palette: { o: "#b8860b", y: "#ffd34d", H: "#fff3b0" },
};
