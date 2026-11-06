import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Brand } from "./components";
import { useDemo } from "./demo-data";
import { Empty } from "./workspace-ui";
import {
  AdminOverview,
  Clients,
  Contracts,
  Lots,
  Payments,
  Properties,
  Reports,
  Accounts,
} from "./admin-pages";
import {
  ClientOverview,
  ClientLot,
  Installments,
  ClientProfile,
} from "./client-pages";
import "./workspace.css";

const adminLinks = [
  ["", "◫", "Resumen"],
  ["clientes", "♙", "Clientes"],
  ["contratos", "▤", "Contratos y planes"],
  ["lotes", "▦", "Lotes"],
  ["pagos", "↗", "Pagos"],
  ["propiedades", "⌂", "Propiedades"],
  ["reportes", "◷", "Morosidad"],
  ["cuentas", "⚙", "Cuentas de acceso"],
];
const clientLinks = [
  ["", "◫", "Mi resumen"],
  ["lote", "▦", "Mi lote y contrato"],
  ["cuotas", "◷", "Mis cuotas"],
  ["pagos", "↗", "Pagos y comprobantes"],
  ["perfil", "♙", "Mi cuenta"],
];

export function Access() {
  return (
    <div className="access-page">
      <div className="access-story">
        <Brand />
        <div>
          <div className="eyebrow">Tu próximo capítulo</div>
          <h1 className="serif">
            Tu lugar.
            <br />
            <em>Más cerca.</em>
          </h1>
          <p>Un espacio para seguir cada paso de tu proyecto.</p>
        </div>
        <span>Un lugar para lo que viene. — Crook</span>
      </div>
      <div className="access-form">
        <span className="eyebrow">Explorá la experiencia</span>
        <h2 className="serif">Bienvenido a Crook.</h2>
        <p>Elegí una vista para recorrer la interfaz de demostración.</p>
        <Link className="role-card" to="/cliente">
          <span className="role-icon">⌂</span>
          <span>
            <strong>Soy comprador</strong>
            <small>Mi lote, mis cuotas y mis comprobantes</small>
          </span>
          <span>↗</span>
        </Link>
        <Link className="role-card" to="/admin">
          <span className="role-icon">◫</span>
          <span>
            <strong>Administración</strong>
            <small>Clientes, contratos y gestión de cobros</small>
          </span>
          <span>↗</span>
        </Link>
        <div className="demo-callout">
          Acceso de demostración sin contraseña. No es autenticación real. Todos
          los nombres, importes y porcentajes son ficticios.
        </div>
        <Link to="/">← Volver al sitio público</Link>
      </div>
    </div>
  );
}

export function Workspace({ admin }: { admin: boolean }) {
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  const base = admin ? "/admin" : "/cliente";
  const page = location.pathname.slice(base.length).replace(/^\//, "");
  const links = admin ? adminLinks : clientLinks;
  const title =
    links.find(([path]) => path === page)?.[2] ?? "Página no encontrada";
  const { clients } = useDemo();
  return (
    <div className="workspace">
      <aside className={`sidebar ${menu ? "expanded" : ""}`}>
        <Brand />
        <div className="workspace-label">
          {admin ? "ESPACIO DE GESTIÓN" : "PORTAL DEL COMPRADOR"}
        </div>
        <nav aria-label={admin ? "Administración" : "Portal del comprador"}>
          {links.map(([path, icon, label]) => (
            <NavLink
              key={path}
              end={!path}
              to={`${base}/${path}`}
              onClick={() => setMenu(false)}
            >
              <span aria-hidden="true">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            Un lugar para
            <br />
            <em>lo que viene.</em>
          </div>
          <Link to={admin ? "/cliente" : "/admin"}>⇄ Cambiar vista demo</Link>
          <Link to="/acceso">← Salir de la demo</Link>
          <Link to="/">Ver sitio público ↗</Link>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="workspace-header">
          <button
            className="mobile-menu icon-button"
            aria-label="Abrir navegación"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            ☰
          </button>
          <span>
            Crook{" "}
            <span className="breadcrumb">
              / {admin ? "Administración" : "Mi espacio"} / {title}
            </span>
          </span>
          <div className="profile-chip">
            <span className="avatar">{admin ? "AD" : "LF"}</span>
            <div>
              <strong>{admin ? "Administración" : "Lucía Fernández"}</strong>
              <small>{admin ? "Vista del equipo" : "Compradora · H-012"}</small>
            </div>
          </div>
        </header>
        <div className="workspace-content">
          <div className="demo-ribbon">
            <span>DEMO INTERACTIVA</span> Datos y porcentajes ficticios ·
            Cambios temporales hasta recargar · Fecha de referencia: 05/11/2026
          </div>
          <div className="page-heading">
            <div>
              <span className="eyebrow">
                {admin ? "Todo en perspectiva" : "Tu proyecto, paso a paso"}
              </span>
              <h1>
                {page
                  ? title
                  : admin
                    ? "Una mirada a tu gestión."
                    : "Hola, Lucía."}
              </h1>
              <p>
                {admin
                  ? "La información que necesitás, en un solo lugar."
                  : "Este es el estado de tu próximo gran comienzo."}
              </p>
            </div>
            <span className="date-label">Jueves, 5 de noviembre de 2026</span>
          </div>
          {!admin && !clients.find((c) => c.id === 1)?.enabled ? (
            <Empty text="Cuenta demo deshabilitada. Podés volver a habilitarla desde Administración → Cuentas de acceso." />
          ) : admin ? (
            <AdminPage page={page} />
          ) : (
            <ClientPage page={page} />
          )}
        </div>
        <div className="workspace-foot">
          Crook Desarrollos · Entorno de demostración{" "}
          <span>Diseñado para acompañar cada paso.</span>
        </div>
      </div>
    </div>
  );
}

function AdminPage({ page }: { page: string }) {
  switch (page) {
    case "":
      return <AdminOverview />;
    case "clientes":
      return <Clients />;
    case "contratos":
      return <Contracts />;
    case "lotes":
      return <Lots />;
    case "pagos":
      return <Payments admin />;
    case "propiedades":
      return <Properties />;
    case "reportes":
      return <Reports />;
    case "cuentas":
      return <Accounts />;
    default:
      return <Empty text="No encontramos esta sección." />;
  }
}

function ClientPage({ page }: { page: string }) {
  switch (page) {
    case "":
      return <ClientOverview />;
    case "lote":
      return <ClientLot />;
    case "cuotas":
      return <Installments />;
    case "pagos":
      return <Payments />;
    case "perfil":
      return <ClientProfile />;
    default:
      return <Empty text="No encontramos esta sección." />;
  }
}
