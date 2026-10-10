import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

const modules = [
  "components/marketing/PremiumDesign.module.css",
  "components/marketing/PremiumSystem.module.css",
  "components/marketing/services/ServicesCatalog.module.css",
  "components/AuthShell.module.css",
  "components/dashboard/PremiumWorkspace.module.css",
];

test("premium templates retain original SocialRUSH charcoal/orange, never cream panels", () => {
  for (const path of modules) {
    const css = read(path);
    assert.doesNotMatch(css, /#(?:eeeae0|faf8f2|eae4d7|eeeadf|e5e1d5|dad7cb)\b/i, path);
    assert.match(css, /#(?:ff7600|ff8a1c|ff9a2e|ffad69|ffb454)\b/i, path);
  }
});

test("the preview, auth panel, services guide and final CTA are intentionally dark", () => {
  assert.match(read(modules[0]), /\.preview \{[^}]*#101219/);
  assert.match(read(modules[3]), /\.visual \{[^}]*#101219/);
  assert.match(read(modules[2]), /\.discoveryGuide \{[^}]*#101219/);
  assert.match(read(modules[1]), /\.home :global\(\.final-cta\) \{[^}]*#101219/);
});

test("homepage discovery and ordering handoff are preserved independently of theme CSS", () => {
  const hero = read("components/marketing/PremiumHomeHero.tsx");
  const homepage = read("components/marketing/PremiumHomepage.tsx");
  const services = read("components/marketing/services/ServicesCatalog.tsx");
  assert.match(hero, /href="#order-demo"/);
  assert.match(hero, /href="#services"/);
  assert.match(homepage, /calculateServiceTotal\(selected\.code, quantity\)/);
  assert.match(homepage, /\/dashboard\/new-order/);
  assert.match(services, /orderHref/);
});
