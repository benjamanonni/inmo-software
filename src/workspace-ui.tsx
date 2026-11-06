import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { money } from "./demo-data";

export function Badge({
  children,
  tone = "green",
}: {
  children: ReactNode;
  tone?: "green" | "amber" | "red" | "neutral";
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

export function Panel({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="dash-panel">
      <div className="panel-heading">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Empty({ text }: { text: string }) {
  return <div className="empty-state">{text}</div>;
}

export function Modal({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return (
    <dialog
      className="dash-dialog"
      ref={dialog}
      aria-labelledby={titleId}
      onCancel={close}
    >
      <div className="panel-heading">
        <h2 id={titleId}>{title}</h2>
        <button className="icon-button" onClick={close} aria-label="Cerrar">
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function PlanDetails() {
  return (
    <dl className="detail-list">
      <div>
        <dt>Valor del lote</dt>
        <dd>{money(30000)}</dd>
      </div>
      <div>
        <dt>Anticipo · 20%</dt>
        <dd>{money(6000)}</dd>
      </div>
      <div>
        <dt>Capital financiado · 80%</dt>
        <dd>{money(24000)}</dd>
      </div>
      <div>
        <dt>Plan</dt>
        <dd>48 cuotas de {money(500)}</dd>
      </div>
      <div>
        <dt>Interés ilustrativo</dt>
        <dd>0% · Sin recargos en la demo</dd>
      </div>
      <div>
        <dt>Moneda</dt>
        <dd>Dólares estadounidenses · USD</dd>
      </div>
    </dl>
  );
}
