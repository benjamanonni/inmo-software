import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { parseEnv } from "node:util";
const origin = process.env.CROOK_PREVIEW_URL;
if (!origin || !/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin))
  throw new Error("Verified Preview URL required");
const request = (url) =>
  fetch(url, { signal: AbortSignal.timeout(20000), redirect: "error" });
const response = await request(origin);
assert.equal(response.status, 200);
assert.match(response.headers.get("x-robots-tag"), /noindex/);
const html = await response.text();
const paths = [...html.matchAll(/(?:src|href)="([^"\s]+\.js)"/g)].map(
  (m) => m[1],
);
assert.ok(paths.length);
const bodies = await Promise.all(
  paths.map(async (path) => {
    const r = await request(new URL(path, origin));
    assert.equal(r.status, 200);
    return r.text();
  }),
);
const bundle = bodies.join("\n");
const env = parseEnv(await readFile(".env.cloud.local", "utf8"));
const credentials = await readFile("artifacts/ACCESOS-ONLINE.txt", "utf8");
const secrets = [
  env.SUPABASE_SERVICE_ROLE_KEY,
  ...[...credentials.matchAll(/Contraseña: (.+)/g)].map((m) => m[1].trim()),
];
for (const secret of secrets) {
  assert.ok(secret?.length > 20);
  assert.ok(
    !bundle.includes(secret),
    "Private credential found in public bundle",
  );
}
assert.ok(
  bundle.includes(env.SUPABASE_URL),
  "Bundle not connected to isolated Cloud",
);
assert.ok(
  !bundle.includes("http://127.0.0.1:54321"),
  "Local backend present in deployed bundle",
);
const report = {
  url: origin,
  publicWithoutVercelLogin: true,
  noindex: true,
  administrativeKeysAndDemoPasswordsAbsent: true,
  connectedToIsolatedCloud: true,
  javascriptFiles: paths.length,
};
await writeFile(
  "artifacts/preview-assets-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report));
