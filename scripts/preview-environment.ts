// Vercel must never publish a build connected to a developer's local stack.
export function validatePreviewEnvironment(
  env: Record<string, string | undefined>,
) {
  if (env.VERCEL !== "1") return;
  if (env.VERCEL_ENV !== "preview")
    throw new Error("Crook deployment is authorized for Vercel Preview only.");
  if (env.VITE_ENABLE_DEMO !== "false")
    throw new Error("Preview requires VITE_ENABLE_DEMO=false.");
  let url: URL;
  try {
    url = new URL(env.VITE_SUPABASE_URL ?? "");
  } catch {
    throw new Error("Preview requires an isolated Supabase Cloud URL.");
  }
  if (
    url.protocol !== "https:" ||
    !/^[a-z]{20}\.supabase\.co$/.test(url.hostname) ||
    url.username ||
    url.password ||
    url.port ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw new Error("Preview requires a canonical HTTPS Supabase Cloud URL.");
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";
  let publicKey = key.startsWith("sb_publishable_") && key.length > 25;
  if (key.split(".").length === 3) {
    try {
      const payload = JSON.parse(
        Buffer.from(key.split(".")[1], "base64url").toString("utf8"),
      );
      publicKey =
        payload.role === "anon" && payload.ref === url.hostname.split(".")[0];
    } catch {
      publicKey = false;
    }
  }
  if (!publicKey)
    throw new Error(
      "Preview requires a public publishable/anon key, never an administrative key.",
    );
  const allowed = new Set([
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    "VITE_ENABLE_DEMO",
  ]);
  if (
    Object.keys(env).some(
      (name) => name.startsWith("VITE_") && !allowed.has(name),
    )
  )
    throw new Error(
      "Unexpected VITE_ variable: review public configuration before deployment.",
    );
}
