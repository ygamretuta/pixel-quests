import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Architecture rules (see README "Project structure"):
 *   shared  <-  parent  <-  bedtime, notifications  <-  wardrobe, rewards  <-  quests  <-  summary
 * A feature may import from features to its left, never to its right, and never from app/.
 * UI components must not import server modules (types are fine).
 */
const FEATURES = ["parent", "bedtime", "notifications", "wardrobe", "rewards", "quests", "summary"];
const ALLOWED = {
  parent: [],
  bedtime: ["parent"],
  notifications: ["parent"],
  wardrobe: ["parent", "bedtime"],
  rewards: ["parent", "bedtime", "notifications"],
  quests: ["parent", "bedtime", "wardrobe", "rewards"],
  summary: ["parent", "bedtime", "notifications", "wardrobe", "rewards", "quests"],
};

const message = (text) => ({ message: text, allowTypeImports: false });

function restricted(groups) {
  return {
    "@typescript-eslint/no-restricted-imports": ["error", { patterns: groups }],
  };
}

const appImport = { group: ["@/app/**"], ...message("Pages are the top layer; nothing imports from app/.") };
const serverImport = {
  group: ["@/**/server/**", "@/shared/server/**"],
  allowTypeImports: true,
  message: "UI components cannot import server modules. Pass data in from the page instead.",
};

const featureBlocks = FEATURES.flatMap((feature) => {
  const forbidden = FEATURES.filter((other) => other !== feature && !ALLOWED[feature].includes(other));
  const layering = forbidden.map((other) => ({
    group: [`@/features/${other}/**`],
    ...message(`features/${feature} may not depend on features/${other} (see dependency order in eslint.config.mjs).`),
  }));
  return [
    { files: [`src/features/${feature}/**/*.{ts,tsx}`], rules: restricted([appImport, ...layering]) },
    {
      files: [`src/features/${feature}/components/**/*.{ts,tsx}`],
      rules: restricted([appImport, ...layering, serverImport]),
    },
  ];
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...featureBlocks,
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: restricted([
      { group: ["@/features/**", "@/app/**"], ...message("shared/ is the bottom layer and cannot import features or app.") },
    ]),
  },
  {
    files: ["src/shared/ui/**/*.{ts,tsx}", "src/shared/audio/**/*.{ts,tsx}"],
    rules: restricted([
      { group: ["@/features/**", "@/app/**"], ...message("shared/ is the bottom layer and cannot import features or app.") },
      serverImport,
    ]),
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
