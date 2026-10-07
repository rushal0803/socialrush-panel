import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildCommercialSearchDescription } from "../../lib/seo/search-snippets.ts";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 28 commercial descriptions front-load pricing, planning, safety and tracking", () => {
  const description = buildCommercialSearchDescription({
    serviceName: "YouTube Subscribers",
    destination: "public YouTube channel link",
  });
  assert.match(description, /live INR pricing/i);
  assert.match(description, /quantity-based totals/i);
  assert.match(description, /public YouTube channel link/i);
  assert.match(description, /no password required/i);
  assert.match(description, /dashboard tracking/i);
  assert.ok(description.length <= 180);
});

test("Phase 28 aligns Services and Packages snippets with their owned search intent", () => {
  const services = read("app/services/page.tsx");
  const packages = read("app/packages/page.tsx");
  assert.match(services, /SMM Panel India \| Compare Social Media Services & INR Plans/);
  assert.match(services, /Compare live SocialRUSH services in India/);
  assert.match(services, /INR pricing, UPI and dashboard tracking/);
  assert.match(packages, /Social Media Packages India \| Compare Prices & Quantities/);
  assert.match(packages, /by platform, service, quantity and price/);
});

test("Phase 28 exposes a SERP command center without claiming measured Google CTR", () => {
  const sidebar = read("components/admin/AdminSidebar.tsx");
  const page = read("app/admin/seo/ctr/page.tsx");
  const model = read("lib/seo/serp-ctr.ts");
  assert.match(sidebar, /SEO CTR/);
  assert.match(sidebar, /\/admin\/seo\/ctr/);
  assert.match(page, /SERP Snippet Command Center/);
  assert.match(model, /editorial heuristics/);
  assert.match(model, /does not claim measured CTR, rankings, impressions or clicks/);
});

test("Phase 28 production audit detects missing and duplicate SERP signals", () => {
  const audit = read("scripts/seo-serp-ctr-audit.mjs");
  assert.match(audit, /title is missing/);
  assert.match(audit, /meta description is missing/);
  assert.match(audit, /duplicate title across/);
  assert.match(audit, /duplicate description across/);
  assert.match(audit, /28–65 characters/);
  assert.match(audit, /90–175 characters/);
});
