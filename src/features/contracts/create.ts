import { z } from "zod";
import { requireSupabase } from "../../integrations/supabase/client";
export async function createContract(input: {
  client: number;
  lot: string;
  reference: string;
  price: number;
  count: number;
  firstDue: string;
}) {
  const value = z
    .object({
      client: z.number().int().positive(),
      lot: z.string().min(1),
      reference: z.string().trim().min(1).max(100),
      price: z.number().positive(),
      count: z.number().int().min(1).max(600),
      firstDue: z.iso.date(),
    })
    .parse(input);
  const { data, error } = await requireSupabase().rpc("create_demo_contract", {
    p_client: value.client,
    p_lot: value.lot,
    p_reference: value.reference,
    p_price: value.price,
    p_count: value.count,
    p_first_due: value.firstDue,
  });
  if (error) throw error;
  return z.number().int().parse(data);
}
