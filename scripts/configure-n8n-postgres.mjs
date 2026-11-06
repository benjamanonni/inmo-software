import { readFile, writeFile, appendFile, unlink } from "node:fs/promises";
import { parseEnv } from "node:util";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
if (process.env.CROOK_SEED_ALLOW_LOCAL !== "true")
  throw new Error("Explicit local demo configuration required");
const docker =
  process.platform === "win32"
    ? join(
        process.env.LOCALAPPDATA,
        "Programs/DockerDesktop/resources/bin/docker.exe",
      )
    : "docker";
const run = (args, input) => {
  const result = spawnSync(docker, args, {
    input,
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.status !== 0)
    throw new Error(
      "Local Docker operation failed; review the private runtime logs.",
    );
  return result.stdout;
};
const file = ".env.n8n.local";
const env = parseEnv(await readFile(file, "utf8"));
const password = env.N8N_PG_PASSWORD ?? randomBytes(32).toString("hex");
if (!/^[a-f0-9]{64}$/.test(password))
  throw new Error("Unexpected local PostgreSQL demo password format");
if (!env.N8N_PG_PASSWORD)
  await appendFile(file, `N8N_PG_PASSWORD=${password}\n`);
run(
  [
    "exec",
    "-i",
    "supabase_db_crook-demo",
    "psql",
    "-U",
    "postgres",
    "-d",
    "postgres",
    "-v",
    "ON_ERROR_STOP=1",
  ],
  `
do $role$ begin if not exists(select 1 from pg_roles where rolname='crook_n8n_reader') then create role crook_n8n_reader login nosuperuser nocreatedb nocreaterole noreplication;end if;end $role$;
alter role crook_n8n_reader password '${password}';
alter role crook_n8n_reader set default_transaction_read_only=on;
grant connect on database postgres to crook_n8n_reader;
grant crook_export_reader to crook_n8n_reader;
`,
);
const credential = [
  {
    id: "crook-demo-postgres-readonly",
    name: "Crook local PostgreSQL solo lectura",
    type: "postgres",
    data: {
      host: "host.docker.internal",
      port: 54322,
      database: "postgres",
      user: "crook_n8n_reader",
      password,
      ssl: "disable",
    },
  },
];
const credentialFile = "artifacts/n8n-postgres-private.json";
await writeFile(credentialFile, JSON.stringify(credential), { mode: 0o600 });
try {
  run(["cp", credentialFile, "n8n-n8n-1:/tmp/crook-postgres-private.json"]);
  run([
    "exec",
    "--user",
    "root",
    "n8n-n8n-1",
    "chown",
    "node:node",
    "/tmp/crook-postgres-private.json",
  ]);
  run([
    "exec",
    "n8n-n8n-1",
    "n8n",
    "import:credentials",
    "--input=/tmp/crook-postgres-private.json",
  ]);
} finally {
  await unlink(credentialFile);
  run([
    "exec",
    "--user",
    "root",
    "n8n-n8n-1",
    "rm",
    "-f",
    "/tmp/crook-postgres-private.json",
  ]);
}
run([
  "cp",
  "automation/n8n/workflow-postgres-demo.json",
  "n8n-n8n-1:/tmp/crook-postgres-workflow.json",
]);
run([
  "exec",
  "n8n-n8n-1",
  "n8n",
  "import:workflow",
  "--input=/tmp/crook-postgres-workflow.json",
]);
console.log(
  "Local read-only PostgreSQL credential stored in n8n. Only the four-column ARS demo view is granted. No credentials printed.",
);
