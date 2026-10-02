import { expect, test } from "@playwright/test";

const routes = [
  { path: "/buy-instagram-followers-india", title: "Buy Instagram Followers in India | INR Pricing | SocialRUSH", description: "Live INR pricing for Instagram followers in India. Choose a quantity, use a public profile link, review delivery/refill details, and order securely." },
  { path: "/instagram-likes", title: "Buy Instagram Likes in India | INR Pricing | SocialRUSH", description: "Live INR pricing for Instagram likes in India. Choose a quantity, add a public post or Reel link, review delivery/refill details, and order securely." },
  { path: "/instagram-views", title: "Buy Instagram Views in India | INR Pricing | SocialRUSH", description: "Live INR pricing for Instagram views in India. Choose a quantity, add a public Reel or video link, review delivery/refill details, and order securely." },
  { path: "/buy-instagram-comments-india", title: "Buy Instagram Comments in India | INR Pricing | SocialRUSH", description: "Live INR pricing for Instagram comments in India. Choose a quantity, add a public post or Reel link, review delivery details, and order securely." },
  { path: "/buy-instagram-saves-india", title: "Buy Instagram Saves in India | INR Pricing | SocialRUSH", description: "Live INR pricing for Instagram saves in India. Choose a quantity, add a public post or Reel link, review delivery/support details, and order securely." },
  { path: "/buy-instagram-shares-india", title: "Buy Instagram Shares in India | INR Pricing | SocialRUSH", description: "Live INR pricing for Instagram shares in India. Choose a quantity, add a public post or Reel link, review delivery/support details, and order securely." },
] as const;

test.describe("Phase 21 Instagram SERP presentation", () => {
  for (const route of routes) {
    test(route.path + " has concise metadata and one breadcrumb graph", async ({ page }) => {
      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(route.title);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", route.description);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toBe("https://www.getsocialrush.com" + route.path);
      await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "SocialRUSH");

      const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
      const breadcrumbCount = scripts.reduce((count, value) => count + (value.match(/"@type":"BreadcrumbList"/g)?.length ?? 0), 0);
      expect(breadcrumbCount).toBe(1);
      expect(scripts.join("\n")).toContain("Instagram Growth");
      expect(scripts.join("\n")).toContain(route.path);
    });
  }
});
