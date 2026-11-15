import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const paths = ["/youtube-likes", "/facebook-views", "/linkedin-likes", "/buy-youtube-watch-hours-india", "/buy-instagram-comments-india", "/buy-instagram-saves-india", "/buy-instagram-shares-india", "/buy-youtube-comments-india", "/buy-facebook-shares-india", "/buy-facebook-group-members-india"];
test.use({ viewport: { width: 390, height: 844 } });

for (const path of paths) {
  test(`batch-two mobile and schema ${path}`, async ({ page, request }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://www.getsocialrush.com${path}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll(elements => {
      const nodes: Record<string, unknown>[] = [];
      const walk = (value: unknown) => {
        if (!value || typeof value !== "object") return;
        if (Array.isArray(value)) { value.forEach(walk); return; }
        const node = value as Record<string, unknown>;
        if (node["@type"]) nodes.push(node);
        Object.values(node).forEach(walk);
      };
      elements.forEach(element => walk(JSON.parse(element.textContent || "{}")));
      return nodes;
    });
    expect(schemas.filter(node => node["@type"] === "Service")).toHaveLength(1);
    expect(schemas.filter(node => node["@type"] === "BreadcrumbList")).toHaveLength(1);
    const offers = schemas.filter(node => node["@type"] === "Offer") as unknown as Array<{ price: number; priceSpecification: { price: number; referenceQuantity: { value: number } } }>;
    if (path === "/buy-youtube-watch-hours-india") expect(offers).toHaveLength(0);
    for (const offer of offers) {
      expect(offer.priceSpecification.price).toBe(offer.price);
      expect(offer.priceSpecification.referenceQuantity.value).toBe(1000);
    }
    if (path === "/buy-facebook-shares-india") await expect(page.locator("main")).toContainText("share counts do not guarantee organic reach or interested visitors");
    if (path === "/facebook-views" || path === "/linkedin-likes") {
      const guide = page.locator("[data-buyer-checks]");
      await expect(guide).toBeVisible();
      const faq = schemas.find(node => node["@type"] === "FAQPage") as unknown as { mainEntity: Array<{ name: string; acceptedAnswer: { text: string } }> };
      for (const question of faq.mainEntity) {
        await expect(guide).toContainText(question.name);
        await expect(guide).toContainText(question.acceptedAnswer.text);
      }
      for (const href of await guide.locator("a").evaluateAll(links => links.map(link => link.getAttribute("href")!))) {
        expect((await request.get(href)).status(), href).toBe(200);
      }
    }
    await page.evaluate(() => scrollTo(0, 0));
    await mkdir("artifacts/service-evidence-batch2", { recursive: true });
    await page.screenshot({ path: `artifacts/service-evidence-batch2/${path.slice(1)}.png` });
  });
}
