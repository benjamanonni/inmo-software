import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { DemoContext } from "../../demo-data";
import type { WorkspaceState } from "../../demo-data";
import { useAuth } from "../auth/AuthProvider";
import {
  listProperties,
  setPublished,
  updateProperty,
} from "../properties/service";
import { loadWorkspace } from "../contracts/service";
import { createClient, enableAccount } from "../clients/service";
import { registerPayment, cancelPayment } from "../payments/service";
import { errorMessage } from "../../shared/result";

export function LiveProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [catalog, setCatalog] = useState<WorkspaceState["properties"]>([]);
  const [workspace, setWorkspace] = useState<Awaited<
    ReturnType<typeof loadWorkspace>
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const generation = useRef(0);
  const reload = useCallback(async () => {
    const current = ++generation.current;
    setLoading(true);
    setError("");
    try {
      const [properties, data] = await Promise.all([
        listProperties(),
        auth.session && auth.enabled ? loadWorkspace() : Promise.resolve(null),
      ]);
      if (current === generation.current) {
        setCatalog(properties);
        setWorkspace(data);
      }
    } catch (failure) {
      if (current === generation.current) {
        setCatalog([]);
        setWorkspace(null);
        setError(errorMessage(failure));
      }
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }, [auth.session, auth.enabled]);
  useEffect(() => {
    void reload();
  }, [reload]);
  useEffect(() => {
    const invalidate = () => {
      generation.current += 1;
    };
    return invalidate;
  }, []);
  // No synthetic data on errors: identities and relationships come only from RLS-filtered responses.
  const data = workspace;
  const linkedIds =
    data?.links
      .filter((l) => l.account_id === auth.session?.user.id)
      .map((l) => l.client_id) ?? [];
  const clients = (data?.clients ?? []).map((c) => {
    const links = data?.links.filter((l) => l.client_id === c.id) ?? [];
    const account = data?.accounts.find((a) =>
      links.some((l) => l.account_id === a.id),
    );
    const contractIds =
      data?.contractClients
        .filter((l) => l.client_id === c.id)
        .map((l) => l.contract_id) ?? [];
    return {
      ...c,
      enabled: account?.enabled ?? false,
      accountId: account?.id,
      lot:
        [...new Set(data?.contractLots
          .filter((l) => contractIds.includes(l.contract_id))
          .map((l) => l.lot_id))]
          .join(", ") || "Sin asignar",
    };
  });
  const payments = (data?.payments ?? [])
    .map((p) => {
      const allocated =
        data?.allocations.filter((a) => a.payment_id === p.id) ?? [];
      return {
        id: p.id,
        client:
          data?.contractClients.find((l) => l.contract_id === p.contract_id)
            ?.client_id ?? 0,
        contract: p.contract_id,
        installment:
          data?.installments.find((i) => i.id === allocated[0]?.installment_id)
            ?.number ?? 0,
        amount: p.amount,
        date: p.paid_on,
        voided: p.voided,
      };
    })
    .sort((a, b) => b.id - a.id);
  const currentClient = clients.find((c) => linkedIds.includes(c.id));
  const run = async (operation: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await operation();
      await reload();
    } finally {
      setBusy(false);
    }
  };
  const value: WorkspaceState = {
    clients,
    payments,
    properties: catalog,
    published: catalog.map((p) => p.published),
    events: (data?.events ?? [])
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((e) => ({
        payment: e.payment_id,
        text: `${e.operation === "registered" ? "Pago registrado" : "Anulación"} · ${e.reason} · ${e.actor}`,
        date: e.created_at,
      })),
    contracts: data?.contracts ?? [],
    plans: data?.plans ?? [],
    installments: data?.installments ?? [],
    allocations: data?.allocations ?? [],
    lots: data?.lots ?? [],
    receipts: data?.receipts ?? [],
    contractClients: data?.contractClients ?? [],
    contractLots: data?.contractLots ?? [],
    currentClient,
    loading,
    error,
    busy,
    reload,
    addClient: (name, email) => run(() => createClient(name, email)),
    toggleClient: (id) =>
      run(async () => {
        const client = clients.find((c) => c.id === id);
        if (!client?.accountId)
          throw new Error(
            "Primero creá o vinculá la cuenta desde el servicio administrativo.",
          );
        await enableAccount(client.accountId, !client.enabled);
      }),
    togglePublished: (index) =>
      run(async () => {
        const property = catalog[index];
        if (!property) throw new Error("Propiedad no encontrada");
        await setPublished(property.id, !property.published);
      }),
    editProperty: (index, description) =>
      run(async () => {
        const property = catalog[index];
        if (!property) throw new Error("Propiedad no encontrada");
        await updateProperty(property.id, description);
      }),
    addPayment: (client, number, options) =>
      run(async () => {
        const contract =
          options?.contract ??
          data?.contractClients.filter((l) => l.client_id === client)[0]
            ?.contract_id;
        if (!contract) throw new Error("Seleccioná un contrato válido.");
        const planIds =
          data?.plans
            .filter((p) => p.contract_id === contract)
            .map((p) => p.id) ?? [];
        const installment = data?.installments.find(
          (i) => planIds.includes(i.plan_id) && i.number === number,
        );
        if (!installment)
          throw new Error("Cuota no encontrada para este contrato.");
        await registerPayment({
          contract,
          amount: options?.amount ?? installment.amount,
          paidOn: options?.date ?? new Date().toISOString().slice(0, 10),
          method: options?.method ?? "Transferencia",
          allocations: options?.allocations ?? [
            {
              installment_id: installment.id,
              amount: options?.amount ?? installment.amount,
            },
          ],
          request: options?.request ?? crypto.randomUUID(),
        });
      }),
    voidPayment: (id, reason, request) =>
      run(() => cancelPayment(id, reason, request ?? crypto.randomUUID())),
  };
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
