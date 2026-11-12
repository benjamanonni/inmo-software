# Exportación tabular Crook — estado 06/11/2026

La web publicada no depende de n8n. No se activó programación ni se enviaron archivos a Drive o filas a Sheets.

## Verificado localmente

- `workflow.json`: plantilla manual con fixtures, inactiva.
- `workflow-postgres-demo.json`: consulta PostgreSQL real de la demo local, inactivo, `upload=false`.
- `error-workflow.json`: conservado para gestión de errores.
- Migraciones 005/006: vista `crook_export.paid_installments`, solo contratos demo ARS y cuotas completamente cubiertas; excluye pagos anulados.
- Columnas aprobadas para demo: `usuario`, `cuota_pagada`, `fecha`, `monto_pagado`. El XLSX contiene números en cuota e importe.
- Rol local `crook_n8n_reader`: solo lectura sobre la vista, sin acceso directo a tablas de clientes. Credencial únicamente en el gestor cifrado de n8n.
- `npm run n8n:verify`: ejecución real PostgreSQL→n8n→XLSX, ocho filas comprobadas contra PostgreSQL, archivo reabierto con ExcelJS y fallo controlado de conexión registrado. Evidencia privada en artifacts/.

`proposed-read-role.sql` es una propuesta histórica que no debe aplicarse: las migraciones vigentes definen la proyección limitada de cuatro columnas. No usar service_role ni un propietario de base en n8n.

## Pendiente para Cloud/Drive

1. Crear y configurar una credencial exclusiva de lectura sobre la vista del Supabase Cloud aislado, sin reutilizar la contraseña local. Configurar TLS y la conexión del proyecto explícito `hrwgdwductfrgzlivvoo` en el gestor de n8n.
2. Autorizar OAuth Google Drive o una Service Account apropiada en n8n. La sesión Google de Codex no se transfiere automáticamente.
3. Definir carpeta privada, dueño, destinatarios, horario, zona horaria y retención. Verificar los permisos de la carpeta y del archivo recibido.
4. Resolver si el destino es actualizar las cuatro columnas de una hoja o conservar archivos XLSX diarios. Son operaciones diferentes. La hoja privada identificada en los workflows se conservó sin cambios.
5. Probar manualmente la exportación cloud y un fallo de conexión/subida. Solo después de validar esas decisiones, habilitar el Schedule Trigger.

Mantener `approved` y `upload` según el entorno revisado. `approved=true` en el workflow local corresponde solo a la proyección ficticia local, no autoriza una base productiva o un envío externo. No inventar horarios ni retenciones productivas.

## Operación local

Docker Compose: `docker compose -f automation/n8n/compose.yaml up -d`. UI solo en http://127.0.0.1:5678. Conservar el volumen y N8N_ENCRYPTION_KEY. No publicar ese puerto ni reutilizar la configuración HTTP local para Internet.

`npm run n8n:configure` importa la credencial local y el workflow PostgreSQL sin imprimir contraseñas. `npm run export:demo` es una prueba adicional de archivo con fixtures ejecutada por Node; por sí sola no demuestra ejecución de n8n.

Excel es respaldo tabular; no restaura Auth, Storage, políticas RLS ni infraestructura. La publicación web y sus pruebas se documentan en [deployment.md](../../docs/deployment.md).
