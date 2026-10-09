import { mirror } from "@/shared/lib/pixel/mirror";
import type { Sprite } from "@/shared/ui/PixelSprite/PixelSprite";
import type { PetKey } from "@/features/wardrobe/data/items";

const base = { k: "#1b1b3a", w: "#ffffff", p: "#ff9bb0" };

export const PET_SPRITES: Record<PetKey, Sprite> = {
  cat: {
    rows: mirror(["og...", "ogggg", "ogkgg", "ogggp", "ogggg", ".oggg", ".ogog", "..ooo"]),
    palette: { ...base, o: "#8a4b1e", g: "#ffa94d" },
  },
  dog: {
    rows: mirror(["..ooo", ".oggg", "eoggg", "eogkg", "eoggg", ".ogpp", ".oggg", "..ooo"]),
    palette: { ...base, o: "#5c3a1e", g: "#d9a066", e: "#7a4a2b" },
  },
  bunny: {
    rows: mirror(["..ow.", "..ow.", "..ow.", ".owww", "owkww", "owwpw", ".owww", "..ooo"]),
    palette: { ...base, o: "#9a9ab8", w: "#ffffff" },
  },
  dragon: {
    rows: mirror([".y...", ".oggg", "oggkg", "ogggg", "ogggg", ".oggw", ".ogww", "..ooo"]),
    palette: { ...base, o: "#1f7a3a", g: "#5be37d", y: "#ffd34d", w: "#e8ffe0" },
  },
};

import { ITEMS_BY_ID, type Equipped } from "@/features/wardrobe/data/items";

/** The pet she has with her, if any. */
export function equippedPet(equipped: Equipped): Sprite | null {
  const item = equipped.pet ? ITEMS_BY_ID[equipped.pet] : undefined;
  return item?.pet ? PET_SPRITES[item.pet] : null;
}
