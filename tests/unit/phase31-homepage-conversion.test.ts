import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");
const home = read("components/marketing/PremiumHomepage.tsx");
const hero = read("components/marketing/PremiumHomeHero.tsx");

test("Phase 31 keeps price-first ordering and clear alternatives in the rendered hero", () => {
  const root = read("components/marketing/HomepageContent.tsx");
  assert.match(root, /<PremiumHomepage hero=\{<PremiumHomeHero\s*\/>\}/);
  assert.match(hero, /href="#order-demo"[\s\S]*?Check Price &amp; Start/);
  assert.match(hero, /href="#services"[\s\S]*?Browse Services/);
  assert.match(hero, /href="#how-it-works"[\s\S]*?See how ordering works/);
});

test("Phase 31 preserves three explicit customer journeys including budget planning", () => {
  assert.match(home, /aria-label="Choose your next step"/);
  assert.match(home, /href:"#order-demo",step:"order",title:"Build my order"/);
  assert.match(home, /href:"\/services",step:"compare",title:"Compare services"/);
  assert.match(home, /href:"\/tools\/social-media-service-cost-calculator",step:"budget",title:"Estimate cost"/);
  assert.match(home, /const destination = selected[\s\S]*?\/dashboard\/new-order/);
  assert.match(home, /calculateServiceTotal\(selected\.code, quantity\)/);
});

test("Phase 31 retains first-party conversion-path tracking in both hero and choice rail", () => {
  const events = read("lib/analytics/events.ts");
  assert.match(events, /"homepage_conversion_path_click"/);
  assert.match(hero, /event="homepage_conversion_path_click"/);
  assert.match(hero, /surface: "homepage_hero"/);
  assert.match(home, /event="homepage_conversion_path_click"/);
  assert.match(home, /surface:"homepage_decision_rail"/);
  assert.match(home, /step:"budget"/);
  assert.match(home, /metadata=\{\{surface:"homepage_decision_rail",step:path\.step\}\}/);
});

test("Phase 31 keeps price-oriented CTAs without vague preview labels", () => {
  assert.match(hero, /Check Price &amp; Start/);
  assert.match(home, />Check Price <ArrowRight/);
  assert.match(home, />Check Live Price <ArrowRight/);
  assert.doesNotMatch(home, />Preview <ArrowRight/);
});
