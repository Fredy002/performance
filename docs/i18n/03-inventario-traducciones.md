# 03 — Inventario de traducciones

El inventario sigue la procedencia de las cadenas. Los literales de interfaz se sustituyen por claves semánticas; los textos de contenido estructurado se resuelven desde el locale y los literales de fuente permanecen sin cambios.

| Dominio | Ubicación principal | Textos cubiertos |
|---|---|---|
| Navegación y layout | `src/components/layout/` | Inicio, historial, consultar/calcular, etiquetas de menú, breadcrumbs, command palette, accesibilidad, carga, avisos |
| Páginas | `src/pages/` | Dashboard, historial, ajustes, lista/detalle de tablas y ejercicios, herramienta en desarrollo, 404 |
| Metadatos de herramientas | `src/tools/registry.ts` | Nombre, nombre corto, categoría, descripción y contenido del buscador |
| Calculadoras | `src/tools/*/` | Títulos, formularios, acciones, ayudas, resultados, estados vacíos, errores y gráficos |
| Componentes de formulario/resultados | `src/components/{fuel,takeoff,climb,ui,exercises}/` | Labels, unidades, placeholders, tooltips, validaciones, pasos, resultados |
| Ayuda y unidades | `src/content/help.ts`, `src/content/units.ts` | Explicaciones contextuales y definiciones de siglas/unidades |
| Tablas | `src/data/tables/`, `src/components/tables/`, `src/pages/tables/` | Metadatos, categorías, ayuda, glosarios, pasos, notas, filtros y acciones; los datos de fuente se preservan |
| Ejercicios | `src/exercises/registry.ts`, `src/pages/exercises/`, `src/components/exercises/` | Enunciados, preguntas, supuestos, observaciones, pasos esperados y estados |
| Servicios | `src/services/`, `server/` | Progreso, validación, errores de análisis y respuesta del servidor; `Accept-Language` selecciona el idioma de errores API |
| Accesibilidad | Componentes y páginas | Nombres y descripciones accesibles, regiones vivas y texto alternativo |

## Exclusiones de localización

- Rutas (`/pruebas`, `/tables`, `/tools/...`), IDs de tablas/herramientas y datos guardados.
- Cifras, fórmulas, resultados numéricos, unidades y secuencia de tablas.
- Contenido original de las figuras de performance, captions verificados y siglas oficiales.
- Texto aportado por el usuario.

## Fuentes incompletas

Para FIGURES 66, 67 y 69 hay datos numéricos y títulos ingleses verificables, pero el repo no contiene el texto fuente inglés completo para toda la ayuda traducida al español. La versión inglesa de esos metadatos es traducción de interfaz, no transcripción fuente; se marca como provisional en [04-tablas-originales.md](./04-tablas-originales.md).
