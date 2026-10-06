import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildDigitalPrSnapshot, digitalPrAssets, digitalPrGuardrails, digitalPrLanes } from "../../lib/seo/digital-pr.ts";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 41 keeps the Digital PR registry internally consistent", () => {
  const snapshot = buildDigitalPrSnapshot();
  assert.equal(snapshot.summary.assets, 6);
  assert.equal(snapshot.summary.lanes, 4);
  assert.equal(snapshot.summary.missingLaneAssets, 0);
  assert.equal(snapshot.summary.duplicatePaths, 0);
  assert.equal(new Set(digitalPrAssets.map((asset) => asset.id)).size, digitalPrAssets.length);
  assert.equal(new Set(digitalPrAssets.map((asset) => asset.path)).size, digitalPrAssets.length);
});

test("Phase 41 uses linkable resources rather than commercial money pages", () => {
  for (const asset of digitalPrAssets) {
    assert.match(asset.path, /^\/(tools|blog)\//);
    assert.ok(asset.suggestedAnchors.length >= 3);
    for (const anchor of asset.suggestedAnchors) {
      assert.doesNotMatch(anchor, /\bbuy\b/i);
    }
  }
});

test("Phase 41 requires relevance before outreach", () => {
  for (const lane of digitalPrLanes) {
    assert.ok(lane.bestAssetIds.length >= 2);
    assert.ok(lane.qualification.length >= 3);
  }
  assert.ok(digitalPrGuardrails.some((rule) => /No PBNs/i.test(rule)));
  assert.ok(digitalPrGuardrails.some((rule) => /No paid dofollow/i.test(rule)));
  assert.ok(digitalPrGuardrails.some((rule) => /No fabricated publisher relationships/i.test(rule)));
});

test("Phase 41 exposes a factual public press resource and admin command center", () => {
  const press = read("app/press/page.tsx");
  const admin = read("app/admin/seo/digital-pr/page.tsx");
  const sidebar = read("components/admin/AdminSidebar.tsx");
  const sitemap = read("app/sitemap.xml/route.ts");

  assert.match(press, /Press & media resources/);
  assert.match(press, /Earned coverage only\./);
  assert.match(press, /fabricated customer stories/);
  assert.match(admin, /Digital PR Command Center/);
  assert.match(admin, /does not count unverified backlinks/);
  assert.match(sidebar, /SEO Digital PR/);
  assert.match(sidebar, /\/admin\/seo\/digital-pr/);
  assert.match(sitemap, /"\/press"/);
});

test("Phase 41 checker blocks missing assets and manipulative anchor tactics", () => {
  const checker = read("scripts/seo-digital-pr-check.ts");
  assert.match(checker, /Duplicate Digital PR asset paths/);
  assert.match(checker, /commercial exact-match anchor is not allowed/);
  assert.match(checker, /paid dofollow placement/);
  assert.match(checker, /private blog network/);
  assert.match(checker, /Public press page must state the earned-coverage standard/);
});
