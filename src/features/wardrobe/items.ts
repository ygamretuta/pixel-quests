export const SLOTS = ["head", "body", "legs", "feet"] as const;
export type Slot = (typeof SLOTS)[number];

export const TIERS = ["leather", "iron", "rose", "gold"] as const;
export type Tier = (typeof TIERS)[number];

export type Item = { id: string; name: string; slot: Slot; tier: Tier; price: number };

export type Equipped = Partial<Record<Slot, string>>;

export const SLOT_LABELS: Record<Slot, string> = {
  head: "Helmets",
  body: "Armor",
  legs: "Skirts",
  feet: "Boots",
};

const NAMES: Record<Slot, Record<Tier, string>> = {
  head: { leather: "Leather Cap", iron: "Iron Helm", rose: "Rose Bonnet", gold: "Golden Crown" },
  body: { leather: "Leather Vest", iron: "Iron Plate", rose: "Rose Mail", gold: "Golden Armor" },
  legs: { leather: "Leather Skirt", iron: "Chain Skirt", rose: "Rose Skirt", gold: "Golden Skirt" },
  feet: { leather: "Leather Boots", iron: "Iron Boots", rose: "Rose Boots", gold: "Golden Boots" },
};

const PRICES: Record<Slot, Record<Tier, number>> = {
  head: { leather: 15, iron: 40, rose: 80, gold: 150 },
  body: { leather: 25, iron: 60, rose: 120, gold: 220 },
  legs: { leather: 20, iron: 50, rose: 100, gold: 180 },
  feet: { leather: 15, iron: 40, rose: 80, gold: 150 },
};

export const ITEMS: Item[] = SLOTS.flatMap((slot) =>
  TIERS.map((tier) => ({
    id: `${slot}-${tier}`,
    name: NAMES[slot][tier],
    slot,
    tier,
    price: PRICES[slot][tier],
  })),
);

export const ITEMS_BY_ID: Record<string, Item> = Object.fromEntries(
  ITEMS.map((item) => [item.id, item]),
);
