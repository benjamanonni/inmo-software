import { createClient } from "npm:@supabase/supabase-js@2.119.0";

// Secrets are injected by Supabase into the Edge runtime, never VITE_*.
const url = Deno.env.get("SUPABASE_URL")!;
const publicKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const allowedOrigin = Deno.env.get("APP_ORIGIN") ?? "http://127.0.0.1:5173";
Deno.serve(async (request) => {
  const cors = {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
  const respond = (status: number, body: Record<string, unknown>) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers: cors });
  if (request.method !== "POST")
    return respond(405, { error: "Method not allowed" });
  const token = request.headers.get("Authorization");
  if (!token?.startsWith("Bearer "))
    return respond(401, { error: "Authentication required" });
  const caller = createClient(url, publicKey, {
    global: { headers: { Authorization: token } },
    auth: { persistSession: false },
  });
  const identity = await caller.auth.getUser();
  if (identity.error || !identity.data.user)
    return respond(401, { error: "Invalid session" });
  const access = await caller
    .from("accounts")
    .select("role,enabled")
    .eq("id", identity.data.user.id)
    .single();
  if (access.error || !["admin","super_admin"].includes(access.data.role) || !access.data.enabled)
    return respond(403, { error: "Administrator required" });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return respond(400, { error: "Invalid JSON" });
  }
  if (
    !body ||
    typeof body !== "object" ||
    !("clientId" in body) ||
    !("email" in body) ||
    typeof body.clientId !== "number" ||
    !Number.isSafeInteger(body.clientId) ||
    typeof body.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)
  )
    return respond(400, { error: "Invalid input" });
  // Do not attach arbitrary existing Auth identities based on a user-supplied email.
  const client = await caller
    .from("clients")
    .select("id,email")
    .eq("id", body.clientId)
    .single();
  if (
    client.error ||
    client.data.email.toLowerCase() !== body.email.toLowerCase()
  )
    return respond(400, { error: "Client and email mismatch" });
  const admin = createClient(url, secret, { auth: { persistSession: false } });
  const existing = await admin
    .from("account_clients")
    .select("account_id,accounts!inner(role,enabled)")
    .eq("client_id", body.clientId);
  if (existing.error)
    return respond(503, { error: "Cannot inspect existing links" });
  if (existing.data.length)
    return respond(409, {
      error:
        "Account already linked; review access instead of creating another identity",
    });
  // No email is sent by createUser. Recovery is requested separately via Auth.
  const created = await admin.auth.admin.createUser({
    email: body.email,
    password: crypto.randomUUID() + crypto.randomUUID(),
    email_confirm: true,
  });
  if (created.error)
    return respond(409, {
      error:
        "Cannot create account. Existing identities require explicit operator reconciliation.",
    });
  const userId = created.data.user.id;
  // RPC revalidates the calling admin and inserts account+link atomically, enabled only after both exist.
  const linked = await caller.rpc("provision_buyer_link", {
    p_account: userId,
    p_client: body.clientId,
  });
  if (linked.error) {
    // Auth and PostgreSQL are separate transactions. Keep the new identity unprivileged; never delete external users as compensation.
    return respond(503, {
      error:
        "Identity created without contractual access. Operator reconciliation required.",
      reference: userId,
    });
  }
  return respond(200, { status: "provisioned", userId });
});
