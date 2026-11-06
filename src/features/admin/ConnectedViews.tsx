import { ContractForm } from "../contracts/ContractForm";
import { summarizeInstallments } from "../installments/summary";
import { installmentStatus } from "../installments/status";
import { useState } from "react";
import { useDemo, money } from "../../demo-data";
import { Panel, Modal, Badge, Empty, Metric } from "../../workspace-ui";
export function ConnectedOverview() {
  const data = useDemo();
  const active = data.payments.filter((p) => !p.voided);
  const next = summarizeInstallments(
    data.installments,
    data.allocations,
    data.payments,
  )
    .map((i) => ({ ...i, status: installmentStatus(i.due_on, i.settled) }))
    .filter((i) => i.status === "A vencer" || i.status === "Vencida");
  return (
    <>
      <div className="metrics">
        <Metric
          label="Clientes registrados"
          value={String(data.clients.length)}
          detail="Consultados desde PostgreSQL"
        />
        <Metric
          label="Pagos activos"
          value={money(
            active
              .filter(
                (p) =>
                  data.contracts.find((c) => c.id === p.contract)?.currency ===
                  "ARS",
              )
              .reduce((sum, p) => sum + p.amount, 0),
          )}
          detail="Pagos ARS sin anular; sin mezclar monedas"
        />
        <Metric
          label="Contratos"
          value={String(data.contracts.length)}
          detail="Escenarios de demostración cargados"
        />
        <Metric
          label="Propiedades publicadas"
          value={String(data.properties.filter((p) => p.published).length)}
          detail="Estado actual del catálogo"
        />
      </div>
      <div className="dashboard-grid">
        <Panel title="Cuotas con estado de seguimiento">
          <p className="muted">
            Aviso desde cinco días antes del vencimiento, incluido el día de
            vencimiento.
          </p>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Contrato</th>
                  <th>Cuota</th>
                  <th>Importe</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {next.map((i) => (
                  <tr key={i.id}>
                    <td>
                      {
                        data.contracts.find(
                          (c) =>
                            c.id ===
                            data.plans.find((p) => p.id === i.plan_id)
                              ?.contract_id,
                        )?.reference
                      }
                    </td>
                    <td>{i.number}</td>
                    <td>
                      {money(
                        i.amount,
                        data.contracts.find(
                          (c) =>
                            c.id ===
                            data.plans.find((p) => p.id === i.plan_id)
                              ?.contract_id,
                        )?.currency ?? "ARS",
                      )}
                    </td>
                    <td>
                      <Badge
                        tone={i.demo_state === "Vencidas" ? "red" : "amber"}
                      >
                        {i.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!next.length && (
            <Empty text="Sin cuotas con estado de seguimiento cargado." />
          )}
        </Panel>
        <Panel title="Actividad reciente">
          {data.events.slice(0, 6).map((event, i) => (
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
          {!data.events.length && <Empty text="Sin eventos registrados." />}
        </Panel>
      </div>
    </>
  );
}
export function ConnectedContracts() {
  const data = useDemo();
  const [selected, setSelected] = useState(0);
  const contract = data.contracts.find((c) => c.id === selected);
  return (
    <>
      <ContractForm />
      <Panel title="Contratos y planes persistentes">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Contrato</th>
                <th>Titulares</th>
                <th>Lotes</th>
                <th>Importe</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.contracts.map((c) => (
                <tr key={c.id}>
                  <td>{c.reference}</td>
                  <td>
                    {data.clients
                      .filter((client) =>
                        data.contractClients.some(
                          (link) =>
                            link.contract_id === c.id &&
                            link.client_id === client.id,
                        ),
                      )
                      .map((c) => c.name)
                      .join(", ")}
                  </td>
                  <td>
                    {data.contractLots
                      .filter((l) => l.contract_id === c.id)
                      .map((l) => l.lot_id)
                      .join(", ")}
                  </td>
                  <td>{money(c.total, c.currency)}</td>
                  <td>
                    <button
                      className="table-action"
                      onClick={() => setSelected(c.id)}
                    >
                      Ver condiciones ↗
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!data.contracts.length && <Empty text="No hay contratos cargados." />}
      </Panel>
      {contract && (
        <Modal title={contract.reference} close={() => setSelected(0)}>
          <dl className="detail-list">
            <div>
              <dt>Moneda</dt>
              <dd>{contract.currency}</dd>
            </div>
            <div>
              <dt>Total del escenario</dt>
              <dd>{money(contract.total, contract.currency)}</dd>
            </div>
            <div>
              <dt>Anticipo</dt>
              <dd>{money(contract.deposit, contract.currency)}</dd>
            </div>
          </dl>
          {data.plans
            .filter((p) => p.contract_id === contract.id)
            .map((plan) => (
              <section key={plan.id}>
                <h3>{plan.label}</h3>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Cuota</th>
                        <th>Vencimiento</th>
                        <th>Importe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.installments
                        .filter((i) => i.plan_id === plan.id)
                        .map((i) => (
                          <tr key={i.id}>
                            <td>{i.number}</td>
                            <td>{i.due_on}</td>
                            <td>{money(i.amount)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
        </Modal>
      )}
    </>
  );
}
export function ConnectedLots() {
  const { lots, contractLots, contracts } = useDemo();
  return (
    <Panel title="Lotes registrados">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Lote</th>
              <th>Propiedad</th>
              <th>Superficie</th>
              <th>Estado demo</th>
              <th>Contratos</th>
            </tr>
          </thead>
          <tbody>
            {lots.map((l) => (
              <tr key={l.id}>
                <td>{l.id}</td>
                <td>{l.property_id}</td>
                <td>{l.area ?? "Sin registrar"} m²</td>
                <td>
                  <Badge>{l.demo_state}</Badge>
                </td>
                <td>
                  {contractLots
                    .filter((cl) => cl.lot_id === l.id)
                    .map(
                      (cl) =>
                        contracts.find((c) => c.id === cl.contract_id)
                          ?.reference,
                    )
                    .join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!lots.length && <Empty text="No hay lotes registrados." />}
    </Panel>
  );
}
export function ConnectedReports() {
  const data = useDemo();
  const rows = summarizeInstallments(
    data.installments,
    data.allocations,
    data.payments,
  )
    .map((i) => ({ ...i, status: installmentStatus(i.due_on, i.settled) }))
    .sort((a, b) => a.due_on.localeCompare(b.due_on));
  return (
    <>
      <p className="demo-callout">
        A vencer: desde cinco días antes hasta el día del vencimiento. Vencida:
        desde el día siguiente. Sin intereses adicionales ni recargos.
      </p>
      <Panel title="Estado de cada cuota">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Contrato</th>
                <th>Cuota</th>
                <th>Vencimiento</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i.id}>
                  <td>
                    {
                      data.contracts.find(
                        (c) =>
                          c.id ===
                          data.plans.find((p) => p.id === i.plan_id)
                            ?.contract_id,
                      )?.reference
                    }
                  </td>
                  <td>{i.number}</td>
                  <td>{i.due_on}</td>
                  <td>
                    <Badge
                      tone={
                        i.status === "Vencida"
                          ? "red"
                          : i.status === "A vencer"
                            ? "amber"
                            : i.status === "Pagada"
                              ? "green"
                              : "neutral"
                      }
                    >
                      {i.status}
                    </Badge>
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
