import test from 'node:test';
import assert from 'node:assert/strict';
import { batch4ServiceFaqs, batch4CatalogGuides } from '../../lib/seo/service-batch4-content.ts';
import { createCatalogServiceMetadata } from '../../lib/seo/catalog-service-metadata.ts';

test('buyer guidance distinguishes the six actions without financial or survey endorsement', () => {
  assert.match(batch4ServiceFaqs['telegram-poll-votes'][1][1], /bias the result/);
  assert.match(batch4ServiceFaqs['telegram-post-reactions'][0][1], /target post permits/);
  assert.match(batch4ServiceFaqs['telegram-post-views'][1][1], /unique people/);
  assert.match(batch4ServiceFaqs['twitter-crypto-custom-comments'][0][1], /fabricated customer experiences/);
  assert.match(batch4ServiceFaqs['twitter-crypto-retweets'][0][1], /quote-post text/);
  assert.match(batch4ServiceFaqs['twitter-crypto-likes'][0][1], /investment intent/);
  for (const slug of Object.keys(batch4ServiceFaqs)) {
    const meta = createCatalogServiceMetadata(slug);
    assert.equal(meta.alternates?.canonical, `/services/${slug}`);
    assert.equal(meta.openGraph?.url, `/services/${slug}`);
    assert.ok(meta.description);
  }
});

test('catalog comparison links retain distinct destinations and bounded claims', () => {
  assert.equal(Object.keys(batch4CatalogGuides).length, 4);
  assert.match(batch4CatalogGuides.linkedin.checks[0][1], /company-Page support/);
  assert.match(batch4CatalogGuides.tiktok.checks[0][1], /local restrictions/);
  const answers = Object.values(batch4ServiceFaqs).flat().map(([,answer]) => answer);
  assert.equal(new Set(answers).size, 12);
  assert.doesNotMatch(JSON.stringify(answers), /₹\d|guaranteed revenue|guaranteed delivery/i);
});
