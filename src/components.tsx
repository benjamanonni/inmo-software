import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import type { Property } from "./properties";

export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="Crook, ir al inicio">
      <span className="brand-mark">c.</span>
      <span className="brand-name">
        CROOK<small>DESARROLLOS</small>
      </span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="topline">
        DEMO DE DISEÑO · PROPIEDADES FICTICIAS · IMÁGENES DE REFERENCIA
      </div>
      <header className="header">
        <Brand />
        <nav
          className={`navlinks ${open ? "show" : ""}`}
          id="crook-nav"
          aria-label="Principal"
          onClick={() => setOpen(false)}
        >
          <NavLink to="/" end>
            Inicio
          </NavLink>
          <NavLink to="/propiedades">Desarrollos</NavLink>
          <Link to="/#nosotros">Nosotros</Link>
          <Link to="/#contacto">Contacto</Link>
          <Link className="nav-cta" to="/acceso">
            Mi espacio <span>↗</span>
          </Link>
        </nav>
        <button
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="crook-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? "Cerrar ×" : "Menú ☰"}
        </button>
      </header>
    </>
  );
}

export function PropertyCard({
  property,
  index,
}: {
  property: Property;
  index: number;
}) {
  return (
    <article className="project-card">
      <Link
        to={`/propiedades/${property.id}`}
        className="card-photo"
        aria-label={`Conocer ${property.title}`}
      >
        <img
          src={property.image}
          alt={`Paisaje de referencia para ${property.title}`}
          loading="lazy"
        />
        <span className="card-index">
          0{index + 1} / {property.operation.toUpperCase()}
        </span>
        <span className="image-note">Imagen de referencia visual</span>
      </Link>
      <div className="body">
        <div className="eyebrow">Colección de desarrollos · Demo</div>
        <h3 className="serif">{property.title}</h3>
        <p>{property.subtitle}</p>
        <div className="card-bottom">
          <span className="micro">Consultar precio</span>
          <Link className="textbutton" to={`/propiedades/${property.id}`}>
            Conocer desarrollo <span className="arrow">↗</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function Contact() {
  return (
    <section className="contact" id="contacto">
      <div className="container contact-layout">
        <div>
          <div className="eyebrow label">Hablemos de lo que viene</div>
          <h2 className="serif">
            Todo empieza con una <em>conversación.</em>
          </h2>
          <p className="lead">
            Un nuevo proyecto empieza por conocer sus posibilidades. Nuestro
            equipo te acompaña en el próximo paso.
          </p>
        </div>
        <div className="contact-card">
          <span className="eyebrow">Atención personalizada</span>
          <h3 className="serif">Encontrá tu próximo lugar.</h3>
          <p>
            Los canales de contacto de Crook se incorporarán cuando estén
            confirmados.
          </p>
          <div className="contact-status">
            <span className="status-dot" /> Contacto pendiente de configurar
          </div>
          <p className="micro">
            Esta demo no recibe consultas ni datos personales.
          </p>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-row">
          <div>
            <div className="footer-title">Crook.</div>
            <p className="footer-tagline">
              La tierra que elegís. La historia que empieza.
            </p>
          </div>
          <nav className="footer-nav" aria-label="Pie de página">
            <Link to="/">Inicio</Link>
            <Link to="/propiedades">Desarrollos</Link>
            <Link to="/#contacto">Contacto</Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Crook · Demo de diseño</span>
          <span>Datos ficticios · Sin oferta comercial</span>
        </div>
      </div>
    </footer>
  );
}
