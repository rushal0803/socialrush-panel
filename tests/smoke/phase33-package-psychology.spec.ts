import { expect, test } from "@playwright/test";

test("Phase 33 packages use evidence-based choice labels and keep checkout reachable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/packages?platform=instagram&service=instagram-followers");

  await expect(page.locator("[data-package-choice-guide]")).toBeVisible();
  await expect(page.getByText("Balanced choice", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/middle-ground recommendation, not a popularity claim/i)).toBeVisible();
  await expect(page.getByText(/most popular/i)).toHaveCount(0);

  const balanced = page.getByRole("button", { name: "Choose balanced" }).first();
  await expect(balanced).toBeVisible();
  await balanced.click();
  await expect(page.locator("#package-checkout")).toBeVisible();
  await expect(page.locator("[data-package-featured='true']").first()).toBeVisible();
});
