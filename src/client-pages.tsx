import { useState } from "react";
import { Link } from "react-router-dom";
import { money, useDemo } from "./demo-data";
import { properties } from "./properties";
import { Badge, Metric, Panel, Empty, PlanDetails } from "./workspace-ui";

export function ClientOverview() {
  const { payments } = useDemo();
  const paid = payments.filter((p) => p.client === 1 && !p.voided).length;
  const total = 6000 + paid * 500;
  return (
    <>
      <div className="client-welcome">
        <div>
          <Badge>Tu proyecto está en marcha</Badge>
          <h2>
            Un paso más cerca
            <br />
            de tu <em>lugar.</em>
          </h2>
          <p>Horizonte · Lote H-012 · Contrato CR-2026-001</p>
          <Link className="dash-button" to="/cliente/lote">
            Conocer mi lote ↗
          </Link>
        </div>
        <div
          className="welcome-photo"
          role="img"
          aria-label="Paisaje de referencia del desarrollo"
        />
      </div>
      <div className="metrics">
        <Metric
          label="Valor del contrato demo"
          value={money(30000)}
          detail="Moneda: USD"
        />
        <Metric
          label="Aportes registrados demo"
          value={money(total)}
          detail={`Anticipo + ${paid} cuotas activas`}
        />
        <Metric
          label="Pendiente del plan demo"
          value={money(30000 - total)}
          detail="Ejemplo aritmético sin intereses"
        />
        <Metric
          label="Cuotas registradas"
          value={`${paid} / 48`}
          detail="Plan ficticio de USD 500 por cuota"
        />
      </div>
      <div className="dashboard-grid">
        <Panel title="El recorrido de tu proyecto">
          <div className="progress-summary">
            <strong>{Math.round((total / 30000) * 100)}%</strong>
            <span>del valor del ejemplo registrado</span>
          </div>
          <progress
            value={total}
            max={30000}
            aria-label="Avance de aportes del ejemplo"
          />
          <div className="progress-labels">
            <span>{money(total)} registrados</span>
            <span>{money(30000)} total</span>
          </div>
          <div className="milestones">
            <span>✓ Anticipo · 20%</span>
            <span>◷ Plan en curso · 80%</span>
            <span>○ Finalización del plan</span>
          </div>
        </Panel>
        <Panel title="Tu próxima cuota">
          {paid >= 48 ? (
            <Empty text="Todas las cuotas del ejemplo están registradas." />
          ) : (
            <>
              <div className="next-payment">
                <span>
                  Cuota{" "}
                  {String(
                    Array.from({ length: 48 }, (_, i) => i + 1).find(
                      (n) =>
                        !payments.some(
                          (p) =>
                            p.client === 1 && p.installment === n && !p.voided,
                        ),
                    ),
                  ).padStart(2, "0")}{" "}
                  / 48
                </span>
                <strong>{money(500)}</strong>
                <Badge tone="amber">Vencimiento de ejemplo · 10/11/2026</Badge>
              </div>
              <p className="muted">
                Los pagos se registran manualmente por la administración. Este
                portal no procesa pagos online.
              </p>
              <Link className="table-action" to="/cliente/cuotas">
                Ver todas mis cuotas →
              </Link>
            </>
          )}
        </Panel>
      </div>
      <p className="demo-callout">
        Los saldos y el avance representan únicamente el ejemplo de diseño
        autorizado: USD 30.000, anticipo del 20% y 48 cuotas sin intereses. No
        son reglas financieras productivas.
      </p>
    </>
  );
}

export function ClientLot() {
  return (
    <>
      <div className="dashboard-grid">
        <Panel title="Horizonte · Tu lugar">
          <div className="client-lot-image">
            <img
              src={properties[0].image}
              alt="Paisaje de referencia del desarrollo Horizonte"
            />
            <span>Imagen ilustrativa</span>
          </div>
          <div className="lot-identification">
            <h2>Lote H-012</h2>
            <Badge>Adjudicado · Demo</Badge>
          </div>
          <dl className="detail-list">
            <div>
              <dt>Superficie ficticia</dt>
              <dd>300 m²</dd>
            </div>
            <div>
              <dt>Manzana</dt>
              <dd>A · Demo</dd>
            </div>
            <div>
              <dt>Titular del ejemplo</dt>
              <dd>Lucía Fernández</dd>
            </div>
            <div>
              <dt>Contrato</dt>
              <dd>CR-2026-001</dd>
            </div>
          </dl>
        </Panel>
        <Panel title="Tu plan, con claridad">
          <PlanDetails />
          <Link className="dash-button" to="/cliente/cuotas">
            Consultar mis cuotas ↗
          </Link>
        </Panel>
      </div>
      <Panel title="Información contractual">
        <div className="contract-summary">
          <span className="document-icon">▤</span>
          <div>
            <strong>Contrato de demostración CR-2026-001</strong>
            <p>
              Inicio ilustrativo: 01/03/2026 · Compradora: Lucía Fernández.
              Documento pendiente de integración; esta ficha no constituye un
              contrato firmado.
            </p>
          </div>
          <Badge tone="neutral">Solo lectura</Badge>
        </div>
      </Panel>
    </>
  );
}

