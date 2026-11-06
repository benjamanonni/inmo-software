import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { validatePreviewEnvironment } from "./scripts/preview-environment.ts";
export default defineConfig(({ mode }) => {
  validatePreviewEnvironment({
    ...loadEnv(mode, process.cwd(), ""),
    ...process.env,
  });
  return { plugins: [react()] };
});
