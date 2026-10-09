import "./PixelSprite.css";

export type Sprite = {
  rows: string[];
  palette: Record<string, string>;
};

type PixelSpriteProps = {
  /** One sprite, or several same-sized layers painted bottom to top. */
  sprite: Sprite | Sprite[];
  label: string;
};

/** One SVG path per color: horizontal runs of the same color become a single rectangle. */
function layerPaths(layer: Sprite) {
  const pathByFill = new Map<string, string>();
  layer.rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const fill = layer.palette[row[x]];
      let end = x + 1;
      while (end < row.length && layer.palette[row[end]] === fill) end++;
      if (fill) {
        const run = end - x;
        pathByFill.set(fill, `${pathByFill.get(fill) ?? ""}M${x} ${y}h${run}v1h-${run}z`);
      }
      x = end;
    }
  });
  return [...pathByFill];
}

export function PixelSprite({ sprite, label }: PixelSpriteProps) {
  const layers = Array.isArray(sprite) ? sprite : [sprite];
  const width = layers[0].rows[0].length;
  const height = layers[0].rows.length;

  return (
    <svg
      className="pixel-sprite"
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    >
      {layers.flatMap((layer, index) =>
        layerPaths(layer).map(([fill, d]) => <path key={`${index}-${fill}`} d={d} fill={fill} />),
      )}
    </svg>
  );
}
