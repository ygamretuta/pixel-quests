import { cx } from "@/shared/lib/css/cx";
import { panelClass } from "@/shared/ui/Panel/panelClass";
import "./StatTiles.css";

type StatTilesProps = { tiles: { label: string; value: number }[] };

export function StatTiles({ tiles }: StatTilesProps) {
  return (
    <ul className="stat-tiles">
      {tiles.map((tile) => (
        <li key={tile.label} className={cx("stat-tiles__tile", panelClass())}>
          <span className="stat-tiles__value">{tile.value}</span>
          <span className="stat-tiles__label">{tile.label}</span>
        </li>
      ))}
    </ul>
  );
}
