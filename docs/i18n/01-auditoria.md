# 01 — Auditoría de internacionalización

## Alcance y arquitectura observada

AeroPerf es una SPA React 19 + TypeScript + Vite, con React Router en modo `HashRouter`, CSS propio y estado persistido en `localStorage`. La interfaz existente estaba principalmente en español; no había una biblioteca i18n, catálogos, proveedor de idioma ni selección de locale.

El idioma y el tema son preferencias de la aplicación, por lo que la preferencia lingüística se agrega al store ya persistido `aeroperf.settings`. El idioma inicial es español. Los códigos de ruta, IDs, valores numéricos, unidades, lógica de cálculo y contenidos literales de las fuentes FAA no se localizan.

## Superficies auditadas

- **Shell compartido:** menú lateral, navegación móvil, breadcrumbs, selector de tema, búsqueda/command palette, notificaciones y estados de carga.
- **Páginas:** inicio, herramientas, tablas, ejercicios/pruebas, historial, ajustes y 404.
- **Calculadoras:** planificación de combustible, EPR de despegue, ascenso en ruta, interpolación lineal y bilineal, altitud densidad, viento y conversión de unidades.
- **Componentes comunes:** campos y ayudas, errores, resultados, gráficos, formularios, herramientas para ejercicios y tablas.
- **Contenido:** catálogo de herramientas, nombres de categorías, ayudas, explicación de unidades, datos de ejercicios y metadatos/ayuda de tablas.
- **Servicios:** mensajes de progreso/validación de OCR, análisis de enunciados y errores del backend.
- **Accesibilidad:** `aria-label`, `aria-valuetext`, `aria-live`, `title`, placeholders y nombres de navegación.

La auditoría inicial identificó aproximadamente 50–60 módulos de código con textos visibles o accesibles. Véase el inventario por superficie en [03-inventario-traducciones.md](./03-inventario-traducciones.md).

## Política de fidelidad

El texto visible de figuras FAA se conserva en inglés tal como está en la fuente; no se reescribe al cambiar locale. Los metadatos y ayudas de la aplicación sí son localizables. Cuando el proyecto no contiene la versión original inglesa de una explicación, se identifica la traducción inglesa como provisional y no se presenta como cita fuente.
