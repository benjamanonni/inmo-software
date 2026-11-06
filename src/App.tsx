import { useEffect } from "react";
import { Link, Route, Routes, useLocation, useParams } from "react-router-dom";
import { Footer, Header } from "./components";
import { Catalog, Detail, Home } from "./pages";
import { AuthProvider, Protected } from "./features/auth/AuthProvider";
import { Login } from "./features/auth/Login";
import { demoMode } from "./integrations/supabase/client";
import { DataStatus } from "./shared/DataStatus";
import { DemoProvider, useDemo } from "./demo-data";
import { Access, Workspace } from "./workspace";

function PropertyRoute() {
  const { id } = useParams();
  const { published, properties, loading, error } = useDemo();
  if (loading || error) return <DataStatus />;
  const property = properties.find((item) => item.id === id);
  return property && published[properties.indexOf(property)] ? (
    <Detail property={property} />
  ) : (
    <NotFound />
  );
}
function NotFound() {
  return (
    <section className="catalog-intro container">
      <div className="eyebrow">404 / Un camino diferente</div>
      <h1 className="serif">
        Este lugar
        <br />
        <em>no está aquí.</em>
      </h1>
      <Link className="btn" to="/propiedades">
        Volver a desarrollos ↗
      </Link>
    </section>
  );
}
export function App() {
  return (
    <AuthProvider>
      <DemoProvider>
        <AppRoutes />
      </DemoProvider>
    </AuthProvider>
  );
}
function AppRoutes() {
  const { pathname, hash } = useLocation();
  const workspace =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/cliente") ||
    pathname === "/acceso" ||
    pathname === "/recuperar";
  useEffect(() => {
    document.title = `${pathname === "/" ? "Crook" : pathname === "/propiedades" ? "Desarrollos — Crook" : "Detalle — Crook"} · Demo`;
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else {
      window.scrollTo(0, 0);
      document.getElementById("contenido")?.focus({ preventScroll: true });
    }
  }, [pathname, hash]);
  return (
    <div id="crook-app">
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      {!workspace && <Header />}
      <main id="contenido" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/propiedades" element={<Catalog />} />
          <Route path="/propiedades/:id" element={<PropertyRoute />} />
          <Route path="/acceso" element={demoMode ? <Access /> : <Login />} />
          <Route path="/recuperar" element={<Login reset />} />
          <Route
            path="/admin/*"
            element={
              <Protected admin>
                <Workspace admin />
              </Protected>
            }
          />
          <Route
            path="/cliente/*"
            element={
              <Protected admin={false}>
                <Workspace admin={false} />
              </Protected>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!workspace && <Footer />}
    </div>
  );
}
