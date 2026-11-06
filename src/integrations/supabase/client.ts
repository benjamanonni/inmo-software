import { createClient } from "@supabase/supabase-js";

export const demoMode =
  import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO === "true";
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
export const supabase =
  url && key
    ? createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce",
        },
      })
    : null;
export function requireSupabase() {
  if (!supabase)
    throw new Error(
      "Falta configurar Supabase. Copiá .env.example a .env.local y completá URL y clave pública.",
    );
  return supabase;
}
