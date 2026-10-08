import { spritesByKey } from "@/features/quests/monsters";
import { slime } from "@/features/quests/sprites";
import type { Sprite } from "@/shared/pixel/PixelSprite";
import type { WeekSummary } from "@/server/summary";

const WIDTH = 1080;
const PAD = 56;
const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

const COLORS = {
  bg: "#1b1b3a",
  panel: "#2a2a5a",
  edge: "#4a4a8a",
  ink: "#ffffff",
  dim: "#b8b8e0",
  gold: "#ffd34d",
  done: "#5be37d",
  miss: "#ff4d6d",
  rest: "#5be3e3",
  none: "#23234a",
  hpEmpty: "#4a2a4a",
};

const CELL_COLOR = {
  done: COLORS.done,
  miss: COLORS.miss,
  rest: COLORS.rest,
  today: COLORS.none,
  na: COLORS.none,
  future: COLORS.none,
} as const;

function formatDay(key: string) {
  return new Date(`${key}T00:00:00Z`).toLocaleDateString("en-PH", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  });
}

export function summaryText(summary: WeekSummary) {
  const { stats, days } = summary;
  const lines = [
    `Pixel Quests: ${formatDay(days[0])} - ${formatDay(days[6])}`,
    `${stats.questsDone} quests done, ${stats.perfectDays} perfect days, ${stats.coins} coins earned`,
    summary.insight,
  ];
  if (summary.isCurrentWeek) lines.push(`Streak: ${stats.streak} ${stats.streak === 1 ? "day" : "days"}`);
  return lines.join("\n");
}

function drawSprite(ctx: CanvasRenderingContext2D, sprite: Sprite, x: number, y: number, scale: number) {
  sprite.rows.forEach((row, ry) =>
    [...row].forEach((cell, rx) => {
      const fill = sprite.palette[cell];
      if (!fill) return;
      ctx.fillStyle = fill;
      ctx.fillRect(x + rx * scale, y + ry * scale, scale, scale);
    }),
  );
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let cut = text;
  while (cut.length > 1 && ctx.measureText(`${cut}...`).width > maxWidth) cut = cut.slice(0, -1);
  return `${cut}...`;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Draws the weekly summary as a shareable PNG (stats only; no photos). */
export async function renderSummaryImage(summary: WeekSummary): Promise<Blob> {
  const family = getComputedStyle(document.body).fontFamily;
  await document.fonts.ready;

  const rowHeight = 168;
  const bossHeight = 128;
  const insightLines = 3;
  const height =
    PAD + 150 + insightLines * 40 + 40 + 150 + 56 +
    summary.dailies.length * rowHeight +
    (summary.weeklies.length ? 64 + summary.weeklies.length * bossHeight : 0) +
    PAD + 48;

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  ctx.textBaseline = "top";
  const font = (size: number) => (ctx.font = `${size}px ${family}`);

  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, WIDTH, height);

  let y = PAD;
  ctx.fillStyle = COLORS.gold;
  font(40);
  ctx.fillText("PIXEL QUESTS", PAD, y);
  y += 64;
  ctx.fillStyle = COLORS.ink;
  font(28);
  ctx.fillText(`${formatDay(summary.days[0])} - ${formatDay(summary.days[6])}`, PAD, y);
  y += 72;

  ctx.fillStyle = COLORS.dim;
  font(22);
  for (const line of wrap(ctx, summary.insight, WIDTH - PAD * 2).slice(0, insightLines)) {
    ctx.fillText(line, PAD, y);
    y += 40;
  }
  y += 40;

  const tiles = [
    ["Quests done", summary.stats.questsDone],
    ["Perfect days", summary.stats.perfectDays],
    ["Coins", summary.stats.coins],
    ["Streak", summary.stats.streak],
  ] as const;
  const gap = 16;
  const tileWidth = (WIDTH - PAD * 2 - gap * 3) / 4;
  tiles.forEach(([label, value], index) => {
    const x = PAD + index * (tileWidth + gap);
    ctx.fillStyle = COLORS.panel;
    ctx.fillRect(x, y, tileWidth, 150);
    ctx.fillStyle = COLORS.gold;
    font(44);
    ctx.fillText(String(value), x + 20, y + 28);
    ctx.fillStyle = COLORS.dim;
    font(14);
    ctx.fillText(fitText(ctx, label, tileWidth - 40), x + 20, y + 100);
  });
  y += 150 + 56;

  summary.dailies.forEach((daily) => {
    ctx.fillStyle = COLORS.panel;
    ctx.fillRect(PAD, y, WIDTH - PAD * 2, rowHeight - 16);
    drawSprite(ctx, spritesByKey[daily.sprite] ?? slime, PAD + 20, y + 16, 4);
    ctx.fillStyle = COLORS.ink;
    font(24);
    ctx.fillText(fitText(ctx, daily.title, 560), PAD + 90, y + 24);
    ctx.fillStyle = COLORS.gold;
    font(24);
    const count = `${daily.doneDays}/7`;
    ctx.fillText(count, WIDTH - PAD - 20 - ctx.measureText(count).width, y + 24);

    const cellWidth = (WIDTH - PAD * 2 - 40 - 6 * 8) / 7;
    daily.cells.forEach((cell, index) => {
      const x = PAD + 20 + index * (cellWidth + 8);
      ctx.fillStyle = CELL_COLOR[cell];
      ctx.fillRect(x, y + 76, cellWidth, 56);
      ctx.fillStyle = cell === "miss" ? COLORS.ink : cell === "done" || cell === "rest" ? COLORS.bg : COLORS.dim;
      font(20);
      ctx.fillText(WEEKDAYS[index], x + cellWidth / 2 - 10, y + 92);
    });
    y += rowHeight;
  });

  if (summary.weeklies.length) {
    y += 8;
    ctx.fillStyle = COLORS.ink;
    font(24);
    ctx.fillText("Weekly bosses", PAD, y);
    y += 56;
    summary.weeklies.forEach((weekly) => {
      ctx.fillStyle = COLORS.panel;
      ctx.fillRect(PAD, y, WIDTH - PAD * 2, bossHeight - 16);
      drawSprite(ctx, spritesByKey[weekly.sprite] ?? slime, PAD + 20, y + 16, 4);
      ctx.fillStyle = COLORS.ink;
      font(24);
      ctx.fillText(fitText(ctx, weekly.title, 520), PAD + 90, y + 20);
      ctx.fillStyle = COLORS.gold;
      const status = weekly.defeated ? "DEFEATED" : `${weekly.hits}/${weekly.maxHp}`;
      ctx.fillText(status, WIDTH - PAD - 20 - ctx.measureText(status).width, y + 20);

      const barWidth = (WIDTH - PAD * 2 - 40 - (weekly.maxHp - 1) * 8) / weekly.maxHp;
      for (let i = 0; i < weekly.maxHp; i++) {
        ctx.fillStyle = i < weekly.maxHp - weekly.hits ? COLORS.miss : COLORS.hpEmpty;
        ctx.fillRect(PAD + 20 + i * (barWidth + 8), y + 68, barWidth, 24);
      }
      y += bossHeight;
    });
  }

  ctx.fillStyle = COLORS.dim;
  font(16);
  ctx.fillText("pixel-quests.vercel.app", PAD, height - PAD - 16);

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("render failed"))), "image/png"),
  );
}
