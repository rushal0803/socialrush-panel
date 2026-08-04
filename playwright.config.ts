import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.SMOKE_TEST_PORT || 3001);
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/smoke",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL, trace: "retain-on-failure" },
  webServer: {
    command: `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 30_000,
    // This is a non-secret placeholder used only by the local smoke server.
    // It prevents optional service-health reads from throwing while tests cover
    // public routes and unauthenticated dashboard redirects.
    env: {
      ...process.env,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "smoke-service-role-key",
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
