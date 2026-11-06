import { test } from "node:test";
import assert from "node:assert/strict";
import { summarizeInstallments } from "../../src/features/installments/summary.ts";
test("partial allocations, voids and multiple payments use amounts rather than payment count", () => {
  const installments = [
    {
      id: 1,
      plan_id: 1,
      number: 1,
      due_on: "2026-11-10",
      amount: 500,
      demo_state: "Pendiente" as const,
    },
  ];
  const payments = [
    { id: 1, voided: false },
    { id: 2, voided: false },
    { id: 3, voided: true },
  ];
  const allocations = [
    { payment_id: 1, installment_id: 1, amount: 200 },
    { payment_id: 2, installment_id: 1, amount: 100 },
    { payment_id: 3, installment_id: 1, amount: 500 },
  ];
  const result = summarizeInstallments(installments, allocations, payments)[0];
  assert.equal(result.paid, 300);
  assert.equal(result.remaining, 200);
  assert.equal(result.settled, false);
});
