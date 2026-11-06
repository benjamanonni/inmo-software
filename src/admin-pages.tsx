import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { PropertyAdmin } from "./features/properties/PropertyAdmin";
import { PaymentsPanel } from "./features/payments/PaymentsPanel";
import { errorMessage } from "./shared/result";
import { demoMode } from "./integrations/supabase/client";
import {
  ConnectedContracts,
  ConnectedLots,
  ConnectedReports,
  ConnectedOverview,
} from "./features/admin/ConnectedViews";
import { createBuyerAccount } from "./features/clients/service";
import { money, useDemo } from "./demo-data";

import {
  Badge,
  Metric,
  Panel,
  Empty,
  Modal,
  PlanDetails,
} from "./workspace-ui";

export function AdminOverview() {
  if (!demoMode) return <ConnectedOverview />;
  return <VisualOverview />;
}
function VisualOverview() {
  const { clients, payments, events } = useDemo();
  const paid = payments
    .filter((p) => !p.voided)
    .reduce((sum, p) => sum + p.amount, 0);
  return (
    <>
      <div className="metrics">
        <Metric
          label="Clientes registrados"
          value={String(clients.length).padStart(2, "0")}
          detail="Cartera de demostración"
        />
        <Metric
          label="Pagos registrados"
          value={money(paid)}
          detail="Importe activo en esta demo"
        />
        <Metric
          label="Cobranza del mes"
          value="75%"
          detail="Indicador ilustrativo · 3 de 4 clientes"
        />
        <Metric
          label="Cuotas a revisar"
          value="02"
          detail="Estados de ejemplo, sin recargos"
        />
      </div>
      <div className="dashboard-grid">
        <Panel
          title="Panorama de cobranza"
          action={<Badge tone="neutral">2026 · Ilustrativo</Badge>}
        >
          <div
            className="bar-chart"
            aria-label="Gráfico ilustrativo de cobros: junio 1200, julio 1700, agosto 1400, septiembre 1900, octubre 2200, noviembre 1500 dólares"
          >
            {[48, 68, 56, 76, 88, 60].map((v, i) => (
              <div key={i}>
                <span>{money(v * 25)}</span>
                <div
                  className={`chart-bar ${i === 5 ? "current" : ""}`}
                  style={{ height: `${v}%` }}
                />
                <small>{["JUN", "JUL", "AGO", "SEP", "OCT", "NOV"][i]}</small>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Tu cartera, de un vistazo">
          <div className="portfolio-ring">
            <div>
              <strong>75%</strong>
              <span>Sin vencidas · demo</span>
            </div>
          </div>
          <div className="legend-list">
            <span>
              <i className="dot green" />
              Al día <b>2 clientes</b>
            </span>
            <span>
              <i className="dot amber" />A vencer <b>1 cliente</b>
            </span>
            <span>
              <i className="dot red" />
              Vencidas <b>1 cliente</b>
            </span>
          </div>
          <small className="muted">
            75% sin vencidas: 2 al día + 1 a vencer. Clasificación de ejemplo.
          </small>
        </Panel>
      </div>
      <div className="dashboard-grid">
        <Panel
          title="Próximos movimientos"
          action={<Link to="/admin/pagos">Ver pagos ↗</Link>}
        >
          <div className="activity-row">
            <span className="activity-icon">↗</span>
            <div>
              <strong>Lucía Fernández</strong>
              <small>Horizonte · Lote H-012 · Cuota 09</small>
            </div>
            <div>
              <strong>{money(500)}</strong>
              <Badge tone="amber">A vencer · 10 nov.</Badge>
            </div>
          </div>
          <div className="activity-row">
            <span className="activity-icon">!</span>
            <div>
              <strong>Martín Acosta</strong>
              <small>Horizonte · Lote H-018 · Cuota 06</small>
            </div>
            <div>
              <strong>{money(500)}</strong>
              <Badge tone="red">Vencida · 20 oct.</Badge>
            </div>
          </div>
        </Panel>
        <Panel title="Actividad reciente">
          {events.slice(0, 3).map((event, i) => (
            <div className="timeline-item" key={i}>
              <i />
              <div>
                <strong>{event.text}</strong>
                <small>
                  Referencia #{event.payment} · {event.date}
                </small>
              </div>
            </div>
          ))}
        </Panel>
      </div>
    </>
  );
}

export function Clients() {
  const { clients, addClient } = useDemo();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const selectedClient = clients.find((c) => c.id === selected);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await addClient(
        String(form.get("name")).trim(),
        String(form.get("email")).trim(),
      );
      setAdding(false);
      setMessage("Cliente registrado.");
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="action-row">
        <label className="search-field">
          Buscar cliente
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nombre o correo electrónico"
          />
        </label>
        <button className="dash-button" onClick={() => setAdding(true)}>
          + Nuevo cliente
        </button>
      </div>
      <Panel title="Personas que construyen su futuro">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Lote</th>
                <th>Cuenta de acceso</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {clients
                .filter((c) =>
                  `${c.name} ${c.email}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.name}</strong>
                      <small>{c.email}</small>
                    </td>
                    <td>{c.lot}</td>
                    <td>
                      <Badge tone={c.enabled ? "green" : "neutral"}>
                        {c.enabled ? "Habilitada" : "Sin habilitar"}
                      </Badge>
                    </td>
                    <td>
                      <button
                        className="table-action"
                        onClick={() => setSelected(c.id)}
                      >
                        Ver ficha ↗
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!clients.some((c) =>
          `${c.name} ${c.email}`.toLowerCase().includes(search.toLowerCase()),
        ) && <Empty text="No hay clientes que coincidan con tu búsqueda." />}
      </Panel>
      {adding && (
        <Modal title="Nuevo cliente demo" close={() => setAdding(false)}>
          <form className="dash-form" onSubmit={submit}>
            <label>
              Nombre y apellido
              <input name="name" required maxLength={100} pattern=".*\S.*" />
            </label>
            <label>
              Correo electrónico
              <input name="email" type="email" required />
            </label>
            <p className="muted">
              {demoMode
                ? "Se crea sin contrato y sin acceso habilitado. Solo se conserva durante esta sesión de diseño."
                : "El cliente se guarda en PostgreSQL, sin cuenta de acceso automática."}
            </p>
            {message && <p role="status">{message}</p>}
            <button className="dash-button" disabled={busy}>
              Crear cliente
            </button>
          </form>
        </Modal>
      )}
      {selectedClient && (
        <Modal title={selectedClient.name} close={() => setSelected(null)}>
          <dl className="detail-list">
            <div>
              <dt>Correo</dt>
              <dd>{selectedClient.email}</dd>
            </div>
            <div>
              <dt>Lote asociado</dt>
              <dd>{selectedClient.lot}</dd>
            </div>
            <div>
              <dt>Cuenta</dt>
              <dd>{selectedClient.enabled ? "Habilitada" : "Sin habilitar"}</dd>
            </div>
          </dl>
          <Link className="dash-button" to="/admin/contratos">
            Revisar contratos ↗
          </Link>
        </Modal>
      )}
    </>
  );
}

export function Contracts() {
  if (!demoMode) return <ConnectedContracts />;
  return <VisualContracts />;
}
function VisualContracts() {
  const { clients } = useDemo();
  const [detail, setDetail] = useState(false);
  return (
    <>
      <div className="metrics three">
        <Metric
          label="Contratos de ejemplo"
          value="04"
          detail="Una propuesta de financiación por cliente"
        />
        <Metric
          label="Valor contractual de ejemplo"
          value={money(30000)}
          detail="Plan utilizado en todas las fichas demo"
        />
        <Metric
          label="Anticipo ilustrativo"
          value="20%"
          detail="USD 6.000 · Sin intereses en la simulación"
        />
      </div>
      <Panel title="Contratos y planes de financiación">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Contrato / titular</th>
                <th>Lote</th>
                <th>Plan demo</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {clients
                .filter((c) => c.lot !== "Sin asignar")
                .map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>CR-2026-00{c.id}</strong>
                      <small>{c.name}</small>
                    </td>
                    <td>{c.lot}</td>
                    <td>48 cuotas de {money(500)}</td>
                    <td>
                      <Badge>Vigente</Badge>
                    </td>
                    <td>
                      <button
                        className="table-action"
                        onClick={() => setDetail(true)}
                      >
                        Ver condiciones ↗
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Panel>
      {detail && (
        <Modal
          title="Condiciones del plan · Ejemplo"
          close={() => setDetail(false)}
        >
          <PlanDetails />
          <p className="demo-callout">
            Ejemplo autorizado para diseño: no es una oferta, una regla
            productiva ni un cálculo de intereses aprobado.
          </p>
        </Modal>
      )}
    </>
  );
}

export function Lots() {
  if (!demoMode) return <ConnectedLots />;
  return <VisualLots />;
}
function VisualLots() {
  const [lot, setLot] = useState(12);
  return (
    <div className="dashboard-grid lots-grid">
      <Panel title="Horizonte · Mapa de lotes">
        <div className="lot-map-label">ACCESO PRINCIPAL — PLANO FICTICIO</div>
        <div className="lot-grid">
          {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={`${[12, 18].includes(n) ? "sold" : ""} ${n === lot ? "selected" : ""}`}
              aria-pressed={n === lot}
              onClick={() => setLot(n)}
            >
              <span>H-{String(n).padStart(3, "0")}</span>
              <small>
                {[12, 18].includes(n) ? "Adjudicado" : "Disponible demo"}
              </small>
            </button>
          ))}
        </div>
        <p className="muted">
          Distribución, disponibilidad y superficies ficticias. Sin valor
          catastral.
        </p>
      </Panel>
      <Panel title={`Lote H-${String(lot).padStart(3, "0")}`}>
        <Badge tone={[12, 18].includes(lot) ? "neutral" : "green"}>
          {[12, 18].includes(lot) ? "Adjudicado" : "Disponible demo"}
        </Badge>
        <dl className="detail-list">
          <div>
            <dt>Desarrollo</dt>
            <dd>Horizonte</dd>
          </div>
          <div>
            <dt>Superficie ficticia</dt>
            <dd>300 m²</dd>
          </div>
          <div>
            <dt>Manzana</dt>
            <dd>A · Demo</dd>
          </div>
          <div>
            <dt>Titular</dt>
            <dd>
              {lot === 12
                ? "Lucía Fernández"
                : lot === 18
                  ? "Martín Acosta"
                  : "Sin asignar"}
            </dd>
          </div>
        </dl>
        <Link className="dash-button" to="/admin/contratos">
          Ver contratos ↗
        </Link>
      </Panel>
    </div>
  );
}

export function Payments({ admin = false }: { admin?: boolean }) {
  return <PaymentsPanel admin={admin} />;
}

export function Properties() {
  if (!demoMode) return <PropertyAdmin />;
  return <VisualProperties />;
}
function VisualProperties() {
  const { published, togglePublished, properties, editProperty } = useDemo();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  return (
    <>
      <div className="demo-callout">
        Las publicaciones se reflejan en el catálogo durante esta sesión. La
        edición de fotografías y el almacenamiento se conectarán a Supabase.
      </div>
      {message && (
        <p role="status" className="demo-callout">
          {message}
        </p>
      )}
      <div className="admin-properties">
        {properties.map((p, i) => (
          <section className="dash-panel" key={p.id}>
            <img src={p.image} alt={`Referencia de ${p.title}`} />
            <div className="property-admin-body">
              <Badge tone={published[i] ? "green" : "neutral"}>
                {published[i] ? "Publicada" : "Sin publicar"}
              </Badge>
              <h2>{p.title}</h2>
              <p>{notes[i] ?? p.subtitle}</p>
              <div className="button-group">
                <button
                  className="dash-button"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await togglePublished(i);
                    } catch (error) {
                      setMessage(errorMessage(error));
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {published[i] ? "Despublicar" : "Publicar"}
                </button>
                <button
                  className="dash-button secondary"
                  onClick={() => setEditing(i)}
                >
                  Editar descripción
                </button>
              </div>
            </div>
          </section>
        ))}
      </div>
      {editing !== null && (
        <Modal
          title={`Editar ${properties[editing]?.title}`}
          close={() => setEditing(null)}
        >
          <form
            className="dash-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              setBusy(true);
              try {
                const value = String(form.get("description"));
                await editProperty(editing, value);
                setNotes((current) => ({ ...current, [editing]: value }));
                setEditing(null);
              } catch (error) {
                setMessage(errorMessage(error));
              } finally {
                setBusy(false);
              }
            }}
          >
            <label>
              Nota interna de presentación
              <textarea
                name="description"
                required
                defaultValue={notes[editing] ?? properties[editing]?.subtitle}
              />
            </label>
            <p className="muted">
              Nota de diseño interna; no modifica todavía el texto comercial
              público.
            </p>
            <button className="dash-button">Guardar nota demo</button>
          </form>
        </Modal>
      )}
    </>
  );
}

export function Reports() {
  if (!demoMode) return <ConnectedReports />;
  return <VisualReports />;
}
function VisualReports() {
  const { clients } = useDemo();
  const [filter, setFilter] = useState("Todas");
  const states = ["Al día", "Vencidas", "A vencer", "Al día"];
  return (
    <>
      <div className="metrics three">
        <Metric label="Al día" value="50%" detail="2 de 4 clientes demo" />
        <Metric label="A vencer" value="25%" detail="1 de 4 clientes demo" />
        <Metric label="Vencidas" value="25%" detail="1 de 4 clientes demo" />
      </div>
      <div className="demo-callout">
        Clasificación ficticia preasignada. No calcula mora, intereses,
        penalizaciones ni períodos de tolerancia.
      </div>
      <div className="filter-tabs" aria-label="Filtrar por estado">
        {["Todas", "Al día", "A vencer", "Vencidas"].map((s) => (
          <button
            aria-pressed={s === filter}
            className={s === filter ? "selected" : ""}
            onClick={() => setFilter(s)}
            key={s}
          >
            {s}
          </button>
        ))}
      </div>
      <Panel title="Estado de la cartera de ejemplo">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Lote</th>
                <th>Estado demo</th>
                <th>Referencia</th>
              </tr>
            </thead>
            <tbody>
              {clients
                .slice(0, 4)
                .filter((_, i) => filter === "Todas" || states[i] === filter)
                .map((c) => {
                  const state = states[c.id - 1];
                  return (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.lot}</td>
                      <td>
                        <Badge
                          tone={
                            state === "Vencidas"
                              ? "red"
                              : state === "A vencer"
                                ? "amber"
                                : "green"
                          }
                        >
                          {state}
                        </Badge>
                      </td>
                      <td>Clasificación manual ilustrativa</td>
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

export function Accounts() {
  const { clients, toggleClient, reload } = useDemo();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<number | null>(null);
  return (
    <>
      <div className="demo-callout">
        {demoMode
          ? "Cuentas de demostración sin registro público. Esta vista visual no reemplaza Auth ni RLS."
          : "Cuentas de compradores gestionadas mediante servicio de servidor. La habilitación no sustituye el vínculo cuenta–cliente."}
      </div>
      {message && (
        <p className="demo-callout" role="status">
          {message}
        </p>
      )}
      <Panel title="Accesos de compradores">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Cuenta / cliente</th>
                <th>Vínculo</th>
                <th>Acceso</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.email}</strong>
                    <small>{c.name}</small>
                  </td>
                  <td>
                    {c.lot === "Sin asignar"
                      ? "Pendiente de vincular"
                      : `Contrato CR-2026-00${c.id}`}
                  </td>
                  <td>
                    <Badge tone={c.enabled ? "green" : "neutral"}>
                      {c.enabled ? "Habilitado" : "Deshabilitado"}
                    </Badge>
                  </td>
                  <td>
                    {!demoMode && !c.accountId && (
                      <button
                        className="table-action"
                        disabled={busy}
                        onClick={async () => {
                          setBusy(true);
                          try {
                            await createBuyerAccount(c.id, c.email);
                            await reload();
                            setMessage(
                              "Cuenta creada y vinculada. El comprador puede solicitar recuperación desde el ingreso.",
                            );
                          } catch (error) {
                            setMessage(errorMessage(error));
                          } finally {
                            setBusy(false);
                          }
                        }}
                      >
                        Crear cuenta segura
                      </button>
                    )}
                    <button
                      className="table-action"
                      disabled={
                        busy ||
                        c.lot === "Sin asignar" ||
                        (!demoMode && !c.accountId)
                      }
                      onClick={() => setConfirm(c.id)}
                    >
                      {c.enabled ? "Deshabilitar" : "Habilitar"} acceso
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      {confirm !== null && (
        <Modal title="Cambiar acceso demo" close={() => setConfirm(null)}>
          <p>
            Se cambiará la habilitación de la cuenta de ejemplo. Si es Lucía, su
            portal mostrará el cambio durante esta sesión.
          </p>
          <button
            className="dash-button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await toggleClient(confirm);
                setConfirm(null);
              } catch (error) {
                setMessage(errorMessage(error));
              } finally {
                setBusy(false);
              }
            }}
          >
            Confirmar cambio
          </button>
        </Modal>
      )}
    </>
  );
}
