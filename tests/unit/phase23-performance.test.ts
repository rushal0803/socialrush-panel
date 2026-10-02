import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 23 avoids fetching FX rates while INR already has a usable rate", () => {
  const source = read("lib/currency/use-currency.ts");
  assert.match(source, /if \(hasRate\(rates, currency\)\)/);
  assert.match(source, /fetch\("\/api\/fx-rates"/);
});

test("Phase 23 defers geo currency detection until the browser is idle", () => {
  const source = read("lib/currency/use-currency.ts");
  assert.match(source, /requestIdleCallback\(detectCurrency/);
  assert.match(source, /setTimeout\(detectCurrency, 1500\)/);
});

test("Phase 23 throttles public pointer effects to animation frames and skips coarse pointers", () => {
  const source = read("components/marketing/InteractiveHomepageShell.tsx");
  assert.match(source, /matchMedia\("\(hover: hover\) and \(pointer: fine\)"\)/);
  assert.match(source, /requestAnimationFrame/);
  assert.doesNotMatch(source, /window\.addEventListener\("pointermove"/);
});
