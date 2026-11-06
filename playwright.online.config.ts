import { defineConfig } from "@playwright/test";
const baseURL = process.env.CROOK_PREVIEW_URL;
if (!baseURL || !/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(baseURL))
  throw new Error("Set CROOK_PREVIEW_URL to the verified Crook Preview URL.");
export default defineConfig({
  testDir: "./tests/online",
  workers: 1,
  timeout: 60000,
  expect: { timeout: 15000 },
  use: {
    baseURL,
    browserName: "chromium",
    channel: process.env.CI ? undefined : "msedge",
    trace: "off",
  },
  reporter: "list",
});
