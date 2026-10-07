import { expect, test } from "./fixtures";

test("Packages use honest labels and keep checkout reachable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/packages?platform=instagram&service=instagram-followers");
  await expect(page.getByText("Recommended", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/most popular|verified saving/i)).toHaveCount(0);
  await page.getByRole("button", { name: "Choose Growth package" }).click();
  await expect(page.locator("#package-checkout")).toBeVisible();
  await expect(page.locator("[data-package-featured='true']").first()).toBeVisible();
});
