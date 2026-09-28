import test from "node:test";
import assert from "node:assert/strict";
import { absoluteSeoUrl, canPublishCountryServicePage, countryHubAlternates, createCountryHubMetadata, getInternationalMarket, internationalHubPaths, internationalMarkets } from "../../lib/seo/international.ts";

test("international hubs use valid locale codes and absolute self-referential URLs", () => {
  for (const path of internationalHubPaths) {
    const market = getInternationalMarket(path.slice(1));
    assert.ok(market);
    assert.match(market.hreflang, /^en-(US|GB|CA|AU|AE|SG)$/);
    assert.equal(countryHubAlternates()[market.hreflang], absoluteSeoUrl(path));
  }
});

test("hub alternate cluster is reciprocal and contains only published hubs", () => {
  const alternates = countryHubAlternates();
  assert.equal(Object.keys(alternates).length, 6);
  assert.equal(Object.values(alternates).every((url) => internationalHubPaths.some((path) => url === absoluteSeoUrl(path))), true);
  assert.equal("en-IN" in alternates, false);
});

test("future country service pages cannot be published as placeholders", () => {
  const market = getInternationalMarket("us")!;
  assert.equal(canPublishCountryServicePage({ market, serviceSlug: "buy-instagram-followers", title: "", description: "", h1: "", intro: "", enabled: true, indexable: true }), false);
});


test("international hub metadata uses natural market labels and one SocialRUSH suffix", () => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const market of internationalMarkets) {
    const metadata = createCountryHubMetadata(market);
    const title = (metadata.title as { absolute?: string }).absolute || "";
    const description = String(metadata.description || "");
    assert.match(title, /Social Media Growth Services in /);
    assert.equal(title.match(/SocialRUSH/g)?.length, 1);
    assert.ok(title.includes(market.seoLocative));
    assert.ok(description.includes(market.searchLabel));
    assert.ok(description.includes(market.currency));
    titles.add(title);
    descriptions.add(description);
  }
  assert.equal(titles.size, internationalMarkets.length);
  assert.equal(descriptions.size, internationalMarkets.length);
});
