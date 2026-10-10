#!/usr/bin/env node
// Prevent published blog copy from referencing image assets missing from public/.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const sourcesDir = fileURLToPath(new URL("../components/marketing/blog/", import.meta.url));
const publicDir = fileURLToPath(new URL("../public/", import.meta.url));
const sourceFiles = readdirSync(sourcesDir).filter((name) => /\.(?:tsx?|jsx?|mjs)$/.test(name));

const missing = [];
let referencesChecked = 0;

for (const file of sourceFiles) {
  const source = readFileSync(join(sourcesDir, file), "utf8");
  // These paths are static public assets; dynamic/remote image URLs are out of scope.
  const paths = new Set(
    [...source.matchAll(/\/images\/blog\/[A-Za-z0-9._/-]+\.(?:png|jpe?g|webp|avif|svg)/gi)]
      .map((match) => match[0]),
  );

  for (const imagePath of paths) {
    referencesChecked += 1;
    if (!existsSync(join(publicDir, imagePath.slice(1)))) {
      missing.push(`${file}: ${imagePath}`);
    }
  }
}

if (missing.length) {
  console.error(`Missing ${missing.length} blog image reference(s):\n${missing.map((item) => `- ${item}`).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`PASS: ${referencesChecked} blog image references resolve to files in public/.`);
}
