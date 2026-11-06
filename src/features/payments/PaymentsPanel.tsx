import { useEffect, useRef, useState } from "react";
import { money, useDemo } from "../../demo-data";
import { Badge, Panel, Empty, Modal } from "../../workspace-ui";
import { Brand } from "../../components";
import { demoMode } from "../../integrations/supabase/client";
import { receiptUrl, uploadReceipt } from "./storage";
import { errorMessage } from "../../shared/result";

function ReceiptFile({ path, mime }: { path: string; mime: string }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const renew = () => {
      void receiptUrl(path).then(
        (value) => {
          if (active) {
            setUrl(value);
            setError("");
          }
        },
        () => {
          if (active) {
            setUrl("");
            setError("No se pudo autorizar el comprobante.");
          }
        },
      );
    };
    renew();
    const timer = setInterval(renew, 50000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [path]);
  if (error) return <p role="alert">{error}</p>;
  if (!url) return <p role="status">Autorizando comprobante…</p>;
  return mime === "application/pdf" ? (
    <iframe
      title="Comprobante privado"
      src={url + "#toolbar=0"}
      style={{ width: "100%", height: "60vh", border: 0 }}
    />
  ) : (
    <img alt="Comprobante privado" src={url} style={{ width: "100%" }} />
  );
}
export function PaymentsPanel({ admin = false }: { admin?: boolean }) {
  const data = useDemo();
  const [chosenContract, setChosenContract] = useState(
    data.contracts.find((c) => c.currency === "ARS")?.id ??
      data.contracts[0]?.id ??
      0,
  );
  const chosenPlans = data.plans.filter(
    (p) => p.contract_id === chosenContract,
  );
  const chosenCurrency =
    data.contracts.find((c) => c.id === chosenContract)?.currency ?? "ARS";
  const chosenAmount =
    data.installments.find((i) => i.plan_id === chosenPlans[0]?.id)?.amount ??
    687500;
  const [adding, setAdding] = useState(false);
  const [history, setHistory] = useState(false);
  const [receipt, setReceipt] = useState<number | null>(null);
  const [voiding, setVoiding] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const request = useRef(crypto.randomUUID());
  const contractIds = data.contractClients
    .filter((c) => c.client_id === data.currentClient?.id)
    .map((c) => c.contract_id);
  const rows =
    admin || !demoMode
      ? data.payments
      : data.payments.filter((p) =>
          p.contract
            ? contractIds.includes(p.contract)
            : p.client === data.currentClient?.id,
        );
  const receiptPayment = rows.find((p) => p.id === receipt);
  const run = async (fn: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      await fn();
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };
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
                request.current = crypto.randomUUID();
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
                {admin && <th>Cliente / contrato</th>}
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
                      Cuota {String(p.installment).padStart(2, "0")} · Puede
                      incluir otras imputaciones
                    </small>
                  </td>
                  {admin && (
                    <td>
                      {data.clients.find((c) => c.id === p.client)?.name}
                      <small>
                        {
                          data.contracts.find((c) => c.id === p.contract)
                            ?.reference
                        }
                      </small>
                    </td>
                  )}
                  <td>{p.date.split("-").reverse().join("/")}</td>
                  <td>
                    {money(
                      p.amount,
                      data.contracts.find(
                        (c) => c.id === (p.contract ?? p.client),
                      )?.currency ?? "ARS",
                    )}
                  </td>
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
                          onClick={() => {
                            request.current = crypto.randomUUID();
                            setVoiding(p.id);
                          }}
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
        <Modal
          title="Registrar un pago manual"
          close={() => !busy && setAdding(false)}
        >
          <form
            className="dash-form"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              void run(async () => {
                const contract = Number(form.get("contract"));
                const number = Number(form.get("installment"));
                const amount = Number(form.get("amount"));
                const second = Number(form.get("second"));
                const secondAmount = Number(form.get("secondAmount"));
                const planIds = data.plans
                  .filter(
                    (p) =>
                      p.contract_id === contract &&
                      p.id === Number(form.get("plan")),
                  )
                  .map((p) => p.id);
                const items = [
                  { number, amount },
                  ...(second ? [{ number: second, amount: secondAmount }] : []),
                ];
                const allocations = items.map((item) => {
                  const installment = data.installments.find(
                    (i) =>
                      planIds.includes(i.plan_id) && i.number === item.number,
                  );
                  if (!installment) throw new Error("Cuota no encontrada.");
                  return {
                    installment_id: installment.id,
                    amount: item.amount,
                  };
                });
                const client = data.contractClients.find(
                  (c) => c.contract_id === contract,
                )?.client_id;
                if (!client) throw new Error("Contrato sin titular.");
                await data.addPayment(client, number, {
                  contract,
                  amount: items.reduce((sum, i) => sum + i.amount, 0),
                  date: String(form.get("date")),
                  method:
                    form.get("method") === "Efectivo"
                      ? "Efectivo"
                      : "Transferencia",
                  request: request.current,
                  allocations,
                });
                setAdding(false);
                setMessage(
                  demoMode
                    ? "Pago demo registrado. Ya se refleja en el portal del comprador."
                    : "Pago persistido y consultado nuevamente.",
                );
              });
            }}
          >
            <label>
              Contrato
              <select
                name="contract"
                value={chosenContract}
                onChange={(e) => setChosenContract(Number(e.target.value))}
              >
                {data.contracts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.reference} ·{" "}
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
                  </option>
                ))}
              </select>
            </label>
            <label>
              Plan de financiación
              <select name="plan" key={chosenContract}>
                {chosenPlans.map((plan) => (
                  <option value={plan.id} key={plan.id}>
                    {
                      data.contracts.find((c) => c.id === plan.contract_id)
                        ?.reference
                    }{" "}
                    · {plan.label}
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
                defaultValue="9"
                required
              />
            </label>
            <label>
              Importe imputado ({chosenCurrency})
              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                key={chosenContract}
                defaultValue={chosenAmount}
                required
              />
            </label>

            <label>
              Fecha del pago
              <input
                name="date"
                type="date"
                required
                defaultValue={
                  demoMode
                    ? "2026-11-05"
                    : new Date().toISOString().slice(0, 10)
                }
              />
            </label>
            <label>
              Medio de pago
              <select name="method">
                <option>Transferencia</option>
                <option>Efectivo</option>
              </select>
            </label>
            <p className="muted">
              Admite pagos parciales y múltiples registros por cuota. El
              servidor valida la imputación y conserva el evento original.
            </p>
            {message && <p role="alert">{message}</p>}
            <button className="dash-button" disabled={busy}>
              {busy ? "Registrando…" : "Confirmar registro demo"}
            </button>
          </form>
        </Modal>
      )}
      {voiding !== null && (
        <Modal title="Anular pago" close={() => !busy && setVoiding(null)}>
          <form
            className="dash-form"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              void run(async () => {
                await data.voidPayment(
                  voiding,
                  String(form.get("reason")),
                  request.current,
                );
                setVoiding(null);
                setMessage(
                  "Pago anulado. El original y el evento permanecen en el historial.",
                );
              });
            }}
          >
            <p>La anulación conserva el original y requiere motivo.</p>
            <label>
              Motivo de la anulación
              <textarea name="reason" required minLength={5} maxLength={1000} />
            </label>
            {message && <p role="alert">{message}</p>}
            <button className="dash-button danger-button" disabled={busy}>
              Confirmar anulación demo
            </button>
          </form>
        </Modal>
      )}
      {receiptPayment && (
        <Modal
          title={
            demoMode ? "Comprobante de demostración" : "Comprobantes privados"
          }
          close={() => setReceipt(null)}
        >
          {demoMode ? (
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
                  <dt>Cuota</dt>
                  <dd>{receiptPayment.installment}</dd>
                </div>
                <div>
                  <dt>Importe</dt>
                  <dd>
                    {money(
                      receiptPayment.amount,
                      data.contracts.find(
                        (c) =>
                          c.id ===
                          (receiptPayment.contract ?? receiptPayment.client),
                      )?.currency ?? "ARS",
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Estado</dt>
                  <dd>{receiptPayment.voided ? "ANULADO" : "Registrado"}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <>
              {data.receipts
                .filter((r) => r.payment_id === receipt)
                .map((r) => (
                  <ReceiptFile
                    key={r.id}
                    path={r.object_path}
                    mime={r.mime_type}
                  />
                ))}
              {!data.receipts.some((r) => r.payment_id === receipt) && (
                <Empty text="No hay comprobantes asociados a este pago." />
              )}
              {admin && (
                <label className="search-field">
                  Asociar comprobante privado
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                    disabled={busy}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file)
                        void run(async () => {
                          await uploadReceipt(receiptPayment.id, file);
                          await data.reload();
                          setMessage("Comprobante asociado.");
                        });
                    }}
                  />
                </label>
              )}
            </>
          )}
        </Modal>
      )}
      {history && (
        <Modal title="Trazabilidad de pagos" close={() => setHistory(false)}>
          {data.events.map((event, i) => (
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
          {!data.events.length && <Empty text="No hay eventos disponibles." />}
        </Modal>
      )}
    </>
  );
}
