# Publicación de Crook — 06/11/2026

## Entorno realmente desplegado

| Recurso | Identidad verificada |
| --- | --- |
| Web pública | https://crook-demo-online-preview.vercel.app |
| Entorno Vercel | Preview, cuenta Hobby `benjamanonni5-1095`, proyecto `crook-demo-online` |
| Panel Vercel | https://vercel.com/benjamanonni5-1095/crook-demo-online |
| Backend exclusivo | Supabase FREE `crook-demo-online`, referencia `hrwgdwductfrgzlivvoo` |
| Panel Supabase | https://supabase.com/dashboard/project/hrwgdwductfrgzlivvoo |
| Rama de trabajo | `codex/despliegue-demo-online`, creada desde `origin/main` en `9b3ea4f` |

Vercel exige que el primer despliegue de un proyecto se clasifique como Production. El propietario autorizó expresamente inicializar una página vacía sin aplicación, sin Supabase, sin datos y con `--skip-domain`. Crook se publicó después en **Preview**. El alias anterior apunta a ese Preview; no se publicó la aplicación en Production. No se afectó el proyecto Supabase preexistente SanLuisTran.

Se quitaron las restricciones de login de Vercel del proyecto exclusivo de demo para permitir visitar el sitio desde cualquier navegador. Las pantallas privadas continúan protegidas por Supabase Auth, roles y RLS; no hay credenciales públicas.

## Configuración y secretos

En **Vercel → crook-demo-online → Settings → Environment Variables**, exclusivamente en **Preview**:

- `VITE_SUPABASE_URL=https://hrwgdwductfrgzlivvoo.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY`: clave pública del mismo proyecto, consultable en Supabase → Settings → API Keys.
- `VITE_ENABLE_DEMO=false`

No copiar claves administrativas ni contraseñas a variables `VITE_`. La validación del build rechaza Production, localhost, fixtures habilitados, claves administrativas, JWT anon de otro proyecto y variables públicas desconocidas. Se admiten por nombre los metadatos públicos que inyecta Vercel. `.vercelignore` excluye todos los `.env*`, `artifacts/`, datos SQL y archivos de pruebas del upload. El código de integración `src/integrations/supabase` sí se incluye.

Configuración cloud reproducible, sin secretos: `deployment/supabase/config.toml`. Incluye signup deshabilitado, contraseña mínima de 12 caracteres, Site URL y redirects exactos `/acceso` y `/recuperar`. Revisar `config diff` antes de ejecutar `config push`; los valores no declarados se conservan.

```powershell
npx supabase config diff --remote=hrwgdwductfrgzlivvoo --workdir deployment
npx supabase config push --remote=hrwgdwductfrgzlivvoo --workdir deployment --yes
```

Edge Function `manage-buyer` desplegada con verificación de JWT habilitada. `APP_ORIGIN` es exactamente `https://crook-demo-online-preview.vercel.app`. La función verifica identidad y rol habilitado antes de utilizar su clave de servidor. Si cambia el alias público, actualizar Auth y `APP_ORIGIN`; las URLs inmutables de cada despliegue no sustituyen automáticamente el alias permitido.

## Migraciones y datos

Se comprobó por API la identidad del proyecto, estado saludable, cero tablas públicas y cero usuarios antes de inicializarlo. Se aplicaron las seis migraciones en orden, con `db push --remote=... --skip-vault`, primero en dry-run. No se ejecutó `db reset` cloud ni se copió la base local.

Las 15 tablas públicas tienen RLS habilitada; los buckets `receipts` y `property-photos` son privados. Se cargaron dos desarrollos y tres contratos nuevos ARS, sin anticipo, 10% total fijo, 48 cuotas y ocho pagos activos iniciales para Lucía. Las pruebas agregan clientes ficticios y movimientos anulados, conservando su historial.

`scripts/seed-cloud-demo.mjs` exige referencia explícita coincidente y proyecto vacío; genera una contraseña aleatoria distinta para cada identidad, sin reutilizar la contraseña local. Un alta interrumpida no sobrescribe identidades existentes. La opción de reanudación exige exactamente las cuatro identidades iniciales y el archivo privado del mismo proyecto. No volver a ejecutar bootstrap sobre la demo ya utilizada.

Accesos iniciales: administrador `admin@crook.example` (rol super_admin), compradores `lucia@crook.example`, `martin@crook.example` y `carolina@crook.example` (deshabilitada). Contraseñas en `artifacts/ACCESOS-ONLINE.txt`, privado. Para dar acceso a otra persona ficticia, crear un cliente y su cuenta desde administración. El correo de recuperación requiere SMTP autorizado; la cuenta creada por Edge no envía un correo ni revela una contraseña.

## Pruebas ejecutadas y límites

