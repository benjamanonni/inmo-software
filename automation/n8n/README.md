# Exportación tabular Crook

`workflow.json` es una plantilla importable **inactiva**. No contiene credenciales. Rama manual predeterminada: datos ficticios → Convert to File XLSX → resultado binario en la ejecución. La programación está deshabilitada; el destino Drive también requiere habilitación explícita de parámetros. `error-workflow.json` registra metadatos de fallos sin datos tabulares ni secretos.

Antes de habilitar el origen PostgreSQL: validar columnas, tablas, permisos, horario, zona horaria, carpeta privada y retención. La consulta preparada usa `crook_export.installment_demo`, una vista propuesta en `proposed-read-role.sql` que NO se aplica por las migraciones. Solo aplicar tras validar su lista de columnas y usuario de lectura; no usar service_role ni un propietario de base para exportar.

Parámetros del nodo Configuración: source (demo/database), approved (false), upload (false), folderId (vacío). Elegir credencial PostgreSQL de solo lectura y OAuth Google Drive en el gestor de n8n. Para activar la rama de datos reales se exige approved=true; esto es una guarda operativa, no evidencia de aprobación. No introducir valores de retención ni horarios productivos por defecto. El Schedule Trigger deshabilitado trae un intervalo meramente técnico que debe sustituirse por lo validado antes de activarlo.

Tras importar: asociar el workflow de errores en Settings → Error workflow, seleccionar zona de demo America/Argentina/Buenos_Aires, mantener inactivo y ejecutar manualmente. Revisar binario XLSX abriéndolo. Después configurar carpeta privada y probar upload=true: el último nodo exige ID de archivo recibido. Revisar permisos de Drive por separado; la respuesta de upload no demuestra privacidad por sí sola.

Docker local: definir N8N_ENCRYPTION_KEY en el entorno y ejecutar `docker compose -f automation/n8n/compose.yaml up -d`. UI solo en http://127.0.0.1:5678; crear propietario al iniciar. La cookie sin HTTPS está configurada solo para localhost. No publicar este compose en un VPS ni abrir el puerto externamente sin HTTPS y configuración revisada. No borrar el volumen de credenciales.

`npm run export:demo` genera y vuelve a abrir `artifacts/crook-fictitious.xlsx`, sin PostgreSQL ni Drive. Esa prueba verifica archivo y contenido mediante ExcelJS, **no una ejecución de n8n**. No se afirma que el workflow haya sido ejecutado ni importado hasta disponer de runtime. La configuración de almacenamiento y conservación de ejecuciones requiere validación antes de datos reales.

Excel es respaldo tabular, no copia restaurable integral de Auth, Storage, RLS ni infraestructura.
