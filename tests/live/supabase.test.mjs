import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL,
  key = process.env.SUPABASE_PUBLISHABLE_KEY,
  password = process.env.CROOK_DEMO_PASSWORD;
test("REAL Edge Function: buyers denied, admin provisions and links a fresh demo identity", async () => {
  const admin = await login("admin@crook.example"),
    buyer = await login("lucia@example.com");
  try {
    const denied = await buyer.functions.invoke("manage-buyer", {
      body: { clientId: 1, email: "lucia@example.com" },
    });
    assert.equal(denied.error?.context?.status, 403);
    const email = `buyer-${crypto.randomUUID()}@crook.example`;
    const inserted = await admin
      .from("clients")
      .insert({ name: "Comprador de prueba Edge", email })
      .select("id")
      .single();
    assert.equal(inserted.error, null);
    const body = { clientId: inserted.data.id, email };
    const provisioned = await admin.functions.invoke("manage-buyer", { body });
    assert.equal(provisioned.error, null);
    assert.equal(provisioned.data.status, "provisioned");
    const duplicate = await admin.functions.invoke("manage-buyer", { body });
    assert.equal(duplicate.error?.context?.status, 409);
    const account = await admin
      .from("accounts")
      .select("role,enabled")
      .eq("id", provisioned.data.userId)
      .single();
    assert.equal(account.data.role, "buyer");
    assert.equal(account.data.enabled, true);
  } finally {
    await Promise.all([admin.auth.signOut(), buyer.auth.signOut()]);
  }
});
if (
  !url ||
  !key ||
  !password ||
  process.env.CROOK_TEST_TARGET !== "isolated-demo"
)
  throw new Error(
    "Live tests require isolated Supabase configuration. No mock fallback.",
  );
function client() {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
async function login(email) {
  const db = client();
  const { error } = await db.auth.signInWithPassword({ email, password });
  assert.equal(error, null, "Cannot authenticate test user");
  return db;
}
test("REAL Supabase: authorization, durable publication, manual payments, private receipt isolation", async () => {
  const admin = await login("admin@crook.example"),
    a = await login("lucia@example.com"),
    b = await login("martin@example.com"),
    disabled = await login("carolina@example.com"),
    anonymous = client();
  try {
    assert.equal(
      (await anonymous.from("contracts").select("*")).data?.length ?? 0,
      0,
    );
    const contractsA = await a.from("contracts").select("*");
    assert.equal(contractsA.error, null);
    assert.ok(contractsA.data.length > 0);
    assert.equal(
      (await b.from("contracts").select("*").eq("id", 1)).data.length,
      0,
    );
    assert.equal((await disabled.from("contracts").select("*")).data.length, 0);
    assert.ok(
      (
        await a
          .from("accounts")
          .update({ role: "admin" })
          .eq("id", (await a.auth.getUser()).data.user.id)
      ).error,
    );
    const slug = "test-" + crypto.randomUUID();
    const created = await admin.from("properties").insert({
      id: slug,
      title: "Propiedad ficticia de integración",
      description: "Solo pruebas aisladas",
      operation: "Venta",
      published: false,
    });
    assert.equal(created.error, null);
    assert.equal(
      (await anonymous.from("properties").select("id").eq("id", slug)).data
        .length,
      0,
    );
    assert.equal(
      (
        await admin
          .from("properties")
          .update({ published: true })
          .eq("id", slug)
      ).error,
      null,
    );
    // A new HTTP client proves this is persisted state, not a browser provider.
    assert.equal(
      (await client().from("properties").select("id").eq("id", slug)).data
        .length,
      1,
    );
    const request = crypto.randomUUID();
    const input = {
      p_contract: 1,
      p_amount: 25,
      p_paid_on: "2026-11-05",
      p_method: "Efectivo",
      p_allocations: [{ installment_id: 9, amount: 25 }],
      p_request: request,
    };
    assert.ok((await b.rpc("register_payment", input)).error);
    const registered = await admin.rpc("register_payment", input);
    assert.equal(registered.error, null);
    const payment = registered.data;
    assert.equal((await admin.rpc("register_payment", input)).data, payment);
    const path = `${payment}/${crypto.randomUUID()}.pdf`;
    const file = new Blob(["%PDF-1.4\n% FICTITIOUS TEST RECEIPT\n%%EOF"], {
      type: "application/pdf",
    });
    assert.equal(
      (
        await admin.storage
          .from("receipts")
          .upload(path, file, { contentType: "application/pdf" })
      ).error,
      null,
    );
    assert.equal(
      (
        await admin.from("receipts").insert({
          payment_id: payment,
          object_path: path,
          mime_type: "application/pdf",
        })
      ).error,
      null,
    );
    assert.equal(
      (await a.storage.from("receipts").createSignedUrl(path, 30)).error,
      null,
    );
    assert.ok(
      (await b.storage.from("receipts").createSignedUrl(path, 30)).error,
    );
    assert.ok(
      (await anonymous.storage.from("receipts").createSignedUrl(path, 30))
        .error,
    );
    const voidRequest = crypto.randomUUID();
    assert.equal(
      (
        await admin.rpc("void_payment", {
          p_payment: payment,
          p_reason: "Prueba integral aislada",
          p_request: voidRequest,
        })
      ).error,
      null,
    );
    const concurrent = await admin.rpc("register_payment", {
      ...input,
      p_request: crypto.randomUUID(),
    });
    assert.equal(concurrent.error, null);
    const conflicting = await Promise.all([
      admin.rpc("void_payment", {
        p_payment: concurrent.data,
        p_reason: "Prueba de concurrencia A",
        p_request: crypto.randomUUID(),
      }),
      admin.rpc("void_payment", {
        p_payment: concurrent.data,
        p_reason: "Prueba de concurrencia B",
        p_request: crypto.randomUUID(),
      }),
    ]);
    assert.equal(
      conflicting.filter((r) => !r.error).length,
      1,
      "Exactly one conflicting concurrent void must succeed",
    );
    const stored = await a
      .from("payments")
      .select("amount,voided")
      .eq("id", payment)
      .single();
    assert.equal(stored.data.voided, true);
    assert.equal(stored.data.amount, 25);
    assert.equal(
      (await admin.from("payment_events").select("*").eq("payment_id", payment))
        .data.length,
      2,
    );
    await admin.from("properties").update({ published: false }).eq("id", slug);
  } finally {
    await Promise.all([admin, a, b, disabled].map((db) => db.auth.signOut()));
  }
});
