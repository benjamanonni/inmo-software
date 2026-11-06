# Auditoría inicial — 05/11/2026

## Alcance y evidencia

Inspección de `C:\inmobiliaria demo` con archivos ocultos incluidos: 0 entradas antes de este trabajo. `git status --short` indicó que la carpeta no era un repositorio. No había código, README, AGENTS.md, package.json, lockfile, configuraciones, pruebas, exportaciones documentales ni secretos locales que inspeccionar. No se encontró `C:\AGENTS.md` aplicable al destino.

Herramientas verificadas en PATH:

| Herramienta | Resultado |
| --- | --- |
| Node.js | v26.13.0 |
| npm | 11.20.0 |
| Git | 2.56.0.windows.3 |
| Docker | No encontrado en PATH; no acredita ausencia de instalación fuera de PATH |
| Supabase CLI | No encontrado en PATH |
| psql | No encontrado en PATH |

No existe gestor de paquetes adoptado por un repositorio previo. npm es la propuesta inicial para aprovechar el entorno disponible; las versiones de dependencias deberán verificarse antes de instalarlas. No se ejecutaron build, lint, typecheck ni tests porque aún no existe aplicación.

## Documentación

Se obtuvo acceso de lectura a Confluence y se recuperaron las 12 páginas enumeradas en fuentes.md. Se revisaron requisitos, alcance, EDT y paquetes de arquitectura, datos, seguridad, frontend, almacenamiento, automatización y despliegue. No se exportaron copias completas de esos documentos.

La búsqueda documental de referencias a Figma no devolvió un enlace concreto a un archivo de diseño. Esto no demuestra que no existan prototipos: Compras y Proveedores indica que Figma está disponible y utilizado. No se inspeccionó un diseño ni se definió una estética aprobada.

## Brechas y riesgos

| ID | Hallazgo | Consecuencia y tratamiento |
| --- | --- | --- |
| D-01 | Diccionario EDT v18 declara pendientes las cardinalidades de cuentas, contratos y lotes | No fijar unicidad ni cardinalidades definitivas en migraciones contractuales. Preparar alternativas explícitas para validación |
| D-02 | Reglas de cuotas, vencimientos, saldos y morosidad pendientes | No calcular saldos ni introducir ventana de aviso, tolerancias, intereses o recargos. La demo podrá usar estados ficticios explícitos |
| D-03 | Proveedores v14 selecciona Google Drive; Pendientes v30 todavía enumera el destino como pendiente | Interpretar Drive como selección de proveedor; carpeta, permisos, retención, tablas, columnas y horario siguen sin evidencia de configuración aprobada |
| D-04 | Calidad v4 menciona reserva de USD 1.000; Proveedores v14 dice no fijar monto de reserva | Registrar contradicción para revisión del Director. No adoptar un presupuesto de reserva ni realizar gastos |
| D-05 | Trazabilidad v15 diferencia Vigente de Aprobado; Calidad v4 no acredita línea base formal aprobada | Usar requisitos vigentes como referencia de demo sin afirmar aprobación formal individual |
| D-06 | Control de Cambios contiene escenarios simulados con decisiones y cierres | No implementar tours virtuales ni otras ampliaciones de esos ejemplos como si estuvieran autorizadas |
| D-07 | Compras indica GitHub disponible y Figma utilizado, pero la carpeta no tiene remoto ni archivos | El estado de esta carpeta no representa todo el trabajo del equipo; falta identificar repositorio y diseño canónicos antes de integrar trabajo compartido |
| D-08 | Cronograma del Acta contempla funcionalidades terminadas el 02/11 y piloto desde el 09/11; destino local vacío al 05/11 | Brecha local respecto de hitos previstos, no prueba de atraso global del equipo. No alterar cronograma ni declarar piloto viable |

## Integraciones

Última inspección: 05/11/2026. No se utilizaron credenciales privadas de ejecución.

| Herramienta | Objetivo | Estado | Configuración/dependencias pendientes | Evidencia y limitación |
| --- | --- | --- | --- | --- |
| Confluence | Consultar fuentes | IMPLEMENTADA Y VERIFICADA (lectura documental) | Acceso conectado existente | Recuperación de páginas y versiones en fuentes.md; no se escribieron páginas |
| React/TypeScript | Aplicación | NO INICIADA | Base técnica y versiones compatibles | Sin package.json ni código |
| Supabase/PostgreSQL | Persistencia | NO INICIADA | Entorno aislado local o proyecto demo identificado | Sin conexión probada |
| Supabase Auth | Sesiones y recuperación | NO INICIADA | Configuración, cuentas ficticias y redirects | Sin login probado |
| Supabase Storage | Fotos y comprobantes | NO INICIADA | Buckets y políticas | Sin archivos ni permisos probados |
| n8n | Exportación XLSX | NO INICIADA | Runtime, fuente de lectura, columnas, horario y retención | Sin workflow ejecutado |
| Google Drive | Destino privado XLSX | NO INICIADA | Carpeta demo, permisos y credenciales n8n | Conexión de Drive del chat no equivale a integración n8n |
| Resend | SMTP de Auth | NO INICIADA | Remitente, dominio y credenciales del entorno demo | Sin correos enviados |
| GitHub Actions | CI | NO INICIADA | Repositorio autorizado y aplicación verificable | Sin remoto ni ejecuciones |
| Vercel | Preview | NO INICIADA | Proyecto, repositorio y variables | Sin URL desplegada |
| Hetzner | Alojamiento n8n | NO INICIADA | Autorización de infraestructura y costos | Sin contratación |
| Sentry/UptimeRobot | Observabilidad | NO INICIADA | Entorno e integración autorizada | Sin eventos ni alertas verificadas |

## Seguridad y calidad

No hay controles implementados que puedan declararse efectivos. La arquitectura propone RLS, permisos explícitos y servidor para altas de cuentas. La validación deberá incluir solicitudes directas A→B, cuentas deshabilitadas, sesiones expiradas, acceso anónimo, funciones privilegiadas y comprobantes ajenos.

Esta auditoría verifica el estado inicial y el acceso documental; no acredita funcionalidad del producto ni aceptación técnica de la demo.
