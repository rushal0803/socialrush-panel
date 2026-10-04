import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 27 exposes the SEO content command center in admin", () => {
  const sidebar = read("components/admin/AdminSidebar.tsx");
  const page = read("app/admin/seo/content/page.tsx");
  assert.match(sidebar, /SEO Content/);
  assert.match(sidebar, /\/admin\/seo\/content/);
  assert.match(page, /Editorial Content Command Center/);
});

test("Phase 27 classifies TikTok content into the TikTok authority graph", () => {
  const blog = read("components/marketing/blog/blogData.ts");
  const clusters = read("lib/seo/content-clusters.ts");
  assert.match(blog, /"tiktok" \| "telegram" \| null/);
  assert.match(blog, /text\.includes\("tiktok"\)\) return "tiktok"/);
  const tiktokStart = clusters.indexOf("  tiktok: {");
  const telegramStart = clusters.indexOf("  telegram: {");
  assert.ok(tiktokStart >= 0 && telegramStart > tiktokStart);
  const tiktokBlock = clusters.slice(tiktokStart, telegramStart);
  assert.doesNotMatch(tiktokBlock, /is-it-safe-to-buy-telegram-members/);
  assert.match(tiktokBlock, /best-social-media-growth-services-for-indian-creators/);
});

test("Phase 27 content engine uses repository evidence and does not invent search metrics", () => {
  const source = read("lib/seo/content-engine.ts");
  assert.match(source, /REVIEW_AFTER_DAYS = 120/);
  assert.match(source, /hasHubLink/);
  assert.match(source, /hasServiceLink/);
  assert.match(source, /plannedImplementationsMissing/);
  assert.match(source, /does not claim Google rankings, impressions, clicks or search volume/);
});

test("Phase 27 validates cluster guides and approved gap targets", () => {
  const checker = read("scripts/seo-content-engine-check.ts");
  assert.match(checker, /cluster guide is not backed by a published article/);
  assert.match(checker, /candidate\.decision === "defer"/);
  assert.match(checker, /unrelated Telegram guide leaked into the TikTok content cluster/);
});
