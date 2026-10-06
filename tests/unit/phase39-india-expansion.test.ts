import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  hasUniqueIndiaRegionalClusters,
  hasUniqueIndiaRegionalLocations,
  indiaExpansionPolicy,
  indiaRegionalClusters,
} from "../../lib/seo/india-expansion.ts";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 39 consolidates regional India discovery on the national authority hub", () => {
  assert.equal(hasUniqueIndiaRegionalClusters(), true);
  assert.equal(hasUniqueIndiaRegionalLocations(), true);
  assert.equal(indiaRegionalClusters.length, 8);

  for (const cluster of indiaRegionalClusters) {
    assert.equal(cluster.primaryPath, "/social-media-growth-india");
    assert.equal(cluster.pageDecision, "covered-by-national-hub");
    assert.ok(cluster.locations.length >= 2);
  }
});

test("Phase 39 requires evidence and unique content before any city or state landing page", () => {
  assert.match(indiaExpansionPolicy.dedicatedPageRequirements.join(" "), /Verified query demand/);
  assert.match(indiaExpansionPolicy.dedicatedPageRequirements.join(" "), /Unique regional information/);
  assert.match(indiaExpansionPolicy.prohibitedPatterns.join(" "), /City-name clones/);
  assert.match(indiaExpansionPolicy.prohibitedPatterns.join(" "), /Unsupported local-office/);
});

test("Phase 39 surfaces regional discovery without claiming separate city pricing or offices", () => {
  const page = read("app/social-media-growth-india/page.tsx");
  const component = read("components/marketing/IndiaRegionalExpansion.tsx");
  const discovery = read("components/marketing/IndiaGrowthDiscovery.tsx");

  assert.match(page, /IndiaRegionalExpansion/);
  assert.match(page, /Does SocialRUSH have separate city pricing/);
  assert.match(component, /not physical SocialRUSH office locations or separate local teams/);
  assert.match(discovery, /social-media-growth-india#india-regional-growth/);
});

test("Phase 39 checker blocks unapproved city doorway routes", () => {
  const checker = read("scripts/seo-india-expansion-check.ts");
  assert.match(checker, /Unapproved city\/location route detected/);
  assert.match(checker, /verified demand and unique regional content/);
  assert.match(checker, /no unapproved city doorway routes found/);
});
