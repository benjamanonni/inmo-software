import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { appendFile, readFile, writeFile } from "node:fs/promises";

const ref = process.env.CROOK_CLOUD_DEMO_REF;
const url = process.env.SUPABASE_URL;
if (
  !ref ||
  process.env.CROOK_SEED_ALLOW_CLOUD_DEMO !== ref ||
  url !== `https://${ref}.supabase.co`
)
  throw new Error(
    "Explicit isolated Cloud demo reference and matching URL required. Never run on production.",
  );
const options = {
  auth: { persistSession: false },
  global: {
    fetch: (input, init) =>
      fetch(input, { ...init, signal: AbortSignal.timeout(20000) }),
  },
};
const owner = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, options);
const existing = await owner.auth.admin.listUsers({ perPage: 100 });
const resuming = process.env.CROOK_RESUME_CLOUD_DEMO === ref;
const expectedEmails = [
  "admin@crook.example",
  "lucia@crook.example",
  "martin@crook.example",
  "carolina@crook.example",
];
if (
  existing.error ||
  (resuming
    ? existing.data.users.length !== 4 ||
      existing.data.users.some((u) => !expectedEmails.includes(u.email))
    : existing.data.users.length !== 0)
)
  throw new Error(
    "Cloud bootstrap requires a new empty Auth project. Existing accounts/passwords are never overwritten.",
  );
const { count, error: inspected } = await owner
  .from("clients")
  .select("id", { count: "exact", head: true });
if (inspected || count !== (resuming ? 3 : 0))
  throw new Error(
    "Cloud bootstrap requires an empty domain database, or the exact interrupted fixture set.",
  );
const check = ({ error, data }) => {
  if (error)
    throw new Error(
      `Cloud bootstrap failed (${error.code ?? error.status ?? "request"}). Inspect private service logs.`,
    );
  return data;
};
const people = [
  { id: 1, name: "Lucía Fernández (demo)", email: "lucia@crook.example" },
  { id: 2, name: "Martín Acosta (demo)", email: "martin@crook.example" },
  { id: 3, name: "Carolina Ríos (demo)", email: "carolina@crook.example" },
];
if (!resuming) {
  check(
    await owner
      .from("clients")
      .insert(people.map(({ name, email }) => ({ name, email }))),
  );
  check(
    await owner.from("properties").insert([
      {
        id: "horizonte",
        title: "Horizonte",
        subtitle: "El comienzo de algo propio.",
        description: "Desarrollo ficticio de Crook. Solo demostración.",
        operation: "Venta",
        published: true,
      },
      {
        id: "los-olivos",
        title: "Los Olivos",
        subtitle: "Otra forma de habitar.",
        description: "Desarrollo ficticio. Fotografías de referencia.",
        operation: "Venta",
        published: true,
      },
    ]),
  );
  check(
    await owner.from("property_photos").insert([
      {
        id: "10000000-0000-0000-0000-000000000001",
        property_id: "horizonte",
        reference_url:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=85",
        alt: "Paisaje de referencia",
      },
      {
        id: "10000000-0000-0000-0000-000000000002",
        property_id: "los-olivos",
        reference_url:
          "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1400&q=85",
        alt: "Paisaje de referencia",
      },
    ]),
  );
  check(
    await owner.from("lots").insert([
      {
        id: "H-012",
        property_id: "horizonte",
        area: 300,
        block: "A",
        demo_state: "Disponible",
      },
      {
        id: "H-018",
        property_id: "horizonte",
        area: 300,
        block: "A",
        demo_state: "Disponible",
      },
      {
        id: "O-007",
        property_id: "los-olivos",
        area: 300,
        block: "B",
        demo_state: "Disponible",
      },
    ]),
  );
  await writeFile(
    "artifacts/ACCESOS-ONLINE.txt",
    `CROOK — DATOS EXCLUSIVAMENTE FICTICIOS\nProyecto aislado: ${ref}\nNo publicar este archivo ni compartir cuentas. Contraseñas distintas de localhost.\n`,
    { mode: 0o600, flag: "wx" },
  );
  for (const entry of [
    { email: "admin@crook.example", role: "super_admin", enabled: true },
    ...people.map((p) => ({
      email: p.email,
      role: "buyer",
      enabled: p.id !== 3,
      client: p.id,
    })),
  ]) {
    const password = randomBytes(32).toString("base64url");
    const identity = check(
      await owner.auth.admin.createUser({
        email: entry.email,
        password,
        email_confirm: true,
      }),
    );
    await appendFile(
      "artifacts/ACCESOS-ONLINE.txt",
      `\n${entry.role} | ${entry.email} | ${entry.enabled ? "habilitada" : "deshabilitada"}\nContraseña: ${password}\n`,
    );
    check(
      await owner.from("accounts").insert({
        id: identity.user.id,
        role: entry.role,
        enabled: entry.enabled,
      }),
    );
    if (entry.client)
      check(
        await owner
          .from("account_clients")
          .insert({ account_id: identity.user.id, client_id: entry.client }),
      );
  }
}
const privateAccess = await readFile("artifacts/ACCESOS-ONLINE.txt", "utf8");
if (!privateAccess.includes(`Proyecto aislado: ${ref}`))
  throw new Error("Credential file belongs to another project.");
const password = privateAccess
  .match(
    /super_admin \| admin@crook.example \| habilitada\r?\nContraseña: (.+)/,
  )?.[1]
  .trim();
if (!password)
  throw new Error("Missing private Cloud administrator credential.");
const admin = createClient(url, process.env.SUPABASE_PUBLISHABLE_KEY, options);
check(
  await admin.auth.signInWithPassword({
    email: "admin@crook.example",
    password,
  }),
);
for (const [index, lot] of ["H-012", "H-018", "O-007"].entries()) {
  const prior = check(
    await admin
      .from("contracts")
      .select("id")
      .eq("reference", `CR-ONLINE-DEMO-00${index + 1}`)
      .maybeSingle(),
  );
  const contract =
    prior?.id ??
    check(
      await admin.rpc("create_demo_contract", {
        p_client: index + 1,
        p_lot: lot,
        p_reference: `CR-ONLINE-DEMO-00${index + 1}`,
        p_price: 30000000,
        p_count: 48,
        p_first_due: "2026-03-10",
      }),
    );
  if (index !== 0) continue;
  const plans = check(
    await admin.from("plans").select("id").eq("contract_id", contract),
  );
  const installments = check(
    await admin
      .from("installments")
      .select("id,amount,number,due_on")
      .eq("plan_id", plans[0].id)
      .lte("number", 8),
  );
  for (const installment of installments)
    check(
      await admin.rpc("register_payment", {
        p_contract: contract,
        p_amount: installment.amount,
        p_paid_on: installment.due_on,
        p_method: "Transferencia",
        p_allocations: [
          { installment_id: installment.id, amount: installment.amount },
        ],
        p_request: `50000000-0000-0000-0000-${String(installment.number).padStart(12, "0")}`,
      }),
    );
}
await admin.auth.signOut();
console.log(
  "Isolated Cloud demo initialized: 4 unique accounts, 3 ARS contracts, 8 payments. Credentials saved privately; none printed.",
);
