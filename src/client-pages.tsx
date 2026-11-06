import { useState } from "react";
import { Link } from "react-router-dom";
import { money } from "./demo-data";
import { Badge, Metric, Panel, Empty } from "./workspace-ui";
import { useBuyerPlan } from "./features/installments/useBuyerPlan";
import { demoMode } from "./integrations/supabase/client";
import { useAuth } from "./features/auth/AuthProvider";

function ContractSelector({ data }: { data: ReturnType<typeof useBuyerPlan> }) {
  return (
    <div className="action-row">
      <label className="search-field">
        Contrato
        <select
          value={data.contract?.id ?? ""}
          onChange={(e) => data.setSelected(Number(e.target.value))}
        >
          {data.contracts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.reference}
            </option>
          ))}
        </select>
      </label>
      {data.plans.length > 1 && (
        <label className="search-field">
          Plan
          <select
            value={data.plan?.id ?? ""}
            onChange={(e) => data.setSelectedPlan(Number(e.target.value))}
          >
            {data.plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
export function ClientOverview() {
  const data = useBuyerPlan();
  const { contract, installments, total, registered, lots, properties } = data;
  if (!contract)
    return (
      <Empty text="No hay contratos vinculados a tu cuenta. Contactá a administración." />
    );
  const settled = installments.filter((i) => i.settled).length;
  const next = data.upcoming;
  const paidPercent = Math.min(
    100,
    Math.round((total / contract.total) * 10000) / 100,
  );
  const remainingPercent = Math.max(0, 100 - paidPercent);
  return (
    <>
      <ContractSelector data={data} />
      <div className="client-welcome">
        <div>
          <Badge>Tu proyecto está en marcha</Badge>
          <h2>
            Un paso más cerca
            <br />
            de tu <em>lugar.</em>
          </h2>
          <p>
            {lots} · {contract.reference}
          </p>
          <Link className="dash-button" to="/cliente/lote">
            Conocer mi lote ↗
          </Link>
        </div>
        <div
          className="welcome-photo"
          style={
            properties[0]?.image
              ? { backgroundImage: "url(" + properties[0].image + ")" }
              : undefined
          }
          role="img"
          aria-label="Paisaje de referencia"
        />
      </div>
      <div className="metrics">
        <Metric
          label="Valor del contrato demo"
          value={money(contract.total, contract.currency)}
          detail={"Moneda: " + contract.currency}
        />
        <Metric
          label="Aportes registrados demo"
          value={money(total, contract.currency)}
          detail={
            paidPercent.toLocaleString("es-AR") +
            "% pagado · " +
            settled +
            " cuotas cubiertas"
          }
        />
        <Metric
          label="Pendiente del plan demo"
          value={money(Math.max(0, contract.total - total), contract.currency)}
          detail={remainingPercent.toLocaleString("es-AR") + "% pendiente"}
        />
        <Metric
          label="Cuotas registradas"
          value={settled + " / " + installments.length}
          detail="Cuotas cubiertas según imputaciones"
        />
      </div>
      <div className="dashboard-grid">
        <Panel title="El recorrido de tu proyecto">
          <div className="progress-summary">
            <strong>{Math.round((total / contract.total) * 100)}%</strong>
            <span>del valor del escenario registrado</span>
          </div>
          <progress
            value={Math.min(total, contract.total)}
            max={contract.total}
            aria-label="Avance de aportes"
          />
          <div className="progress-labels">
            <span>{money(total, contract.currency)} registrados</span>
            <span>{money(contract.total, contract.currency)} total</span>
          </div>
          <div className="milestones">
            <span>
              Anticipo registrado: {money(contract.deposit, contract.currency)}
            </span>
            <span>Cuotas: {money(registered, contract.currency)}</span>
          </div>
        </Panel>
        <Panel title="Tu próxima cuota">
          {next ? (
            <>
              <div className="next-payment">
                <span>
                  Cuota {next.number} / {installments.length}
                </span>
                <strong>{money(next.remaining, contract.currency)}</strong>
                <Badge tone="amber">
                  Vencimiento registrado · {next.due_on}
                </Badge>
              </div>
              <p className="muted">
                Los pagos son registrados manualmente por administración. Sin
                pagos online.
              </p>
              <Link className="table-action" to="/cliente/cuotas">
                Ver todas mis cuotas →
              </Link>
            </>
          ) : (
            <Empty text="Todas las cuotas del plan están cubiertas." />
          )}
        </Panel>
      </div>
      <p className="demo-callout">
        Datos de demostración. Aportes y pendiente se muestran únicamente para
        el escenario contractual cargado. El total incluye el interés definido
        para ese contrato; no se agregan recargos de mora ni refinanciaciones.
      </p>
    </>
  );
}
export function ClientLot() {
  const data = useBuyerPlan();
  const { contract, currentClient, lots } = data;
  if (!contract) return <Empty text="No hay contratos asociados." />;
  return (
    <>
      <ContractSelector data={data} />
      <div className="dashboard-grid">
        <Panel title="Tu lugar">
          <div className="lot-identification">
            <h2>Lote {lots}</h2>
            <Badge>Contrato demo</Badge>
          </div>
          <dl className="detail-list">
            <div>
              <dt>Titular autorizado</dt>
              <dd>{currentClient?.name}</dd>
            </div>
            <div>
              <dt>Contrato</dt>
              <dd>{contract.reference}</dd>
            </div>
            <div>
              <dt>Fecha registrada</dt>
              <dd>{contract.signed_on}</dd>
            </div>
            {data.lots &&
              data.lots.split(", ").map((id) => {
                const lot = data.contractLots.find((l) => l.lot_id === id);
                return (
                  <div key={id}>
                    <dt>Lote vinculado</dt>
                    <dd>{lot?.lot_id}</dd>
                  </div>
                );
              })}
          </dl>
        </Panel>
        <Panel title="Tu plan, con claridad">
          <dl className="detail-list">
            <div>
              <dt>Valor del lote</dt>
              <dd>{money(contract.total, contract.currency)}</dd>
            </div>
            <div>
              <dt>Anticipo del contrato</dt>
              <dd>{money(contract.deposit)}</dd>
            </div>
            <div>
              <dt>Total financiado con interés</dt>
              <dd>
                {money(contract.total - contract.deposit, contract.currency)}
              </dd>
            </div>
            <div>
              <dt>Plan seleccionado</dt>
              <dd>{data.plan?.label ?? "Sin plan"}</dd>
            </div>
            <div>
              <dt>Cuotas cargadas</dt>
              <dd>{data.installments.length}</dd>
            </div>
          </dl>
          <Link className="dash-button" to="/cliente/cuotas">
            Consultar mis cuotas ↗
          </Link>
        </Panel>
      </div>
      <Panel title="Información contractual">
        <p className="muted">
          Escenario ficticio cargado para demostración. Esta ficha no es un
          contrato firmado. Un cliente puede tener más de un contrato y cada
          contrato puede vincular varios lotes; son supuestos técnicos de demo
          pendientes de aprobación productiva.
        </p>
      </Panel>
    </>
  );
}
export function Installments() {
  const data = useBuyerPlan();
  const [filter, setFilter] = useState("Todas");
  const [message, setMessage] = useState("");
  if (!data.contract)
    return <Empty text="No hay un plan asociado a tu cuenta." />;
  const count = data.installments.filter((i) => i.settled).length;
  return (
    <>
      <ContractSelector data={data} />
      <div className="metrics three">
        <Metric
          label="Cuotas registradas"
          value={String(count).padStart(2, "0")}
          detail={money(data.registered) + " imputados al plan"}
        />
        <Metric
          label="Cuotas pendientes"
          value={String(data.installments.length - count)}
          detail="Sin recargos por mora"
        />
        <Metric
          label="Plan"
          value={String(data.installments.length) + " cuotas"}
          detail={data.plan?.label ?? ""}
        />
      </div>
      <div className="filter-tabs">
        {["Todas", "Registradas", "Pendientes"].map((s) => (
          <button
            key={s}
            className={filter === s ? "selected" : ""}
            aria-pressed={filter === s}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>
      {message && (
        <p className="feedback" role="status">
          {message}
        </p>
      )}
      <Panel
        title="Tu plan de cuotas"
        action={<Badge tone="neutral">{data.contract.reference}</Badge>}
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Cuota</th>
                <th>Vencimiento</th>
                <th>Importe</th>
                <th>Imputado</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.installments
                .filter(
                  (i) =>
                    filter === "Todas" ||
                    (i.settled
                      ? filter === "Registradas"
                      : filter === "Pendientes"),
                )
                .map((i) => (
                  <tr key={i.id}>
                    <td>
                      <strong>
                        {String(i.number).padStart(2, "0")} /{" "}
                        {data.installments.length}
                      </strong>
                    </td>
                    <td>{i.due_on}</td>
                    <td>{money(i.amount, data.contract!.currency)}</td>
                    <td>{money(i.paid, data.contract!.currency)}</td>
                    <td>
                      <Badge
                        tone={
                          i.settled
                            ? "green"
                            : i.status === "A vencer"
                              ? "amber"
                              : "neutral"
                        }
                      >
                        {i.settled
                          ? "Registrada"
                          : i.paid > 0
                            ? "Pago parcial"
                            : i.status}
                      </Badge>
                    </td>
                    <td>
                      {i.paid > 0 ? (
                        <Link className="table-action" to="/cliente/pagos">
                          Ver pago ↗
                        </Link>
                      ) : (
                        <button
                          className="table-action"
                          onClick={() =>
                            setMessage(
                              "Los pagos deben registrarse por administración. No hay pagos online.",
                            )
                          }
                        >
                          Información
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
export function ClientProfile() {
  const data = useBuyerPlan();
  const auth = useAuth();
  const [recovery, setRecovery] = useState(false);
  const client = data.currentClient;
  return (
    <div className="dashboard-grid">
      <Panel title="Tus datos">
        <div className="profile-large">
          <span className="avatar">{client?.name.slice(0, 2)}</span>
          <div>
            <h2>{client?.name ?? "Sin vínculo"}</h2>
            <Badge>Comprador autorizado</Badge>
          </div>
        </div>
        <dl className="detail-list">
          <div>
            <dt>Correo</dt>
            <dd>{client?.email}</dd>
          </div>
          <div>
            <dt>Identificador</dt>
            <dd>{client?.id}</dd>
          </div>
          <div>
            <dt>Lotes vinculados</dt>
            <dd>{client?.lot}</dd>
          </div>
          <div>
            <dt>Cuenta</dt>
            <dd>{client?.enabled ? "Habilitada" : "Deshabilitada"}</dd>
          </div>
        </dl>
      </Panel>
      <Panel title="Seguridad y acceso">
        <h3>Tu espacio, tu información.</h3>
        <p className="muted">Las cuentas son habilitadas por administración.</p>
        {demoMode ? (
          <>
            <button
              className="dash-button secondary"
              onClick={() => setRecovery(true)}
            >
              Ver recuperación de acceso
            </button>
            {recovery && (
              <div className="demo-callout" role="status">
                La vista visual no envía correos. Usá el modo Supabase para
                autenticación real.
              </div>
            )}
            <Link className="table-action profile-exit" to="/acceso">
              Salir de la vista de demostración →
            </Link>
          </>
        ) : (
          <>
            <Link className="dash-button secondary" to="/acceso">
              Recuperar acceso
            </Link>
            <button
              className="table-action profile-exit"
              onClick={() => void auth.logout()}
            >
              Cerrar sesión
            </button>
          </>
        )}
      </Panel>
    </div>
  );
}
