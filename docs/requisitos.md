# Cobertura de requisitos — 06/11/2026

Confluence conserva la autoridad de los requisitos formales. Esta matriz registra evidencia de la implementación ficticia, sin modificar aprobaciones ni convertir supuestos de demo en reglas productivas. Fuente inicial: Requisitos v43, Alcance v22, Trazabilidad v15 y Diccionario EDT v18.

| Código | Cobertura actual | Evidencia/limitación |
| --- | --- | --- |
| RF-01 | Catálogo online sin precios ni formulario de contacto | Navegador sobre Preview: catálogo, detalle directo, fotos, móvil. Contactos todavía no configurados se identifican en la UI |
| RF-02 | Login, logout, sesión persistente y roles online | Admin/comprador/deshabilitada y recarga verificados; recuperación por correo externo pendiente SMTP |
| RF-03 | Portal propio y comprobante privado online | Contratos A/B aislados por RLS, bucket privado, URL firmada y visor de comprador |
| RF-04 | Clientes, contratos, cuotas y pagos online | Recorrido de todas las vistas de admin; alta Edge; registro/anulación desde UI y persistencia al recargar |
| RF-05 | Estados por fecha y ventana demo de cinco días | Unitarias de límites, fecha Buenos Aires y pantalla de morosidad; sin cálculo productivo de punitorios |
| RF-06 | Edición/publicación y fotos persistentes | Publicar/despublicar probado en Cloud; catálogo/fotos online; cobertura local SQL y Storage de retiro de visibilidad |
| RF-07 | Alta administrativa y vínculo único | Edge real: comprador 403, admin alta y duplicado 409; una cuenta por cliente y un cliente por cuenta |
| RF-08 | Anulación con historia inmutable | Pago/idempotencia/anulación e importe original verificados en Cloud y UI; borrado rechazado; concurrencia en Supabase local |
| RNF-01 | Recorridos funcionales verificados | Sin prueba de carga ni umbrales operativos aprobados |
| RNF-02 | Desktop/móvil | E2E locales y navegación móvil real en URL pública |
| RNF-03 | Controles implementados y probados | npm audit sin vulnerabilidades en la instalación; noindex/nosniff/frame denial; build guard y revisión de bundle; no es certificación |
| RNF-04 | Aislamiento real | 15 tablas con RLS; comprador A/B, anónimo, deshabilitado y RPC/Storage negativos contra Cloud sin desactivar políticas |
| RNF-05 | Exportación parcial: local PostgreSQL→XLSX | n8n local verificado con cuatro columnas. Cloud/Drive y ejecución diaria pendientes; no confundir XLSX diario con actualizar Sheets |

Web: https://crook-demo-online-preview.vercel.app. Los comandos y la separación entre evidencia local/cloud/pública están en [deployment.md](deployment.md). Pruebas online explícitas en `tests/online`, API cloud en `scripts/verify-cloud-demo.mjs`, SQL/local en sus suites correspondientes. No se publicaron credenciales de prueba ni se conectaron datos reales.
