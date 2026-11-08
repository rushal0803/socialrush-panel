import { test, expect } from "@playwright/test";
import { platformBuyerDecisions } from "../../lib/seo/platform-buyer-decisions";
import { xServiceBuyerFaqs } from "../../lib/seo/x-service-buyer-faqs";

const hubs = ["instagram", "facebook", "youtube", "linkedin", "tiktok", "twitter"] as const;
const paths = [...hubs.map(platform => `/${platform === "twitter" ? "x" : platform}-growth-india`), ...Object.keys(xServiceBuyerFaqs).map(slug => `/services/${slug}`)];
test.use({ viewport: { width: 390, height: 844 }, extraHTTPHeaders: { DNT: "1" } });
for (const path of paths) {
  test(`batch-three mobile rendered evidence ${path}`, async ({ page, request }, testInfo) => {
    // Keep browser telemetry and unrelated third-party requests off the network.
    await page.route("**/*", route => new URL(route.request().url()).hostname === "localhost" || new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort());
    const raw = await request.get(path);
    expect(raw.status()).toBe(200);
    const html = await raw.text();
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://www.getsocialrush.com${path}`);
    await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll(elements => {
      const nodes: Record<string, any>[] = [];
      const walk = (value: any) => {
        if (!value || typeof value !== "object") return;
        if (Array.isArray(value)) return value.forEach(walk);
        if (value['@type']) nodes.push(value);
        Object.values(value).forEach(walk);
      };
      elements.forEach(element => walk(JSON.parse(element.textContent || '{}')));
      return nodes;
    });
    if (path.startsWith('/services/')) {
      const slug = path.split('/').pop()!;
      expect(schemas.filter(node => node['@type'] === 'Service')).toHaveLength(1);
      expect(schemas.filter(node => node['@type'] === 'BreadcrumbList')).toHaveLength(1);
      const faqs = schemas.filter(node => node['@type'] === 'FAQPage');
      expect(faqs).toHaveLength(1);
      for (const [question, answer] of xServiceBuyerFaqs[slug]) {
        expect(html).toContain(question);
        expect(faqs[0].mainEntity).toContainEqual({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } });
        const detail = page.locator('details').filter({ hasText: question });
        await detail.locator('summary').click();
        await expect(detail.locator('p')).toHaveText(answer);
      }
      const card = page.locator('[data-service-order-card]');
      if (process.env.BATCH3_REQUIRE_ACTIVE_FIXTURE === '1') await expect(card).toHaveCount(1);
      if (await page.getByText('Currently unavailable', { exact: true }).count()) {
        await expect(card).toHaveCount(0);
        await expect(page.getByRole('link', { name: 'Continue to Secure Order' })).toHaveCount(0);
      } else {
      await expect(card).toHaveCount(1);
      await card.getByLabel('Custom quantity').fill('1000');
      const expectedRates: Record<string, string> = { 'twitter-likes': '₹499.00', 'twitter-views': '₹49.00', 'twitter-retweets': '₹599.00', 'twitter-crypto-followers': '₹4,999.00' };
      await expect(card.locator('strong[aria-live="polite"]')).toHaveText(expectedRates[slug]);
      const target = slug === 'twitter-crypto-followers' ? 'https://x.com/socialrushqa' : 'https://x.com/socialrushqa/status/1234567890';
      await card.locator('input[inputmode="url"]').fill(target);
      const proceed = card.getByRole('link', { name: 'Continue to Secure Order' });
      const href = await proceed.getAttribute('href');
      const selection = new URL(href!, 'http://localhost');
      expect(selection.pathname).toBe('/dashboard/new-order');
      expect(selection.searchParams.get('service')).toBe(slug);
      expect(selection.searchParams.get('quantity')).toBe('1000');
      expect(selection.searchParams.get('link')).toBe(target);
      }
      expect(await page.title()).toMatch(/Twitter|X/);
      expect(html).toMatch(/Buy Twitter|Crypto Followers/);
      expect(html).not.toContain('Use the exact public YouTube video URL');
      // Existing live-only service policy: never invent a structured offer.
      expect(schemas.filter(node => node['@type'] === 'Offer')).toHaveLength(0);
    } else {
      const platform = path === '/x-growth-india' ? 'twitter' : path.slice(1).split('-')[0] as keyof typeof platformBuyerDecisions;
      const content = platformBuyerDecisions[platform];
      const section = page.locator('[data-platform-buyer-decisions]');
      for (const [heading, text] of content.checks) {
        expect(html).toContain(heading);
        await expect(section).toContainText(text);
      }
      await expect(section.locator('a')).toHaveAttribute('href', '/refund-policy');
    }
    const refund = await request.get('/refund-policy');
    expect(refund.status()).toBe(200);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: testInfo.outputPath('mobile-buyer-guidance.png'), fullPage: true, animations: 'disabled' });
    await testInfo.attach('mobile-buyer-guidance', { path: testInfo.outputPath('mobile-buyer-guidance.png'), contentType: 'image/png' });
  });
}
