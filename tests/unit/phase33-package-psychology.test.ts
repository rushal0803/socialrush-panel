import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getPackageChoicePresentation } from "../../lib/cro/package-psychology.ts";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 33 uses neutral package tiers instead of popularity claims", () => {
  const engine = read("lib/package-engine.ts");
  assert.match(engine, /label: "Starter"/);
  assert.match(engine, /label: "Balanced"/);
  assert.match(engine, /label: "Scale"/);
  assert.match(engine, /label: "High Volume"/);
  assert.doesNotMatch(engine, /Most Popular|Best Seller|Limited Time/i);
});

test("Phase 33 package psychology explains the recommendation without fake social proof", () => {
  const psychology = read("lib/cro/package-psychology.ts");
  assert.match(psychology, /Balanced choice/);
  assert.match(psychology, /middle-ground recommendation, not a claim about customer behavior/);
  assert.match(psychology, /Same catalog rate per 1K across these tiers/);
  assert.match(psychology, /Lowest verified unit rate in this package set/);
  assert.match(psychology, /Verified saving/);
  assert.doesNotMatch(psychology, /most popular|best seller|only \d+ left|limited time/i);
});

test("Phase 33 public and dashboard package UI share evidence-based choice architecture", () => {
  const page = read("components/marketing/packages/PremiumPackagesPageContent.tsx");
  const dashboard = read("app/dashboard/packages/premium-page.tsx");
  assert.match(page, /data-package-choice-guide/);
  assert.match(page, /data-package-featured/);
  assert.match(page, /The highlighted tier is a middle-ground recommendation, not a popularity claim/);
  assert.match(page, /Evidence-based choices/);
  assert.match(page, /No fake popularity, scarcity or invented best-value badge/);
  assert.match(page, /Choose balanced/);
  assert.doesNotMatch(page, />Most popular</i);
  assert.match(dashboard, /PremiumPackagesPageContent/);
});

test("Phase 33 legacy merchandising also avoids unsupported popularity and value badges", () => {
  const merchandising = read("lib/package-merchandising.ts");
  const bigPackages = read("lib/big-packages.ts");
  const legacyPage = read("components/marketing/packages/PackagesPageContent.tsx");
  assert.match(merchandising, /Balanced Choice/);
  assert.match(merchandising, /tier: "Scale"/);
  assert.doesNotMatch(merchandising, /Most Popular|Best Value/);
  assert.match(bigPackages, /discountBadge:index===1\?"Balanced Choice"/);
  assert.match(bigPackages, /discountBadge:undefined/);
  assert.doesNotMatch(bigPackages, /discountBadge:index===1\?"Popular"/);
  assert.match(legacyPage, /Balanced Choice/);
  assert.doesNotMatch(legacyPage, /Best Value/);
});


test("Phase 33 recommendation is positional, not popularity evidence", () => {
  const packages = [
    { tierId: "starter" as const, recommended: false, pricePer1000Paise: 79900, savingsPaise: 0, savingsPercent: 0 },
    { tierId: "growth" as const, recommended: true, pricePer1000Paise: 79900, savingsPaise: 0, savingsPercent: 0 },
    { tierId: "pro" as const, recommended: false, pricePer1000Paise: 79900, savingsPaise: 0, savingsPercent: 0 },
    { tierId: "scale" as const, recommended: false, pricePer1000Paise: 79900, savingsPaise: 0, savingsPercent: 0 },
  ];
  const balanced = getPackageChoicePresentation(packages[1], packages);
  const starter = getPackageChoicePresentation(packages[0], packages);
  assert.equal(balanced.badge, "Balanced choice");
  assert.equal(balanced.featured, true);
  assert.match(balanced.unitRateNote ?? "", /Same catalog rate per 1K/);
  assert.equal(balanced.savingsNote, null);
  assert.equal(starter.featured, false);
});

test("Phase 33 only describes a saving when a real lower final price exists", () => {
  const discounted = {
    tierId: "growth" as const,
    recommended: true,
    pricePer1000Paise: 72000,
    savingsPaise: 7900,
    savingsPercent: 10,
  };
  const regular = {
    tierId: "starter" as const,
    recommended: false,
    pricePer1000Paise: 79900,
    savingsPaise: 0,
    savingsPercent: 0,
  };
  const presentation = getPackageChoicePresentation(discounted, [regular, discounted]);
  assert.match(presentation.savingsNote ?? "", /Verified saving: 10%/);
  assert.match(presentation.unitRateNote ?? "", /Lowest verified unit rate/);
});
