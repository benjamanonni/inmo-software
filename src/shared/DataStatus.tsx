import { useDemo } from "../demo-data";
export function DataStatus() {
  const { loading, error, reload } = useDemo();
  return (
    <section className="catalog-intro container">
      <h1 className="serif">
        {loading ? "Cargando tu espacio…" : "No pudimos obtener los datos."}
      </h1>
      <p role={error ? "alert" : "status"}>
        {error || "Estamos consultando la información autorizada."}
      </p>
      {error && (
        <button className="dash-button" onClick={() => void reload()}>
          Reintentar
        </button>
      )}
    </section>
  );
}
