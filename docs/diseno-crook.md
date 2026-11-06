# Incremento de diseño Crook — 05/11/2026

Autorización: el usuario pidió guiar el diseño por C:\benja\descargas\garu-demo-interactiva.html y cambiar la marca por Crook. El archivo se trató como referencia visual, no como una nueva fuente de requisitos. El original permanece intacto.

Se adaptaron paleta crema/verde, DM Sans e Instrument Serif, composición editorial, hero fotográfico, tarjetas y espaciado responsive. El CSS de referencia se extrajo a reference.css; styles.css contiene las adaptaciones. Las fuentes de Google y fotografías de Unsplash necesitan Internet. No se presenta ninguna de estas imágenes como fotografía de una propiedad real.

Se construyeron componentes React, contratos TypeScript y fixtures separados. Vite aporta servidor y build; React Router aporta rutas y navegación directa; Playwright verifica el comportamiento en navegador. No se incorporó un framework CSS ni un backend adicional. Versiones exactas y dependencias transitivas en package-lock.json. Se consultó documentación oficial de React y Vite antes de implementar.

Contenido: dos desarrollos ficticios, Horizonte y Los Olivos. Sin importes públicos, formulario, registro de compradores, afirmaciones de disponibilidad ni videos pertenecientes al cliente original. El contacto muestra su configuración pendiente. No se simuló un envío exitoso ni una sesión autenticada. El plano de parcelas no se incorporó en este incremento: su pertinencia y datos requieren definición separada.

## Estado actualizado

| Elemento | Estado | Evidencia |
| --- | --- | --- |
| Diseño y navegación públicos | IMPLEMENTADA Y VERIFICADA | Build, navegador y capturas desktop/móvil |
| Fuente de datos del catálogo | SIMULADA | src/properties.ts; sin persistencia |
| RF-01 integral | EN DESARROLLO | Vistas verificadas; falta consulta a base de datos |
| RF-02–08 | NO INICIADA | Sin Auth, portal, administración ni persistencia |
| RNF-02 | EN DESARROLLO | Capturas 1440px y 390px; no auditoría completa de accesibilidad/compatibilidad |
| Integraciones externas del producto | NO INICIADA | No conexiones configuradas |

La matriz requisitos.md y auditoria.md describen el punto de partida; esta actualización registra el incremento posterior.

## Verificaciones ejecutadas

- npm run build: aprobado, incluye compilación estricta TypeScript.
- Playwright: 3 pruebas aprobadas en Microsoft Edge. Inicio→catálogo→detalle, recarga directa, ancla de contacto, ausencia de formulario, menú móvil, ausencia de desbordamiento a 390px, marca y 404. Sin errores JavaScript en el recorrido principal.
- Revisión visual de docs/crook-desktop.png y docs/crook-mobile.png: composición, legibilidad, tarjetas y apilamiento móvil.
- npm install: auditoría de 32 paquetes, cero vulnerabilidades informadas. No equivale a un análisis de seguridad completo.
- Primer build detectó tipos faltantes de importaciones CSS; corregido con vite/client. Una prueba inicial de menú falló porque buscaba el nombre anterior del botón después de abrirlo; se corrigió el selector y se repitió la suite completa.

No ejecutados: lint (sin configuración), RLS, SQL, integración Supabase, autenticación, Storage, n8n, SMTP, ZAP y despliegue. Los tests actuales no acreditan los E2E de negocio definidos en el prompt maestro.

Próximo paso: migración de propiedades, pruebas positivas/negativas de publicación y servicio de datos Supabase en entorno aislado. Las reglas financieras siguen pendientes.
