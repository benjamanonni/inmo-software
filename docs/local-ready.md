# Entorno local instalado y verificado — 05/11/2026

Este documento conserva evidencia de la instalación local del 05/11. Actualización 06/11: la demo anterior fue incorporada a main por el propietario; se publicaron cambios en codex/despliegue-demo-online y un Preview conectado a Supabase Cloud. Estado vigente, pruebas online y pendientes en [deployment.md](deployment.md). No se contrataron planes pagos ni se afectaron sistemas operativos.

## Instalación

- WSL 2.7.14.0 y kernel 6.18.33.2, instalador Microsoft con firma y SHA256 verificados.
- Docker Desktop 4.98.0 para el usuario actual, backend WSL 2. Docker Engine 29.9.2 y Compose 5.6.1 responden correctamente.
- Supabase CLI 3.0.0: stack local `crook-demo`, seis migraciones y seed aplicados; volúmenes persistentes.
- n8n 2.46.6 en Docker, persistencia en volumen y puerto publicado solamente en 127.0.0.1.

Se activaron VirtualMachinePlatform y Microsoft-Windows-Subsystem-Linux mediante elevación de Windows. El segundo componente devolvió código 3010 (reinicio pendiente). Docker y WSL 2 ya funcionan sin reiniciar; no se reinició el equipo automáticamente. Conviene completar ese reinicio cuando el usuario haya guardado su trabajo.

El instalador WSL requirió una ruta pública de instalación accesible al servicio Windows Installer: usar el archivo dentro del perfil privado provocaba error 1622 del log. Se utilizó `C:\Users\Public\CrookSetup` para ese instalador y logs de sistema, sin credenciales del proyecto.

## Arranque y acceso

```powershell
cd 'C:\inmobiliaria demo'
npm run local:start
```

El comando comprueba/inicia Docker, arranca Supabase y n8n y abre el servidor Vite conectado. `npm run local:start -- --services-only` verifica solo los servicios, sin abrir otro frontend. No reinicializa usuarios, claves ni datos al arrancar. `npm run dev` sigue siendo el modo visual explícito; usar `local:start` o `dev:live` para datos reales locales.

| Servicio | Dirección |
| --- | --- |
| Crook conectado | http://127.0.0.1:5173/acceso |
| Supabase Studio local | http://127.0.0.1:54323 |
| API Supabase local | http://127.0.0.1:54321 |
| Buzón de pruebas Mailpit | http://127.0.0.1:54324 |
| n8n local | http://127.0.0.1:5678 |

Usuarios ficticios principales: `admin@crook.example` y `lucia@example.com`. Las contraseñas aleatorias se guardaron en **artifacts/ACCESOS-LOCALES.txt**, fuera de Git; el archivo no contiene claves administrativas de Supabase. n8n tiene un propietario local ficticio con credenciales en ese mismo archivo. No publicar ni adjuntar ese archivo.

`.env.local` contiene solo configuración pública para frontend. `.env.integration.local` guarda la configuración privada de pruebas y `.env.n8n.local` la clave de cifrado/credenciales de n8n. Esos archivos y artifacts/ están ignorados; se restringieron permisos NTFS de los archivos privados y artefactos al usuario, SYSTEM y administradores. No se imprimieron contraseñas ni claves en las respuestas.

## Verificación real ejecutada

| Integración | Estado | Evidencia |
| --- | --- | --- |
| Docker / Compose / WSL 2 | IMPLEMENTADA Y VERIFICADA | Cliente y servidor Docker Linux responden, contenedores sanos |
| Migraciones y persistencia Supabase | IMPLEMENTADA Y VERIFICADA | Seis migraciones, seed, usuarios y pagos cargados; datos conservados tras detener/arrancar el stack sin borrar volúmenes |
| Auth y RLS | IMPLEMENTADA Y VERIFICADA localmente | Login real A/B, cuenta deshabilitada sin datos, comprador no puede modificar roles ni registrar pagos administrativos |
| Pagos auditables | IMPLEMENTADA Y VERIFICADA localmente | Idempotencia, historial, anulación concurrente con un solo resultado exitoso y conservación del importe original |
| Storage privado | IMPLEMENTADA Y VERIFICADA localmente | Upload de comprobante ficticio; URL firmada permitida para A, denegada para B y anónimo |
| Alta segura Edge | IMPLEMENTADA Y VERIFICADA localmente | Comprador recibe 403; administrador crea y vincula cuenta; repetición recibe 409 |
| Interfaz conectada | IMPLEMENTADA Y VERIFICADA localmente | Dos pruebas Edge: comprador conserva sesión/8 cuotas tras recarga y no accede a admin; administrador consulta clientes y 48 cuotas persistentes |
| Recuperación / SMTP local | VERIFICACIÓN PARCIAL | Solicitud aceptada y correo ficticio recibido en Mailpit. No se cambió contraseña ni se probó Resend externo |
| n8n, rama manual ficticia | IMPLEMENTADA Y VERIFICADA | Importado y ejecutado en n8n 2.46.6; estado success, último nodo Resultado manual binario |
| XLSX generado por n8n | IMPLEMENTADA Y VERIFICADA | Archivo real recuperado del volumen y reabierto con ExcelJS: 2 filas, 16.460 bytes. SHA256 98cf8da65862b90b4412b7a862e456f7d6dd4145b98ba346f5929dadc1d36041 |
| n8n PostgreSQL local | IMPLEMENTADA Y VERIFICADA | Workflow real, vista limitada, ocho filas XLSX verificadas; fallo de conexión registrado. Drive y programación pendientes |
| Vercel Preview | IMPLEMENTADA Y VERIFICADA | https://crook-demo-online-preview.vercel.app; Cloud aislado. GitHub Actions: consultar SHA vigente del PR |

Pruebas reproducibles nuevas: `npm run test:live` (3 pruebas HTTP reales, incluyen Edge y plan ARS) y `npm run test:live-browser` (2 pruebas con Auth real). Esta suite usa exclusivamente el stack aislado y conserva los registros históricos que crea. Los tipos TypeScript se generaron desde el esquema local y ahora tipan el cliente SDK, además de la validación de fronteras con Zod.

La regresión final aprobó build/typecheck, ESLint, 5 unitarias, 10 registros de pruebas SQL, 7 pruebas de demo visual y 1 de configuración conectada. Se compararon las claves privadas y contraseñas configuradas con el JavaScript público generado: no aparecen en el bundle. El build con Supabase configurado emite una advertencia no bloqueante por el chunk principal de 631 kB (179 kB gzip); la división adicional de código queda pendiente de optimización.

Los artefactos de ejecución y comprobación permanecen en artifacts/: n8n-result.json, n8n-verification.json, crook-n8n.xlsx, edge-verification.json y mail-verification.json. No se versionaron secretos ni logs privados.

## Ajuste del runtime

Vector intentaba recolectar logs de Docker mediante el puerto TCP 2375 no disponible en Docker Desktop y entraba en reinicio. Se desactivó analytics en el config local y se arranca con `--exclude vector,logflare`. No se expuso el daemon Docker por TCP sin autenticación. Los servicios de datos, Auth, Storage, funciones, Studio y correo quedaron sanos tras reiniciar el stack conservando datos.

El workflow n8n fue ejecutado mediante CLI con un puerto de broker separado (5680), sin interferir con la UI. El propietario local requirió contraseña de longitud permitida por n8n; se generó una contraseña independiente y no se reutilizó una contraseña que excediera ese límite. Ninguna programación externa quedó activa.
