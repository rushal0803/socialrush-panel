import { defineConfig } from "@playwright/test";
import config from "./playwright.config";

export default defineConfig({
  ...config,
  testMatch: /phase2-premium\.spec\.ts/,
  workers: 2,
  reporter: [["list"], ["json", { outputFile: "artifacts/phase2/browser-results.json" }]],
  outputDir: "artifacts/phase2/browser",
  use: { ...config.use, launchOptions: { ...config.use?.launchOptions, executablePath: process.env.CHROMIUM_EXECUTABLE } },
  projects: [{ name: "chromium" }],
});
