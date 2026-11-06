# Sistema de Gestión y Portal Web para Inmobiliaria

Demo local. Inicio: 05/11/2026 (America/Argentina/Buenos_Aires).

## Estado real

**Crook** conserva su interfaz pública, administrativa y de comprador. Ahora dispone de dos modos: demo visual temporal y adaptador conectado a Supabase con servicios, migraciones, Auth, RLS, pagos auditables y Storage preparados. El código conectado todavía necesita verificación contra una instancia real: el arranque local quedó bloqueado por ausencia de Docker/Podman. No se declara integrada la demo completa.

Entradas: `/acceso` permite elegir perspectiva; `/admin` abre administración; `/cliente` abre el ejemplo de Lucía Fernández con un lote ya adquirido. El botón **Mi espacio** del sitio público lleva al acceso demo.

## Ejecutar

```powershell
cd 'C:\inmobiliaria demo'
npm ci
npm run dev
```

Abrir http://127.0.0.1:5173/. Verificar con `npm run build`, `npm run typecheck` y `npm run test:e2e`. Las pruebas de navegador usan Microsoft Edge instalado; si no está disponible, configurar Chromium en playwright.config.ts e instalarlo con Playwright.

`npm run dev` habilita explícitamente la demo visual solo en desarrollo. Para el modo persistente usar `npm run dev:live` después de configurar `.env.local` y el stack aislado. El build no habilita datos ficticios silenciosamente ni el selector de roles demo.

Build, typecheck, ESLint y pruebas locales aprobados. Consultar [informe full stack](docs/full-stack.md) para resultados, supuestos y estados reales; [ejecución y Preview](docs/deployment.md) para inicializar Supabase y las cuentas ficticias sin publicar secretos. Los documentos de diseño anteriores describen hitos históricos, no el estado actual de las integraciones.

La documentación local describe el análisis y las propuestas técnicas; Confluence conserva la autoridad sobre requisitos y decisiones formales. Una versión vigente no acredita por sí sola aprobación formal.

## Documentación de trabajo

- [Auditoría y discrepancias](docs/auditoria.md).
- [Matriz de requisitos y pruebas previstas](docs/requisitos.md).
- [Arquitectura y contratos propuestos](docs/arquitectura.md).
- [Plan incremental y dependencias](docs/plan.md).
- [Fuentes consultadas](docs/fuentes.md).
- [Full stack y evidencias](docs/full-stack.md).
- [Ejecución y despliegue Preview](docs/deployment.md).
- [Workflow n8n y parámetros pendientes](automation/n8n/README.md).

## Límites

Solo datos ficticios y entorno de demo. El usuario autorizó números y porcentajes inventados para diseñar las pantallas: USD 30.000 por lote, 20% de anticipo y 48 cuotas de USD 500, sin intereses. Estos cálculos ilustrativos no establecen reglas productivas. Sin pagos online ni modificaciones productivas. No se han creado recursos cloud, enviado correos, modificado documentos oficiales ni contratado servicios.

Pendiente externo: iniciar una instancia Supabase aislada, ejecutar la suite real de Auth/API/Storage y verificar Preview/n8n/SMTP con configuración autorizada. No se realizó push ni despliegue.
