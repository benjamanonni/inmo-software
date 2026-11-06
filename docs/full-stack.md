# Incremento full stack — 05/11/2026

**Actualización posterior:** el bloqueo Docker se resolvió y ya se ejecutaron verificaciones con Supabase y n8n reales. Este informe conserva el punto de control inicial; consultar [local-ready.md](local-ready.md) para el estado actual y los resultados posteriores.

Rama: `codex/full-stack-demo`. Se conservó la identidad visual Crook y el código existente. No hubo escrituras externas, despliegue productivo ni cambios en Confluence. Se contrastaron nuevamente Diccionario EDT v18 y Pendientes v30: las cardinalidades y reglas financieras productivas continúan pendientes.

## Resultado y cobertura

| Requisito / fase | Implementación local | Estado y evidencia |
| --- | --- | --- |
| A · Base técnica | Rama, ESLint, TypeScript estricto, variables públicas y servidor separadas, SDK Supabase, validadores de frontera Zod | IMPLEMENTADA Y VERIFICADA: typecheck, lint y build |
| RF-01/06 · Catálogo | Propiedades y fotos, seed, lectura publicada, altas sin publicar, edición de presentación, publicación y carga de fotos desde administración | IMPLEMENTADA SIN VERIFICAR contra Supabase real; SQL/RLS y navegación visual verificados por separado |
| RF-02/07 · Auth | Login, logout, sesión, recuperación PKCE, rutas según rol, cuentas habilitadas, función Edge para alta sin secreto en navegador | IMPLEMENTADA SIN VERIFICAR contra Auth/SMTP reales; Deno check aprobado; prueba de rutas sin configurar aprobada |
| RF-03/04 · Datos contractuales | Clientes, contratos, titulares, lotes, planes, cuotas e imputaciones. Servicios y vistas conectadas a respuestas filtradas por RLS | IMPLEMENTADA SIN VERIFICAR contra API real; sin comprador fijo por ID/nombre en modo conectado |
| RF-05 · Morosidad | Estados explícitos guardados en cuotas; vistas conectadas no calculan criterios pendientes | SIMULADA: clasificación preasignada del escenario, sin interés ni tolerancia inventados |
| RF-08 · Pagos | RPC atómicas, actor autenticado, instante de servidor, idempotencia por solicitud, bloqueos de filas, anulación con motivo y eventos inmutables | SQL IMPLEMENTADA Y VERIFICADA en PostgreSQL/WASM; integración Auth/API y concurrencia HTTP PENDIENTES |
| G · Storage | Buckets privados, políticas por referencia autorizada, carga sin sobrescritura y URLs firmadas de 60 segundos | IMPLEMENTADA SIN VERIFICAR en Storage real. Políticas SQL positivas/negativas ejecutadas con esquema Storage mínimo de pruebas |
| H · n8n | JSON importable, manual ficticio, programación deshabilitada, PostgreSQL de solo lectura propuesto, Drive parametrizado y workflow de errores | IMPLEMENTADA SIN VERIFICAR en n8n/Drive. Generación/reapertura local XLSX IMPLEMENTADA Y VERIFICADA |
| I · CI | Checks locales y trabajo Linux con Supabase aislado, sin credenciales cloud | IMPLEMENTADA SIN VERIFICAR en GitHub Actions; no se realizó push |
| I · Vercel Preview | Build Vite, rutas SPA, cabeceras y variables documentadas | PENDIENTE de proyecto/acceso Preview y URL verificable. Sin despliegue |

No se declara aceptada la demo integral ni un piloto real.

## Organización

```text
src/
  features/
    auth/             # sesión, login, recuperación y guardas
    properties/       # catálogo, publicación, formularios y fotos
    clients/          # altas, habilitación y alta segura de compradores
    contracts/        # modelos y carga de datos autorizados
    installments/     # selección de contrato/plan y resumen por imputaciones
    payments/         # RPC, registro/anulación y visor Storage
    admin/            # adaptador conectado y vistas administrativas
  integrations/supabase/client.ts
  shared/             # resultado/error y estados de consulta
  demo-data.tsx       # compatibilidad con UI y modo visual explícito
supabase/
  migrations/         # cuatro migraciones versionadas
  functions/manage-buyer/
  seed.sql
automation/n8n/       # workflows, compose, exportación local y permisos propuestos
tests/
  unit/               # resumen monetario y artefacto XLSX
  sql/                # migraciones, RLS, integridad, persistencia y auditoría
  live/               # pruebas HTTP Supabase reales, requieren instancia aislada
  connected-ui/       # rechazo del modo conectado sin configuración
scripts/              # seed Auth, entorno de test y tipos desde esquema local
```

