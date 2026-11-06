import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
test("n8n template is inactive, scheduled trigger disabled and references no embedded credentials", async () => {
  const workflow = JSON.parse(
    await readFile(
      new URL("../../automation/n8n/workflow.json", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(workflow.active, false);
  assert.equal(
    workflow.nodes.find((n) => n.type.includes("scheduleTrigger")).disabled,
    true,
  );
  for (const node of workflow.nodes) assert.equal(node.credentials, undefined);
  const names = new Set(workflow.nodes.map((n) => n.name));
  for (const [source, connections] of Object.entries(workflow.connections)) {
    assert.ok(names.has(source));
    for (const branch of connections.main)
      for (const edge of branch) assert.ok(names.has(edge.node));
  }
});
