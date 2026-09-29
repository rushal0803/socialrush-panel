import test from "node:test";
import assert from "node:assert/strict";
import { internationalAuthorityMarkets, hasUniqueInternationalAuthorityLinks } from "../../lib/seo/international-authority.ts";
import { internationalMarkets, publishedCountryServicePages } from "../../lib/seo/international.ts";

test("international authority links mirror the published market inventory", () => {
  assert.equal(internationalAuthorityMarkets.length, internationalMarkets.length);
  assert.equal(hasUniqueInternationalAuthorityLinks(), true);

  for (const market of internationalAuthorityMarkets) {
    const sourceMarket = internationalMarkets.find((item) => item.slug === market.slug);
    assert.ok(sourceMarket);
    assert.equal(market.hubHref, `/${market.slug}`);
    assert.equal(market.currency, sourceMarket.currency);

    const published = publishedCountryServicePages.filter((page) => page.market.slug === market.slug);
    assert.equal(market.services.length, published.length);

    for (const service of market.services) {
      assert.ok(
        published.some(
          (page) => service.href === `/${market.slug}/${page.serviceSlug}`,
        ),
      );
    }
  }
});