`DemoProvider` conserva su nombre para reducir cambios en la UI, pero elige entre un proveedor visual temporal y un adaptador conectado. La selección exige **DEV y VITE_ENABLE_DEMO=true**. `npm run dev` usa explícitamente el modo `demo`; `npm run dev:live` usa Supabase. Un build no puede habilitar el selector visual ni siquiera con esa variable. Una consulta fallida deja estado de error, nunca fixtures silenciosos.

Los servicios validan respuestas externas con Zod. `npm run types:generate` prepara tipos desde un esquema local ejecutándose; no se inventó un archivo generado sin esa ejecución. La API cliente usa listas explícitas de columnas públicas y no publica precios. El SDK guarda la sesión siguiendo su mecanismo estándar; no se usa localStorage como base de datos de negocio.

## Modelo y supuestos de demo

Relaciones: cuenta ↔ cliente, cliente ↔ contrato y contrato ↔ lote mediante tablas de vínculo. Contrato → planes → cuotas; pago → múltiples imputaciones a cuotas del mismo contrato; pago → comprobantes y eventos. No se impone un contrato único por comprador, un pago único por cuota ni se prohíben pagos parciales. El portal selecciona entre los contratos y planes autorizados.

La operación administrativa de alta de comprador crea inicialmente una sola cuenta vinculada por cliente para evitar altas duplicadas durante esta demo; esa guarda operativa no fija la cardinalidad general del esquema. Las identidades existentes o un fallo parcial entre Auth y PostgreSQL requieren reconciliación de operador, sin borrar usuarios automáticamente.

Los contratos son escenarios ficticios identificados con `demo_scenario=true`. USD y `numeric(14,2)` para importes, `numeric(12,2)` para superficies; UUID para identidades Auth/eventos/archivos; bigint dentro del rango entero seguro de JavaScript para entidades operativas. Vencimientos son `date`; eventos son `timestamptz` del servidor. El seed usa USD 30.000, anticipo registrado de USD 6.000 y 48 cuotas cargadas de USD 500. No se generan planes productivos, intereses ni refinanciaciones. El anticipo cargado representa un aporte registrado del ejemplo, no una regla para inferir automáticamente pagos reales.

Las relaciones financieras no admiten borrado en cascada. El cliente no recibe permiso UPDATE/DELETE de contratos, pagos o eventos. Modificar condiciones contractuales históricas requerirá un diseño de versiones y aprobación específicos; esta demo solo consulta esos contratos.

## Seguridad de pagos y archivos

`register_payment` exige administrador vigente, bloquea el contrato, valida precisión, cuotas del mismo contrato y suma de imputaciones. El original, las imputaciones y el evento se registran en una transacción. Repetir la misma clave con el mismo contenido retorna el registro original; cambiar el contenido produce conflicto. Varias solicitudes diferentes pueden registrar pagos parciales sobre la misma cuota, por decisión explícita de no asumir restricciones pendientes.

`void_payment` bloquea el pago, exige motivo, conserva importe original y registra antes/después, actor, instante y referencia. El mismo reintento es idempotente; una segunda anulación distinta es rechazada. No se añadió corrección directa del importe: el flujo implementado conserva el original mediante anulación y nuevo registro cuando corresponda.

La función Edge valida el JWT con Auth y lee el rol vigente antes de utilizar `service_role`. El usuario nuevo queda sin acceso contractual si falla el vínculo. El RPC de provisión vuelve a comprobar administrador y coincidencia de email con el cliente, y vincula/habilita de forma atómica dentro de PostgreSQL. No se envían emails desde la función de alta. Deshabilitar una cuenta cambia de inmediato el resultado de las políticas RLS, aunque el JWT continúe vigente.

Fotos y comprobantes usan buckets privados; las políticas inspeccionan la referencia a propiedad publicada o pago autorizado. No hay eliminación ni sobrescritura del comprobante original. La carga es un proceso Storage + metadatos no transaccional: si el segundo paso falla, se informa el objeto huérfano para revisión; no se oculta ni se borra automáticamente.

URLs firmadas: ventana máxima preparada de 60 segundos; las de comprobantes se renuevan mientras el visor está abierto. Una URL ya emitida puede seguir funcionando hasta vencer después de revocar acceso/despublicar. Un archivo que el navegador puede mostrar puede guardarse; no se añade botón específico de descarga.

## Pruebas y evidencia

