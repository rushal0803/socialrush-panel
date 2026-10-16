import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Only display-currency conversions use this optional provider; never block a
// request indefinitely on network egress, and never fabricate fallback rates.
const code = readFileSync(join(process.cwd(), "lib/fx-rates.ts"), "utf8");

test("optional FX lookup has a bounded 4-second deadline", () => {
  assert.match(code, /signal:\s*AbortSignal\.timeout\(4000\)/);
  assert.match(code, /next:\s*\{\s*revalidate:\s*21600\s*\}/);
});

test("FX fetch/provider failures preserve the INR-only safe fallback", () => {
  assert.match(code, /catch\s*\{/);
  assert.match(code, /return\s*\{\s*INR:\s*1\s*\}/);
  assert.match(code, /payload\.base_code\s*!==\s*"INR"/);
  assert.doesNotMatch(code, /\bUSD\s*:\s*0\.0/);
});
