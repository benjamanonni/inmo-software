# Estado full stack — 06/11/2026

La demo está publicada en **https://crook-demo-online-preview.vercel.app**, conectada al Supabase Cloud exclusivo `hrwgdwductfrgzlivvoo`. Este informe sustituye los estados de instalación y publicación del informe inicial. Se conserva la interfaz Crook; no se reconstruyó el proyecto.

| Bloque | Estado comprobado |
| --- | --- |
| Catálogo | Online: propiedades y fotos, ausencia de precios, rutas directas y móvil |
| Auth | Online: login, logout, persistencia y rutas protegidas; signup deshabilitado |
| Roles/RLS | Online: admin/super_admin, comprador, aislamiento entre titulares y cuenta deshabilitada; 15 tablas públicas con RLS |
| Clientes/cuentas | Online: alta por administrador vía Edge y rechazo de duplicados/comprador; superadmin hereda permisos de admin |
| Contratos/cuotas | Online: tres contratos ficticios ARS, regla demo aprobada de 10% total fijo y sin anticipo; fechas/estados y porcentajes |
| Pagos | Online: registro manual por una cuota, persistencia, idempotencia, anulación e historial; ocho pagos activos iniciales de Lucía |
| Storage | Online: buckets privados, comprobante de prueba firmado y accesos ajenos rechazados; visor probado desde el comprador |
| Vercel | Preview real READY, alias público sin login Vercel; claves administrativas/contraseñas ausentes del bundle |
| n8n | PostgreSQL local→XLSX de cuatro columnas ejecutado y verificado; fallo controlado persistido. No es dependencia de la web |
| Drive/programación | Pendiente de credenciales, destino, horario y retención; no se activó programación ni se modificó Sheets |
| SMTP externo | Pendiente; no se declara correo enviado o recibido |
| GitHub | Rama `codex/despliegue-demo-online`; commits y PR sin auto-merge. Consultar checks del PR para el SHA vigente |
| GitHub→Vercel | Intentado; falta que el propietario vincule GitHub como Login Connection en Vercel. CLI manual funcional |

Pruebas separadas por entorno, comandos, referencias, configuración y reversión: [deployment.md](deployment.md). No confundir los tests visuales con la verificación real en Cloud. Las credenciales online se guardaron únicamente en `artifacts/ACCESOS-ONLINE.txt`; las locales siguen separadas.

## Decisiones y límites

Un usuario por persona. Administradores con permisos comunes y superadmin que hereda esos permisos. No se inventó una política adicional para quién administra otros administradores. Cada registro se imputa a una cuota; se conservan pagos parciales hasta que se defina una restricción distinta. Anticipo cero, ARS y 10% total fijo están aprobados solo para demostración; no hay UVA, mora calculada ni capitalización.

Las cuotas vencen según fechas de Buenos Aires; “A vencer” incluye los cinco días anteriores y el vencimiento. Los importes históricos USD locales no se convirtieron ni se trasladaron a los contratos cloud nuevos. No se borran pagos para corregirlos.

Vercel exigió inicialización Production de un proyecto nuevo. El propietario autorizó una página vacía, sin Crook ni Supabase, con `--skip-domain`; la aplicación se desplegó después exclusivamente como Preview. Supabase etiqueta su rama principal como Production en la consola, pero este proyecto nuevo está dedicado a datos ficticios, con plan FREE y sin conexión a bases operativas.

Advertencia de rendimiento conocida: chunk JS de aproximadamente 631 kB. No impide el build ni las pruebas funcionales. Este trabajo no acredita una prueba de carga, una certificación o la aprobación de reglas operativas reales.
