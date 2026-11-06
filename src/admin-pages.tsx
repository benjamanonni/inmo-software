import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brand } from "./components";
import { money, useDemo } from "./demo-data";
import { properties } from "./properties";
import {
  Badge,
  Metric,
  Panel,
  Empty,
  Modal,
  PlanDetails,
} from "./workspace-ui";

export function AdminOverview() {
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
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const selectedClient = clients.find((c) => c.id === selected);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    addClient(
      String(data.get("name")).trim(),
      String(data.get("email")).trim(),
    );
    setAdding(false);
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
              Se crea sin contrato y sin acceso habilitado. Solo se conserva
              durante esta sesión de diseño.
            </p>
            <button className="dash-button">Crear cliente</button>
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
  const { payments, clients, addPayment, voidPayment, events } = useDemo();
  const [adding, setAdding] = useState(false);
  const [receipt, setReceipt] = useState<number | null>(null);
  const [voiding, setVoiding] = useState<number | null>(null);
  const [history, setHistory] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const rows = admin ? payments : payments.filter((p) => p.client === 1);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const client = Number(data.get("client"));
    const installment = Number(data.get("installment"));
    if (
      payments.some(
        (p) =>
          p.client === client && p.installment === installment && !p.voided,
      )
    ) {
      setMessage("Esta cuota ya tiene un pago activo. Revisá el historial.");
      return;
    }
    addPayment(client, installment);
    setAdding(false);
    setMessage(
      "Pago demo registrado. Ya se refleja en el portal del comprador.",
    );
  }
  const receiptPayment = payments.find((p) => p.id === receipt);
  return (
    <>
      <div className="action-row">
        <p>Registro manual · Sin pagos online</p>
        {admin && (
          <div className="button-group">
            <button
              className="dash-button secondary"
              onClick={() => setHistory(true)}
            >
              Ver historial
            </button>
            <button
              className="dash-button"
              onClick={() => {
                setMessage("");
                setAdding(true);
              }}
            >
              + Registrar pago
            </button>
          </div>
        )}
      </div>
      {message && (
        <p className="feedback" role="status">
          {message}
        </p>
      )}
      <Panel
        title={admin ? "Movimientos registrados" : "Mis pagos y comprobantes"}
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Referencia</th>
                {admin && <th>Cliente</th>}
                <th>Fecha</th>
                <th>Importe</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>PG-{String(p.id).slice(-4)}</strong>
                    <small>
                      Cuota {String(p.installment).padStart(2, "0")}
                    </small>
                  </td>
                  {admin && (
                    <td>{clients.find((c) => c.id === p.client)?.name}</td>
                  )}
                  <td>{p.date.split("-").reverse().join("/")}</td>
                  <td>{money(p.amount)}</td>
                  <td>
                    <Badge tone={p.voided ? "red" : "green"}>
                      {p.voided ? "Anulado" : "Registrado"}
                    </Badge>
                  </td>
                  <td>
                    <div className="button-group">
                      <button
                        className="table-action"
                        onClick={() => setReceipt(p.id)}
                      >
                        Ver comprobante
                      </button>
                      {admin && !p.voided && (
                        <button
                          className="table-action danger"
                          onClick={() => setVoiding(p.id)}
                        >
                          Anular
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && <Empty text="Todavía no hay pagos registrados." />}
      </Panel>
      {adding && (
        <Modal title="Registrar un pago manual" close={() => setAdding(false)}>
          <form className="dash-form" onSubmit={submit}>
            <label>
              Cliente
              <select name="client">
                {clients
                  .filter((c) => c.lot !== "Sin asignar")
                  .map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.name} · {c.lot}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Número de cuota
              <input
                name="installment"
                type="number"
                min="1"
                max="48"
                defaultValue="9"
                required
              />
            </label>
            <label>
              Importe del ejemplo
              <input value="USD 500" readOnly />
            </label>
            <label>
              Medio de pago
              <select>
                <option>Transferencia · Demo</option>
                <option>Efectivo · Demo</option>
              </select>
            </label>
            <p className="muted">
              Fecha de referencia: 05/11/2026. Este formulario registra una
              operación ficticia en memoria.
            </p>
            {message && <p role="alert">{message}</p>}
            <button className="dash-button">Confirmar registro demo</button>
          </form>
        </Modal>
      )}
      {voiding !== null && (
        <Modal title="Anular pago" close={() => setVoiding(null)}>
          <form
            className="dash-form"
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              voidPayment(voiding, String(data.get("reason")).trim());
              setVoiding(null);
              setMessage(
                "Pago anulado en la demo. El original y el evento permanecen en el historial.",
              );
            }}
          >
            <p>
              El pago original se conserva. Esta acción actualiza el resumen del
              comprador.
            </p>
            <label>
              Motivo de la anulación
              <textarea name="reason" required minLength={5} />
            </label>
            <button className="dash-button danger-button">
              Confirmar anulación demo
            </button>
          </form>
        </Modal>
      )}
      {receiptPayment && (
        <Modal
          title="Comprobante de demostración"
          close={() => setReceipt(null)}
        >
          <div className="receipt">
            <Brand />
            <div className="receipt-watermark">SIN VALIDEZ COMERCIAL</div>
            <h3>Constancia de registro manual</h3>
            <dl className="detail-list">
              <div>
                <dt>Referencia</dt>
                <dd>PG-{receiptPayment.id}</dd>
              </div>
              <div>
                <dt>Comprador</dt>
                <dd>
                  {clients.find((c) => c.id === receiptPayment.client)?.name}
                </dd>
              </div>
              <div>
                <dt>Cuota</dt>
                <dd>{receiptPayment.installment}</dd>
              </div>
              <div>
                <dt>Fecha</dt>
                <dd>{receiptPayment.date}</dd>
              </div>
              <div>
                <dt>Importe</dt>
                <dd>{money(receiptPayment.amount)}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>{receiptPayment.voided ? "ANULADO" : "Registrado"}</dd>
              </div>
            </dl>
            <p className="muted">
              Documento visual ficticio, no es un comprobante fiscal ni un
              archivo de Storage.
            </p>
          </div>
        </Modal>
      )}
      {history && (
        <Modal title="Trazabilidad de pagos" close={() => setHistory(false)}>
          {events.map((event, i) => (
            <div className="timeline-item" key={i}>
              <i />
              <div>
                <strong>{event.text}</strong>
                <small>
                  Pago #{event.payment} · {event.date}
                </small>
              </div>
            </div>
          ))}
          <button
            className="dash-button secondary"
            onClick={() => navigate("/cliente/pagos")}
          >
            Ver perspectiva del comprador ↗
          </button>
        </Modal>
      )}
    </>
  );
}

export function Properties() {
  const { published, togglePublished } = useDemo();
  const [editing, setEditing] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  return (
    <>
      <div className="demo-callout">
        Las publicaciones se reflejan en el catálogo durante esta sesión. La
        edición de fotografías y el almacenamiento se conectarán a Supabase.
      </div>
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
                  onClick={() => togglePublished(i)}
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
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              setNotes((current) => ({
                ...current,
                [editing]: String(data.get("description")),
              }));
              setEditing(null);
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
  const { clients, toggleClient } = useDemo();
  const [confirm, setConfirm] = useState<number | null>(null);
  return (
    <>
      <div className="demo-callout">
        Cuentas creadas por administración, sin registro público. Los controles
        de esta vista son una simulación de interfaz y no reemplazan Auth ni
        RLS.
      </div>
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
                    <button
                      className="table-action"
                      disabled={c.lot === "Sin asignar"}
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
            onClick={() => {
              toggleClient(confirm);
              setConfirm(null);
            }}
          >
            Confirmar cambio
          </button>
        </Modal>
      )}
    </>
  );
}
