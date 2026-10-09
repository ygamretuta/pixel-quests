import type { Sprite } from "@/shared/ui/PixelSprite/PixelSprite";

/** The same shape painted in one dark color, for monsters she has not met yet. */
export function silhouette(sprite: Sprite): Sprite {
  return {
    rows: sprite.rows,
    palette: Object.fromEntries(Object.keys(sprite.palette).map((key) => [key, "#33336a"])),
  };
}
