import type { Sprite } from "@/shared/ui/PixelSprite/PixelSprite";
import { mirror } from "@/shared/lib/pixel/mirror";
import { ITEMS_BY_ID, type Equipped, type Item, type Slot, type Tier } from "@/features/wardrobe/data/items";

const ROWS = 24;
const BLANK = "........";

/** Builds a full-height layer from left-half rows starting at `start`. */
function layer(start: number, halves: string[], palette: Record<string, string>): Sprite {
  const all = Array.from({ length: ROWS }, (_, y) => halves[y - start] ?? BLANK);
  return { rows: mirror(all), palette };
}

/** Builds a full-height layer from full 16-wide rows (for asymmetric items). */
function fullLayer(start: number, rows: string[], palette: Record<string, string>): Sprite {
  const all = Array.from({ length: ROWS }, (_, y) => rows[y - start] ?? ".".repeat(16));
  return { rows: all, palette };
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

// a = main, A = dark edge, L = highlight, G = accent.
const TIER_PALETTES: Record<Tier, Record<string, string>> = {
  leather: { a: "#a0693a", A: "#5c3a1e", L: "#c98a55", G: "#e0b050" },
  iron: { a: "#9aa5b1", A: "#4a5560", L: "#d5dde5", G: "#4fc3f7" },
  rose: { a: "#ff8fb8", A: "#b8356a", L: "#ffd1e3", G: "#fff0a0" },
  gold: { a: "#ffd34d", A: "#b8860b", L: "#fff3b0", G: "#ff4d6d" },
};

const CAPE_PALETTES: Record<Tier, Record<string, string>> = {
  leather: { a: "#d94a4a", A: "#8a2a2a", L: "#ff8a8a", G: "#ffd34d" },
  iron: { a: "#4a7fd9", A: "#2a4a8a", L: "#8ab4ff", G: "#ffd34d" },
  rose: { a: "#ff8fb8", A: "#b8356a", L: "#ffd1e3", G: "#fff0a0" },
  gold: { a: "#ffd34d", A: "#b8860b", L: "#fff3b0", G: "#ff4d6d" },
};

type Shape = { start: number; halves: string[] };

const SHAPES: Record<"head" | "body" | "legs" | "feet" | "back", Record<Tier, Shape>> = {
  head: {
    leather: {
      start: 0,
      halves: [".....AAA", "...AAaaa", "..AaaLaa", ".AaaLaaa", ".Aaaaaaa", ".AAAAAAA"],
    },
    iron: {
      start: 0,
      halves: [
        ".....ALa",
        "...AAaaa",
        "..AaLaaa",
        ".AaLaaaa",
        ".Aaaaaaa",
        ".AAAAAAA",
        ".......a",
        "..Aa...a",
        "..Aa....",
      ],
    },
    rose: {
      start: 0,
      halves: ["....aaGG", "...AaaaG", "..AaLaaa", ".AaaLaaa", ".Aaaaaaa", "AAAAAAAA"],
    },
    gold: {
      start: 1,
      halves: ["...A.A.A", "...aLaLa", "..AaaaaG", "..AAAAAA"],
    },
  },
  body: {
    leather: { start: 14, halves: ["..AaaaLa", "...AaLaa", "...aaaaa", "...AAAAA"] },
    iron: { start: 14, halves: [".AaaaLaa", "..AaaaaA", "...aLaaA", "...AAAAA"] },
    rose: { start: 14, halves: ["..AaaaLa", "...AaaaG", "...aaLaa", "...AaAaA"] },
    gold: { start: 14, halves: [".AaaaaLa", "..AaaLaG", "...aLaGG", "...AAAAA"] },
  },
  legs: {
    leather: { start: 18, halves: ["...AaaLa", "..AaaaaL", ".AAAAAAA"] },
    iron: { start: 18, halves: ["...AaAaA", "..AaAaAa", ".AAAAAAA"] },
    rose: { start: 18, halves: ["...aaaLa", "..aLaaaa", ".AaAaAaA"] },
    gold: { start: 18, halves: ["...ALaaG", "..AaaaGG", ".AAAAAAA"] },
  },
  feet: {
    leather: { start: 21, halves: ["....AA..", "...AaL..", "..AaaaA."] },
    iron: { start: 21, halves: ["...AAA..", "...AaL..", "..AaaaA."] },
    rose: { start: 21, halves: ["...GaG..", "...aLa..", "..AaaaA."] },
    gold: { start: 21, halves: ["...AGA..", "..AaLaA.", "..AaaaaA"] },
  },
  back: {
    leather: cape(),
    iron: cape(),
    rose: cape(),
    gold: cape(),
  },
};

function cape(): Shape {
  return {
    start: 14,
    halves: [
      "Aaaaaaaa",
      "Aaaaaaaa",
      "Aaaaaaaa",
      "Aaaaaaaa",
      "Aaaaaaaa",
      "AaaaaaaL",
      "AaaLaaaa",
      "AaaaaaAA",
      "AAAAAAAA",
    ],
  };
}

const WAND_ROWS = [
  "..............L.",
  ".............LLL",
  "..............L.",
  "..............a.",
  "..............a.",
  "..............a.",
  "..............a.",
  "..............a.",
  "..............A.",
  "..............A.",
];

/** The picture of an equippable gear item (not pets). */
export function itemLayer(item: Item): Sprite {
  const tier = item.tier ?? "leather";
  if (item.slot === "hand") return fullLayer(8, WAND_ROWS, TIER_PALETTES[tier]);
  if (item.slot === "back") {
    const { start, halves } = SHAPES.back[tier];
    return layer(start, halves, CAPE_PALETTES[tier]);
  }
  const { start, halves } = SHAPES[item.slot as "head" | "body" | "legs" | "feet"][tier];
  return layer(start, halves, TIER_PALETTES[tier]);
}

const BEHIND: Slot[] = ["back"];
const FRONT: Slot[] = ["legs", "body", "feet", "head", "hand"];

function worn(equipped: Equipped, slots: Slot[]): Sprite[] {
  return slots.flatMap((slot) => {
    const item = equipped[slot] ? ITEMS_BY_ID[equipped[slot]] : undefined;
    return item ? [itemLayer(item)] : [];
  });
}

/** Cape behind, the basic kid, then whatever she is wearing on top. */
export function characterLayers(equipped: Equipped): Sprite[] {
  return [...worn(equipped, BEHIND), baseCharacter, ...worn(equipped, FRONT)];
}

/** The basic character wearing just one item, for shop previews. */
export function previewLayers(item: Item): Sprite[] {
  const piece = itemLayer(item);
  return item.slot === "back" ? [piece, baseCharacter] : [baseCharacter, piece];
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
