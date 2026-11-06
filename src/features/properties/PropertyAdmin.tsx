import { useState } from "react";
import { useDemo } from "../../demo-data";
import { Badge, Modal } from "../../workspace-ui";
import { createProperty, addPhoto } from "./service";
import { errorMessage } from "../../shared/result";
export function PropertyAdmin() {
  const { properties, togglePublished, editProperty, reload } = useDemo();
  const [adding, setAdding] = useState(false);
  const [edit, setEdit] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const run = async (operation: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      await operation();
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className="action-row">
        <p>Catálogo persistente · Sin precios públicos</p>
        <button className="dash-button" onClick={() => setAdding(true)}>
          + Nueva propiedad
        </button>
      </div>
      {message && (
        <p className="demo-callout" role="status">
          {message}
        </p>
      )}
      <div className="admin-properties">
        {properties.map((p, index) => (
          <section className="dash-panel" key={p.id}>
            {p.image && <img src={p.image} alt={p.title} />}
            <div className="property-admin-body">
              <Badge tone={p.published ? "green" : "neutral"}>
                {p.published ? "Publicada" : "Sin publicar"}
              </Badge>
              <h2>{p.title}</h2>
              <p>{p.subtitle}</p>
              <div className="button-group">
                <button
                  className="dash-button"
                  disabled={busy}
                  onClick={() => void run(() => togglePublished(index))}
                >
                  {p.published ? "Despublicar" : "Publicar"}
                </button>
                <button
                  className="dash-button secondary"
                  onClick={() => setEdit(index)}
                >
                  Editar descripción
                </button>
              </div>
              <label className="search-field">
                Agregar fotografía
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={busy}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      void run(async () => {
                        await addPhoto(p.id, file);
                        await reload();
                        setMessage("Fotografía asociada.");
                      });
                  }}
                />
              </label>
            </div>
          </section>
        ))}
      </div>
      {adding && (
        <Modal title="Nueva propiedad" close={() => !busy && setAdding(false)}>
          <form
            className="dash-form"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              void run(async () => {
                await createProperty({
                  id: String(form.get("id")),
                  title: String(form.get("title")),
                  description: String(form.get("description")),
                  operation:
                    form.get("operation") === "Alquiler" ? "Alquiler" : "Venta",
                });
                await reload();
                setAdding(false);
                setMessage(
                  "Propiedad creada sin publicar. Podés agregar fotos y publicarla.",
                );
              });
            }}
          >
            <label>
              Identificador estable
              <input
                name="id"
                required
                pattern="[a-z0-9-]+"
                placeholder="nuevo-desarrollo-demo"
              />
            </label>
            <label>
              Título
              <input name="title" required maxLength={150} />
            </label>
            <label>
              Descripción
              <textarea name="description" required />
            </label>
            <label>
              Operación
              <select name="operation">
                <option>Venta</option>
                <option>Alquiler</option>
              </select>
            </label>
            {message && <p role="alert">{message}</p>}
            <button className="dash-button" disabled={busy}>
              Crear propiedad
            </button>
          </form>
        </Modal>
      )}
      {edit !== null && (
        <Modal title="Editar presentación" close={() => !busy && setEdit(null)}>
          <form
            className="dash-form"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              void run(async () => {
                await editProperty(edit, String(form.get("subtitle")));
                setEdit(null);
                setMessage("Presentación actualizada.");
              });
            }}
          >
            <label>
              Presentación breve
              <textarea
                name="subtitle"
                defaultValue={properties[edit]?.subtitle}
                required
              />
            </label>
            {message && <p role="alert">{message}</p>}
            <button className="dash-button" disabled={busy}>
              Guardar cambios
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
