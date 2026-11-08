import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dedicatedCatalogBatchSlugs } from "../../lib/seo/dedicated-catalog-batch-routes.ts";
import { platformBuyerDecisions } from "../../lib/seo/platform-buyer-decisions.ts";
import { xServiceBuyerFaqs } from "../../lib/seo/x-service-buyer-faqs.ts";

test("audited X canonical owners exist and buyer questions retain distinct intent", () => {
  assert.equal(dedicatedCatalogBatchSlugs.size, 4);
  for (const slug of dedicatedCatalogBatchSlugs) {
    assert.ok(existsSync(new URL(`../../app/services/${slug}/page.tsx`, import.meta.url)));
    assert.equal(xServiceBuyerFaqs[slug].length, 2);
  }
  assert.match(xServiceBuyerFaqs['twitter-views'][0][1], /unique viewers/);
  assert.match(xServiceBuyerFaqs['twitter-crypto-followers'][0][1], /does not verify/);
  assert.equal(new Set(Object.values(xServiceBuyerFaqs).flat().map(([question]) => question)).size, 8);
});

test("platform decisions explain separate buyer requirements without fabricated prices", () => {
  assert.equal(Object.keys(platformBuyerDecisions).length, 6);
  assert.match(platformBuyerDecisions.tiktok.checks[0][1], /local restrictions/);
  assert.match(platformBuyerDecisions.youtube.checks[2][1], /billed delivery unit/);
  assert.match(platformBuyerDecisions.linkedin.checks[0][1], /company-Page support/);
  const texts = Object.values(platformBuyerDecisions).flatMap(value => value.checks.map(([, text]) => text));
  assert.equal(new Set(texts).size, 18);
  assert.doesNotMatch(JSON.stringify(texts), /₹\d|guaranteed delivery|five.star/i);
});
