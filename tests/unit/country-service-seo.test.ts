import test from "node:test";
import assert from "node:assert/strict";
import { absoluteSeoUrl, countryServiceAlternates, countryServicePaths, createCountryServiceMetadata, getPublishedCountryServicePage, publishedCountryServicePages } from "../../lib/seo/international.ts";
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
test("published country-service pages have isolated transactional metadata", () => {
  for (const page of publishedCountryServicePages) {
    const metadata = createCountryServiceMetadata(page);
    const canonical = absoluteSeoUrl(`/${page.market.slug}/${page.serviceSlug}`);
    const title = metadata.title as { absolute?: string };

    assert.equal(title.absolute, page.title);
    assert.equal(title.absolute?.includes("| SocialRUSH | SocialRUSH"), false);
    assert.equal(title.absolute?.match(/SocialRUSH/g)?.length, 1);
    assert.equal(metadata.alternates?.canonical, canonical);
    assert.deepEqual(metadata.alternates?.languages, countryServiceAlternates(page));
    assert.equal(metadata.openGraph?.title, page.title);
    assert.equal(metadata.openGraph?.description, page.description);
    assert.equal(metadata.openGraph?.url, canonical);
    assert.equal(metadata.openGraph?.locale, page.market.hreflang.replace("-", "_"));
    assert.equal(metadata.openGraph?.siteName, "SocialRUSH");
    assert.equal((metadata.openGraph as { type?: string } | undefined)?.type, "website");
    assert.deepEqual(metadata.openGraph?.images, [{ url: absoluteSeoUrl("/og-image.png"), width: 1200, height: 630, alt: `SocialRUSH ${page.h1}` }]);
    assert.deepEqual(metadata.twitter, { card: "summary_large_image", title: page.title, description: page.description, images: [absoluteSeoUrl("/og-image.png")] });
    assert.deepEqual(metadata.robots, { index: true, follow: true });
  }
});
