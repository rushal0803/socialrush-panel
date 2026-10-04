import { test, expect } from "./fixtures";

for (const locale of ["en-US", "en-IN", "de-DE"]) {
  test.describe(`homepage hydration in ${locale}`, () => {
    test.use({ locale });
    test("server and client quantity formatting agree", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
      const response = await page.goto("/", { waitUntil: "load" });
      const html = await response!.text();
      const quantity = page.locator("#order-demo p").filter({ hasText: "Available from" });
      await expect(quantity).toContainText("10,00,000");
      expect(html).toContain("10,00,000");
      // A working React interaction proves hydration completed without waiting
      // for unrelated deferred service-health requests to become idle.
      const toggle = page.getByRole("button", { name: "How does ordering work?", exact: true });
      await toggle.click();
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
      expect(errors).toEqual([]);
    });
  });
}
