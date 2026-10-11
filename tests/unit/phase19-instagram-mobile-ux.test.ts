import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

const templates = [
  "app/buy-instagram-followers-india/page.tsx",
  "app/(india-seo-services)/buy-instagram-likes-india/page.tsx",
  "app/(india-seo-services)/buy-instagram-views-india/page.tsx",
  "components/marketing/InstagramCommentsLanding.tsx",
  "components/marketing/services/InstagramSavesLanding.tsx",
  "components/marketing/services/InstagramSharesLanding.tsx",
];

test("Phase 19 scopes the mobile UX layer to the six canonical Instagram money templates", () => {
  for (const path of templates) {
    const source = read(path);
    assert.match(source, /instagram-mobile-ux/, path + " must opt into the shared Instagram mobile UX layer");
    assert.match(source, /ServiceOrderStickyCta/, path + " must reuse the shared mobile order dock");
  }
});

test("Phase 19 keeps follower-only mobile rules from leaking into other money pages", () => {
  const globals = read("app/globals.css");
  assert.match(globals, /\.instagram-followers-mobile > section:first-child/);
  assert.doesNotMatch(globals, /\.instagram-followers-mobile > section:nth-child\(2\)/);
  assert.doesNotMatch(globals, /\.service-money-page > section:nth-child\(2\)/);
});

test("Phase 19 protects mobile form readability and in-page order targets", () => {
  const globals = read("app/globals.css");
  assert.match(globals, /\.instagram-mobile-ux :is\(input, select, textarea\)/);
  assert.match(globals, /font-size: 16px/);
  assert.match(globals, /#order, #packages, #pricing/);
});

test("Phase 19 hides the mobile order dock while its order builder is already visible", () => {
  const sticky = read("components/marketing/services/ServiceOrderStickyCta.tsx");
  assert.match(sticky, /IntersectionObserver/);
  assert.match(sticky, /targetVisible/);
  assert.match(sticky, /href\.startsWith\("#"\)/);
});
