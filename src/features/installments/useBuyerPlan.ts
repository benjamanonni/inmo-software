import { useState } from "react";
import { useDemo } from "../../demo-data";
import { summarizeInstallments } from "./summary";
import { installmentStatus } from "./status";
import { demoMode } from "../../integrations/supabase/client";
export function useBuyerPlan() {
  const data = useDemo();
  const [selected, setSelected] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(0);
  const ids = data.contractClients
    .filter((c) => c.client_id === data.currentClient?.id)
    .map((c) => c.contract_id);
  const contracts = data.contracts
    .filter((c) => !demoMode || ids.includes(c.id))
    .sort(
      (a, b) => Number(b.currency === "ARS") - Number(a.currency === "ARS"),
    );
  const contract = contracts.find((c) => c.id === selected) ?? contracts[0];
  const plans = data.plans.filter((p) => p.contract_id === contract?.id);
  const plan = plans.find((p) => p.id === selectedPlan) ?? plans[0];
  const installments = summarizeInstallments(
    data.installments
      .filter((i) => i.plan_id === plan?.id)
      .sort((a, b) => a.number - b.number),
    data.allocations,
    data.payments,
  );
  const classified = installments.map((i) => ({
    ...i,
    status: installmentStatus(
      i.due_on,
      i.settled,
      demoMode ? "2026-11-05" : undefined,
    ),
  }));
  const upcoming = classified
    .filter((i) => !i.settled && i.status !== "Vencida")
    .sort((a, b) => a.due_on.localeCompare(b.due_on))[0];
  const registered = installments.reduce((sum, i) => sum + i.paid, 0);
  const total = (contract?.deposit ?? 0) + registered;
  const lots = data.contractLots
    .filter((l) => l.contract_id === contract?.id)
    .map((l) => l.lot_id)
    .join(", ");
  return {
    ...data,
    contracts,
    contract,
    plans,
    plan,
    installments: classified,
    upcoming,
    registered,
    total,
    lots,
    setSelected,
    setSelectedPlan,
  };
}
