import { createContext, useContext, useState } from "react";
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
}
export interface Payment {
  id: number;
  client: number;
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
interface DemoState {
  clients: Client[];
  payments: Payment[];
  events: PaymentEvent[];
  addClient: (name: string, email: string) => void;
  toggleClient: (id: number) => void;
  addPayment: (client: number, installment: number) => void;
  voidPayment: (id: number, reason: string) => void;
  published: boolean[];
  togglePublished: (index: number) => void;
}
const DemoContext = createContext<DemoState | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
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
  return (
    <DemoContext.Provider
      value={{
        clients,
        payments,
        events,
        published,
        addClient: (name, email) =>
          setClients((current) => [
            ...current,
            { id: Date.now(), name, email, lot: "Sin asignar", enabled: false },
          ]),
        toggleClient: (id) =>
          setClients((current) =>
            current.map((client) =>
              client.id === id
                ? { ...client, enabled: !client.enabled }
                : client,
            ),
          ),
        togglePublished: (index) =>
          setPublished((current) =>
            current.map((value, i) => (i === index ? !value : value)),
          ),
        addPayment: (client, installment) => {
          const id = Date.now();
          setPayments((current) => [
            {
              id,
              client,
              installment,
              amount: 500,
              date: "2026-11-05",
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
        voidPayment: (id, reason) => {
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
