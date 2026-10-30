import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCanonicalIndiaServicePath } from "../../lib/seo/canonical-india-services.ts";

const page=readFileSync("app/buy-instagram-followers-india/page.tsx","utf8");

test("Instagram Followers buying page owns its canonical and indexable metadata",()=>{
  assert.equal(getCanonicalIndiaServicePath("buy-instagram-followers-india"),"/buy-instagram-followers-india");
  assert.match(page,/alternates: \{ canonical: url \}/);
  assert.match(page,/robots: \{ index: true, follow: true \}/);
  assert.match(page,/Buy Instagram Followers India \| Pricing & Terms \| SocialRUSH/);
});

test("Rendered FAQs and JSON-LD disclose limits of follower counts",()=>{
  assert.match(page,/Does a higher follower count prove a genuine audience/);
  assert.match(page,/Displayed followers alone do not prove real audience interest/);
  assert.match(page,/faqs\.map/);
  assert.match(page,/faqSchema/);
  assert.match(page,/do not guarantee followers from India/);
});
