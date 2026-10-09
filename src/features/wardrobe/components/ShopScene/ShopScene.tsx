import { characterLayers, merchant } from "@/features/wardrobe/data/character";
import type { Equipped } from "@/features/wardrobe/data/items";
import { equippedPet } from "@/features/wardrobe/data/pets";
import { cx } from "@/shared/lib/css/cx";
import { panelClass } from "@/shared/ui/Panel/panelClass";
import { PixelSprite } from "@/shared/ui/PixelSprite/PixelSprite";
import "./ShopScene.css";

type ShopSceneProps = { equipped: Equipped; said: string };

/** Her hero and pet on one side, the merchant and his speech bubble on the other. */
export function ShopScene({ equipped, said }: ShopSceneProps) {
  const pet = equippedPet(equipped);

  return (
    <section className={cx("shop-scene", panelClass("stage"))}>
      <div className="shop-scene__hero">
        <div className="shop-scene__hero-body">
          <PixelSprite sprite={characterLayers(equipped)} label="Your hero" />
        </div>
        {pet && (
          <div className="shop-scene__pet">
            <PixelSprite sprite={pet} label="Your pet" />
          </div>
        )}
      </div>
      <div className="shop-scene__merchant">
        <PixelSprite sprite={merchant} label="The merchant" />
      </div>
      <p className="shop-scene__bubble">{said}</p>
    </section>
  );
}
