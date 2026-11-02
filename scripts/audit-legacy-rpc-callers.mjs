import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const skip = new Set([".git", ".next", "node_modules", "coverage", "playwright-report", "test-results"]);
const supported = /\.(?:ts|tsx|js|jsx|mjs|cjs|sql)$/;
const patterns = [
  { name: "place_order", regex: /(?:rpc\s*\(\s*["'`]place_order["'`]|\bpublic\.place_order\s*\()/g },
  { name: "place_campaign", regex: /(?:rpc\s*\(\s*["'`]place_campaign["'`]|\bpublic\.place_campaign\s*\()/g },
  { name: "create_wallet_payment", regex: /(?:rpc\s*\(\s*["'`]create_wallet_payment["'`]|\bpublic\.create_wallet_payment\s*\()/g },
];

export function scanLegacyRpcReferences(source) {
  return patterns.filter(({ regex }) => { regex.lastIndex = 0; return regex.test(source); }).map(({ name }) => name);
}

function walk(dir, results) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, results);
    else if (entry.isFile() && supported.test(entry.name)) {
      const matches = scanLegacyRpcReferences(readFileSync(path, "utf8"));
      if (matches.length) results.push({ path: relative(root, path), functions: matches });
    }
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const results = [];
  walk(root, results);
  console.log(JSON.stringify({ audit: "legacy-rpc-callers", matches: results }, null, 2));
}
