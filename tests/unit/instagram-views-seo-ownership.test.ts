import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getServiceById } from "../../lib/smm-service-catalog.ts";
import { getIndiaServiceMetadata, getIndiaServicePage } from "../../lib/seo/india-service-pages.ts";
import { canonicalIndiaServicePaths } from "../../lib/seo/canonical-india-services.ts";

const page = readFileSync("app/(india-seo-services)/buy-instagram-views-india/page.tsx", "utf8");
const canonicalRoute = readFileSync("app/(seo-services)/[service]/page.tsx", "utf8");
const guide = readFileSync("components/seo/InstagramViewsBuyingGuide.tsx", "utf8");
const schemaHelper = readFileSync("components/seo/IndiaCommercialServiceJsonLd.tsx", "utf8");

test("Instagram Views remains one crawlable canonical destination with buyer-first intent", () => {
  const meta = getIndiaServiceMetadata("buy-instagram-views-india", "/instagram-views");
  assert.equal(canonicalIndiaServicePaths["buy-instagram-views-india"], "/instagram-views");
  assert.equal(meta.alternates?.canonical, "https://www.getsocialrush.com/instagram-views");
  assert.match(JSON.stringify(meta.title), /Buy Instagram Views India/);
  assert.match(meta.description ?? "", /Buy Instagram views in India with live INR pricing when available/);
  assert.match(page, /<InstagramViewsBuyingGuide \/>/);
  assert.match(guide, /where to buy Instagram views/);
  assert.match(guide, /Before you buy Instagram views in India/);
  assert.match(page, /"@type":"FAQPage"/);
});

test("Instagram Views SEO content respects catalog and does not invent live availability", () => {
  const service = getServiceById("instagram-views");
  assert.equal(service?.deliveryTime, "1-3 days");
  assert.equal(service?.refillPolicy, "Refill eligible");
  assert.equal(getIndiaServicePage("buy-instagram-views-india").delivery, "1–3 days");
  assert.match(page, /Catalog listing/);
  assert.match(page, /Catalog rate/);
  assert.match(page, /Are viewers guaranteed to be from India/);
  assert.match(guide, /not a live quote or a guarantee/);
  assert.match(guide, /do not guarantee Indian viewers/);
  assert.match(guide, /1–3 day delivery estimate/);
  assert.match(guide, /may violate Instagram rules/);
});

test("Instagram Views has only one commercial schema/breadcrumb owner and no speculative InStock offer", () => {
  assert.doesNotMatch(page, /IndiaCommercialServiceJsonLd/);
  assert.doesNotMatch(page, /MoneyPageAuthorityLinks/);
  assert.match(canonicalRoute, /IndiaCommercialServiceJsonLd code="instagram-views"[^>]*includeOffer=\{false\}/);
  assert.match(schemaHelper, /includeOffer = true/);
  assert.match(schemaHelper, /includeOffer && service && service\.pricePer1000 > 0/);
});