export function Installments() {
  const { payments } = useDemo();
  const [filter, setFilter] = useState("Todas");
  const [message, setMessage] = useState("");
  const count = payments.filter((p) => p.client === 1 && !p.voided).length;
  return (
    <>
      <div className="metrics three">
        <Metric
          label="Cuotas registradas"
          value={String(count).padStart(2, "0")}
          detail={money(count * 500) + " del plan"}
        />
        <Metric
          label="Cuotas pendientes"
          value={String(48 - count)}
          detail="Sin intereses ni recargos en el ejemplo"
        />
        <Metric
          label="Importe por cuota"
          value={money(500)}
          detail="48 cuotas · Moneda USD"
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
        action={<Badge tone="neutral">CR-2026-001</Badge>}
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Cuota</th>
                <th>Vencimiento demo</th>
                <th>Importe</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 48 }, (_, i) => i + 1)
                .filter(
                  (n) =>
                    filter === "Todas" ||
                    (payments.some(
                      (p) => p.client === 1 && p.installment === n && !p.voided,
                    )
                      ? filter === "Registradas"
                      : filter === "Pendientes"),
                )
                .map((n) => {
                  const paid = payments.some(
                    (p) => p.client === 1 && p.installment === n && !p.voided,
                  );
                  const date = new Date(Date.UTC(2026, n + 1, 10));
                  return (
                    <tr key={n}>
                      <td>
                        <strong>{String(n).padStart(2, "0")} / 48</strong>
                      </td>
                      <td>
                        {date.toLocaleDateString("es-AR", { timeZone: "UTC" })}
                      </td>
                      <td>{money(500)}</td>
                      <td>
                        <Badge
                          tone={paid ? "green" : n === 9 ? "amber" : "neutral"}
                        >
                          {paid
                            ? "Registrada"
                            : n === 9
                              ? "A vencer · demo"
                              : "Pendiente"}
                        </Badge>
                      </td>
                      <td>
                        {paid ? (
                          <Link className="table-action" to="/cliente/pagos">
                            Ver pago ↗
                          </Link>
                        ) : (
                          <button
                            className="table-action"
                            onClick={() =>
                              setMessage(
                                `Cuota ${n}: el pago debe ser registrado por administración. No hay pagos online en esta demo.`,
                              )
                            }
                          >
                            Información
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

export function ClientProfile() {
  const [recovery, setRecovery] = useState(false);
  return (
    <div className="dashboard-grid">
      <Panel title="Tus datos">
        <div className="profile-large">
          <span className="avatar">LF</span>
          <div>
            <h2>Lucía Fernández</h2>
            <Badge>Compradora de demostración</Badge>
          </div>
        </div>
        <dl className="detail-list">
          <div>
            <dt>Correo</dt>
            <dd>lucia@example.com</dd>
          </div>
          <div>
            <dt>Identificador</dt>
            <dd>CLI-DEMO-001</dd>
          </div>
          <div>
            <dt>Lote vinculado</dt>
            <dd>H-012</dd>
          </div>
          <div>
            <dt>Cuenta</dt>
            <dd>Habilitada por administración</dd>
          </div>
        </dl>
        <p className="muted">
          Para corregir tus datos o vínculos contractuales, comunicate con la
          administración cuando estén habilitados los canales.
        </p>
      </Panel>
      <Panel title="Seguridad y acceso">
        <h3>Tu espacio, tu información.</h3>
        <p className="muted">
          En el sistema integrado, accederás con email y contraseña. La demo
          permite explorar vistas sin una sesión real.
        </p>
        <button
          className="dash-button secondary"
          onClick={() => setRecovery(true)}
        >
          Ver recuperación de acceso
        </button>
        {recovery && (
          <div className="demo-callout" role="status">
            La recuperación de contraseña se conectará a Supabase Auth y correo
            transaccional. No se envió ningún correo.
          </div>
        )}
        <Link className="table-action profile-exit" to="/acceso">
          Salir de la vista de demostración →
        </Link>
      </Panel>
    </div>
  );
}
