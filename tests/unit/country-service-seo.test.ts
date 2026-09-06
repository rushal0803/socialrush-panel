import test from "node:test";
import assert from "node:assert/strict";
import { countryServiceAlternates, countryServicePaths, getPublishedCountryServicePage, publishedCountryServicePages } from "../../lib/seo/international.ts";
import { activeSmmServices } from "../../lib/smm-service-catalog.ts";
test("only explicit enabled country-service combinations publish", () => {
  assert.equal(countryServicePaths.length, 8);
  assert.ok(getPublishedCountryServicePage("us", "buy-instagram-followers"));
  assert.equal(getPublishedCountryServicePage("sg", "buy-instagram-followers"), undefined);
  assert.equal(getPublishedCountryServicePage("us", "buy-fake-service"), undefined);
});
test("every published page maps to a safe static catalog service", () => {
  for (const page of publishedCountryServicePages) {
    const service = activeSmmServices.find((candidate) => candidate.code === page.catalogServiceCode);
    assert.ok(service); assert.equal(service.requiresLiveCatalogFacts, undefined); assert.ok(service.minQuantity > 0);
    assert.ok(countryServicePaths.includes(`/${page.market.slug}/${page.serviceSlug}`));
  }
});
test("hreflang clusters contain only real reciprocal equivalents", () => {
  for (const page of publishedCountryServicePages) {
    const alternates = countryServiceAlternates(page);
    assert.equal(alternates[page.market.hreflang]?.endsWith(`/${page.market.slug}/${page.serviceSlug}`), true);
    for (const [locale, href] of Object.entries(alternates)) assert.ok(publishedCountryServicePages.some((candidate) => candidate.market.hreflang === locale && href.endsWith(`/${candidate.market.slug}/${candidate.serviceSlug}`)));
  }
});
