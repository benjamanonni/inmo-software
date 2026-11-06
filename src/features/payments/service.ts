import { z } from "zod";
import { requireSupabase } from "../../integrations/supabase/client";
export const paymentInput = z
  .object({
    contract: z.number().int().positive(),
    amount: z
      .number()
      .positive()
      .finite()
      .refine(
        (v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-7,
        "Máximo dos decimales",
      ),
    paidOn: z.iso.date(),
    method: z.enum(["Transferencia", "Efectivo"]),
    allocations: z
      .array(
        z.object({
          installment_id: z.number().int().positive(),
          amount: z.number().positive(),
        }),
      )
      .length(1, "Cada pago corresponde a una sola cuota"),
    request: z.uuid(),
  })
  .refine(
    (p) =>
      Math.abs(p.allocations.reduce((sum, a) => sum + a.amount, 0) - p.amount) <
      0.001,
    "Las imputaciones deben coincidir con el importe",
  );
export type PaymentInput = z.infer<typeof paymentInput>;
export async function registerPayment(input: PaymentInput) {
  const p = paymentInput.parse(input);
  const { data, error } = await requireSupabase().rpc("register_payment", {
    p_contract: p.contract,
    p_amount: p.amount,
    p_paid_on: p.paidOn,
    p_method: p.method,
    p_allocations: p.allocations,
    p_request: p.request,
  });
  if (error) throw error;
  return z.number().int().parse(data);
}
export async function cancelPayment(
  id: number,
  reason: string,
  request: string,
) {
  z.string().trim().min(5).max(1000).parse(reason);
  const { error } = await requireSupabase().rpc("void_payment", {
    p_payment: id,
    p_reason: reason.trim(),
    p_request: request,
  });
  if (error) throw error;
}
