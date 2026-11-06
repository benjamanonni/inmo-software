import { createClient } from "@supabase/supabase-js";
import { readFile, writeFile } from "node:fs/promises";
const {
  SUPABASE_URL: url,
  SUPABASE_PUBLISHABLE_KEY: key,
  SUPABASE_SERVICE_ROLE_KEY: secret,
  CROOK_DEMO_PASSWORD: password,
} = process.env;
if (
  !url ||
  !key ||
  !secret ||
  !password ||
  process.env.CROOK_SEED_ALLOW_LOCAL !== "true" ||
  !["localhost", "127.0.0.1"].includes(new URL(url).hostname)
)
  throw new Error("Explicit local demo configuration required");
const owner = createClient(url, secret, { auth: { persistSession: false } }),
  admin = createClient(url, key, { auth: { persistSession: false } });
const signed = await admin.auth.signInWithPassword({
  email: "admin@crook.example",
  password,
});
if (signed.error) throw new Error("Cannot authenticate local admin");
const reference = "CR-ARS-DEMO-001";
let contract = await admin
  .from("contracts")
  .select("id")
  .eq("reference", reference)
  .maybeSingle();
if (contract.error) throw contract.error;
if (!contract.data) {
  const lot = await owner
    .from("lots")
    .upsert(
      {
        id: "H-025",
        property_id: "horizonte",
        area: 300,
        block: "C",
        demo_state: "Disponible",
      },
      { onConflict: "id", ignoreDuplicates: true },
    );
  if (lot.error) throw lot.error;
  const created = await admin.rpc("create_demo_contract", {
    p_client: 1,
    p_lot: "H-025",
    p_reference: reference,
    p_price: 30000000,
    p_count: 48,
    p_first_due: "2026-03-10",
  });
  if (created.error) throw created.error;
  contract = { ...contract, data: { id: created.data } };
}
const plans = await admin
  .from("plans")
  .select("id")
  .eq("contract_id", contract.data.id);
if (plans.error) throw plans.error;
const installments = await admin
  .from("installments")
  .select("id,number,amount,due_on")
  .eq("plan_id", plans.data[0].id)
  .lte("number", 8);
if (installments.error) throw installments.error;
for (const installment of installments.data) {
  const result = await admin.rpc("register_payment", {
    p_contract: contract.data.id,
    p_amount: installment.amount,
    p_paid_on: installment.due_on,
    p_method: "Transferencia",
    p_allocations: [
      { installment_id: installment.id, amount: installment.amount },
    ],
    p_request: `40000000-0000-0000-0000-${String(installment.number).padStart(12, "0")}`,
  });
  if (result.error) throw result.error;
}
const email = "superadmin@crook.example";
let user;
for (let page = 1; ; page++) {
  const result = await owner.auth.admin.listUsers({ page, perPage: 100 });
  if (result.error) throw new Error("Cannot inspect demo accounts");
  user = result.data.users.find((u) => u.email === email);
  if (user || result.data.users.length < 100) break;
}
if (!user) {
  const created = await owner.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (created.error) throw new Error("Cannot initialize demo superadmin");
  user = created.data.user;
}
const existing = await owner
  .from("accounts")
  .select("id,role")
  .eq("id", user.id)
  .maybeSingle();
if (existing.error) throw existing.error;
if (!existing.data) {
  const inserted = await owner
    .from("accounts")
    .insert({ id: user.id, role: "super_admin", enabled: true });
  if (inserted.error) throw inserted.error;
} else if (existing.data.role !== "super_admin")
  throw new Error("Existing account requires manual role reconciliation");
try {
  const path = "artifacts/ACCESOS-LOCALES.txt";
  let text = await readFile(path, "utf8");
  if (!text.includes(email)) {
    text += `\nSuperadministrador demo: ${email}\nContrasena: ${password}\n`;
    await writeFile(path, text);
  }
} catch {
  /* Credentials remain in the private test configuration; never print them. */
}
await admin.auth.signOut();
console.log(
  "New ARS demo scenario and superadmin initialized. Existing USD history unchanged. No passwords printed.",
);
