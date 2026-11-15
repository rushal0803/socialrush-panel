import { defineConfig } from "@playwright/test";
import config from "./playwright.config";

const backend = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:3001";
if (!["localhost", "127.0.0.1"].includes(new URL(backend).hostname)) {
  throw new Error("Follow-up QA requires a synthetic loopback backend");
}
process.env.NEXT_PUBLIC_SUPABASE_URL = backend;

export default defineConfig({
  ...config,
  testMatch: [/services-v2\.spec\.ts/, /performance-mobile-followup\.spec\.ts/, /phase2-premium\.spec\.ts/],
  workers: 2,
  reporter: [["list"], ["json", { outputFile: "artifacts/phase2/ci-followup/results.json" }]],
  outputDir: "artifacts/phase2/ci-followup/browser",
  use: { ...config.use, launchOptions: { ...config.use?.launchOptions, executablePath: process.env.CHROMIUM_EXECUTABLE } },
  projects: [{ name: "chromium" }],
});
