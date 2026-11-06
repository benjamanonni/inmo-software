import { test } from "node:test";
import assert from "node:assert/strict";
import { validatePreviewEnvironment } from "../../scripts/preview-environment.ts";
const valid = {
  VERCEL: "1",
  VERCEL_ENV: "preview",
  VITE_ENABLE_DEMO: "false",
  VITE_SUPABASE_URL: "https://abcdefghijklmnopqrst.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_fictitious_test_value",
};
test("Preview refuses production, local URLs, fixture mode and administrative keys", () => {
  assert.doesNotThrow(() => validatePreviewEnvironment(valid));
  assert.doesNotThrow(() => validatePreviewEnvironment({}));
  for (const invalid of [
    { VERCEL_ENV: "production" },
    { VITE_ENABLE_DEMO: "true" },
    { VITE_SUPABASE_URL: "http://127.0.0.1:54321" },
    {
      VITE_SUPABASE_URL:
        "https://abcdefghijklmnopqrst.supabase.co.attacker.example",
    },
    { VITE_SUPABASE_PUBLISHABLE_KEY: "sb_secret_fictitious" },
    { VITE_SUPABASE_SERVICE_ROLE_KEY: "must-never-be-public" },
  ])
    assert.throws(() => validatePreviewEnvironment({ ...valid, ...invalid }));
  const jwt = (role: string, ref: string) =>
    `test.${Buffer.from(JSON.stringify({ role, ref })).toString("base64url")}.test`;
  assert.throws(() =>
    validatePreviewEnvironment({
      ...valid,
      VITE_SUPABASE_PUBLISHABLE_KEY: jwt(
        "service_role",
        "abcdefghijklmnopqrst",
      ),
    }),
  );
  assert.throws(() =>
    validatePreviewEnvironment({
      ...valid,
      VITE_SUPABASE_PUBLISHABLE_KEY: jwt("anon", "wrong-project"),
    }),
  );
  assert.doesNotThrow(() =>
    validatePreviewEnvironment({
      ...valid,
      VITE_SUPABASE_PUBLISHABLE_KEY: jwt("anon", "abcdefghijklmnopqrst"),
    }),
  );
});