| Entorno | Verificación |
| --- | --- |
| Local | npm ci, lint, typecheck, build, 5 unitarias, 10 SQL, 7 E2E visuales, 1 configuración sin backend, 3 HTTP Supabase real y 2 navegador con Auth local aprobadas |
| Supabase Cloud real | Login de cuatro cuentas, aislamiento A/B, denegación anónima y deshabilitada, registro público desactivado, Edge comprador 403, alta administrativa y duplicado 409 |
| Supabase Cloud real | Pago de una cuota, idempotencia, anulación, importe original e historial conservados, borrado rechazado; comprobante privado por URL firmada, acceso ajeno rechazado; despublicación/publicación persistente |
| URL pública | Catálogo sin precios, fotos, rutas directas y recarga, móvil, login comprador/admin, todas sus vistas, sesión persistente, denegación comprador→admin, logout y cuenta deshabilitada |
| URL pública | Registro y anulación de pago desde la interfaz, persistencia tras recargar e historial |
| Bundle público | HTTP 200 sin login Vercel, noindex, backend Cloud correcto; claves administrativas y contraseñas ficticias ausentes; sin localhost:54321 |

La comprobación de la imagen de comprobante usa un PNG mínimo de prueba, sin validez comercial. No se enviaron correos externos ni se declara verificada la recuperación externa. No es una prueba de carga ni una certificación de seguridad. Vite advierte de un chunk de ~631 kB; el build finaliza correctamente.

Para repetir las pruebas explícitas sobre esta demo, con `.env.cloud.local` privado ya configurado:

```powershell
$env:CROOK_PREVIEW_URL='https://crook-demo-online-preview.vercel.app'
npm run test:cloud
npm run test:online
npm run verify:preview
```

`test:cloud` crea un cliente ficticio nuevo, prueba un pago y lo anula sin borrar historia. `test:online` hace otro registro/anulación desde la interfaz. No ejecutar estas pruebas en una base operativa. Evidencias privadas en `artifacts/cloud-api-verification.json`, `preview-assets-verification.json` y capturas `online-*.png`, fuera de Git. Las suites online no forman parte de la suite visual local ni de CI: no se suben credenciales cloud a GitHub Actions.

## Actualizar, consultar logs y revertir

La CLI de Vercel está autorizada en este equipo. Después de revisar un commit de la rama y completar los checks:

```powershell
git switch codex/despliegue-demo-online
git pull --ff-only
npx vercel deploy --environment preview --yes
# Sustituir por la URL READY devuelta realmente por Vercel:
npx vercel alias set https://URL-READY-DEL-NUEVO-PREVIEW.vercel.app crook-demo-online-preview.vercel.app
```

No usar `--prod`. El guard del build también impide publicar Crook en Production. Probar la URL inmutable antes de cambiar el alias y repetir las verificaciones sobre el alias después de cambiarlo. Para volver a una versión anterior, reasignar el mismo alias a su URL Preview READY anterior; no revertir datos ni ejecutar resets. La reversión de frontend no revierte migraciones de base de datos: aplicar correcciones mediante una nueva migración revisada.

Builds y fallos: Vercel → proyecto → Deployments → despliegue → Build Logs, o `npx vercel inspect URL --logs`. Logs de backend: Supabase → proyecto → Logs / Edge Functions → manage-buyer → Logs. No publicar tokens ni el contenido de archivos privados.

GitHub Actions: revisar los checks de la cabeza del PR, no ejecuciones de commits anteriores. La rama se publica sin tocar `main` ni fusionar automáticamente.

Intento de conexión GitHub→Vercel: rechazado porque falta una **Login Connection** con GitHub en la cuenta Vercel. Para habilitar automatización, el propietario debe ir a Vercel → Account Settings → Authentication / Login Connections → GitHub y vincular su cuenta; después conectar `benjamanonni/inmo-software` en Project Settings → Git. No es necesario para usar o actualizar manualmente este Preview. No habilitar despliegues operativos automáticos; el guard impide usar Production.

## Pendientes independientes de la web

- Resend/SMTP: autorización del servicio, dominio/remitente verificado y secretos solo en Supabase Auth. Probar con un destinatario real autorizado; aún no se recibió un correo externo de recuperación.
- n8n: la exportación PostgreSQL local→XLSX fue verificada. No se llama a n8n desde el frontend. Falta configurar un lector de Cloud con permisos limitados y credencial propia en n8n.
- Google Drive: falta OAuth/Service Account autorizado en n8n y carpeta privada de destino. La conexión Google de Codex no se transfiere a n8n. La hoja identificada no se modificó.
- Definir si se actualizan filas de Sheets o se guardan XLSX diarios, horario, zona y retención. Programación desactivada; ningún webhook público n8n forma parte de esta demo.

Fuentes técnicas: [Vercel Preview](https://vercel.com/docs/deployments/environments), [primer despliegue](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting), [variables de framework](https://vercel.com/docs/environment-variables/framework-environment-variables), [Supabase: entornos](https://supabase.com/docs/guides/deployment/managing-environments).
