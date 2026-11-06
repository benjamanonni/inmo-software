import { z } from "zod";
import { requireSupabase } from "../../integrations/supabase/client";
import * as model from "./models";
import type { Database } from "../../integrations/supabase/database.generated";

async function rows<T>(
  table: keyof Database["public"]["Tables"],
  schema: z.ZodType<T>,
): Promise<T[]> {
  const { data, error } = await requireSupabase().from(table).select("*");
  if (error) throw error;
  return schema.array().parse(data);
}
export async function loadWorkspace() {
  const [
    clients,
    accounts,
    links,
    contracts,
    contractClients,
    contractLots,
    plans,
    installments,
    payments,
    allocations,
    events,
    lots,
    receipts,
  ] = await Promise.all([
    rows("clients", model.clientSchema),
    rows("accounts", model.accountSchema),
    rows("account_clients", model.linkSchema),
    rows("contracts", model.contractSchema),
    rows("contract_clients", model.contractClientSchema),
    rows("contract_lots", model.contractLotSchema),
    rows("plans", model.planSchema),
    rows("installments", model.installmentSchema),
    rows("payments", model.paymentSchema),
    rows("payment_allocations", model.allocationSchema),
    rows("payment_events", model.eventSchema),
    rows("lots", model.lotSchema),
    rows("receipts", model.receiptSchema),
  ]);
  return {
    clients,
    accounts,
    links,
    contracts,
    contractClients,
    contractLots,
    plans,
    installments,
    payments,
    allocations,
    events,
    lots,
    receipts,
  };
}
