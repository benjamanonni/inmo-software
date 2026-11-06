import { spawnSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
// CI helper: never print local administrative keys into GitHub Actions logs.
const result = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["supabase", "status", "--output", "json"],
  { encoding: "utf8", shell: process.platform === "win32" },
);
if (result.status !== 0) throw new Error("Cannot obtain local stack status");
const status = JSON.parse(result.stdout);
const url = status.API_URL ?? status.api_url;
const publicKey = status.ANON_KEY ?? status.anon_key;
const secret = status.SERVICE_ROLE_KEY ?? status.service_role_key;
if (
  !url ||
  !publicKey ||
  !secret ||
  !["localhost", "127.0.0.1"].includes(new URL(url).hostname)
)
  throw new Error(
    "Unexpected local stack status format/target; environment not written",
  );
await writeFile(
  ".env.integration.local",
  `SUPABASE_URL=${url}\nSUPABASE_PUBLISHABLE_KEY=${publicKey}\nSUPABASE_SERVICE_ROLE_KEY=${secret}\nCROOK_DEMO_PASSWORD=${randomBytes(32).toString("hex")}\nCROOK_SEED_ALLOW_LOCAL=true\nCROOK_TEST_TARGET=isolated-demo\n`,
  { mode: 0o600 },
);
console.log("Private local test environment created without logging keys.");
