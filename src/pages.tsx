import { Link } from "react-router-dom";
import { Contact, PropertyCard } from "./components";
import { DataStatus } from "./shared/DataStatus";
import { useDemo } from "./demo-data";
import type { Property } from "./properties";

export function Home() {
  const { published, properties, loading, error } = useDemo();
  if (loading || error) return <DataStatus />;
  return (
    <>
      <section className="homehero photo">
        <div className="hero-inner">
          <div>
            <div className="eyebrow">
              Crook Desarrollos / Una nueva perspectiva
            </div>
            <h1 className="serif">
              Hay lugares que <i>cambian</i> tu historia.
            </h1>
            <p>
              Todo gran proyecto empieza con un lugar. Explorá nuestros
              desarrollos e imaginá el espacio de tu próximo comienzo.
            </p>
            <div className="hero-buttons">
              <Link className="btn light" to="/propiedades">
                Explorar desarrollos <span className="arrow">↗</span>
              </Link>
            </div>
          </div>
          <div className="hero-aside">
            <div className="eyebrow">Nuestra mirada</div>
            <div className="large">
              Invertir en tierra.
              <br />
              Proyectar futuro.
            </div>
            <div className="micro">Un lugar para cada nueva historia.</div>
          </div>
        </div>
        <div className="hero-bottom">
          <span>Los proyectos que imaginás. La tierra que elegís.</span>
          <span>01 — Crook</span>
        </div>
      </section>
      <section className="container intro" id="nosotros">
        <div>
          <div className="eyebrow label">Una forma de mirar adelante</div>
          <h2 className="serif">
            El futuro se construye <em>desde el lugar.</em>
          </h2>
        </div>
        <div className="intro-right">
          <p>
            Un terreno es más que un espacio. Es la posibilidad de construir, de
            encontrarse y de darle forma a eso que todavía imaginás.
          </p>
          <div className="intro-facts">
            <div>
              <b>02</b>
              <span>Desarrollos de demostración</span>
            </div>
            <div>
              <b>Tu lugar</b>
              <span>Un nuevo comienzo</span>
            </div>
          </div>
        </div>
      </section>
      <section className="developments">
        <div className="container">
          <div className="sectionhead">
            <div>
              <div className="eyebrow label">El territorio</div>
              <h2 className="serif">
                Nuestros desarrollos<span className="clay">.</span>
              </h2>
            </div>
            <Link className="textbutton" to="/propiedades">
              Explorar el catálogo <span className="arrow">↗</span>
            </Link>
          </div>
          {!published.some(Boolean) && (
            <p className="demo-callout">
              No hay propiedades publicadas en este momento.
            </p>
          )}
          <div className="project-cards">
            {properties.map((property, index) =>
              published[index] ? (
                <PropertyCard
                  key={property.id}
                  property={property}
                  index={index}
                />
              ) : null,
            )}
          </div>
        </div>
      </section>
      <section className="quote">
        <div className="container quote-layout">
          <div>
            <div className="eyebrow label">Nuestra esencia</div>
            <h2 className="serif">
              Un lugar para <i>lo que viene.</i>
            </h2>
          </div>
          <div className="quote-detail">
            <div>
              <h3>Mirar más allá.</h3>
              <p>
                Proyectar un espacio propio es pensar en nuevas posibilidades.
                El primer paso es conocer el lugar y hacer las preguntas que
                importan.
              </p>
            </div>
            <div>
              <h3>Elegir con claridad.</h3>
              <p>
                Información simple y una presentación cuidada para acompañarte
                desde la primera mirada hasta la conversación.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="experience container">
        <div className="sectionhead">
          <div>
            <div className="eyebrow label">Paso a paso</div>
            <h2 className="serif">
              De la idea al <em>comienzo.</em>
            </h2>
          </div>
        </div>
        <div className="steps">
          {[
            [
              "01 / EXPLORÁ",
              "Descubrí el lugar",
              "Recorré las propuestas y conocé su presentación.",
            ],
            [
              "02 / IMAGINÁ",
              "Pensá tu proyecto",
              "Explorá las imágenes y la descripción de cada desarrollo.",
            ],
            [
              "03 / CONVERSÁ",
              "Dale el próximo paso",
              "Consultá con el equipo antes de tomar una decisión.",
            ],
          ].map(([number, title, text]) => (
            <div className="step" key={number}>
              <div className="number">{number}</div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
      <Contact />
    </>
  );
}

export function Catalog() {
  const { published, properties, loading, error } = useDemo();
  if (loading || error) return <DataStatus />;
  return (
    <>
      <section className="catalog-intro container">
        <div className="eyebrow label">La tierra que elegís</div>
        <h1 className="serif">
          Un lugar.
          <br />
          <em>Mil posibilidades.</em>
        </h1>
        <p>
          Conocé nuestra colección de desarrollos. Cada propuesta, una nueva
          manera de imaginar el futuro.
        </p>
      </section>
      <section className="developments">
        <div className="container">
          <div className="catalog-toolbar">
            <span className="eyebrow">Todos los desarrollos</span>
            <span>
              {published.filter(Boolean).length} propuestas de demostración
            </span>
          </div>
          <div className="project-cards">
            {properties.map((property, index) =>
              published[index] ? (
                <PropertyCard
                  key={property.id}
                  property={property}
                  index={index}
                />
              ) : null,
            )}
          </div>
          <p className="demo-disclaimer">
            Información ficticia para revisión de diseño. No representa
            inventario disponible.
          </p>
        </div>
      </section>
      <Contact />
    </>
  );
}

export function Detail({ property }: { property: Property }) {
  return (
    <>
      <section className="phero">
        <div className="phero-text">
          <div>
            <Link className="textbutton" to="/propiedades">
              ← Volver a desarrollos
            </Link>
            <h1 className="serif">
              {property.title}
              <em>.</em>
            </h1>
            <p className="project-intro">{property.subtitle}</p>
          </div>
          <div className="details">
            <div>
              <div className="eyebrow">Operación</div>
              <strong>{property.operation}</strong>
            </div>
            <div>
              <div className="eyebrow">Valor</div>
              <strong>Consultar precio</strong>
            </div>
          </div>
        </div>
        <div className="detail-photo">
          <img
            src={property.image}
            alt={`Paisaje ilustrativo de ${property.title}`}
          />
          <span className="image-note">Imagen de referencia visual</span>
        </div>
      </section>
      <section className="psection container detail-copy">
        <div>
          <div className="eyebrow label">Un nuevo comienzo</div>
          <h2 className="serif">
            El espacio para <em>tu historia.</em>
          </h2>
        </div>
        <div>
          <p>{property.description}</p>
          <p className="demo-disclaimer">
            Desarrollo completamente ficticio. Ubicación, superficies, servicios
            y disponibilidad no se presentan como características comerciales
            verificadas.
          </p>
          <Link className="btn" to="#contacto">
            Consultar precio <span className="arrow">↗</span>
          </Link>
        </div>
      </section>
      <Contact />
    </>
  );
}
