import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brand } from "../../components";
import { requireSupabase } from "../../integrations/supabase/client";
import { accountSchema } from "../contracts/models";
import { errorMessage } from "../../shared/result";

export function Login({ reset = false }: { reset?: boolean }) {
  const [recovery, setRecovery] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  return (
    <div className="access-page">
      <div className="access-story">
        <Brand />
        <div>
          <div className="eyebrow">Tu próximo capítulo</div>
          <h1 className="serif">
            Tu lugar.
            <br />
            <em>Más cerca.</em>
          </h1>
        </div>
      </div>
      <div className="access-form">
        <h2 className="serif">
          {reset
            ? "Nueva contraseña"
            : recovery
              ? "Recuperar acceso"
              : "Bienvenido a Crook."}
        </h2>
        <form
          className="dash-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy) return;
            const data = new FormData(e.currentTarget);
            setBusy(true);
            setMessage("");
            try {
              const db = requireSupabase();
              if (reset) {
                const { error } = await db.auth.updateUser({
                  password: String(data.get("password")),
                });
                if (error) throw error;
                await db.auth.signOut();
                setMessage("Contraseña actualizada. Volvé a iniciar sesión.");
              } else if (recovery) {
                await db.auth.resetPasswordForEmail(String(data.get("email")), {
                  redirectTo: `${location.origin}/recuperar`,
                });
                setMessage(
                  "Si la cuenta puede recuperar acceso, recibirá instrucciones por correo.",
                );
              } else {
                const { data: login, error } = await db.auth.signInWithPassword(
                  {
                    email: String(data.get("email")),
                    password: String(data.get("password")),
                  },
                );
                if (error) {
                  setMessage(
                    "No se pudo iniciar sesión. Revisá tus credenciales.",
                  );
                  return;
                }
                const access = await db
                  .from("accounts")
                  .select("id,role,enabled")
                  .eq("id", login.user.id)
                  .maybeSingle();
                const parsed = accountSchema.safeParse(access.data);
                if (access.error || !parsed.success || !parsed.data.enabled) {
                  await db.auth.signOut();
                  setMessage(
                    "Tu cuenta no tiene acceso habilitado. Contactá a administración.",
                  );
                  return;
                }
                navigate(parsed.data.role === "buyer" ? "/cliente" : "/admin");
              }
            } catch (error) {
              setMessage(errorMessage(error));
            } finally {
              setBusy(false);
            }
          }}
        >
          {!reset && (
            <label>
              Correo electrónico
              <input
                type="email"
                name="email"
                required
                autoComplete="username"
              />
            </label>
          )}
          {(!recovery || reset) && (
            <label>
              {reset ? "Nueva contraseña" : "Contraseña"}
              <input
                name="password"
                type="password"
                required
                minLength={reset ? 12 : 1}
                autoComplete={reset ? "new-password" : "current-password"}
              />
            </label>
          )}
          <button className="dash-button" disabled={busy}>
            {busy
              ? "Procesando…"
              : reset
                ? "Guardar contraseña"
                : recovery
                  ? "Solicitar recuperación"
                  : "Ingresar"}
          </button>
        </form>
        {message && (
          <p className="demo-callout" role="status">
            {message}
          </p>
        )}
        {!reset && (
          <button
            className="table-action"
            onClick={() => {
              setRecovery(!recovery);
              setMessage("");
            }}
          >
            {recovery ? "Volver al ingreso" : "Olvidé mi contraseña"}
          </button>
        )}
        <p className="muted">
          Las cuentas son habilitadas por administración. No hay registro
          público.
        </p>
        <Link to="/">← Volver al sitio</Link>
      </div>
    </div>
  );
}
