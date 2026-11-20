import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { publishedCountryServicePages, countryServiceAlternates } from '../../lib/seo/international.ts';
import { createCountryServiceFaqs, createCountryServiceSchema } from '../../lib/seo/country-service-schema.ts';
import { activeSmmServices } from '../../lib/smm-service-catalog.ts';

test('country follower and subscriber guidance preserves offer authority and action-specific eligibility', () => {
  const pages = publishedCountryServicePages.filter(p => ['instagram-followers','youtube-subscribers'].includes(p.catalogServiceCode));
  assert.equal(pages.length,12);
  for(const page of pages) {
    assert.equal(page.copy.buyerFaqs?.length,3);
    assert.equal(Object.keys(countryServiceAlternates(page)).length,6);
    const service=activeSmmServices.find(s=>s.code===page.catalogServiceCode)!;
    const faqs=createCountryServiceFaqs(page,service);
    const nodes=createCountryServiceSchema(page,service)['@graph'];
    assert.deepEqual(nodes.find(n=>n['@type']==='FAQPage')!.mainEntity,faqs.map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}})));
    assert.equal(new Set(faqs.map(([q])=>q)).size,faqs.length);
    const offer=nodes.find(n=>n['@type']==='Service')!.offers!;
    assert.equal(offer.price,service.pricePer1000);assert.equal(offer.priceCurrency,'INR');
    const answers=page.copy.buyerFaqs!.map(([,a])=>a).join(' ');
    assert.ok(answers.includes(page.market.currency));
    assert.match(answers,/does not verify/);assert.match(answers,/refill is conditional/);assert.match(answers,/refund/);
    if(page.catalogServiceCode==='youtube-subscribers') {
      assert.match(answers,/not an individual video URL/);assert.match(answers,/valid public watch hours/);assert.match(answers,/remove artificial activity/);
    } else {
      assert.match(answers,/does not make purchased followers compliant/);assert.match(answers,/account restrictions/);
    }
  }
});

test('existing country metadata, eligibility, routes and catalog owners are unchanged', () => {
  const baseline=JSON.parse(readFileSync(new URL('../fixtures/country-service-batch6-baseline.json',import.meta.url),'utf8'));
  assert.deepEqual(publishedCountryServicePages.map(p=>({path:`/${p.market.slug}/${p.serviceSlug}`,title:p.title,description:p.description,h1:p.h1,intro:p.intro,enabled:p.enabled,indexable:p.indexable,catalogServiceCode:p.catalogServiceCode})),baseline);
});
