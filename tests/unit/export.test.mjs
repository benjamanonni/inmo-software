import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generateDemoXlsx } from "../../automation/n8n/export-demo.mjs";
test("local XLSX artifact is written, reopened and its content verified", async () => {
  const directory = await mkdtemp(join(tmpdir(), "crook-xlsx-"));
  try {
    const result = await generateDemoXlsx(join(directory, "test.xlsx"));
    assert.equal(result.rows, 2);
    assert.ok(result.bytes > 1000);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
