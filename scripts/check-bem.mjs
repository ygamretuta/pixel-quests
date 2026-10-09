// Checks the CSS follows BEM: one block per file, kebab-case names, and no selector
// that reaches into another block. Run with `pnpm lint:css`.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const NAME = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const CLASS = new RegExp(`^(${NAME.source.slice(1, -1)})(?:__(${NAME.source.slice(1, -1)}))?(?:--(${NAME.source.slice(1, -1)}))?$`);

function cssFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return cssFiles(path);
    return path.endsWith(".css") && !path.endsWith("globals.css") ? [path] : [];
  });
}

const problems = [];

for (const file of cssFiles("src")) {
  const source = readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/@keyframes\s+[\w-]+\s*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");
  const fileBlocks = new Set();

  for (const [, selectorList] of source.matchAll(/([^{}@;]+)\{/g)) {
    for (const selector of selectorList.split(",")) {
      const classes = [...selector.matchAll(/\.([\w-]+)/g)].map((match) => match[1]);
      if (classes.length === 0) continue; // @media preludes, :root, and so on
      if (/[>*]/.test(selector)) problems.push(`${file}: "${selector.trim()}" styles children it does not own.`);
      const blocks = new Set();
      for (const name of classes) {
        const parsed = CLASS.exec(name);
        if (!parsed) {
          problems.push(`${file}: "${name}" is not a valid BEM name (block__element--modifier)`);
          continue;
        }
        if (parsed[2] && parsed[2].includes("__")) problems.push(`${file}: "${name}" nests elements`);
        blocks.add(parsed[1]);
        fileBlocks.add(parsed[1]);
      }
      if (blocks.size > 1) {
        problems.push(`${file}: "${selector.trim()}" styles more than one block (${[...blocks].join(", ")}). Use a mix class instead.`);
      }
    }
  }

  if (fileBlocks.size > 1) {
    problems.push(`${file}: defines several blocks (${[...fileBlocks].join(", ")}); keep one block per file.`);
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("BEM check passed");
