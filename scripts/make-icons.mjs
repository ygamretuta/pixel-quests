// Renders the slime sprite onto the app background as crisp PNG icons (no deps).
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { slime } from "../src/features/quests/sprites.ts";

const BG = [0x1b, 0x1b, 0x3a];

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (const byte of buf) {
    c = (crc ^ byte) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function hex(color) {
  return [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
}

function png(size) {
  const cols = slime.rows[0].length;
  const rows = slime.rows.length;
  const cell = Math.floor((size * 0.6) / cols);
  const left = Math.floor((size - cell * cols) / 2);
  const top = Math.floor((size - cell * rows) / 2);
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const cx = Math.floor((x - left) / cell);
      const cy = Math.floor((y - top) / cell);
      const key = slime.rows[cy]?.[cx];
      const fill = x >= left && y >= top && key && slime.palette[key] ? hex(slime.palette[key]) : BG;
      raw.set(fill, y * (size * 3 + 1) + 1 + x * 3);
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 2, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

writeFileSync("public/icon-192.png", png(192));
writeFileSync("public/icon-512.png", png(512));
writeFileSync("src/app/icon.png", png(512));
writeFileSync("src/app/apple-icon.png", png(180));
console.log("icons written");
