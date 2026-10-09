import type { TrophyData } from "@/features/trophies/server/trophies";
import { cx } from "@/shared/lib/css/cx";
import { medal } from "@/shared/lib/pixel/icons";
import { panelClass } from "@/shared/ui/Panel/panelClass";
import { PixelSprite } from "@/shared/ui/PixelSprite/PixelSprite";
import "./BadgeGrid.css";

export function BadgeGrid({ badges }: { badges: TrophyData["badges"] }) {
  const earnedCount = badges.filter((badge) => badge.earned).length;

  return (
    <section className="badge-grid">
      <h2 className="badge-grid__title">
        Badges {earnedCount}/{badges.length}
      </h2>
      <ul className="badge-grid__list">
        {badges.map((badge) => (
          <li key={badge.id} className={cx("badge-grid__item", panelClass(), !badge.earned && "badge-grid__item--locked")}>
            <span className="badge-grid__medal">
              <PixelSprite
                sprite={{ ...medal, palette: badge.earned ? { ...medal.palette, r: badge.color } : { r: "#4a4a8a", o: "#33336a", y: "#3d3d78", H: "#3d3d78" } }}
                label=""
              />
            </span>
            <span className="badge-grid__name">{badge.earned ? badge.title : "???"}</span>
            <span className="badge-grid__hint">{badge.hint}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
