import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { absoluteSeoUrl, canPublishCountryServicePage, countryHubAlternates, countryServiceAlternates, countryServicePaths, createCountryHubMetadata, createCountryServiceMetadata, getCountryHubIntent, getInternationalMarket, internationalHubPaths, internationalMarkets, publishedCountryServicePages } from "../../lib/seo/international.ts";

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


test("international hubs expose unique market-specific search intent", () => {
  const titles = new Set<string>();
  const summaries = new Set<string>();

  for (const market of internationalMarkets) {
    const intent = getCountryHubIntent(market);
    assert.ok(intent.title.includes(market.searchLabel) || intent.summary.includes(market.searchLabel) || intent.summary.includes(market.name));
    assert.ok(intent.summary.includes(market.currency));
    assert.equal(intent.planningChecks.length, 3);
    assert.ok(intent.planningChecks.some((check) => check.includes("INR")));
    assert.ok(intent.serviceIntro.includes(market.searchLabel) || intent.serviceIntro.includes(market.name));

    const publishedForMarket = publishedCountryServicePages.filter((page) => page.market.slug === market.slug);
    assert.ok(publishedForMarket.length >= 3);
    for (const page of publishedForMarket) {
      const label = page.catalogServiceCode === "instagram-followers"
        ? "Instagram followers"
        : page.catalogServiceCode === "youtube-subscribers"
          ? "YouTube subscribers"
          : page.catalogServiceCode === "youtube-views"
            ? "YouTube views"
            : page.catalogServiceCode === "linkedin-followers"
              ? "LinkedIn followers"
              : "";
      if (label) assert.ok(intent.serviceIntro.includes(label));
    }

    titles.add(intent.title);
    summaries.add(intent.summary);
  }

  assert.equal(titles.size, internationalMarkets.length);
  assert.equal(summaries.size, internationalMarkets.length);
});


test("international hub and service paths are unique and never overlap", () => {
  assert.equal(new Set(internationalHubPaths).size, internationalHubPaths.length);
  assert.equal(new Set(countryServicePaths).size, countryServicePaths.length);
  const overlap = countryServicePaths.filter((path) => internationalHubPaths.includes(path as (typeof internationalHubPaths)[number]));
  assert.deepEqual(overlap, []);
});

test("every published international service has a self canonical and reciprocal same-service hreflang cluster", () => {
  for (const page of publishedCountryServicePages) {
    const path = `/${page.market.slug}/${page.serviceSlug}`;
    assert.ok(countryServicePaths.includes(path));

    const metadata = createCountryServiceMetadata(page);
    assert.equal(metadata.alternates?.canonical, absoluteSeoUrl(path));

    const alternates = countryServiceAlternates(page);
    assert.equal(alternates[page.market.hreflang], absoluteSeoUrl(path));

    const expectedPeers = publishedCountryServicePages.filter(
      (candidate) => candidate.catalogServiceCode === page.catalogServiceCode,
    );
    assert.equal(Object.keys(alternates).length, expectedPeers.length);

    for (const peer of expectedPeers) {
      assert.equal(
        alternates[peer.market.hreflang],
        absoluteSeoUrl(`/${peer.market.slug}/${peer.serviceSlug}`),
      );
    }

    for (const href of Object.values(alternates)) {
      assert.equal(href.includes("?"), false);
      assert.equal(href.includes("#"), false);
    }
  }
});

test("localized international service metadata stays unique across published pages", () => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  const canonicals = new Set<string>();

  for (const page of publishedCountryServicePages) {
    const metadata = createCountryServiceMetadata(page);
    const title = (metadata.title as { absolute?: string }).absolute || "";
    const description = String(metadata.description || "");
    const canonical = String(metadata.alternates?.canonical || "");

    assert.ok(title.includes(page.market.seoLocative));
    assert.ok(description.includes(page.market.searchLabel));
    assert.ok(description.includes(page.market.currency));
    assert.ok(canonical.endsWith(`/${page.market.slug}/${page.serviceSlug}`));

    titles.add(title);
    descriptions.add(description);
    canonicals.add(canonical);
  }

  assert.equal(titles.size, publishedCountryServicePages.length);
  assert.equal(descriptions.size, publishedCountryServicePages.length);
  assert.equal(canonicals.size, publishedCountryServicePages.length);
});

test("sitemap keeps both international hubs and published country service paths in discovery", () => {
  const source = fs.readFileSync("app/sitemap.xml/route.ts", "utf8");
  assert.match(source, /\.\.\.internationalHubPaths/);
  assert.match(source, /\.\.\.countryServicePaths/);
});
