import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { Navigate } from "react-router-dom";
import {
  demoMode,
  supabase,
  requireSupabase,
} from "../../integrations/supabase/client";
import { accountSchema } from "../contracts/models";

interface AuthState {
  session: Session | null;
  role: "admin" | "buyer" | null;
  enabled: boolean;
  loading: boolean;
  error: string;
  logout: () => Promise<void>;
}
const Context = createContext<AuthState | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [account, setAccount] = useState<{
    role: "admin" | "buyer";
    enabled: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(!demoMode && !!supabase);
  const [error, setError] = useState("");
  useEffect(() => {
    if (demoMode || !supabase) return;
    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      if (active) {
        setSession(next);
        setAccount(null);
        setLoading(!!next);
      }
    });
    void supabase.auth.getSession().then(({ data, error: failure }) => {
      if (active) {
        if (failure) setError("No se pudo recuperar la sesión.");
        setSession(data.session);
        if (!data.session) setLoading(false);
      }
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (!session || !supabase || demoMode) return;
    let active = true;
    const refresh = () => {
      void requireSupabase()
        .from("accounts")
        .select("id,role,enabled")
        .eq("id", session.user.id)
        .maybeSingle()
        .then(({ data, error: failure }) => {
          if (!active) return;
          const parsed = accountSchema.safeParse(data);
          setAccount(!failure && parsed.success ? parsed.data : null);
          setError(failure ? "No se pudo verificar la autorización." : "");
          setLoading(false);
        });
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
    };
  }, [session]);
  return (
    <Context.Provider
      value={{
        session,
        role: account?.role ?? null,
        enabled: account?.enabled ?? false,
        loading,
        error,
        logout: async () => {
          const { error: failure } = await requireSupabase().auth.signOut();
          if (failure) throw failure;
          setSession(null);
          setAccount(null);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAuth() {
  const state = useContext(Context);
  if (!state) throw new Error("AuthProvider requerido");
  return state;
}
export function Protected({
  admin,
  children,
}: {
  admin: boolean;
  children: ReactNode;
}) {
  const auth = useAuth();
  if (demoMode) return children;
  if (auth.loading)
    return (
      <p className="demo-callout" role="status">
        Verificando acceso…
      </p>
    );
  if (!auth.session) return <Navigate to="/acceso" replace />;
  if (auth.error || !auth.enabled || auth.role !== (admin ? "admin" : "buyer"))
    return (
      <div className="access-form">
        <h1>Acceso no habilitado</h1>
        <p>
          {auth.error ||
            "Esta cuenta no tiene permiso para acceder a esta sección."}
        </p>
        <button className="dash-button" onClick={() => void auth.logout()}>
          Cerrar sesión
        </button>
      </div>
    );
  return children;
}
