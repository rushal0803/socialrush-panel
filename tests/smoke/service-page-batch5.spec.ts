import { test, expect } from '@playwright/test';
import { publishedCountryServicePages, countryServiceAlternates } from '../../lib/seo/international';
import { activeSmmServices } from '../../lib/smm-service-catalog';
const pages = publishedCountryServicePages.filter(p => ['linkedin-followers', 'youtube-views'].includes(p.catalogServiceCode));
for (const width of [390, 1440]) {
  test.describe(`batch five at ${width}px`, () => {
    test.use({viewport:{width,height:900},extraHTTPHeaders:{DNT:'1'}});
    for (const config of pages) {
      const path = `/${config.market.slug}/${config.serviceSlug}`;
      test(`country buyer guidance ${path}`, async ({page, request}, info) => {
        await page.route('**/*', route => ['localhost','127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
        const response = await request.get(path);
        expect(response.status()).toBe(200);
        const html = await response.text();
        for (const [question] of config.copy.buyerFaqs!) expect(html).toContain(question);
        const nodes = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m => {const v=JSON.parse(m[1]);return v['@graph'] ?? [v];});
        const faq = nodes.filter(n => n['@type'] === 'FAQPage');
        expect(faq).toHaveLength(1);
        expect(nodes.filter(n => n['@type'] === 'Service')).toHaveLength(1);
        expect(nodes.filter(n => n['@type'] === 'BreadcrumbList')).toHaveLength(1);
        const offer = nodes.find(n => n['@type'] === 'Service').offers;
        expect(offer.priceCurrency).toBe('INR');
        expect(offer.price).toBe(activeSmmServices.find(s => s.code === config.catalogServiceCode)!.pricePer1000);
        await page.goto(path);
        await expect(page).toHaveTitle(config.title);
        await expect(page.locator('h1')).toHaveCount(1);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',`https://www.getsocialrush.com${path}`);
        for (const [locale,href] of Object.entries(countryServiceAlternates(config))) await expect(page.locator(`link[hreflang="${locale}"]`)).toHaveAttribute('href',href);
        for (const [question,answer] of config.copy.buyerFaqs!) {
          expect(faq[0].mainEntity).toContainEqual({'@type':'Question',name:question,acceptedAnswer:{'@type':'Answer',text:answer}});
          const details = page.locator('details').filter({hasText:question});
          await details.locator('summary').focus();
          await page.keyboard.press('Enter');
          await expect(details).toHaveAttribute('open','');
          await expect(details.locator('p')).toHaveText(answer);
        }
        const conditions = page.locator('[data-country-order-conditions]');
        for (const href of ['/terms','/refund-policy','/contact']) {
          await expect(conditions.locator(`a[href="${href}"]`)).toHaveCount(1);
          expect((await request.get(href)).status()).toBe(200);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        if(width === 390) await page.screenshot({path:info.outputPath('country-buyer-mobile.png'),fullPage:true,animations:'disabled'});
      });
    }
  });
}
