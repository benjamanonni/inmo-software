# Plan incremental verificable

Fecha: 05/11/2026. No modifica cronograma oficial ni asigna responsables del equipo.

| Incremento | Problema/RF | Archivos previstos | Verificación y condición de avance |
| --- | --- | --- | --- |
| 0. Auditoría | Conocer estado y fuentes | README, docs/auditoria, fuentes, requisitos | Inspección del destino, versiones y lectura documental. Ejecutado |
| 1. Arquitectura | Separar responsabilidades y riesgos transversales | docs/arquitectura y plan | Diseño inicial redactado; cardinalidades y decisiones operativas siguen pendientes |
| 2A. Catálogo persistente | RF-01/06 sin reglas financieras | Modelo de propiedades, migración, seed ficticio y pruebas SQL | Migración en entorno aislado; anónimo solo lee publicadas; administración puede editar; no exponer fotos privadas |
| 2B. Datos contractuales | RF-03/04/08 | Modelo aprobado o supuestos demo explícitos; migraciones y pruebas | Validar cardinalidades, precisión y asignación de pagos antes de restricciones definitivas |
| 3. Auth y autorización | RF-02/07, RNF-03/04 | RLS, Edge Function y pruebas de sesión | Sin registro público; cuenta sin vínculo denegada; A→B rechazado por peticiones directas |
| 4. Frontend | RF-01–08 | React/TS, servicios y estilos; rutas | Build, typecheck, lint y flujos E2E; diseño Figma o propuesta identificada |
| 5. Archivos | RF-03/06 | Políticas Storage y visor | Archivos ajenos denegados, retirar fotos al despublicar y probar vencimiento de accesos |
| 6. Exportación | RNF-05 | Workflow n8n y runbook | Ejecutar XLSX, abrir y comprobar filas, columnas, destino privado y fallo controlado |
| 7. CI y Preview | Calidad y despliegue | GitHub Actions, configuración Vercel | Checks reales, URL Preview verificada, navegación directa y Auth |
| 8. Validación | RF-01–08 / RNF | Tests y evidencias | E2E-01–08 aplicables, limitaciones explícitas; no declarar aceptación del piloto |

## Dependencias para integración

- Identificar el repositorio GitHub canónico y el archivo Figma indicado como existente en Proveedores. La carpeta vacía no confirma que el equipo no tenga implementación.
- Disponer de Supabase demo identificado o runtime local aislado. Docker, CLI y psql no aparecen actualmente en PATH. No conectarse a producción por conveniencia.
- Validar roles administrativos/comerciales y relaciones cuenta–cliente–contrato–lote. Los permisos no se presumen por pertenecer al equipo.
- Resolver reglas financieras con la inmobiliaria; para demo, usar estados registrados ficticios sin cálculos no aprobados.
- Para n8n: confirmar tablas, columnas, carpeta, horario, zona y retención. No crear programación externa con valores inventados.
- Para SMTP: credenciales configuradas de manera segura, remitente y direcciones de prueba autorizadas. No pedir secretos por chat.

## Próximo incremento seguro

Formalizar el contrato público de propiedades, su modelo relacional y pruebas de publicación antes de construir componentes. Después preparar la base React/TypeScript con dependencias mínimas y versiones verificadas en documentación oficial. La arquitectura financiera no necesita resolverse para avanzar con catálogo.

## Registro de verificación de esta entrega

Inspección: destino inicialmente vacío; no repositorio Git. Herramientas: Node, npm y Git identificados. Confluence: páginas recuperadas con versión. Archivos locales: documentación y exclusiones preventivas de secretos.

Build, lint, typecheck, unitarias, SQL, RLS, integración, E2E, auditoría npm, ZAP y despliegue: NO EJECUTADOS; aún no existe aplicación ni entorno integrado. Ninguna funcionalidad está IMPLEMENTADA Y VERIFICADA.
