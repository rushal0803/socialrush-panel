import { test, expect } from './fixtures';
import { readFileSync } from 'node:fs';
import { getArticleBySlug } from '../../components/marketing/blog/blogData';
import { indexingRecoveryUpdates } from '../../components/marketing/blog/indexingRecoveryContent';
import { engagementBuyerChecks } from '../../lib/seo/engagement-buyer-checks';
const cohort: string[]=JSON.parse(readFileSync('tests/fixtures/indexing-recovery-cohort.json','utf8'));
const base='https://www.getsocialrush.com';
function schemaNodes(html:string) {
  const nodes:any[]=[];
  const walk=(v:any)=>{if(!v||typeof v!=='object')return;if(Array.isArray(v)){v.forEach(walk);return;}if(v['@type'])nodes.push(v);Object.values(v).forEach(walk);};
  for(const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g))walk(JSON.parse(match[1]));
  return nodes;
}

test('all 17 supplied HTML URLs retain their intended HTTP, canonical and sitemap ownership',async({request})=>{
  test.setTimeout(90000);
  const sitemap=await (await request.get('/sitemap.xml')).text();
  for(const path of cohort) {
    const response=await request.get(path,{maxRedirects:0});
    if(path==='/blog/linkedin-growth-tips-for-personal-brands') {
      expect(response.status()).toBe(308);
      expect(response.headers().location).toBe('/blog/linkedin-growth-tips-personal-brands');
      expect(sitemap).not.toContain(`<loc>${base}${path}</loc>`);
      continue;
    }
    expect(response.status(),path).toBe(200);
    expect(response.headers()['x-robots-tag']??'').not.toMatch(/noindex/);
    const html=await response.text();
    expect(html).toContain(`rel="canonical" href="${base}${path}"`);
    expect(html).not.toMatch(/name="robots" content="[^"]*noindex/);
    expect(sitemap).toContain(`<loc>${base}${path}</loc>`);
    const nodes=schemaNodes(html);
    if(path.startsWith('/blog/')) {
      const article=nodes.filter(n=>n['@type']==='BlogPosting');
      expect(article).toHaveLength(1);
      expect(article[0].url).toBe(base+path);
      expect(html).toContain('data-article-illustration');
      expect(html).toContain('Illustration only. No measured campaign results are shown.');
      expect(html).not.toContain('Live growth check');
      if(indexingRecoveryUpdates[path.split('/').pop()!]) {
        expect(article[0].dateModified).toBe('2026-11-09');
        expect(sitemap).toMatch(new RegExp(`<loc>${base}${path}</loc>\\s*<lastmod>2026-11-09</lastmod>`));
      }
    }
  }
});

for(const width of [390,1440]) {
  test.describe(`recovery content at ${width}px`,()=>{
    test.use({viewport:{width,height:900}});
    for(const slug of Object.keys(indexingRecoveryUpdates)) {
      test(`rendered article ${slug}`,async({page,request},info)=>{
        const article=getArticleBySlug(slug)!;
        const response=await page.goto(`/blog/${slug}`);
        expect(response!.status()).toBe(200);
        await expect(page.locator('h1')).toHaveCount(1);
        await expect(page.locator('[data-article-illustration]')).toContainText('Illustration only.');
        await expect(page.locator('[data-article-illustration]')).not.toContainText(/\+24%|1\.2K|Live growth check/);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',`${base}/blog/${slug}`);
        const raw=await (await request.get(`/blog/${slug}`)).text();
        const nodes=schemaNodes(raw);
        const faq=nodes.find(n=>n['@type']==='FAQPage');
        expect(nodes.filter(n=>n['@type']==='FAQPage')).toHaveLength(1);
        const initialText=await page.evaluate(html=>new DOMParser().parseFromString(html,'text/html').body.textContent??'',raw);
        for(const section of article.sections) expect(initialText).toContain(section.heading);
        for(const item of article.faqs!) {
          expect(faq.mainEntity).toContainEqual({'@type':'Question',name:item.question,acceptedAnswer:{'@type':'Answer',text:item.answer}});
          const detail=page.locator('details').filter({hasText:item.question});
          await detail.locator('summary').focus();await page.keyboard.press('Enter');
          await expect(detail).toHaveAttribute('open','');
          await expect(detail).toContainText(item.answer);
        }
        for(const href of indexingRecoveryUpdates[slug].relatedLinks!.map(l=>l.href)) {
          await expect(page.locator(`a[href="${href}"]`).first()).toBeAttached();
          expect((await request.get(href)).status(),href).toBe(200);
        }
        if(slug==='youtube-views-price-in-india') {
          const bridge=page.locator('[data-article-service-options]');
          await bridge.scrollIntoViewIfNeeded();
          const primary=bridge.getByRole('link').filter({hasText:'Primary service'});
          await expect(primary).toHaveAttribute('href','/youtube-views');
        }
        expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
        if(width===390){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:info.outputPath('article-mobile.png'),fullPage:true,animations:'disabled'});}
      });
    }
    test('LinkedIn Likes retains price authority, destination validation and one FAQ owner',async({page,request},info)=>{
      const raw=await (await request.get('/linkedin-likes')).text();
      const nodes=schemaNodes(raw);expect(nodes.filter(n=>n['@type']==='Service')).toHaveLength(1);
      const faq=nodes.filter(n=>n['@type']==='FAQPage');expect(faq).toHaveLength(1);
      for(const [name,text] of engagementBuyerChecks['linkedin-likes'].questions)expect(faq[0].mainEntity).toContainEqual({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}});
      await page.goto('/linkedin-likes');
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('[data-buyer-checks="linkedin-likes"]')).toContainText('Public visibility alone does not establish compatibility');
      const offers=nodes.filter(n=>n['@type']==='Offer');expect(offers).toHaveLength(1);
      expect(offers[0].priceSpecification.price).toBe(offers[0].price);
      expect(offers[0].priceSpecification.referenceQuantity.value).toBe(1000);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      if(width===390){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:info.outputPath('linkedin-likes-mobile.png'),fullPage:true,animations:'disabled'});}
      const form=page.locator('#order');
      const proceed=form.getByRole('link',{name:'Continue to Secure Order'});
      await expect(proceed).toHaveAttribute('aria-disabled','true');
      await form.getByLabel('Custom likes quantity').fill('1000');
      await form.getByLabel('Public LinkedIn Post URL').fill('https://www.instagram.com/p/INVALID/');
      await expect(proceed).toHaveAttribute('href','#order');
      const post='https://www.linkedin.com/posts/socialrush_activity-1234567890123456789-abcd';
      await form.getByLabel('Public LinkedIn Post URL').fill(post);
      await expect(proceed).toHaveAttribute('aria-disabled','false');
      const href=(await proceed.getAttribute('href'))!;
      const destination=new URL(href,base);
      expect(destination.pathname).toBe('/dashboard/new-order');
      expect(destination.searchParams.get('platform')).toBe('linkedin');
      expect(destination.searchParams.get('service')).toBe('linkedin-likes');
      expect(destination.searchParams.get('quantity')).toBe('1000');
      expect(destination.searchParams.get('link')).toBe(post);
      await proceed.click();
      await expect(page).toHaveURL(/\/login\?/);
      expect(new URL(page.url()).searchParams.get('next')).toBe(href);
    });
  });
}
