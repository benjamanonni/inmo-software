# Crook Inmobiliaria — demo online

Actualizado: 06/11/2026. Interfaz original conservada; todos los clientes, contratos e importes son ficticios.

**Web:** https://crook-demo-online-preview.vercel.app

- [Proyecto Vercel](https://vercel.com/benjamanonni5-1095/crook-demo-online): despliegue **Preview**, accesible sin iniciar sesión en Vercel.
- [Supabase exclusivo de demo](https://supabase.com/dashboard/project/hrwgdwductfrgzlivvoo): `hrwgdwductfrgzlivvoo`.
- Acceso privado por `/acceso`. Cada persona tiene su propia cuenta; el registro público está deshabilitado.
- Contraseñas nuevas de Internet: `artifacts/ACCESOS-ONLINE.txt` en el equipo del propietario, fuera de Git y del despliegue. No son las contraseñas locales. No publicar ni compartir cuentas.

Administrador, comprador, persistencia al recargar, aislamiento A/B, cuenta deshabilitada, pagos/anulaciones e historial, catálogo y comprobantes privados se verificaron contra Cloud y la URL pública. Ver [despliegue y evidencias](docs/deployment.md).

## Ejecutar localmente

```powershell
cd 'C:\inmobiliaria demo'
npm ci
npm run local:start
```

`npm run dev` abre la interfaz visual con fixtures temporales. `npm run dev:live` utiliza Supabase configurado en `.env.local`. Los accesos locales están en `artifacts/ACCESOS-LOCALES.txt`. El build publicado exige `VITE_ENABLE_DEMO=false` y conexión HTTPS a Supabase Cloud, sin fallback a fixtures.

## Validación

```powershell
npm run lint
npm run typecheck
npm run build
npm run test:unit
npm run test:sql
npm run test:e2e
npm run test:connected-ui
```

Con Supabase local encendido: `npm run test:live` y `npm run test:live-browser`. Las pruebas cloud/online son separadas, explícitas y usan archivos privados; consultar [deployment.md](docs/deployment.md).

## Reglas exclusivas de demostración

El usuario confirmó ARS, sin anticipo, 10% de interés TOTAL fijo, cuotas mensuales y una cuota por registro de pago. Ejemplo: precio $30.000.000, total $33.000.000, 48 cuotas de $687.500. Se admiten registros parciales mientras se define esa restricción. “A vencer” abarca el vencimiento y los cinco días anteriores. No hay indexación UVA ni capitalización. Estas reglas no constituyen aprobación para una operación inmobiliaria real. Los escenarios USD anteriores se conservan solamente en el entorno histórico local.

## Pendientes externos

SMTP/Resend y recuperación por correo externo no verificados. La vinculación automática GitHub→Vercel pide agregar una conexión de inicio de sesión con GitHub en Vercel; la publicación manual ya funciona. n8n/Drive no son dependencias de la web: falta conectar Cloud, autorizar Drive y definir destino, horario y retención antes de activar programación. No se contrató un plan pago ni se fusionó la rama con `main`.

## Documentación

- [Despliegue, actualización, logs y reversión](docs/deployment.md).
- [Cobertura de requisitos](docs/requisitos.md).
- [Estado full stack](docs/full-stack.md).
- [Instalación local](docs/local-ready.md).
- [n8n y parámetros pendientes](automation/n8n/README.md).

Confluence conserva la autoridad sobre los requisitos formales. Los documentos de diseño y análisis inicial describen hitos históricos.
