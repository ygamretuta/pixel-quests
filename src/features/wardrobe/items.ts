export const SLOTS = ["head", "body", "legs", "feet", "back", "hand", "pet"] as const;
export type Slot = (typeof SLOTS)[number];

export const TIERS = ["leather", "iron", "rose", "gold"] as const;
export type Tier = (typeof TIERS)[number];

export const PET_KEYS = ["cat", "dog", "bunny", "dragon"] as const;
export type PetKey = (typeof PET_KEYS)[number];

export type Item = {
  id: string;
  name: string;
  slot: Slot;
  price: number;
  /** Gear slots look different per tier. */
  tier?: Tier;
  /** Pets are their own sprites. */
  pet?: PetKey;
};

export type Equipped = Partial<Record<Slot, string>>;

export const SLOT_LABELS: Record<Slot, string> = {
  head: "Helmets",
  body: "Armor",
  legs: "Skirts",
  feet: "Boots",
  back: "Capes",
  hand: "Wands",
  pet: "Pets",
};

type GearSlot = Exclude<Slot, "pet">;

const GEAR: Record<GearSlot, Record<Tier, { name: string; price: number }>> = {
  head: {
    leather: { name: "Leather Cap", price: 15 },
    iron: { name: "Iron Helm", price: 40 },
    rose: { name: "Rose Bonnet", price: 80 },
    gold: { name: "Golden Crown", price: 150 },
  },
  body: {
    leather: { name: "Leather Vest", price: 25 },
    iron: { name: "Iron Plate", price: 60 },
    rose: { name: "Rose Mail", price: 120 },
    gold: { name: "Golden Armor", price: 220 },
  },
  legs: {
    leather: { name: "Leather Skirt", price: 20 },
    iron: { name: "Chain Skirt", price: 50 },
    rose: { name: "Rose Skirt", price: 100 },
    gold: { name: "Golden Skirt", price: 180 },
  },
  feet: {
    leather: { name: "Leather Boots", price: 15 },
    iron: { name: "Iron Boots", price: 40 },
    rose: { name: "Rose Boots", price: 80 },
    gold: { name: "Golden Boots", price: 150 },
  },
  back: {
    leather: { name: "Scarlet Cape", price: 30 },
    iron: { name: "Sky Cape", price: 60 },
    rose: { name: "Rose Cape", price: 110 },
    gold: { name: "Golden Cape", price: 190 },
  },
  hand: {
    leather: { name: "Wooden Wand", price: 20 },
    iron: { name: "Silver Wand", price: 50 },
    rose: { name: "Rose Wand", price: 90 },
    gold: { name: "Golden Wand", price: 170 },
  },
};

const PETS: { pet: PetKey; name: string; price: number }[] = [
  { pet: "cat", name: "Kitty", price: 60 },
  { pet: "dog", name: "Puppy", price: 80 },
  { pet: "bunny", name: "Bunny", price: 100 },
  { pet: "dragon", name: "Baby Dragon", price: 200 },
];

export const ITEMS: Item[] = [
  ...(Object.keys(GEAR) as GearSlot[]).flatMap((slot) =>
    TIERS.map((tier) => ({
      id: `${slot}-${tier}`,
      name: GEAR[slot][tier].name,
      slot,
      tier,
      price: GEAR[slot][tier].price,
    })),
  ),
  ...PETS.map(({ pet, name, price }) => ({
    id: `pet-${pet}`,
    name,
    slot: "pet" as const,
    pet,
    price,
  })),
];

export const ITEMS_BY_ID: Record<string, Item> = Object.fromEntries(
  ITEMS.map((item) => [item.id, item]),
);
