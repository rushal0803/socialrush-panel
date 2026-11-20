import { defineConfig } from "@playwright/test";
import config from "./playwright.config";

const url = new URL(process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3107");
if (!["localhost", "127.0.0.1"].includes(url.hostname)) throw new Error("Phase 3 browser audit requires loopback synthetic fixtures");
export default defineConfig({
  ...config, testMatch: [/phase3-readiness\.spec\.ts/, /phase2-premium\.spec\.ts/],
  workers: 2, retries: 0,
  reporter: [["list"], ["json", { outputFile: "artifacts/phase3/browser-results.json" }]],
  outputDir: "artifacts/phase3/browser",
  use: { ...config.use, baseURL: url.origin, launchOptions: { ...config.use?.launchOptions, executablePath: process.env.CHROMIUM_EXECUTABLE } },
  projects: [{name:"chromium"}],
});
