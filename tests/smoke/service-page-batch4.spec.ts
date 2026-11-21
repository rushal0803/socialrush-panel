import { createCatalogServiceMetadata } from "../../lib/seo/catalog-service-metadata";
import { test, expect } from '@playwright/test';
import { batch4ServiceFaqs, batch4CatalogGuides } from '../../lib/seo/service-batch4-content';
const paths = [...Object.keys(batch4ServiceFaqs), ...Object.keys(batch4CatalogGuides)].map(slug => `/services/${slug}`);
test.use({ viewport: { width: 390, height: 844 }, extraHTTPHeaders: { DNT: '1' } });
for (const path of paths) {
  test(`batch-four initial HTML, mobile guidance and schema ${path}`, async ({ page, request }, testInfo) => {
    await page.route('**/*', route => ['localhost','127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
    const raw = await request.get(path);
    expect(raw.status()).toBe(200);
    const html = await raw.text();
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.getsocialrush.com${path}`);
    await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute('content', /noindex/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const graphs = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(match => {
      const nodes: any[] = [];
      const walk = (value: any) => {
        if (!value || typeof value !== 'object') return;
        if (Array.isArray(value)) return value.forEach(walk);
        if (value['@type']) nodes.push(value);
        Object.values(value).forEach(walk);
      };
      walk(JSON.parse(match[1])); return nodes;
    });
    const slug = path.split('/').pop()!;
    expect(graphs.filter(node => node['@type'] === 'BreadcrumbList')).toHaveLength(1);
    if (batch4ServiceFaqs[slug]) {
      const metadata = createCatalogServiceMetadata(slug);
      await expect(page).toHaveTitle((metadata.title as {absolute:string}).absolute);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", metadata.description!);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", `https://www.getsocialrush.com${path}`);
      expect(graphs.filter(node => node['@type'] === 'Service')).toHaveLength(1);
      const faq = graphs.filter(node => node['@type'] === 'FAQPage');
      expect(faq).toHaveLength(1);
      expect(graphs.filter(node => node['@type'] === 'Offer')).toHaveLength(0);
      for (const [question, answer] of batch4ServiceFaqs[slug]) {
        expect(faq[0].mainEntity).toContainEqual({ '@type':'Question', name:question, acceptedAnswer:{ '@type':'Answer', text:answer } });
        const detail = page.locator('details').filter({ hasText:question });
        await detail.locator('summary').click();
        await expect(detail.locator('p')).toHaveText(answer);
      }
      // Preserve the existing catch-all live-only handoff; no inline checkout mutation.
      for (const selector of ['[data-service-primary-cta="live-dashboard"]','[data-service-live-handoff]']) {
        const href = await page.locator(selector).getAttribute('href');
        const target = new URL(href!, 'http://localhost');
        expect(target.pathname).toBe('/dashboard/new-order');
        expect(target.searchParams.get('service')).toBe(slug);
        expect(target.searchParams.get('platform')).toBe(slug.startsWith('telegram') ? 'telegram' : 'x');
      }
      await expect(page.locator('[data-service-order-card]')).toHaveCount(0);
      const links = page.locator('[data-service-requirement-links]');
      await expect(links.getByRole('link', {name:'Read refund conditions'})).toHaveAttribute('href','/refund-policy');
      for (const href of await links.locator('a').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')!))) expect((await request.get(href)).status()).toBe(200);
      expect(await page.title()).toMatch(/Telegram|Twitter|X/);
    } else {
      const guide = batch4CatalogGuides[slug as keyof typeof batch4CatalogGuides];
      const section = page.locator('main [data-catalog-buyer-guide]');
      for (const [heading, text] of guide.checks) {
        expect(html).toContain(heading);
        await expect(section).toContainText(text);
      }
      for (const [href,label] of guide.links) {
        await expect(section.getByRole('link',{ name:label })).toHaveAttribute('href',href);
        expect((await request.get(href)).status()).toBe(200);
      }
      expect(graphs.filter(node => node['@type'] === 'ItemList')).toHaveLength(1);
    }
    await page.evaluate(() => scrollTo(0,0));
    const screenshot = testInfo.outputPath('mobile-guidance.png');
    await page.screenshot({path:screenshot,fullPage:true,animations:'disabled'});
    await testInfo.attach('local-fixture-mobile', {path:screenshot,contentType:'image/png'});
  });
}
