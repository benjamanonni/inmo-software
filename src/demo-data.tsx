import { createContext, useContext, useState } from "react";
import { demoMode } from "./integrations/supabase/client";
import { LiveProvider } from "./features/admin/LiveProvider";
import type { CatalogProperty } from "./features/properties/service";
import type {
  Contract,
  Plan,
  Installment,
  Allocation,
  Lot,
  Receipt,
} from "./features/contracts/models";
import { properties as fixtures } from "./properties";
import type { ReactNode } from "react";

export const money = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
export interface Client {
  id: number;
  name: string;
  email: string;
  lot: string;
  enabled: boolean;
  accountId?: string;
}
export interface Payment {
  id: number;
  client: number;
  contract?: number;
  installment: number;
  amount: number;
  date: string;
  voided: boolean;
}
export interface PaymentEvent {
  payment: number;
  text: string;
  date: string;
}
const initialClients: Client[] = [
  {
    id: 1,
    name: "Lucía Fernández",
    email: "lucia@example.com",
    lot: "H-012",
    enabled: true,
  },
  {
    id: 2,
    name: "Martín Acosta",
    email: "martin@example.com",
    lot: "H-018",
    enabled: true,
  },
  {
    id: 3,
    name: "Carolina Ríos",
    email: "carolina@example.com",
    lot: "O-007",
    enabled: false,
  },
  {
    id: 4,
    name: "Diego Molina",
    email: "diego@example.com",
    lot: "O-014",
    enabled: true,
  },
];
const initialPayments: Payment[] = Array.from({ length: 8 }, (_, i) => ({
  id: 1008 - i,
  client: 1,
  installment: 8 - i,
  amount: 500,
  date: `2026-${String(10 - i).padStart(2, "0")}-05`,
  voided: false,
}));
export interface PaymentOptions {
  contract?: number;
  amount?: number;
  date?: string;
  method?: "Transferencia" | "Efectivo";
  request?: string;
  allocations?: { installment_id: number; amount: number }[];
}
export interface WorkspaceState {
  clients: Client[];
  payments: Payment[];
  events: PaymentEvent[];
  properties: CatalogProperty[];
  contracts: Contract[];
  plans: Plan[];
  installments: Installment[];
  allocations: Allocation[];
  lots: Lot[];
  receipts: Receipt[];
  contractClients: { contract_id: number; client_id: number }[];
  contractLots: { contract_id: number; lot_id: string }[];
  currentClient: Client | undefined;
  loading: boolean;
  error: string;
  busy: boolean;
  reload: () => Promise<void>;
  addClient: (name: string, email: string) => Promise<void>;
  toggleClient: (id: number) => Promise<void>;
  addPayment: (
    client: number,
    installment: number,
    options?: PaymentOptions,
  ) => Promise<void>;
  voidPayment: (id: number, reason: string, request?: string) => Promise<void>;
  published: boolean[];
  togglePublished: (index: number) => Promise<void>;
  editProperty: (index: number, description: string) => Promise<void>;
}
export const DemoContext = createContext<WorkspaceState | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  return demoMode ? (
    <VisualProvider>{children}</VisualProvider>
  ) : (
    <LiveProvider>{children}</LiveProvider>
  );
}
function VisualProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState(initialClients);
  const [payments, setPayments] = useState(initialPayments);
  const [events, setEvents] = useState<PaymentEvent[]>([
    {
      payment: 1008,
      text: "Pago registrado · USD 500 · Administración demo",
      date: "05/10/2026, 10:32",
    },
  ]);
  const [published, setPublished] = useState([true, true]);
  const [properties, setProperties] = useState(
    fixtures.map((p) => ({ ...p, published: true })),
  );
  const contracts: Contract[] = initialClients.map((c) => ({
    id: c.id,
    reference: "CR-2026-00" + c.id,
    signed_on: "2026-03-01",
    currency: "USD",
    total: 30000,
    deposit: 6000,
    demo_scenario: true,
  }));
  const plans: Plan[] = contracts.map((c) => ({
    id: c.id,
    contract_id: c.id,
    label: "48 cuotas sin intereses · demo",
  }));
  const installments: Installment[] = plans.flatMap((p) =>
    Array.from({ length: 48 }, (_, i) => ({
      id: (p.id - 1) * 48 + i + 1,
      plan_id: p.id,
      number: i + 1,
      due_on: new Date(Date.UTC(2026, i + 2, 10)).toISOString().slice(0, 10),
      amount: 500,
      demo_state: i === 8 ? ("A vencer" as const) : ("Pendiente" as const),
    })),
  );
  const [allocationOverrides, setAllocationOverrides] = useState<
    Record<number, { installment_id: number; amount: number }[]>
  >({});
  const allocations: Allocation[] = payments.flatMap((p) =>
    (
      allocationOverrides[p.id] ?? [
        {
          installment_id: (p.client - 1) * 48 + p.installment,
          amount: p.amount,
        },
      ]
    ).map((a) => ({ ...a, payment_id: p.id })),
  );
  return (
    <DemoContext.Provider
      value={{
        clients,
        payments,
        properties: properties.map((p, i) => ({
          ...p,
          published: published[i],
        })),
        contracts,
        plans,
        installments,
        allocations,
        lots: [],
        receipts: [],
        contractClients: contracts.map((c) => ({
          contract_id: c.id,
          client_id: c.id,
        })),
        contractLots: initialClients.map((c) => ({
          contract_id: c.id,
          lot_id: c.lot,
        })),
        currentClient: clients[0],
        loading: false,
        error: "",
        busy: false,
        reload: async () => {},
        editProperty: async (index, description) =>
          setProperties((current) =>
            current.map((p, i) =>
              i === index ? { ...p, subtitle: description } : p,
            ),
          ),
        events,
        published,
        addClient: async (name, email) =>
          setClients((current) => [
            ...current,
            { id: Date.now(), name, email, lot: "Sin asignar", enabled: false },
          ]),
        toggleClient: async (id) =>
          setClients((current) =>
            current.map((client) =>
              client.id === id
                ? { ...client, enabled: !client.enabled }
                : client,
            ),
          ),
        togglePublished: async (index) =>
          setPublished((current) =>
            current.map((value, i) => (i === index ? !value : value)),
          ),
        addPayment: async (client, installment, options) => {
          const id = Date.now();
          if (options?.allocations)
            setAllocationOverrides((current) => ({
              ...current,
              [id]: options.allocations!,
            }));
          setPayments((current) => [
            {
              id,
              client,
              installment,
              amount: options?.amount ?? 500,
              contract: options?.contract ?? client,
              date: options?.date ?? "2026-11-05",
              voided: false,
            },
            ...current,
          ]);
          setEvents((current) => [
            {
              payment: id,
              text: "Pago registrado · USD 500 · Administración demo",
              date: "05/11/2026, 12:00",
            },
            ...current,
          ]);
        },
        voidPayment: async (id, reason) => {
          setPayments((current) =>
            current.map((payment) =>
              payment.id === id ? { ...payment, voided: true } : payment,
            ),
          );
          setEvents((current) => [
            {
              payment: id,
              text: `Anulación · Activo → Anulado · ${reason} · Administración demo`,
              date: "05/11/2026, 12:01",
            },
            ...current,
          ]);
        },
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}
export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error("DemoProvider requerido");
  return value;
}
