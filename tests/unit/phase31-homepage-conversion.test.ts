import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 31 makes price-first ordering the primary homepage action", () => {
  const home = read("components/marketing/PremiumHomepage.tsx");
  assert.match(home, /Check Price & Start/);
  assert.match(home, /href="#order-demo"/);
  assert.match(home, /Browse Services/);
  assert.match(home, /See how ordering works/);
});

test("Phase 31 gives visitors three explicit conversion paths", () => {
  const home = read("components/marketing/PremiumHomepage.tsx");
  assert.match(home, /I’m ready to order/);
  assert.match(home, /I want to compare services/);
  assert.match(home, /I need to plan a budget/);
  assert.match(home, /\/tools\/social-media-service-cost-calculator/);
  assert.match(home, /Every path uses the current catalog and existing order flow/);
});

test("Phase 31 measures homepage conversion-path clicks with first-party analytics", () => {
  const home = read("components/marketing/PremiumHomepage.tsx");
  const events = read("lib/analytics/events.ts");
  assert.match(events, /"homepage_conversion_path_click"/);
  assert.match(home, /event="homepage_conversion_path_click"/);
  assert.match(home, /surface: "homepage_hero"/);
  assert.match(home, /surface: "homepage_decision_rail"/);
  assert.match(home, /step: "budget"/);
});

test("Phase 31 uses decision-oriented service and journey CTA wording", () => {
  const home = read("components/marketing/PremiumHomepage.tsx");
  assert.match(home, />Check Price <ArrowRight/);
  assert.match(home, />Check Live Price <ArrowRight/);
  assert.doesNotMatch(home, />Preview <ArrowRight/);
});
