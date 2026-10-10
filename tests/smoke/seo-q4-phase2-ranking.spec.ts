import { test, expect } from "./fixtures";

test.use({ screenshot: "only-on-failure" });

const moneyPages = [
  "/instagram-likes", "/buy-instagram-followers-india", "/buy-facebook-followers-india",
  "/linkedin-followers", "/twitter-followers",
];

for (const width of [320, 390, 768, 1440]) {
  for (const route of moneyPages) {
    test(`Q4 Phase 2 money-page content ${route} at ${width}px`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", e => errors.push(e.message));
      page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto(route, { waitUntil: "networkidle" });
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://www.getsocialrush.com${route}`);
      const quantity = page.locator('input[inputmode="numeric"]').first();
      await expect(quantity).toBeVisible();
      await quantity.fill("1000");
      await expect(quantity).toHaveValue("1000");
      // Read the existing CTA without following it or submitting an order.
      await expect(page.getByRole("link", { name: "Continue to Secure Order", exact: true }).first()).toBeVisible();
      if (route === "/instagram-likes") {
        await expect(page.getByRole("heading", { name: "What do 1K, 5K and 10K likes cost?", exact: true })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Instagram Likes minimum order and quantity limits in India", exact: true })).toBeVisible();
        await expect(page.getByText("No password is required; India ordering does not imply India-only likes.", { exact: false })).toBeVisible();
      }
      if (route === "/linkedin-followers") {
        const faq = page.locator("details").filter({ has: page.getByText("Can I buy LinkedIn followers for a company page?", { exact: true }) });
        if (await faq.getAttribute("open") === null) await faq.locator("summary").click();
        await expect(page.getByText(/Do not assume this covers a company page/)).toBeVisible();
      }
      if (route === "/twitter-followers") await expect(page.locator("h1")).toContainText("Twitter (X)");
      await page.locator("footer").scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
      for (const block of await page.locator('script[type="application/ld+json"]').allTextContents()) expect(() => JSON.parse(block)).not.toThrow();
      expect(errors).toEqual([]);
    });
  }
}

for (const width of [390, 1440]) {
  test(`Q4 Phase 2 subscriber guide price-neutral SSR at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const response = await page.goto("/blog/youtube-subscribers-price-in-india", { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    const html = await response!.text();
    expect(html).toContain("No unverified current price is published here.");
    await expect(page.locator("h1")).toBeVisible();
    expect(await page.locator("#article-body").innerText()).not.toMatch(/₹[\d,]+/);
    const faqs = await page.locator('script[type="application/ld+json"]').allTextContents();
    for (const block of faqs) {
      const schema = JSON.parse(block);
      if (schema["@type"] === "FAQPage") expect(block).not.toMatch(/₹[\d,]+/);
    }
    await expect(page.locator('#article-body a[href="/youtube-subscribers"]').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });
}

const guides = [
  ["instagram-followers-vs-likes-india", "/instagram-likes"],
  ["best-time-to-post-on-instagram-india", "/instagram-likes"],
  ["instagram-followers-price-in-india", "/buy-instagram-followers-india"],
  ["how-to-grow-instagram-followers-in-india", "/buy-instagram-followers-india"],
  ["facebook-page-growth-tips-for-local-businesses", "/buy-facebook-followers-india"],
  ["linkedin-followers-for-business-growth", "/linkedin-followers"],
  ["twitter-followers-price-in-india", "/twitter-followers"],
  ["youtube-channel-readiness-checklist", "/youtube-subscribers"],
];
for (const [slug, target] of guides) {
  test(`Q4 Phase 2 contextual guide ${slug}`, async ({ page }) => {
    const response = await page.goto(`/blog/${slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator(`#article-body a[href="${target}"]`).first()).toBeVisible();
    const preencodedHeroes: Record<string, { asset: string; alt: string }> = {
      "instagram-followers-vs-likes-india": { asset: "instagram-followers-vs-engagement", alt: "Comparison of Instagram follower growth and likes for Indian creators" },
      "best-time-to-post-on-instagram-india": { asset: "best-time-instagram-india", alt: "Instagram posting schedule in India with audience activity times and content planning" },
      "instagram-followers-price-in-india": { asset: "instagram-followers-price-india", alt: "Comparing Instagram follower prices, quality, delivery and support in India" },
      "how-to-grow-instagram-followers-in-india": { asset: "grow-instagram-followers-india-practical-plan", alt: "Practical Instagram follower growth plan for creators in India" },
      "linkedin-followers-for-business-growth": { asset: "linkedin-followers-business-growth-india", alt: "LinkedIn business growth dashboard for Indian companies with follower and lead growth" },
      "youtube-channel-readiness-checklist": { asset: "promote-new-youtube-channel-india", alt: "Creator reviewing a YouTube channel readiness checklist before a promotion" },
      "facebook-page-growth-tips-for-local-businesses": { asset: "facebook-page-growth-india", alt: "Facebook page growth strategy for Indian local businesses and customer trust" },
      "twitter-followers-price-in-india": { asset: "social-media-growth-strategy-indian-creators", alt: "Twitter X followers price in India planning guide" },
    };
    const expectedHero = preencodedHeroes[slug];
    if (expectedHero) {
      const hero = page.getByRole("img", { name: expectedHero.alt, exact: true });
      await expect(hero).toBeVisible();
      expect(await hero.evaluate((image: HTMLImageElement) => new URL(image.currentSrc || image.src, location.href).pathname)).toBe(`/images/blog/${expectedHero.asset}.webp`);
      expect(await hero.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", `https://www.getsocialrush.com/images/blog/${expectedHero.asset}.png`);
    }
  });
}
