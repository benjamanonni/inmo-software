import { useState } from "react";
import { useDemo, money } from "../../demo-data";
import { Modal } from "../../workspace-ui";
import { createContract } from "./create";
import { errorMessage } from "../../shared/result";
export function ContractForm() {
  const data = useDemo();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [price, setPrice] = useState(30000000);
  const [count, setCount] = useState(48);
  return (
    <>
      <div className="action-row">
        <p>
          ARS · Sin anticipo · Interés total fijo del 10% · Cuotas mensuales
        </p>
        <button className="dash-button" onClick={() => setOpen(true)}>
          + Nuevo contrato y plan
        </button>
      </div>
      {open && (
        <Modal
          title="Crear contrato y generar cuotas"
          close={() => !busy && setOpen(false)}
        >
          <form
            className="dash-form"
            onSubmit={async (e) => {
              e.preventDefault();
              if (busy) return;
              const form = new FormData(e.currentTarget);
              setBusy(true);
              setError("");
              try {
                await createContract({
                  client: Number(form.get("client")),
                  lot: String(form.get("lot")),
                  reference: String(form.get("reference")),
                  price,
                  count,
                  firstDue: String(form.get("firstDue")),
                });
                await data.reload();
                setOpen(false);
              } catch (failure) {
                setError(errorMessage(failure));
              } finally {
                setBusy(false);
              }
            }}
          >
            <label>
              Comprador
              <select name="client" required>
                {data.clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Lote
              <select name="lot" required>
                {data.lots.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.id} · {l.demo_state}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Referencia única
              <input name="reference" required maxLength={100} />
            </label>
            <label>
              Precio del lote en pesos
              <input
                type="number"
                value={price}
                min="0.01"
                step="0.01"
                required
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </label>
            <label>
              Cantidad de cuotas
              <input
                type="number"
                value={count}
                min="1"
                max="600"
                required
                onChange={(e) => setCount(Number(e.target.value))}
              />
            </label>
            <label>
              Primer vencimiento
              <input name="firstDue" type="date" required />
            </label>
            <p className="demo-callout">
              Total con interés: {money(price * 1.1)}. Cuota orientativa:{" "}
              {money(count > 0 ? (price * 1.1) / count : 0)}. El servidor genera
              el calendario y ajusta los centavos de la última cuota para
              conservar el total. Límite técnico de demo: 600 cuotas.
            </p>
            {error && <p role="alert">{error}</p>}
            <button className="dash-button" disabled={busy}>
              {busy ? "Generando…" : "Crear contrato y cuotas"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
