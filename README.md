# Sistema de Gestión y Portal Web para Inmobiliaria

Demo local. Inicio: 05/11/2026 (America/Argentina/Buenos_Aires).

## Estado real

La carpeta estaba vacía. Se implementó una demo de diseño **Crook** en React/TypeScript con Vite: sitio público, acceso de demostración, ocho secciones administrativas y cinco del comprador. Incluye cuotas, plan, lotes, pagos, comprobantes visuales y reportes. Las interacciones comparten estado en memoria y se reinician al recargar. Todavía no hay base de datos, autenticación real, Storage ni automatización integrados.

Entradas: `/acceso` permite elegir perspectiva; `/admin` abre administración; `/cliente` abre el ejemplo de Lucía Fernández con un lote ya adquirido. El botón **Mi espacio** del sitio público lleva al acceso demo.

## Ejecutar

```powershell
cd 'C:\inmobiliaria demo'
npm ci
npm run dev
```

Abrir http://127.0.0.1:5173/. Verificar con `npm run build`, `npm run typecheck` y `npm run test:e2e`. Las pruebas de navegador usan Microsoft Edge instalado; si no está disponible, configurar Chromium en playwright.config.ts e instalarlo con Playwright.

Build y typecheck aprobados; siete pruebas de navegador aprobadas en Edge. npm install informó cero vulnerabilidades en el incremento anterior. No hay lint configurado todavía. Ver [diseño inicial](docs/diseno-crook.md) y [administración y comprador](docs/interfaz-gestion.md).

La documentación local describe el análisis y las propuestas técnicas; Confluence conserva la autoridad sobre requisitos y decisiones formales. Una versión vigente no acredita por sí sola aprobación formal.

## Documentación de trabajo

- [Auditoría y discrepancias](docs/auditoria.md).
- [Matriz de requisitos y pruebas previstas](docs/requisitos.md).
- [Arquitectura y contratos propuestos](docs/arquitectura.md).
- [Plan incremental y dependencias](docs/plan.md).
- [Fuentes consultadas](docs/fuentes.md).

## Límites

Solo datos ficticios y entorno de demo. El usuario autorizó números y porcentajes inventados para diseñar las pantallas: USD 30.000 por lote, 20% de anticipo y 48 cuotas de USD 500, sin intereses. Estos cálculos ilustrativos no establecen reglas productivas. Sin pagos online ni modificaciones productivas. No se han creado recursos cloud, enviado correos, modificado documentos oficiales ni contratado servicios.

El próximo incremento es conectar el catálogo con persistencia y políticas de acceso, sin fijar cardinalidades contractuales ni fórmulas financieras pendientes.
