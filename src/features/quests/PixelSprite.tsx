import type { Sprite } from "./sprites";

type PixelSpriteProps = {
  sprite: Sprite;
  label: string;
};

export function PixelSprite({ sprite, label }: PixelSpriteProps) {
  const width = sprite.rows[0].length;
  const height = sprite.rows.length;

  return (
    <svg
      className="pixel-sprite"
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={label}
    >
      {sprite.rows.flatMap((row, y) =>
        [...row].map((cell, x) => {
          const fill = sprite.palette[cell];
          return fill ? (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />
          ) : null;
        }),
      )}
    </svg>
  );
}
