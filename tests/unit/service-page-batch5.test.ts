import test from 'node:test';
import assert from 'node:assert/strict';
import { publishedCountryServicePages, countryServiceAlternates } from '../../lib/seo/international.ts';
import { createCountryServiceFaqs, createCountryServiceSchema } from '../../lib/seo/country-service-schema.ts';
import { activeSmmServices } from '../../lib/smm-service-catalog.ts';

test('buyer guidance affects only the ten existing LinkedIn and video-view variants', () => {
  const selected = publishedCountryServicePages.filter(p => ['linkedin-followers', 'youtube-views'].includes(p.catalogServiceCode));
  assert.equal(selected.length, 10);
  assert.equal(selected.filter(p => p.catalogServiceCode === 'linkedin-followers').length, 6);
  assert.equal(selected.filter(p => p.catalogServiceCode === 'youtube-views').length, 4);
  for (const page of selected) {
    const service = activeSmmServices.find(s => s.code === page.catalogServiceCode)!;
    const faqs = createCountryServiceFaqs(page, service);
    const graph = createCountryServiceSchema(page, service)['@graph'];
    const faq = graph.find(n => n['@type'] === 'FAQPage')!;
    assert.equal(new Set(faqs.map(([q]) => q)).size, faqs.length);
    assert.deepEqual(faq.mainEntity, faqs.map(([name,text]) => ({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}})));
    const offer = graph.find(n => n['@type'] === 'Service')!.offers!;
    assert.equal(offer.priceCurrency, 'INR');
    assert.equal(offer.price, service.pricePer1000);
    assert.equal(Object.keys(countryServiceAlternates(page)).length, page.catalogServiceCode === 'linkedin-followers' ? 6 : 4);
    assert.ok(page.copy.buyerFaqs!.some(([,a]) => a.includes(page.market.currency)));
    assert.ok(page.copy.buyerFaqs!.some(([,a]) => /refill|refund/.test(a)));
    if (page.catalogServiceCode === 'linkedin-followers') {
      assert.match(page.copy.faq, /only when.*explicitly supports/);
      assert.ok(page.copy.buyerFaqs!.some(([,a]) => a.includes('earned recommendation')));
    } else {
      assert.ok(page.copy.buyerFaqs!.some(([,a]) => a.includes('valid public watch hours')));
      assert.ok(page.copy.buyerFaqs!.some(([,a]) => a.includes('Shorts, live streams or unlisted')));
    }
  }
});
