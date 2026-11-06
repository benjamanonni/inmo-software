import { test } from "node:test";
import assert from "node:assert/strict";
import {
  installmentStatus,
  localToday,
} from "../../src/features/installments/status.ts";
test("five-day window includes due day, expires following day, settled always paid", () => {
  assert.equal(
    installmentStatus("2026-11-10", false, "2026-11-04"),
    "Pendiente",
  );
  assert.equal(
    installmentStatus("2026-11-10", false, "2026-11-05"),
    "A vencer",
  );
  assert.equal(
    installmentStatus("2026-11-10", false, "2026-11-10"),
    "A vencer",
  );
  assert.equal(installmentStatus("2026-11-10", false, "2026-11-11"), "Vencida");
  assert.equal(installmentStatus("2026-11-10", true, "2026-11-11"), "Pagada");
  assert.equal(localToday(new Date("2026-11-06T01:00:00Z")), "2026-11-05");
});
