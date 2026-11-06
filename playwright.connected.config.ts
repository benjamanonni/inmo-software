import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/connected-ui",
  testMatch: "**/*.spec.ts",
  use: {
    baseURL: "http://127.0.0.1:5185",
    browserName: "chromium",
    channel: process.env.CI ? undefined : "msedge",
  },
  webServer: {
    command: "npm run dev:live -- --port 5185 --strictPort",
    url: "http://127.0.0.1:5185",
    reuseExistingServer: false,
    env: {
      VITE_ENABLE_DEMO: "false",
      VITE_SUPABASE_URL: "",
      VITE_SUPABASE_PUBLISHABLE_KEY: "",
    },
  },
  reporter: "list",
});
