import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../../app/youtube-growth-india/page.tsx", import.meta.url), "utf8");

test("YouTube growth hub owns explicit comparison intent", () => {
  assert.match(page, /title: "YouTube Growth Services India \| Subscribers, Views & Watch Hours"/);
  assert.match(page, /YouTube Growth Services India: compare subscribers, views and watch hours\./);
  assert.match(page, /href="\/youtube-subscribers"/);
  assert.match(page, /href="\/youtube-views"/);
});

test("YouTube growth hub exposes FAQ and breadcrumb structured data", () => {
  assert.match(page, /BreadcrumbJsonLd/);
  assert.match(page, /"@type": "FAQPage"/);
  assert.match(page, /dangerouslySetInnerHTML=\{\{ __html: faqSchema \}\}/);
});

test("YouTube growth hub preserves monetization disclaimer", () => {
  assert.match(page, /does not guarantee YouTube monetization, revenue, ranking, recommendations or channel approval/);
});
