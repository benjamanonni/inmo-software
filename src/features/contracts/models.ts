import { z } from "zod";
const id = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
export const clientSchema = z.object({
  id,
  name: z.string(),
  email: z.email(),
});
export const accountSchema = z.object({
  id: z.uuid(),
  role: z.enum(["super_admin", "admin", "buyer"]),
  enabled: z.boolean(),
});
export const linkSchema = z.object({ account_id: z.uuid(), client_id: id });
export const contractSchema = z.object({
  id,
  reference: z.string(),
  signed_on: z.string(),
  currency: z.enum(["ARS", "USD"]),
  price: z.number().nullable().optional(),
  interest_percent: z.number().optional(),
  rule_code: z.string().optional(),
  total: z.number().positive(),
  deposit: z.number().nonnegative(),
  demo_scenario: z.literal(true),
});
export const contractClientSchema = z.object({
  contract_id: id,
  client_id: id,
});
export const contractLotSchema = z.object({
  contract_id: id,
  lot_id: z.string(),
});
export const planSchema = z.object({ id, contract_id: id, label: z.string() });
export const installmentSchema = z.object({
  id,
  plan_id: id,
  number: id,
  due_on: z.string(),
  amount: z.number().positive(),
  demo_state: z.enum(["Pendiente", "Al día", "A vencer", "Vencidas"]),
});
export const paymentSchema = z.object({
  id,
  contract_id: id,
  amount: z.number().positive(),
  paid_on: z.string(),
  method: z.string(),
  voided: z.boolean(),
  actor: z.uuid(),
  created_at: z.string(),
});
export const allocationSchema = z.object({
  payment_id: id,
  installment_id: id,
  amount: z.number().positive(),
});
export const eventSchema = z.object({
  id: z.uuid(),
  payment_id: id,
  operation: z.string(),
  reason: z.string(),
  actor: z.uuid(),
  created_at: z.string(),
});
export const lotSchema = z.object({
  id: z.string(),
  property_id: z.string(),
  area: z.number().nullable(),
  block: z.string().nullable(),
  demo_state: z.string(),
});
export const receiptSchema = z.object({
  id: z.uuid(),
  payment_id: id,
  object_path: z.string(),
  mime_type: z.enum(["application/pdf", "image/png", "image/jpeg"]),
});
export type Contract = z.infer<typeof contractSchema>;
export type Plan = z.infer<typeof planSchema>;
export type Installment = z.infer<typeof installmentSchema>;
export type Allocation = z.infer<typeof allocationSchema>;
export type Lot = z.infer<typeof lotSchema>;
export type Receipt = z.infer<typeof receiptSchema>;
