import { z } from "zod";
import { requireSupabase } from "../../integrations/supabase/client";
export async function createClient(name: string, email: string) {
  const input = z
    .object({ name: z.string().trim().min(1).max(100), email: z.email() })
    .parse({ name, email });
  const { error } = await requireSupabase().from("clients").insert(input);
  if (error) throw error;
}
export async function enableAccount(account: string, enabled: boolean) {
  const { error } = await requireSupabase().rpc("set_account_enabled", {
    p_account: account,
    p_enabled: enabled,
  });
  if (error) throw error;
}
export async function createBuyerAccount(clientId: number, email: string) {
  const { data, error } = await requireSupabase().functions.invoke(
    "manage-buyer",
    { body: { clientId, email } },
  );
  if (error) throw error;
  return z
    .object({ status: z.literal("provisioned"), userId: z.uuid() })
    .parse(data);
}
