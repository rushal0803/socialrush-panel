import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 2 policy layout renders static crawlable headings and complete section text", () => {
  const page = read("components/marketing/LegalPageLayout.tsx");
  assert.doesNotMatch(page, /"use client"|framer-motion|whileInView|repeat:\s*Infinity/);
  assert.match(page, /<h1\b/);
  assert.match(page, /<h2\b/);
  assert.match(page, /sections\.map/);
  assert.match(page, /section\.body\.map/);
  assert.match(page, /section\.bullets\.map/);
  assert.match(page, /tableOfContentsItems\.map/g);
  assert.match(page, /#07080D/);
  assert.match(page, /#FF7600/);
  // Low-opacity white hover affordances are intentional on dark surfaces; prohibit light panels.
  assert.doesNotMatch(page, /bg-white\/(?:[6-9][0-9]|100)|bg-(?:amber|orange)-200/);
});

test("Phase 2 public reviews never invent entries or hide the empty state", () => {
  const page = read("components/reviews/PublicReviewsSection.tsx");
  assert.match(page, /getPublicReviews\(limit\)/);
  assert.match(page, /reviews\.length === 0/);
  assert.match(page, /No published customer reviews yet/);
  assert.match(page, /reviews\.map/);
  assert.match(page, /review\.rating/);
  assert.match(page, /review\.display_name/);
});

test("Phase 2 support keeps all six customer help routes", () => {
  const page = read("app/support/page.tsx");
  for (const route of ["/faq#delivery", "/faq#payments", "/refund-policy", "/trust", "/services", "/contact"]) {
    assert.ok(page.includes('href: "' + route + '"'), route);
  }
  assert.match(page, /SupportJourney variant="public"/);
  assert.match(page, /topics\.map/);
});

test("Phase 2 creator tools change only hub visuals and keep real tools routing", () => {
  const page = read("components/marketing/tools/ToolsContent.tsx");
  assert.match(page, /function HubPremium\(\)/);
  assert.match(page, /visibleTools\.map/);
  assert.match(page, /toolBySlug\[activeSlug\]/);
  assert.match(page, /#101219/);
  assert.match(page, /#FF9A2E/);
});

test("Phase 2 admin navigation remains complete and only cosmetic", () => {
  const nav = read("components/admin/AdminSidebar.tsx");
  const header = read("components/admin/AdminHeader.tsx");
  assert.doesNotMatch(nav, /framer-motion|layoutId/);
  for (const route of ["/admin/dashboard", "/admin/orders", "/admin/payments", "/admin/crm", "/admin/seo/indexation", "/admin/settings", "/admin/support"]) {
    assert.ok(nav.includes('"' + route + '"'), route);
  }
  assert.match(nav, /items:\s*links\.slice\(0,\s*9\)/);
  assert.match(nav, /items:\s*links\.slice\(9,\s*21\)/);
  assert.match(nav, /items:\s*links\.slice\(21\)/);
  assert.match(nav, /aria-current/);
  assert.doesNotMatch(header, /System online/);
});


test("Phase 2 actual Terms, Privacy and Refund routes retain copy and dark brand surfaces", () => {
  const terms = read("components/marketing/TermsCenter.tsx");
  const privacy = read("app/privacy-policy/page.tsx");
  const refunds = read("components/marketing/RefundPolicyPage.tsx");
  assert.match(terms, /const sections:/);
  assert.match(terms, /sections\.map/);
  assert.match(terms, /bg-\[#07080D\]/);
  assert.match(privacy, /export const metadata = createPageMetadata/);
  assert.match(privacy, /path: "\/privacy-policy"/);
  assert.match(privacy, /bg-\[#0C0E14\]/);
  assert.match(refunds, /function RefundPolicyPage/);
  assert.match(refunds, /bg-\[#07080D\]/);
  for (const page of [terms, privacy, refunds]) {
    assert.doesNotMatch(page, /bg-\[#eeeae0\]|bg-\[#eeeadf\]|bg-\[#eae4d7\]/i);
  }
});


test("Phase 2 creator-tools preview cards exclude alternate pastel hues", () => {
  const page = read("components/marketing/tools/ToolsContent.tsx");
  const from = page.lastIndexOf("function Preview(");
  const to = page.indexOf("function HubPremium()", from);
  assert.ok(from >= 0 && to > from);
  const previews = page.slice(from, to);
  assert.doesNotMatch(previews, /(?:pink|violet|cyan|sky|indigo|red|emerald)-[0-9]+/);
  assert.match(previews, /#101219/);
  assert.match(previews, /#FF7600/);
  assert.match(previews, /#FF9A2E/);
});
