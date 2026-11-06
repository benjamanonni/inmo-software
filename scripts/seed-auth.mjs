import { createClient } from "@supabase/supabase-js";
const url = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publicKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const password = process.env.CROOK_DEMO_PASSWORD;
if (
  !url ||
  !secret ||
  !publicKey ||
  !password ||
  password.length < 12 ||
  process.env.CROOK_SEED_ALLOW_LOCAL !== "true" ||
  !["127.0.0.1", "localhost"].includes(new URL(url).hostname)
)
  throw new Error(
    "Seed requires explicit CROOK_SEED_ALLOW_LOCAL=true, local Supabase URL, keys and a password >=12 characters. Cloud seeding is intentionally disabled.",
  );
const admin = createClient(url, secret, { auth: { persistSession: false } });
const users = [
  { email: "admin@crook.example", role: "admin" },
  ...[
    "lucia@example.com",
    "martin@example.com",
    "carolina@example.com",
    "diego@example.com",
  ].map((email, i) => ({ email, role: "buyer", client: i + 1 })),
];
const existing = [];
for (let page = 1; ; page++) {
  const { data, error } = await admin.auth.admin.listUsers({
    page,
    perPage: 100,
  });
  if (error) throw new Error("Cannot list local Auth users");
  existing.push(...data.users);
  if (data.users.length < 100) break;
}
for (const entry of users) {
  let user = existing.find((u) => u.email === entry.email);
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email: entry.email,
      password,
      email_confirm: true,
    });
    if (error) throw new Error("Cannot create local demo identity");
    user = data.user;
  }
  const { error } = await admin
    .from("accounts")
    .upsert({ id: user.id, role: entry.role, enabled: entry.client !== 3 });
  if (error) throw new Error("Cannot initialize account");
  if (entry.client) {
    const { error } = await admin
      .from("account_clients")
      .upsert({ account_id: user.id, client_id: entry.client });
    if (error) throw new Error("Cannot initialize account link");
  }
}
const client = createClient(url, publicKey, {
  auth: { persistSession: false },
});
const login = await client.auth.signInWithPassword({
  email: "admin@crook.example",
  password,
});
if (login.error)
  throw new Error(
    "Cannot sign in local seeded admin. Existing passwords were not overwritten.",
  );
for (let n = 1; n <= 8; n++) {
  const { error } = await client.rpc("register_payment", {
    p_contract: 1,
    p_amount: 500,
    p_paid_on: `2026-${String(n + 2).padStart(2, "0")}-05`,
    p_method: "Transferencia",
    p_allocations: [{ installment_id: n, amount: 500 }],
    p_request: `30000000-0000-0000-0000-${String(n).padStart(12, "0")}`,
  });
  if (error)
    throw new Error(
      "Cannot initialize payment; review server logs without exposing credentials",
    );
}
await client.auth.signOut();
console.log(
  "Local fictitious accounts, links and eight payments initialized. Password not printed.",
);
