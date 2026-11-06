# Ejecución reproducible y Preview

En este equipo, la instalación e inicialización ya se realizaron. Usar `npm run local:start` para arrancar el sistema conectado y consultar [local-ready.md](local-ready.md) para accesos y evidencia. Los pasos siguientes sirven para reproducir la instalación en un entorno nuevo.

## 1. Interfaz visual sin servicios

PowerShell, en `C:\inmobiliaria demo`:

```powershell
npm ci
npm run dev
```

Abrir http://127.0.0.1:5173. El script utiliza explícitamente `.env.demo`; fixtures temporales, sin Auth. Si el puerto está ocupado, detener el servidor anterior con Ctrl+C. No confundir este modo con una integración de base de datos.

## 2. Supabase local aislado

Requisito Windows: Docker Desktop o Podman ejecutándose y accesible desde terminal. CLI 3.0.0 está fijada en dependencias de desarrollo.

```powershell
npx supabase start
```

Config, migraciones y seed son para `crook-demo`, no producción. El inicio de un stack nuevo aplica las migraciones y seed. Para aplicar incrementos sobre el stack local existente se puede usar `npx supabase migration up --local`; no utilizar un reset contra datos que deban conservarse. No usar db push contra un proyecto cloud sin revisar expresamente su referencia y destino.

```powershell
Copy-Item .env.example .env.local
Copy-Item .env.integration.example .env.integration.local
```

Editar los archivos localmente con las claves del stack. `.env.local` solo admite URL y clave pública/publishable para Vite y `VITE_ENABLE_DEMO=false`. `.env.integration.local` contiene claves de servidor/test y una contraseña aleatoria de al menos 12 caracteres; está ignorado por Git. Las claves administrativas nunca llevan prefijo VITE_.

Opcional para generar automáticamente el archivo privado de pruebas desde el stack local, sin imprimir claves:

```powershell
node scripts/local-test-env.mjs
npm run seed:auth
npm run test:live
npm run types:generate
npm run dev:live
```

Seed Auth admite solamente URLs localhost/127.0.0.1 y exige aceptación de entorno local mediante CROOK_SEED_ALLOW_LOCAL. Inicializa admin@crook.example y cuatro compradores ficticios (lucia@example.com, martin@example.com, carolina@example.com, diego@example.com); Carolina queda deshabilitada. La contraseña es CROOK_DEMO_PASSWORD del archivo privado, no se imprime. No se sobrescriben contraseñas de identidades existentes. Inicializa ocho pagos por RPC autenticado y con claves idempotentes.

Para la operación segura de altas:

```powershell
npx supabase functions serve manage-buyer
```

La función utiliza SUPABASE_URL, SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY del runtime Edge. Configurar APP_ORIGIN si cambia el origen de frontend. Probar primero con usuarios ficticios: anónimo y comprador deben recibir 401/403; administrador debe vincular una cuenta nueva. El chequeo de tipos de la función no reemplaza esta prueba. Las identidades creadas sin vínculo tras un fallo parcial necesitan reconciliación; no reintentar asociando automáticamente usuarios existentes por email.

Config local: registro público deshabilitado, URLs de recuperación http://127.0.0.1:5173/recuperar; mantener este hostname para la prueba de correo. Mailpit local en puerto 54324; probar recepción solo cuando el stack esté disponible. Configurar SMTP externo/Resend por separado en el entorno de desarrollo, sin enviar a clientes reales.

## 3. Checks

```powershell
npm run typecheck
npm run lint
npm run build
npm run test:unit
npm run test:sql
npm run test:e2e
npm run test:connected-ui
npm audit
npm run export:demo
```

Playwright usa Edge en Windows; CI usa Chromium instalado por `npx playwright install --with-deps chromium`. Los puertos de pruebas son 5184/5185, sin reutilizar procesos. El artefacto XLSX se genera en artifacts/, fuera de Git. Los JSON n8n se verifican estructuralmente, pero su ejecución requiere n8n.

## 4. Vercel Preview

`vercel.json` prepara Vite, dist y rutas SPA. En un proyecto Vercel autorizado, configurar **Preview**, no Production:

- VITE_SUPABASE_URL del proyecto de desarrollo.
- VITE_SUPABASE_PUBLISHABLE_KEY pública de ese proyecto.
- VITE_ENABLE_DEMO=false (el build también exige DEV para cualquier fixture).

Vincular la rama de desarrollo desde el proyecto Vercel o ejecutar `npx vercel` con credenciales ya configuradas; no usar `--prod`. Esta guía no acredita una publicación. Antes de ejecutarlo revisar el proyecto y evitar creación de recursos con costo. Agregar el origen Preview exacto a Supabase Auth redirects y APP_ORIGIN de la función; no usar comodines globales innecesarios.

Tras desplegar: verificar URL real, recarga directa de /propiedades/:id, login/logout, recuperación con correo autorizado, comprador A/B, cuenta deshabilitada y visor privado. Mantener las cabeceras noindex de la demo. No activar producción ni dominio productivo.

## 5. CI

`.github/workflows/ci.yml` contiene checks y un trabajo independiente de Supabase Docker en Ubuntu. Crea sus claves y contraseña de pruebas dentro del runner sin imprimirlas, inicializa datos ficticios, ejecuta la suite HTTP y detiene servicios. Ese trabajo aún no se ejecutó remotamente: no hubo push. Revisar la primera ejecución y tratar errores de imágenes/runtime o diferencias de Supabase real sin sustituirlos por mocks.
