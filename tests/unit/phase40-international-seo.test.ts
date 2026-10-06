import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  countryHubAlternates,
  countryServiceAlternates,
  getPublishedCountryServicePage,
  internationalMarkets,
  publishedCountryServicePages,
} from "../../lib/seo/international.ts";
import {
  buildInternationalSeoSnapshot,
  getCountryServiceMarketLinks,
  internationalXDefaultPolicy,
} from "../../lib/seo/international-integrity.ts";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 40 international inventory has zero integrity issues", () => {
  const snapshot = buildInternationalSeoSnapshot();
  assert.equal(snapshot.issues.length, 0);
  assert.equal(snapshot.summary.markets, internationalMarkets.length);
  assert.equal(snapshot.summary.localizedServicePages, publishedCountryServicePages.length);
  assert.ok(snapshot.summary.equivalentServiceClusters >= 4);
});

test("Phase 40 cross-market service switcher excludes the current page and uses real equivalents only", () => {
  for (const page of publishedCountryServicePages) {
    const links = getCountryServiceMarketLinks(page);
    const alternates = countryServiceAlternates(page);
    assert.equal(links.length, Object.keys(alternates).length - 1);
    assert.equal(links.some((link) => link.hreflang === page.market.hreflang), false);
    for (const link of links) {
      assert.ok(link.marketName.length > 2);
      assert.equal(alternates[link.hreflang], link.href);
    }
  }
});

test("Phase 40 does not invent an x-default without a neutral equivalent fallback", () => {
  assert.equal(internationalXDefaultPolicy.enabled, false);
  assert.equal(internationalXDefaultPolicy.fallbackPath, null);
  assert.equal(Object.hasOwn(countryHubAlternates(), "x-default"), false);
  for (const page of publishedCountryServicePages) {
    assert.equal(Object.hasOwn(countryServiceAlternates(page), "x-default"), false);
  }
});

test("Phase 40 keeps unsupported international combinations unpublished", () => {
  assert.equal(getPublishedCountryServicePage("ae", "buy-youtube-views"), undefined);
  assert.equal(getPublishedCountryServicePage("sg", "buy-youtube-views"), undefined);
  assert.equal(getPublishedCountryServicePage("us", "buy-fake-service"), undefined);
});

test("Phase 40 user-facing market links use human labels and hreflang hints", () => {
  const source = read("components/marketing/services/CountryServiceLandingPage.tsx");
  assert.match(source, /getCountryServiceMarketLinks/);
  assert.match(source, /hrefLang=\{item\.hreflang\}/);
  assert.match(source, /\{item\.marketName\}/);
  assert.doesNotMatch(source, /Object\.entries\(countryServiceAlternates\(page\)\)/);
});

test("Phase 40 exposes international integrity in admin and automated monitoring", () => {
  const sidebar = read("components/admin/AdminSidebar.tsx");
  const page = read("app/admin/seo/international/page.tsx");
  const checker = read("scripts/seo-international-integrity-check.ts");
  assert.match(sidebar, /SEO International/);
  assert.match(sidebar, /\/admin\/seo\/international/);
  assert.match(page, /International SEO Command Center/);
  assert.match(checker, /Unsupported country\/service combinations remain unpublished/);
});
