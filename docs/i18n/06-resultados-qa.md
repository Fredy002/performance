# 06 — Resultados de QA

| Verificación | Estado |
|---|---|
| TypeScript y producción | `npm run build` pasa (`tsc -b` + Vite). |
| Catálogos ES/EN | Paridad y claves requeridas pasan en `src/i18n/i18n.test.ts`. |
| Pruebas ejecutables en sandbox | 219 pruebas en 15 archivos pasan con `npx vitest run --exclude src/services/claudeServer.test.ts`. |
| Selector, persistencia y `lang` | Smoke test: cambio ES ↔ EN inmediato y persistencia tras recargar. |
| Rutas y contenido | Smoke test de 17 rutas en inglés; páginas de calculadora, tablas y ejercicios cargaron con sus títulos localizados. |
| Responsive | A 390 px, las rutas recorridas no mostraron desbordamiento horizontal; se corrigió el control segmentado de viento en formularios de ascenso/EPR. |
| Tema oscuro | Smoke test de tema oscuro y restauración del tema del sistema. |
| Ejercicios/tablas | Pruebas de ejercicios, tablas, fuentes y localización pasan; los valores escritos se mantienen. |
| Pruebas de servidor OCR | No ejecutables en este sandbox: los 19 casos requieren abrir un listener local y Node devuelve `listen EPERM: operation not permitted 127.0.0.1`. |

El intento de `npx vitest run` completo confirma el bloqueo de sandbox en `src/services/claudeServer.test.ts`; no se atribuye a una regresión de traducción. Vite también muestra su aviso existente de chunk principal superior a 500 kB.

## Verificación final (5 de noviembre de 2026)

Repetida sobre el código final en Chromium 1248 con Playwright y axe-core, contra `vite` en `127.0.0.1:5191`.

| Verificación | Resultado |
| --- | --- |
| `tsc -b`, `npm run build` | Correctos. Vite avisa de que el bundle principal mide 660 kB (192 kB gzip), por los catálogos. |
| `npx vitest run` | **239 pruebas en 17 archivos**, incluidas las 19 de `claudeServer.test.ts`, que en este entorno sí pueden abrir el listener local. |
| Idioma inicial y selector | Arranca en `es` (`<html lang="es">`). El selector está justo antes del botón de tema. |
| Cambio dinámico | ES → EN sin recargar ni cambiar la URL; `lang="en"`; se conserva un dato ya escrito en Interpolación. EN → ES restaura el texto español. |
| Persistencia | El inglés se mantiene tras recargar y al navegar entre rutas. |
| Barrido de textos | 38 rutas en inglés, con todas las tablas, ejercicios y plegables abiertos, revisando texto visible, `title`, `aria-label`, `placeholder` y tooltips. Tras las correcciones de abajo solo quedan nombres propios de aeropuertos («Lima – Callao · Jorge Chávez»), que no se traducen. |
| Responsive | Sin desbordamiento horizontal en inglés a 1280, 768 y 390 px. |
| Accesibilidad en inglés | axe sin infracciones en herramientas, ejercicios, historial y ajustes. Las láminas de tablas mantienen 3 avisos que también aparecen en español (ver 07). |
| Servidor | `server/claude.ts` importa los mensajes localizados y arranca con Node sin Vite. |
| Sonda de interacción en español | 24 de 24 comprobaciones de teclado, táctil, deshacer, errores y menú. |

Correcciones hechas en esta verificación (antes se mostraban en español con la interfaz en inglés, porque `localizedOr` vuelve al español si falta la clave inglesa):

- Edición y referencias de la fuente: «Appendix 2», «FAA 2005 supplement · PDF page N (archived copy)».
- Nota del tramo sin filas de la planificación abreviada (70–250 NM).
- Etiqueta «Reactor de transporte» → «Transport jet».
- Frase del ejemplo resuelto de la planificación en crucero Mach 0,74.
- Nueva prueba `src/i18n/tableCoverage.test.ts`: falla si algún texto localizable de una tabla no tiene entrada en inglés.
