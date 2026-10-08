import type { Sprite } from "@/shared/pixel/PixelSprite";

export type { Sprite };

const base = { k: "#1b1b3a", w: "#ffffff" };

export const slime: Sprite = {
  rows: [
    "....oooo....",
    "..ooggggoo..",
    ".oggHgggggo.",
    "oggggggggggo",
    "ogwkgggwkggo",
    "ogwkgggwkggo",
    "oggggggggggo",
    "ogggkkkkgggo",
    ".oggggggggo.",
    "..oooooooo..",
  ],
  palette: { ...base, o: "#1f7a3a", g: "#5be37d", H: "#b8f7c5" },
};

export const gremlin: Sprite = {
  rows: [
    "o..........o",
    "oo........oo",
    ".oggggggggo.",
    "oggggggggggo",
    "ogwwgggwwggo",
    "ogwkgggwkggo",
    "oggggggggggo",
    "ogwgwgwgwggo",
    ".oggggggggo.",
    "..oo....oo..",
  ],
  palette: { ...base, o: "#6b1d5c", g: "#c45be3", H: "#e8b3f7" },
};

export const hero: Sprite = {
  rows: [
    "...oooooo...",
    "..osssssso..",
    "..osssssso..",
    "..oFFFFFFo..",
    "..oFkFFkFo..",
    "..oFFFFFFo..",
    "...oooooo...",
    ".obbbbbbbbo.",
    "obbbbbbbbbbo",
    "obbbbbbbbbbo",
    ".obbbooobbo.",
    "..oo....oo..",
  ],
  palette: { ...base, o: "#0b3d91", s: "#cfd8dc", F: "#ffcc99", b: "#3f7cff" },
};

export const coin: Sprite = {
  rows: [".oooo.", "oyyyyo", "oyHyyo", "oyyyyo", "oyyyyo", ".oooo."],
  palette: { o: "#b8860b", y: "#ffd34d", H: "#fff3b0" },
};

export const pencil: Sprite = {
  rows: [
    "....oo",
    "...opo",
    "..oyoo",
    ".oyoo.",
    "oyoo..",
    "opo...",
    "oo....",
  ],
  palette: { o: "#1b1b3a", p: "#ff7a9c", y: "#ffd34d" },
};

export const spritesByKey: Record<string, Sprite> = { slime, gremlin };

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
