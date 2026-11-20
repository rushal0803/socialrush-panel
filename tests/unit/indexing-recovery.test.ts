import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { blogArticles, getArticleBySlug } from '../../components/marketing/blog/blogData.ts';
import { indexingRecoveryUpdates, applyIndexingRecoveryContent } from '../../components/marketing/blog/indexingRecoveryContent.ts';
import { getIndiaServiceMetadata } from '../../lib/seo/india-service-pages.ts';
import { engagementBuyerChecks, engagementBuyerFaqSchema } from '../../lib/seo/engagement-buyer-checks.ts';

const cohort: string[] = JSON.parse(readFileSync('tests/fixtures/indexing-recovery-cohort.json','utf8'));
const headings = ['readiness checklist for this specific strategy','Discovery plan for ','Trust signals that support ','30-day operating rhythm for ','Quality and safety signals for '];

test('six explicit article improvements stay inside the supplied exclusion cohort', () => {
  assert.equal(cohort.length,17);
  assert.equal(new Set(cohort).size,17);
  assert.equal(Object.keys(indexingRecoveryUpdates).length,6);
  for(const slug of Object.keys(indexingRecoveryUpdates)) {
    assert.ok(cohort.includes(`/blog/${slug}`));
    const article=getArticleBySlug(slug)!;
    assert.equal(article.updatedAt,'2026-11-09');
    assert.ok(article.sections.every(s=>!headings.some(h=>s.heading.includes(h))));
    assert.equal(new Set(article.faqs!.map(f=>f.question)).size,article.faqs!.length);
    assert.ok(article.faqs!.every(f=>!f.question.includes('plan plan')&&!f.question.includes('??')));
    assert.equal(new Set(article.relatedLinks!.map(l=>l.href)).size,article.relatedLinks!.length);
  }
  const untouched=getArticleBySlug('how-to-get-1000-youtube-subscribers')!;
  assert.equal(applyIndexingRecoveryContent(untouched),untouched);
});

test('legacy personal-brand alias remains a redirect, not a second article or sitemap owner', async () => {
  const {default:config}=await import('../../next.config.mjs');
  const redirects=await config.redirects();
  const alias='/blog/linkedin-growth-tips-for-personal-brands';
  assert.deepEqual(redirects.find((r:{source:string})=>r.source===alias),{source:alias,destination:'/blog/linkedin-growth-tips-personal-brands',permanent:true});
  assert.equal(getArticleBySlug(alias.split('/').pop()!),undefined);
  assert.equal(blogArticles.filter(a=>a.slug==='linkedin-growth-tips-personal-brands').length,1);
});

test('pricing guides contain no invented rupee rates and separate counts from outcomes',()=>{
  for(const slug of ['instagram-followers-price-in-india','youtube-views-price-in-india']) {
    const a=getArticleBySlug(slug)!;
    assert.doesNotMatch(JSON.stringify(indexingRecoveryUpdates[slug]),/₹\s*\d/);
    assert.match(a.intro,/current order review/i);
  }
  const youtube=getArticleBySlug('youtube-views-price-in-india')!;
  assert.ok(youtube.sections.some(s=>s.body.includes('advertising CPM')));
  assert.ok(youtube.sections.some(s=>s.body.includes('not evidence of valid public watch hours')));
  const safety=getArticleBySlug('how-to-increase-instagram-followers-safely-in-india')!;
  assert.match(safety.intro,/does not establish platform approval/);
});

test('business-owner and personal-brand guides have reciprocal links and different jobs',()=>{
  const owners=getArticleBySlug('linkedin-profile-growth-tips-for-business-owners')!;
  const personal=getArticleBySlug('linkedin-growth-tips-personal-brands')!;
  assert.match(owners.intro,/enquiry readiness/);
  assert.match(personal.intro,/positioning, useful posts/);
  assert.ok(owners.relatedLinks!.some(l=>l.href===`/blog/${personal.slug}`));
  assert.ok(personal.relatedLinks!.some(l=>l.href===`/blog/${owners.slug}`));
  for(const heading of ['Make your expertise verifiable on your profile','Use four repeatable post formats with distinct jobs','Measure who engages, not only how many']) assert.ok(personal.sections.some(s=>s.heading===heading));
});

test('LinkedIn Likes preserves canonical ownership and truthful post-eligibility FAQ schema',()=>{
  const metadata=getIndiaServiceMetadata('buy-linkedin-likes-india','/linkedin-likes');
  assert.equal(metadata.alternates?.canonical,'https://www.getsocialrush.com/linkedin-likes');
  const faq=engagementBuyerFaqSchema('linkedin-likes');
  assert.equal(faq.mainEntity.length,5);
  for(const [question,answer] of engagementBuyerChecks['linkedin-likes'].questions) {
    assert.ok(faq.mainEntity.some(q=>q.name===question&&q.acceptedAnswer.text===answer));
  }
  assert.match(JSON.stringify(faq),/Public visibility alone does not establish compatibility/);
  assert.match(JSON.stringify(faq),/not an independent test/);
});


test('guide CTA follows the declared intent while preserving every platform service',async()=>{
  const { getGuideServiceLinks }=await import('../../lib/seo/authority-graph.ts');
  const { contentClusters }=await import('../../lib/seo/content-clusters.ts');
  const links=getGuideServiceLinks('youtube','/blog/youtube-views-price-in-india');
  assert.equal(links[0].href,'/youtube-views');
  assert.deepEqual(new Set(links.map(l=>l.href)),new Set(contentClusters.youtube.serviceLinks.map(l=>l.href)));
  assert.equal(links.length,contentClusters.youtube.serviceLinks.length);
  assert.equal(getGuideServiceLinks('youtube','/blog/how-to-get-1000-youtube-subscribers')[0].href,'/youtube-subscribers');
});


test('rewritten Instagram guides retain contextual commercial links inside article sections',()=>{
  for(const slug of ['how-to-grow-instagram-followers-in-india','instagram-followers-price-in-india']) {
    const article=getArticleBySlug(slug)!;
    assert.ok(article.sections.some(s=>s.contextualLink?.href==='/buy-instagram-followers-india'),`${slug}: do not relocate a contextual body link only to related resources`);
  }
});
