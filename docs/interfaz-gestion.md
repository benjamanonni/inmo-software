# Administración y comprador — 05/11/2026

El usuario pidió diseñar toda la interfaz desde administración hasta el comprador de un lote, autorizando porcentajes y números ficticios. El alcance de este incremento es una demo de interacción en memoria; no se implementó ni se declaró autenticación o persistencia real. No se cambió el alcance formal en Confluence.

## Pantallas

| Perspectiva | Rutas | Contenido |
| --- | --- | --- |
| Acceso demo | /acceso | Selector explícito de perspectivas sin contraseña; no constituye login |
| Administración | /admin | KPIs, gráfico de cobranza ilustrativo, cartera y actividad |
| Clientes | /admin/clientes | Búsqueda, alta demo y ficha del cliente |
| Contratos y planes | /admin/contratos | Listado y condiciones ficticias en diálogo |
| Lotes | /admin/lotes | Mapa seleccionable de 24 parcelas ficticias y ficha |
| Pagos | /admin/pagos | Registro manual simulado, anulación con motivo, eventos y visor de comprobante |
| Propiedades | /admin/propiedades | Publicación/despublicación compartida con catálogo y nota interna editable |
| Morosidad | /admin/reportes | Filtros y categorías explícitamente preasignadas como ejemplo |
| Accesos | /admin/cuentas | Confirmación para habilitar/deshabilitar cuentas demo |
| Comprador | /cliente | Resumen del lote adquirido, avance, aportes, pendiente y siguiente cuota |
| Lote y contrato | /cliente/lote | Ficha ficticia y condiciones del plan, sin contrato firmado |
| Cuotas | /cliente/cuotas | 48 cuotas, filtros, estados e información del registro manual |
| Pagos y comprobantes | /cliente/pagos | Historial del comprador y visor sin botón de descarga |
| Cuenta | /cliente/perfil | Datos ficticios y explicación del mecanismo de recuperación pendiente |

Cliente inicial: Lucía Fernández, lucia@example.com, lote H-012. USD 30.000 de valor ficticio, anticipo USD 6.000 (20%), capital USD 24.000 (80%), 48 cuotas de USD 500 y 0% de interés ilustrativo. Ocho cuotas registradas: aportes totales USD 10.000, pendiente del ejemplo USD 20.000, avance redondeado 33%. La suma es aritmética del ejemplo, no una regla financiera aprobada.

Los indicadores de cobranza y estados de mora son fixtures separados; no se recalculan al cambiar pagos. Las cifras de gráficos se rotulan como ilustrativas. Las nuevas cuentas no tienen contrato asignado ni se habilitan automáticamente.

## Responsabilidades y límites

- demo-data.tsx contiene tipos, datos ficticios y estado compartido temporal. No utiliza localStorage como sustituto de autenticación o base de datos.
- workspace.tsx contiene acceso, estructura de navegación y selección de vistas.
- admin-pages.tsx y client-pages.tsx separan las pantallas por responsabilidad.
- workspace-ui.tsx contiene tarjetas, métricas, diálogos y condiciones compartidas.
- workspace.css extiende la identidad crema/verde y editorial, con tablas desplazables y navegación móvil.
- El catálogo público omite propiedades despublicadas y sus fichas durante la navegación de la misma sesión. Esto es simulación visual y no RLS ni protección de archivos remotos.
- Registro y anulación actualizan la vista del comprador y conservan el evento original en memoria. La integridad, auditoría durable, idempotencia y autorización deberán implementarse en servidor.
- El visor muestra una constancia HTML ficticia, no un archivo privado de Storage. No hay envío de correos, compra online ni integración bancaria.
- Las cuentas y rutas son explorables libremente como demo, con avisos explícitos. No hay barrera de seguridad real ni aislamiento verificado entre compradores.

## Verificación

Build y TypeScript estrictos: aprobados. Suite Playwright: 7 pruebas aprobadas en Edge, incluyendo 3 del sitio público y 4 nuevas. Se recorrieron las 14 rutas de acceso y gestión a 1440px y 390px, comprobando títulos visibles, ausencia de errores JavaScript y ausencia de desbordamiento del documento.

Se verificó el recorrido registrar cuota 9 → resumen del comprador (9/48 y USD 10.500) → anular con motivo → conservar historial → volver a 8/48. También despublicar → catálogo actualizado, deshabilitar cuenta → portal informa el estado, alta y búsqueda de cliente, filtros de cuotas, visor y cierre con Escape. Capturas de administración, comprador y acceso guardadas en docs/crook-*-1440.png y docs/crook-*-390.png; revisadas visualmente administración desktop y comprador móvil.

## Estado de requisitos

RF-01–08: interfaces EN DESARROLLO con interacciones SIMULADAS. Ningún RF completo se declara IMPLEMENTADO Y VERIFICADO: faltan persistencia, servidor, Auth, RLS, Storage y pruebas de negocio reales. RNF-02 cuenta con verificación visual parcial en dos tamaños, sin certificación de accesibilidad. n8n, SMTP y Preview externo: NO INICIADOS. Lint: sin configurar.

Siguiente incremento: conectar modelos y contratos de datos aprobados a Supabase aislado, reemplazar acceso demo por autenticación y validar permisos mediante peticiones directas. Las cardinalidades y reglas financieras productivas siguen pendientes.
