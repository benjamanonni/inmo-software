import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  testIgnore: [
    "**/live/**",
    "**/connected-ui/**",
    "**/live-browser/**",
    "**/online/**",
  ],
  use: {
    baseURL: "http://127.0.0.1:5184",
    browserName: "chromium",
    channel: process.env.CI ? undefined : "msedge",
  },
  webServer: {
    command: "npm run dev -- --port 5184 --strictPort",
    url: "http://127.0.0.1:5184",
    reuseExistingServer: false,
  },
  reporter: "list",
});
