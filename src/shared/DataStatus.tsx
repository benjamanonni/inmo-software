import { useDemo } from "../demo-data";
export function DataStatus({ inline = false }: { inline?: boolean }) {
  const { loading, error, reload } = useDemo();
  const Heading = inline ? "h2" : "h1";
  return (
    <section className={inline ? undefined : "catalog-intro container"}>
      <Heading className="serif">
        {loading ? "Cargando tu espacio…" : "No pudimos obtener los datos."}
      </Heading>
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
