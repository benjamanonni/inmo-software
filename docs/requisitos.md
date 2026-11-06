# Cobertura inicial y verificación prevista

Fuente: Requisitos v43, Alcance v22, Trazabilidad v15 y Diccionario EDT v18. Fecha: 05/11/2026. No hay pruebas de aplicación ejecutadas. Los identificadores E2E corresponden al prompt del usuario, no a tests existentes.

| Código | Requisito/módulo | EDT de referencia | Estado | Prueba prevista | Evidencia actual |
| --- | --- | --- | --- | --- | --- |
| RF-01 | Catálogo sin precios ni formulario de contacto | 1.3.1.1.1–1.3.1.2.1 | NO INICIADA | E2E-01/08 y comprobación de campos públicos | Carpeta inicialmente vacía |
| RF-02 | Login, sesión y recuperación | 1.3.2.1.1/2 | NO INICIADA | E2E-02/07; expiración y cierre de sesión | Sin Auth configurado |
| RF-03 | Portal propio y visor de comprobantes | 1.3.2.2.1–1.3.2.3.1 | NO INICIADA | E2E-02/03; URL de comprobante ajeno denegada | Sin frontend, datos ni Storage |
| RF-04 | Administración de clientes, contratos, planes y pagos | 1.3.3.1.1/2; 1.3.3.3.1 | NO INICIADA | E2E-04; persistencia tras recarga y rechazo comprador | Sin implementación |
| RF-05 | Al día / A vencer / Vencidas | 1.3.3.4.1 | NO INICIADA | Estados ficticios controlados; verificar etiqueta de demo | Criterios financieros pendientes |
| RF-06 | Edición y publicación de propiedades | 1.3.3.2.1/2 | NO INICIADA | E2E-01/08; retirar acceso a fotos al despublicar | Sin persistencia |
| RF-07 | Alta administrativa y vínculo cuenta–cliente | 1.3.3.5.1/2 | NO INICIADA | Anónimo/comprador no pueden crear o alterar vínculos | Sin función privilegiada |
| RF-08 | Trazabilidad de correcciones/anulaciones | 1.3.3.3.2; 1.2.2.4 | NO INICIADA | E2E-05; rollback, concurrencia y ausencia de borrado | Sin tablas ni RPC |
| RNF-01 | Operación sin bloqueos | Pruebas transversales | NO INICIADA | Recorrer operaciones con cargas de prueba documentadas | Sin ejecución; sin umbral arbitrario |
| RNF-02 | Responsive y compatibilidad | 1.2.3; 1.3.4 | NO INICIADA | Desktop/móvil, teclado y estados de formularios | Diseño de referencia sin identificar |
| RNF-03 | Seguridad de aplicación | 1.4.2; pruebas de seguridad | NO INICIADA | Entradas inválidas, roles, npm audit, ZAP autorizado | Sin dependencias ni entorno web |
| RNF-04 | Aislamiento | 1.4.2.1/2 | NO INICIADA | E2E-03 y SQL con anónimo, A, B y administrador | Sin RLS probada |
| RNF-05 | Exportación tabular diaria XLSX | 1.4.5.1/2 | NO INICIADA | E2E-06; abrir archivo, validar contenido y destino privado | Sin n8n ejecutado |

La trazabilidad propuesta deberá completarse con nombres de archivos, tests y evidencias reales al implementar cada incremento. Ninguna fila cambia a IMPLEMENTADA Y VERIFICADA por generar código o documentación.
