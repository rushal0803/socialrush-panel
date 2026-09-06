import test from "node:test";
import assert from "node:assert/strict";
import { activeSmmServices } from "../../lib/smm-service-catalog.ts";
import { canonicalIndiaServicePaths, indiaServiceSlugs } from "../../lib/seo/india-service-pages.ts";
import { countryServicePaths, getPublishedCountryServicePage, publishedCountryServicePages } from "../../lib/seo/international.ts";
import { hasUniquePrimaryTargets, indexableInternationalPaths, isPublishedInternationalPath, protectedIndiaSeoPaths, seoIntentMap } from "../../lib/seo/architecture.ts";
import { createCountryServiceSchema } from "../../lib/seo/country-service-schema.ts";

test("every deliberate SEO intent has exactly one preferred canonical target", () => {
  assert.equal(hasUniquePrimaryTargets(), true);
  assert.equal(seoIntentMap.every((intent) => intent.primaryTarget.startsWith("/") && !intent.primaryTarget.includes("?")), true);
});

test("protected India service targets remain present and canonical", () => {
  assert.equal(protectedIndiaSeoPaths.length, indiaServiceSlugs.length);
  for (const slug of indiaServiceSlugs) {
    const path = canonicalIndiaServicePaths[slug];
    assert.ok(protectedIndiaSeoPaths.includes(path));
    assert.ok(seoIntentMap.some((intent) => intent.primaryTarget === path && intent.protected));
  }
});

test("international routes are allowlisted, catalog-backed, and have no unpublished variants", () => {
  assert.deepEqual([...indexableInternationalPaths].sort(), [...new Set([...indexableInternationalPaths])].sort());
  for (const page of publishedCountryServicePages) {
    const path = `/${page.market.slug}/${page.serviceSlug}`;
    assert.ok(countryServicePaths.includes(path));
    assert.equal(isPublishedInternationalPath(path), true);
    assert.ok(activeSmmServices.some((service) => service.code === page.catalogServiceCode));
  }
  assert.equal(getPublishedCountryServicePage("sg", "buy-instagram-followers"), undefined);
  assert.equal(isPublishedInternationalPath("/sg/buy-instagram-followers"), false);
});

test("country service schema remains INR-authoritative", () => {
  for (const page of publishedCountryServicePages) {
    const service = activeSmmServices.find((candidate) => candidate.code === page.catalogServiceCode);
    assert.ok(service);
    const schema = createCountryServiceSchema(page, service);
    const offer = schema["@graph"].find((item) => item["@type"] === "Service")?.offers;
    assert.equal(offer?.priceCurrency, "INR");
    assert.notEqual(page.market.currency, "INR");
    assert.notEqual(offer?.priceCurrency, page.market.currency);
  }
});