| Comando | Resultado local |
| --- | --- |
| npm run typecheck | APROBADO |
| npm run lint | APROBADO, sin errores |
| npm run build | APROBADO |
| npm run test:unit | 3 pruebas aprobadas: imputaciones parciales/anuladas, XLSX y guardas del workflow |
| npm run test:sql | 10 registros de test aprobados (incluye 8 subcasos y contenedor), PostgreSQL/WASM; cuatro migraciones y seed ejecutados |
| npm run test:e2e | 7 pruebas visuales aprobadas en Edge; regresión de navegación, registro/anulación temporal y vistas móvil/desktop |
| npm run test:connected-ui | 1 prueba aprobada: sin configuración no hay fallback ni selector de cuentas |
| npx deno check supabase/functions/manage-buyer/index.ts | APROBADO; solo chequeo de tipos, no invocación Edge |
| npm run export:demo | XLSX escrito y reabierto: 2 filas, 6.618 bytes en la ejecución registrada |
| npm audit / npm audit --omit=dev | Sin vulnerabilidades informadas después de ajustes específicos |
| npm run test:live | NO EJECUTADO: no hay instancia Supabase aislada iniciada |
| GitHub Actions, SMTP, Drive, n8n y Preview | NO EJECUTADOS en servicios externos |

PGlite ejecuta PostgreSQL real compilado a WASM, pero las pruebas suministran `auth.uid()`, identidades y un esquema Storage mínimos. No verifican JWT, transporte HTTP, URLs firmadas o el servicio de archivos de Supabase. Se probó persistencia a disco cerrando y reabriendo el motor. Los bloqueos/concurrencia se diseñaron en SQL; su prueba HTTP concurrente está preparada para la instancia real.

La prueba HTTP real preparada registra entidades ficticias y conserva su historia; no borra pagos ni documentos para limpiar. Requiere `CROOK_TEST_TARGET=isolated-demo`; no usarla contra producción. Verifica A/B, cuenta deshabilitada, persistencia entre clientes HTTP nuevos, idempotencia, anulación concurrente, eventos y autorizaciones de Storage.

## Dependencias y diagnósticos

TypeScript 7 era incompatible con el peer range de typescript-eslint. Se ajustó solo TypeScript a 6.0.3 compatible; no se utilizó `--force` ni `--legacy-peer-deps`. ESLint usa configuración plana y reglas de hooks. Se agregaron SDK Supabase y Zod en runtime; PGlite y ExcelJS solo para pruebas/artefactos, y CLI Supabase 3.0.0 fijada para reproducibilidad.

La auditoría inicial de nuevas dependencias detectó avisos moderados en minimatch y uuid transitivos. Overrides acotados: minimatch >=11.0.1 y uuid >=11.1.1 dentro de ExcelJS. Se verificaron lint, build y escritura/lectura XLSX después de resolverlos. No se aplicó actualización masiva.

Supabase CLI 3 rechazó `[inbucket]`: se corrigió a `[local_smtp]`. El siguiente intento de arranque falló con `DockerLifecycleInspectError`: Docker y Podman no están en PATH. El runtime nativo de Supabase no admite Windows. No se creó una base compartida ni se ejecutó una migración cloud.

El primer intento E2E reutilizó un servidor anterior en modo development que no tenía el modo demo explícito; no era un fallo de permisos. Se aisló Playwright en puertos 5184/5185 con strictPort y sin reutilizar servidores. También se separaron los patrones de pruebas SQL/HTTP de la suite de navegador.

## Bloqueos y acciones necesarias

1. **Supabase local:** instalar/iniciar Docker Desktop o Podman compatible y reiniciar terminal si hace falta. Luego seguir deployment.md. Alternativa: identificar proyecto Supabase de desarrollo aislado y configurar variables; las migraciones cloud requieren revisar el destino antes de aplicarlas.
2. **Auth/SMTP y archivos:** con el stack disponible, inicializar cuentas ficticias y ejecutar la suite real. Configurar redirects exactos y remitente demo antes de probar recuperación. No pegar secretos en el chat.
3. **n8n/Drive:** disponer de runtime, carpeta privada y credenciales en el gestor de n8n; validar selección de datos, horario y retención antes de activar. El JSON sigue inactivo.
4. **Preview:** asociar repositorio/proyecto Vercel autorizado y variables públicas de entorno Preview. No se encontró una configuración Vercel existente ni un canal Vercel conectado para desplegar/verificar una URL.

Referencias técnicas consultadas: [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Storage](https://supabase.com/docs/guides/storage/security/access-control), [Auth](https://supabase.com/docs/reference/javascript/auth-signinwithpassword), [Edge Functions](https://supabase.com/docs/guides/functions/auth), [runtimes Supabase](https://supabase.com/docs/guides/local-development/docker-and-native-runtimes), [PGlite](https://pglite.dev/docs/), [n8n XLSX](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.converttofile), [Vercel](https://vercel.com/docs/project-configuration).
