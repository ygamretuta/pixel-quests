import { previewLayers } from "@/features/wardrobe/data/character";
import type { Item } from "@/features/wardrobe/data/items";
import { PET_SPRITES } from "@/features/wardrobe/data/pets";
import { cx } from "@/shared/lib/css/cx";
import { panelClass } from "@/shared/ui/Panel/panelClass";
import { PixelButton } from "@/shared/ui/PixelButton/PixelButton";
import { PixelSprite } from "@/shared/ui/PixelSprite/PixelSprite";
import { PriceTag } from "@/shared/ui/PriceTag/PriceTag";
import "./ShopItem.css";

type ShopItemProps = {
  item: Item;
  owned: boolean;
  worn: boolean;
  affordable: boolean;
  busy: boolean;
  onBuy: (item: Item) => void;
  onToggle: (item: Item) => void;
};

export function ShopItem({ item, owned, worn, affordable, busy, onBuy, onToggle }: ShopItemProps) {
  return (
    <li className={cx("shop-item", panelClass(worn ? "highlight" : "plain"))}>
      <div className="shop-item__preview">
        <PixelSprite sprite={item.pet ? PET_SPRITES[item.pet] : previewLayers(item)} label={item.name} />
      </div>
      <span className="shop-item__name">{item.name}</span>
      {owned ? (
        <PixelButton className="shop-item__button" disabled={busy} onClick={() => onToggle(item)}>
          {worn ? "Take off" : "Wear"}
        </PixelButton>
      ) : (
        <PixelButton
          className="shop-item__button"
          disabled={busy || !affordable}
          onClick={() => onBuy(item)}
        >
          <PriceTag>{item.price}</PriceTag>
        </PixelButton>
      )}
    </li>
  );
}
