import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 29 centralizes money-page authority links instead of hard-coding URL groups", () => {
  const component = read("components/seo/MoneyPageAuthorityLinks.tsx");
  assert.match(component, /getMoneyPageAuthorityTargets/);
  assert.doesNotMatch(component, /\/services\/tiktok-likes/);
  assert.doesNotMatch(component, /\/youtube-watch-hours"/);
});

test("Phase 29 excludes catalog-only noindex TikTok paths from organic authority", () => {
  const graph = read("lib/seo/authority-graph.ts");
  for (const path of [
    "/services/tiktok-likes",
    "/services/tiktok-views",
    "/services/tiktok-custom-comments",
    "/services/tiktok-story-views",
    "/services/tiktok-saves",
  ]) {
    assert.match(graph, new RegExp(path.replaceAll("/", "\\/")));
  }
  assert.match(graph, /excluded\.has\(canonical\)/);
  assert.match(graph, /excluded\.has\(from\) \|\| excluded\.has\(to\)/);
});

test("Phase 29 models hub, money-page, guide and international authority edges", () => {
  const graph = read("lib/seo/authority-graph.ts");
  for (const relation of [
    "hub-to-service",
    "hub-to-guide",
    "money-to-hub",
    "money-to-sibling",
    "money-to-guide",
    "guide-to-hub",
    "guide-to-service",
    "catalog-to-country",
    "country-to-service",
    "service-to-country-hub",
  ]) {
    assert.match(graph, new RegExp(relation));
  }
  assert.match(graph, /orphanServices/);
});

test("Phase 29 exposes the authority graph in admin and CI", () => {
  const sidebar = read("components/admin/AdminSidebar.tsx");
  const page = read("app/admin/seo/authority/page.tsx");
  const checker = read("scripts/seo-authority-graph-check.ts");
  assert.match(sidebar, /SEO Authority/);
  assert.match(sidebar, /\/admin\/seo\/authority/);
  assert.match(page, /Internal Authority Command Center/);
  assert.match(checker, /orphan service nodes/);
  assert.match(checker, /commercial alias leaked into authority graph/);
  assert.match(checker, /noindex catalog path leaked into authority graph/);
});
