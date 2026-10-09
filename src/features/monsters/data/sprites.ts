import type { Sprite } from "@/shared/ui/PixelSprite/PixelSprite";

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
