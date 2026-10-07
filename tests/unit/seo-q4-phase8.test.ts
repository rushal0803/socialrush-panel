import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 8 sharpens About brand and platform intent", () => {
  const page = read("app/about/page.tsx");
  assert.match(page, /title: "About SocialRUSH \| Social Media Growth Platform India"/);
  assert.match(page, /About SocialRUSH:<br \/><span[^>]*>social media growth made clearer\.<\/span>/);
});

test("Phase 8 makes Contact intent explicit without changing the support form flow", () => {
  const page = read("app/contact/page.tsx");
  const content = read("components/marketing/contact/ContactPageContent.tsx");
  assert.match(page, /title: "Contact SocialRUSH Support \| Orders, Payments & Account Help"/);
  assert.match(content, /Contact SocialRUSH <span[^>]*>Support<\/span>/);
  assert.match(content, /fetch\("\/api\/contact"/);
});

test("Phase 8 aligns FAQ snippet and H1 with support questions", () => {
  const page = read("app/faq/page.tsx");
  const content = read("components/marketing/FaqPageContent.tsx");
  assert.match(page, /title: "SocialRUSH FAQ \| Pricing, Delivery, Refill & Payments"/);
  assert.match(content, /SocialRUSH FAQ: services, payments, delivery & refill/);
  assert.match(page, /"@type": "FAQPage"/);
});

test("Phase 8 aligns the Growth Library with India guide intent", () => {
  const page = read("app/blog/page.tsx");
  const content = read("components/marketing/blog/BlogPageContent.tsx");
  assert.match(page, /title: "Social Media Growth Guides India \| Instagram, YouTube & SEO"/);
  assert.match(content, /Social Media Growth Guides for India/);
  assert.match(page, /ContentAuthorityNavigation/);
});
