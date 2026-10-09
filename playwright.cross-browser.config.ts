import { defineConfig, devices } from "@playwright/test";
import config from "./playwright.config";

// Opt-in QA: install these engines in artifacts/browser-engines and set
// PLAYWRIGHT_BROWSERS_PATH to that directory. The usual smoke suite stays intact.
export default defineConfig({
  ...config,
  outputDir: 'artifacts/premium-responsive/cross-traces',
  testMatch: /premium-responsive\.spec\.ts/,
  use: { ...config.use, launchOptions: {} },
  projects: [
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
