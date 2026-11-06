import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/live-browser",
  testMatch: "**/*.spec.ts",
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:5186",
    browserName: "chromium",
    channel: process.env.CI ? undefined : "msedge",
  },
  webServer: {
    command: "npm run dev:live -- --port 5186 --strictPort",
    url: "http://127.0.0.1:5186",
    reuseExistingServer: false,
    env: {
      VITE_ENABLE_DEMO: "false",
      VITE_SUPABASE_URL: process.env.SUPABASE_URL ?? "",
      VITE_SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY ?? "",
    },
  },
  reporter: "list",
});
