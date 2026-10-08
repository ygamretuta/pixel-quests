import type { Sprite } from "@/shared/pixel/PixelSprite";
import { mirror } from "@/shared/pixel/mirror";
import { ITEMS_BY_ID, type Equipped, type Slot, type Tier } from "./items";

const ROWS = 24;
const BLANK = "........";

/** Builds a full-height layer from left-half rows starting at `start`. */
function layer(start: number, halves: string[], palette: Record<string, string>): Sprite {
  const all = Array.from({ length: ROWS }, (_, y) => halves[y - start] ?? BLANK);
  return { rows: mirror(all), palette };
}

// A cute kid in a basic tee and skirt. Each row is the left half; it is mirrored.
export const baseCharacter: Sprite = layer(
  0,
  [
    ".....hhh",
    "...hhhhh",
    "..hhhhhh",
    ".hhhhhhh",
    ".hhhhhhh",
    ".hhhhhhh",
    "yhhhhsss",
    "hhhsssss",
    "hhhswkss",
    "hhhskkss",
    "hhhsppss",
    ".hhssssm",
    ".hh.ssss",
    ".hh...ss",
    "..tttttt",
    "..sttttt",
    "..sttttt",
    "..sttttt",
    "...rrrrr",
    "..rrrrrr",
    ".rrrrrrr",
    "....ss..",
    "....ss..",
    "...bbb..",
  ],
  {
    h: "#6b3f2a",
    s: "#ffd9b3",
    k: "#2a1b3d",
    w: "#ffffff",
    p: "#ff9bb0",
    m: "#c2465f",
    y: "#ff5c8a",
    t: "#fff6c9",
    r: "#b366ff",
    b: "#8a4b2e",
  },
);

const TIER_PALETTES: Record<Tier, Record<string, string>> = {
  leather: { a: "#a0693a", A: "#5c3a1e", L: "#c98a55" },
  iron: { a: "#9aa5b1", A: "#4a5560", L: "#d5dde5" },
  rose: { a: "#ff8fb8", A: "#b8356a", L: "#ffd1e3" },
  gold: { a: "#ffd34d", A: "#b8860b", L: "#fff3b0" },
};

const SHAPES: Record<Slot, { start: number; halves: string[] }> = {
  head: {
    start: 0,
    halves: [".....AAA", "...AAaaa", "..AaaLaa", ".AaaLaaa", ".Aaaaaaa", ".AAAAAAA"],
  },
  body: {
    start: 14,
    halves: ["..AaaaLa", "...AaLaa", "...aaaaa", "...AAAAA"],
  },
  legs: {
    start: 18,
    halves: ["...AaaLa", "..AaaaaL", ".AAAAAAA"],
  },
  feet: {
    start: 21,
    halves: ["....AA..", "...AaL..", "..AaaaA."],
  },
};

export function itemLayer(slot: Slot, tier: Tier): Sprite {
  const { start, halves } = SHAPES[slot];
  return layer(start, halves, TIER_PALETTES[tier]);
}

const DRAW_ORDER: Slot[] = ["legs", "body", "feet", "head"];

/** Base character plus whatever she is wearing, bottom layer first. */
export function characterLayers(equipped: Equipped): Sprite[] {
  const layers = [baseCharacter];
  for (const slot of DRAW_ORDER) {
    const item = equipped[slot] ? ITEMS_BY_ID[equipped[slot]] : undefined;
    if (item) layers.push(itemLayer(item.slot, item.tier));
  }
  return layers;
}

/** The basic character wearing just one item, for shop previews. */
export function previewLayers(slot: Slot, tier: Tier): Sprite[] {
  return [baseCharacter, itemLayer(slot, tier)];
}

export const merchant: Sprite = {
  rows: mirror([
    ".....ooo",
    "...ooooo",
    "..oooooo",
    ".ooooooo",
    "yyyyyyyy",
    "..ssssss",
    "..sskkss",
    "..ssssss",
    "..sswwww",
    "..wwwwww",
    "...wwwww",
    "..bbbbbb",
    ".bbbbbbb",
    ".bbbbyyy",
    ".bbbbbbb",
    ".bbbbbbb",
    "..bbbbbb",
    "..bbbbbb",
    "...ddddd",
  ]),
  palette: {
    o: "#4a2a7a",
    y: "#ffd34d",
    s: "#f3c08a",
    k: "#1b1b3a",
    w: "#eeeeee",
    b: "#2a8f8a",
    d: "#1b1b3a",
  },
};
