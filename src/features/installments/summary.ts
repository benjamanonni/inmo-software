import type { Allocation, Installment } from "../contracts/models";
export function summarizeInstallments(
  installments: Installment[],
  allocations: Allocation[],
  payments: { id: number; voided: boolean }[],
) {
  const active = new Set(payments.filter((p) => !p.voided).map((p) => p.id));
  return installments.map((i) => {
    const paid =
      allocations
        .filter((a) => a.installment_id === i.id && active.has(a.payment_id))
        .reduce((sum, a) => sum + Math.round(a.amount * 100), 0) / 100;
    return {
      ...i,
      paid,
      settled: paid >= i.amount,
      remaining: Math.max(0, Math.round((i.amount - paid) * 100) / 100),
    };
  });
}
