import type { ReactNode } from "react";
import { coin } from "@/shared/lib/pixel/icons";
import { PixelSprite } from "@/shared/ui/PixelSprite/PixelSprite";
import "./PriceTag.css";

/** A small coin followed by a number or word, for use inside buttons. */
export function PriceTag({ children }: { children: ReactNode }) {
  return (
    <span className="price-tag">
      <span className="price-tag__icon">
        <PixelSprite sprite={coin} label="" />
      </span>
      {children}
    </span>
  );
}
