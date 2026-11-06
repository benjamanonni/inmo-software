import { PGlite } from "@electric-sql/pglite";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";

const actor = {
  admin: "00000000-0000-0000-0000-000000000001",
  a: "00000000-0000-0000-0000-000000000002",
  b: "00000000-0000-0000-0000-000000000003",
  disabled: "00000000-0000-0000-0000-000000000004",
};
test("PostgreSQL/WASM disk persistence survives engine restart", async () => {
  const directory = await mkdtemp(join(tmpdir(), "crook-postgres-"));
  let db;
  try {
    const path = join(directory, "database");
    db = await setup(path);
    await as(db, "admin", () =>
      db.exec(
        "update public.properties set published=false where id='horizonte'",
      ),
    );
    await db.close();
    db = new PGlite(path);
    await as(db, null, async () =>
      assert.equal(
        (await db.query("select * from public.properties where id='horizonte'"))
          .rows.length,
        0,
      ),
    );
    await as(db, "admin", async () =>
      assert.equal(
        (
          await db.query(
            "select title from public.properties where id='horizonte'",
          )
        ).rows[0].title,
        "Horizonte",
      ),
    );
  } finally {
    if (db) await db.close();
    await rm(directory, { recursive: true, force: true });
  }
});
async function setup(path) {
  const db = new PGlite(path);
  await db.exec(`create role anon;create role authenticated;create schema auth;create schema storage;
 create table auth.users(id uuid primary key,email text);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;grant usage on schema storage to anon,authenticated;grant select,insert on storage.objects to anon,authenticated;`);
  for (const file of [
    "202611050001_domain.sql",
    "202611050002_payment_rpc.sql",
    "202611050003_storage.sql",
    "202611050004_account_provision.sql",
"202611050005_confirmed_demo_rules.sql",
"202611060006_ars_export_projection.sql",
  ])
    await db.exec(
      await readFile(
        new URL("../../supabase/migrations/" + file, import.meta.url),
        "utf8",
      ),
    );
  await db.exec(
    await readFile(new URL("../../supabase/seed.sql", import.meta.url), "utf8"),
  );
  for (const id of Object.values(actor))
    await db.query(`insert into auth.users(id) values($1);`, [id]);
  await db.exec(`insert into public.accounts values('${actor.admin}','admin',true),('${actor.a}','buyer',true),('${actor.b}','buyer',true),('${actor.disabled}','buyer',false);
 insert into public.account_clients values('${actor.a}',1),('${actor.b}',2),('${actor.disabled}',3);`);
  return db;
}
async function as(db, who, operation) {
  await db.exec(
    `set role ${who ? "authenticated" : "anon"};select set_config('request.jwt.claim.sub','${who ? actor[who] : ""}',false);`,
  );
  try {
    return await operation();
  } finally {
    await db.exec("reset role;");
  }
}
test("SQL PostgreSQL/WASM: migrations, RLS, immutable history, idempotency and private file policies", async (t) => {
  const db = await setup();
  try {
    await t.test(
      "public catalog omits unpublished properties and private data",
      async () => {
        await db.exec(
          `update public.properties set published=false where id='los-olivos';`,
        );
        await as(db, null, async () => {
          assert.equal(
            (await db.query("select * from public.properties")).rows.length,
            1,
          );
          await assert.rejects(
            db.query("select * from public.contracts"),
            /permission denied/,
          );
        });
      },
    );
    await t.test(
      "buyer A cannot read B, change role, insert payment or call admin RPC",
      async () => {
        await as(db, "a", async () => {
          assert.deepEqual(
            (await db.query("select id from public.contracts")).rows,
            [{ id: 1 }],
          );
          assert.equal(
            (await db.query("select * from public.clients where id=2")).rows
              .length,
            0,
          );
          assert.equal(
            (
              await db.query(
                "select * from public.installments where plan_id=2",
              )
            ).rows.length,
            0,
          );
          await assert.rejects(
            db.exec(`update public.accounts set role='admin'`),
            /permission denied/,
          );
          await assert.rejects(
            db.exec(
              `insert into public.payments(contract_id,amount,paid_on,method,actor,request_id) values(1,500,'2026-11-05','Efectivo','${actor.a}',gen_random_uuid())`,
            ),
            /permission denied/,
          );
          await assert.rejects(
            db.exec(
              `select public.register_payment(1,500,'2026-11-05','Efectivo','[{"installment_id":9,"amount":500}]',gen_random_uuid())`,
            ),
            /Administrator required/,
          );
        });
        await as(db, "b", async () =>
          assert.deepEqual(
            (await db.query("select id from public.contracts")).rows,
            [{ id: 2 }],
          ),
        );
        await as(db, "disabled", async () =>
          assert.equal(
            (await db.query("select * from public.contracts")).rows.length,
            0,
          ),
        );
      },
    );
    let payment;
    await t.test(
      "integrity and privileged provisioning reject invalid or unauthorized writes",
      async () => {
        await assert.rejects(
          db.exec(
            `insert into public.clients(name,email) values('  ','wrong')`,
          ),
          /check constraint/,
        );
        await assert.rejects(
          db.exec(
            `insert into public.contracts(reference,signed_on,currency,total,deposit) values('INVALID','2026-01-01','USD',1,2)`,
          ),
          /check constraint/,
        );
        await as(db, "a", async () =>
          assert.rejects(
            db.exec(`select public.provision_buyer_link('${actor.b}',2)`),
            /Administrator required/,
          ),
        );
        const newUser = "00000000-0000-0000-0000-000000000005";
        await db.exec(
          `insert into auth.users(id,email) values('${newUser}','new@example.com');insert into public.clients(id,name,email) values(5,'Nueva demo','new@example.com');`,
        );
        await as(db, "admin", () =>
          db.exec(`select public.provision_buyer_link('${newUser}',5)`),
        );
        assert.equal(
          (
            await db.query(
              `select enabled from public.accounts where id='${newUser}'`,
            )
          ).rows[0].enabled,
          true,
        );
        await as(db, "admin", async () =>
          assert.rejects(
            db.exec(`select public.provision_buyer_link('${newUser}',5)`),
            /already linked/,
          ),
        );
      },
    );
    const request = "10000000-0000-0000-0000-000000000001";
    await t.test(
      "admin writes single installment allocation atomically, retry is idempotent",
      async () => {
        await as(db, "admin", async () => {
          const sql = `select public.register_payment(1,500,'2026-11-05','Transferencia','[{"installment_id":9,"amount":500}]','${request}') as id`;
          payment = (await db.query(sql)).rows[0].id;
          assert.equal((await db.query(sql)).rows[0].id, payment);
          await assert.rejects(
            db.exec(
              `select public.register_payment(1,501,'2026-11-05','Transferencia','[{"installment_id":9,"amount":501}]','${request}')`,
            ),
            /Idempotency key conflict/,
          );
          const before = (await db.query("select * from public.payments")).rows
            .length;
          await assert.rejects(
            db.exec(
              `select public.register_payment(1,500,'2026-11-05','Efectivo','[{"installment_id":49,"amount":500}]',gen_random_uuid())`,
            ),
            /another contract/,
          );
          await assert.rejects(
            db.exec(
              `select public.register_payment(1,500,'2026-11-05','Efectivo','[{"installment_id":9,"amount":100}]',gen_random_uuid())`,
            ),
            /total mismatch/,
          );
          assert.equal(
            (await db.query("select * from public.payments")).rows.length,
            before,
          );
          await db.exec(
            `select public.register_payment(1,50,'2026-11-05','Efectivo','[{"installment_id":9,"amount":50}]',gen_random_uuid())`,
          );
        });
      },
    );
    await t.test(
      "private receipt policies isolate direct object requests",
      async () => {
        await db.exec(
          `insert into public.receipts(payment_id,object_path,mime_type) values(${payment},'${payment}/test.pdf','application/pdf');insert into storage.objects(bucket_id,name) values('receipts','${payment}/test.pdf');`,
        );
        await as(db, "a", async () =>
          assert.equal(
            (
              await db.query(
                `select * from storage.objects where name='${payment}/test.pdf'`,
              )
            ).rows.length,
            1,
          ),
        );
        for (const who of ["b", "disabled", null])
          await as(db, who, async () =>
            assert.equal(
              (await db.query("select * from storage.objects")).rows.length,
              0,
            ),
          );
      },
    );
    await t.test(
      "void conserves original amount and immutable events, repeats cannot race status",
      async () => {
        await as(db, "admin", async () => {
          await assert.rejects(
            db.exec(
              `select public.void_payment(${payment},' ','20000000-0000-0000-0000-000000000001')`,
            ),
            /Reason required/,
          );
          const sql = `select public.void_payment(${payment},'Duplicado de prueba','20000000-0000-0000-0000-000000000001') as id`;
          const result = (await db.query(sql)).rows[0].id;
          assert.equal((await db.query(sql)).rows[0].id, result);
          await assert.rejects(
            db.exec(
              `select public.void_payment(${payment},'Otra anulación',gen_random_uuid())`,
            ),
            /already voided/,
          );
          const p = (
            await db.query(`select * from public.payments where id=${payment}`)
          ).rows[0];
          assert.equal(p.amount, "500.00");
          assert.equal(p.voided, true);
          assert.equal(
            (
              await db.query(
                `select * from public.payment_events where payment_id=${payment}`,
              )
            ).rows.length,
            2,
          );
          await assert.rejects(
            db.exec("delete from public.payment_events"),
            /permission denied/,
          );
        });
        await assert.rejects(
          db.exec("delete from public.payment_events"),
          /immutable/,
        );
        await assert.rejects(
          db.exec(`update public.payments set amount=1 where id=${payment}`),
          /immutable/,
        );
      },
    );
    await t.test(
      "account revocation removes contract visibility immediately",
      async () => {
        await as(db, "admin", () =>
          db.exec(`select public.set_account_enabled('${actor.a}',false)`),
        );
        await as(db, "a", async () =>
          assert.equal(
            (await db.query("select * from public.contracts")).rows.length,
            0,
          ),
        );
      },
    );
    await t.test(
      "unpublishing removes direct Storage policy visibility for photos",
      async () => {
        await db.exec(
          `update public.property_photos set reference_url=null,object_path='horizonte/test.jpg' where property_id='horizonte';insert into storage.objects(bucket_id,name) values('property-photos','horizonte/test.jpg');`,
        );
        await as(db, null, async () =>
          assert.equal(
            (
              await db.query(
                `select * from storage.objects where bucket_id='property-photos'`,
              )
            ).rows.length,
            1,
          ),
        );
        await db.exec(
          `update public.properties set published=false where id='horizonte';`,
        );
        await as(db, null, async () =>
          assert.equal(
            (
              await db.query(
                `select * from storage.objects where bucket_id='property-photos'`,
              )
            ).rows.length,
            0,
          ),
        );
      },
    );
  } finally {
    await db.close();
  }
});
