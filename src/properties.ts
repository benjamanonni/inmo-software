export interface Property {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  operation: "Venta" | "Alquiler";
}

// Fixtures explícitos: no representan inventario comercial ni persistencia real.
export const properties: readonly Property[] = [
  {
    id: "horizonte",
    title: "Horizonte",
    subtitle: "El comienzo de algo propio.",
    description:
      "Una propuesta ficticia para imaginar un proyecto rodeado de paisaje y espacios abiertos. Conocé la presentación y consultá las condiciones con el equipo.",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=85",
    operation: "Venta",
  },
  {
    id: "los-olivos",
    title: "Los Olivos",
    subtitle: "Otra forma de habitar.",
    description:
      "Un desarrollo de demostración que invita a pensar el futuro con calma. Las fotografías son referencias visuales y no corresponden a una propiedad ofrecida.",
    image:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1400&q=85",
    operation: "Venta",
  },
];
