import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 48 explicitly allows OAI-SearchBot while protecting private routes", () => {
  const robots = read("app/robots.txt/route.ts");
  assert.match(robots, /User-agent: OAI-SearchBot/);
  assert.match(robots, /Allow: //);
  for (const path of ["/dashboard", "/admin", "/api/"]) {
    assert.ok(robots.includes(`Disallow: ${path}`));
  }
});

test("Phase 48 exposes source-backed quick answers on shared canonical service pages", () => {
  const answer = read("components/seo/AeoQuickAnswer.tsx");
  const landing = read("components/marketing/services/SeoServiceLandingPage.tsx");
  assert.match(answer, /data-aeo-answer="service-summary"/);
  assert.match(answer, /No social media password is required/);
  assert.match(answer, /pricePer1000/);
  assert.match(answer, /deliveryTime/);
  assert.match(answer, /refillPolicy/);
  assert.match(landing, /import AeoQuickAnswer/);
  assert.match(landing, /<AeoQuickAnswer/);
});

test("Phase 48 keeps Service and BlogPosting schema tied to one Organization entity", () => {
  const service = read("lib/seo/service-landing-pages.ts");
  const india = read("components/seo/IndiaCommercialServiceJsonLd.tsx");
  const blog = read("app/blog/[slug]/page.tsx");
  const layout = read("app/layout.tsx");
  assert.match(layout, /\/#organization/);
  assert.match(service, /"@id": `\$\{SEO_SITE_URL\}\/\#organization`/);
  assert.match(india, /"@id": `\$\{SEO_SITE_URL\}\/\#organization`/);
  assert.match(blog, /publisher: \{\s*"@id": `\$\{SEO_SITE_URL\}\/\#organization`/);
});

test("Phase 48 exposes an AEO command center without claiming AI rankings or citations", () => {
  const sidebar = read("components/admin/AdminSidebar.tsx");
  const page = read("app/admin/seo/aeo/page.tsx");
  const model = read("lib/seo/answer-engine.ts");
  assert.match(sidebar, /SEO AEO/);
  assert.match(sidebar, /\/admin\/seo\/aeo/);
  assert.match(page, /Answer Engine Command Center/);
  assert.match(model, /does not claim placement, citations, rankings or traffic/);
  assert.match(model, /Do not create AI-only doorway pages/);
});

test("Phase 48 production audit checks crawler, answer and entity readiness", () => {
  const audit = read("scripts/seo-aeo-audit.mjs");
  assert.match(audit, /OAI-SearchBot/);
  assert.match(audit, /data-aeo-answer="service-summary"/);
  assert.match(audit, /#organization/);
  assert.match(audit, /BlogPosting/);
});
