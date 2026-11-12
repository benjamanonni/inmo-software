import { createClient } from "@supabase/supabase-js";
import { readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const ref = process.env.CROOK_CLOUD_DEMO_REF;
if (
  ref !== "hrwgdwductfrgzlivvoo" ||
  process.env.SUPABASE_URL !== `https://${ref}.supabase.co`
)
  throw new Error("Wrong isolated target");
const options = {
  auth: { persistSession: false },
  global: {
    fetch: (i, o) => fetch(i, { ...o, signal: AbortSignal.timeout(15000) }),
  },
};
const mk = () =>
  createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    options,
  );
const access = await readFile("artifacts/ACCESOS-ONLINE.txt", "utf8");
const identities = [
  ...access.matchAll(
    /(?:super_admin|buyer) \| ([^|]+) \| [^\n]+\nContraseña: (.+)/g,
  ),
].map((m) => ({ email: m[1].trim(), password: m[2].trim() }));
const clients = [];
for (const credentials of identities) {
  const c = mk();
  const r = await c.auth.signInWithPassword(credentials);
  assert.equal(r.error, null, "Cloud login failed");
  clients.push(c);
}
const [admin, a, b, disabled] = clients;
const anonymous = mk();
for (const [c, n] of [
  [admin, 3],
  [a, 1],
  [b, 1],
  [disabled, 0],
]) {
  const r = await c.from("contracts").select("id");
  assert.equal(r.error, null);
  assert.equal(r.data.length, n);
}
assert.ok((await anonymous.from("contracts").select("id")).error);
const own = (await a.from("contracts").select("id")).data[0].id;
assert.equal(
  (await b.from("contracts").select("id").eq("id", own)).data.length,
  0,
);
const bucketOwner = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  options,
);
const buckets = await bucketOwner.storage.listBuckets();
assert.equal(buckets.error, null);
assert.ok(buckets.data.find((x) => x.id === "receipts" && !x.public));
const denied = await a.functions.invoke("manage-buyer", {
  body: { clientId: 1, email: identities[1].email },
});
assert.equal(denied.error?.context?.status, 403);
// Test a real administrator provision without sending an email or exposing credentials.
const email = `online-${crypto.randomUUID()}@crook.example`;
const inserted = await admin
  .from("clients")
  .insert({ name: "Prueba online ficticia", email })
  .select("id")
  .single();
assert.equal(inserted.error, null);
const provision = await admin.functions.invoke("manage-buyer", {
  body: { clientId: inserted.data.id, email },
});
assert.equal(
  provision.error,
  null,
  "Cloud Edge administrator provisioning failed",
);
assert.equal(provision.data.status, "provisioned");
assert.equal(
  (
    await admin.functions.invoke("manage-buyer", {
      body: { clientId: inserted.data.id, email },
    })
  ).error?.context?.status,
  409,
);
const plans = await a.from("plans").select("id").eq("contract_id", own);
const installment = await a
  .from("installments")
  .select("id,amount")
  .eq("plan_id", plans.data[0].id)
  .eq("number", 9)
  .single();
const input = {
  p_contract: own,
  p_amount: installment.data.amount,
  p_paid_on: new Date().toISOString().slice(0, 10),
  p_method: "Transferencia",
  p_allocations: [
    { installment_id: installment.data.id, amount: installment.data.amount },
  ],
  p_request: crypto.randomUUID(),
};
assert.ok((await b.rpc("register_payment", input)).error);
const payment = await admin.rpc("register_payment", input);
assert.equal(payment.error, null);
assert.equal((await admin.rpc("register_payment", input)).data, payment.data);
try {
  const path = `${payment.data}/${crypto.randomUUID()}.png`;
  const image = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
    "base64",
  );
  assert.equal(
    (
      await admin.storage
        .from("receipts")
        .upload(path, image, { contentType: "image/png" })
    ).error,
    null,
  );
  assert.equal(
    (
      await admin.from("receipts").insert({
        payment_id: payment.data,
        object_path: path,
        mime_type: "image/png",
      })
    ).error,
    null,
  );
  const signed = await a.storage.from("receipts").createSignedUrl(path, 30);
  assert.equal(signed.error, null);
  assert.equal(
    (await fetch(signed.data.signedUrl, { signal: AbortSignal.timeout(15000) }))
      .status,
    200,
  );
  for (const db of [b, disabled, anonymous])
    assert.ok(
      (await db.storage.from("receipts").createSignedUrl(path, 30)).error,
    );
  assert.ok(
    (await b.from("receipts").select("id").eq("payment_id", payment.data)).data
      .length === 0,
  );
} finally {
  assert.equal(
    (
      await admin.rpc("void_payment", {
        p_payment: payment.data,
        p_reason: "Prueba online ficticia; conserva historial",
        p_request: crypto.randomUUID(),
      })
    ).error,
    null,
  );
}
const saved = await a
  .from("payments")
  .select("amount,voided")
  .eq("id", payment.data)
  .single();
assert.equal(saved.data.amount, installment.data.amount);
assert.equal(saved.data.voided, true);
assert.equal(
  (
    await admin
      .from("payment_events")
      .select("id")
      .eq("payment_id", payment.data)
  ).data.length,
  2,
);
assert.ok((await admin.from("payments").delete().eq("id", payment.data)).error);
try {
  assert.equal(
    (
      await admin
        .from("properties")
        .update({ published: false })
        .eq("id", "horizonte")
    ).error,
    null,
  );
  assert.equal(
    (await anonymous.from("properties").select("id").eq("id", "horizonte")).data
      .length,
    0,
  );
} finally {
  assert.equal(
    (
      await admin
        .from("properties")
        .update({ published: true })
        .eq("id", "horizonte")
    ).error,
    null,
  );
}
const signup = await anonymous.auth.signUp({
  email: "no-public-signup@crook.example",
  password: "NotAnOperationalPassword-12345",
});
assert.ok(signup.error);
assert.equal(signup.error.code, "signup_disabled");
const result = {
  target: ref,
  accounts: 4,
  adminContracts: 3,
  buyerIsolation: true,
  disabledDenied: true,
  anonymousDenied: true,
  privateReceipts: true,
  publicSignupDisabled: true,
  buyerEdgeStatus: denied.error?.context?.status,
  administratorProvisioning: true,
  paymentIdempotencyAndVoidHistory: true,
  receiptSignedUrlAndCrossAccess: true,
  publicationPersistence: true,
};
await writeFile(
  "artifacts/cloud-api-verification.json",
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result));
for (const c of clients) await c.auth.signOut();
