import type { ReactNode } from "react";

export type Sprite = {
  rows: string[];
  palette: Record<string, string>;
};

type PixelSpriteProps = {
  /** One sprite, or several same-sized layers painted bottom to top. */
  sprite: Sprite | Sprite[];
  label: string;
};

export function PixelSprite({ sprite, label }: PixelSpriteProps) {
  const layers = Array.isArray(sprite) ? sprite : [sprite];
  const width = layers[0].rows[0].length;
  const height = layers[0].rows.length;

  const cells: ReactNode[] = [];
  layers.forEach((layer, index) =>
    layer.rows.forEach((row, y) =>
      [...row].forEach((cell, x) => {
        const fill = layer.palette[cell];
        if (fill) {
          cells.push(
            <rect key={`${index}-${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />,
          );
        }
      }),
    ),
  );

  return (
    <svg
      className="pixel-sprite"
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={label}
    >
      {cells}
    </svg>
  );
}
