import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { activeSmmServices } from "../../lib/smm-service-catalog.ts";
import { canonicalIndiaServicePaths, getIndiaServiceMetadata, indiaServiceSlugs } from "../../lib/seo/india-service-pages.ts";
import { countryServicePaths, getPublishedCountryServicePage, publishedCountryServicePages } from "../../lib/seo/international.ts";
import { hasUniquePrimaryTargets, indexableInternationalPaths, isPublishedInternationalPath, protectedIndiaSeoPaths, seoIntentMap } from "../../lib/seo/architecture.ts";
import { createCountryServiceSchema } from "../../lib/seo/country-service-schema.ts";
import { contentClusters } from "../../lib/seo/content-clusters.ts";

const redirectedServicePaths = new Set([
  "/services/instagram-followers",
  "/services/instagram-likes",
  "/services/instagram-views",
  "/services/youtube-subscribers",
  "/services/youtube-likes",
  "/services/youtube-views",
]);

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

test("platform hubs link directly to canonical service pages", () => {
  const hubLinks = Object.values(contentClusters).flatMap((cluster) => cluster.serviceLinks.map((link) => link.href));
  for (const href of hubLinks) {
    assert.equal(redirectedServicePaths.has(href), false, `${href} should not require an internal redirect`);
  }
});

test("priority India pages keep Search Console query language in metadata", () => {
  const youtube = getIndiaServiceMetadata("buy-youtube-subscribers-india", "/youtube-subscribers");
  const twitter = getIndiaServiceMetadata("buy-twitter-followers-india", "/twitter-followers");
  const facebook = getIndiaServiceMetadata("buy-facebook-followers-india", "/buy-facebook-followers-india");
  const instagramSource = readFileSync(new URL("../../app/buy-instagram-followers-india/page.tsx", import.meta.url), "utf8");

  assert.match(String(youtube.title && typeof youtube.title === "object" ? youtube.title.absolute : youtube.title), /Buy YouTube Subscribers India/);
  assert.match(youtube.description ?? "", /live INR pricing/i);
  assert.match(String(twitter.title && typeof twitter.title === "object" ? twitter.title.absolute : twitter.title), /Buy Twitter \(X\) Followers India/);
  assert.match(twitter.description ?? "", /Buy Twitter\/X followers in India/i);
  assert.match(String(facebook.title && typeof facebook.title === "object" ? facebook.title.absolute : facebook.title), /Buy Facebook Followers India/);
  assert.match(facebook.description ?? "", /live INR pricing/i);
  assert.match(instagramSource, /Buy Instagram Followers India \| Live ₹ Plans \| SocialRUSH/);
  assert.match(instagramSource, /How much do Instagram followers cost in India\?/);
  assert.match(String(youtube.alternates?.canonical), /\/youtube-subscribers$/);
  assert.match(String(twitter.alternates?.canonical), /\/twitter-followers$/);
  assert.match(String(facebook.alternates?.canonical), /\/buy-facebook-followers-india$/);
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
