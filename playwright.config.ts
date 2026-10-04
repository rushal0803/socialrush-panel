import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

const port = Number(process.env.SMOKE_TEST_PORT || 3001);
// Match Next's local redirect authority so private-link prefetch stays same-origin.
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests/smoke",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  globalSetup: require.resolve("./scripts/playwright-server-setup.cjs"),
  use: { baseURL, trace: "retain-on-failure", launchOptions: { args: [`--log-file=${path.resolve("artifacts/service-final/chromium.log")}`] } },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
