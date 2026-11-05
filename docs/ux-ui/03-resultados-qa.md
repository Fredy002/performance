# Resultados de QA

Validación final del 4 de noviembre de 2026 sobre el código final de esta rama. Solo se marca como aprobado lo que se ejecutó.

## 1. Pruebas técnicas

| Comando | Resultado |
| --- | --- |
| `npx tsc -b` | Sin errores |
| `npm run build` | Correcto (`dist/`, bundle principal de 430,5 kB, 134,7 kB gzip) |
| `npx vitest run` | **228 pruebas aprobadas en 14 archivos**: 153 previas, 14 de la auditoría UX, 11 de vuelos internacionales, 3 de redondeo decimal, 32 de EPR de despegue (B727 y B737) y 15 de ascenso en ruta. Los avisos de jsdom sobre `window.scrollTo` ya existían y no son fallos. |

## 2. Barrido automático en navegador

Chromium 1248 con Playwright 1.64 y axe-core 4 (reglas WCAG 2.0, 2.1 y 2.2 A/AA y buenas prácticas) contra `vite` en `127.0.0.1:5191`. Script: `.claude/skills/ux-qa/scripts/audit.mjs`.

| Pasada | Pantallas | Infracciones axe | Scroll horizontal | Errores JS | Objetivos táctiles < 24 px |
| --- | ---: | ---: | ---: | ---: | ---: |
| Antes, claro | 39 (13 rutas × 3 anchos) | 6 tipos (`color-contrast`, `label-content-name-mismatch`, `heading-order`, `page-has-heading-one`, `empty-table-header`), unos 30 nodos | 0 | 0 | 2 |
| **Después, claro** | 57 (19 rutas × 3 anchos, incluidas las herramientas añadidas después) | **0** | **0** | **0** | **0** |
| **Después, oscuro** | 57 | **0** | **0** | **0** | **0** |

axe se ejecutó a 1280 y 390 px. A 768 px (tableta) solo se comprobaron el scroll horizontal, los errores y las capturas. Datos completos: [axe-antes-claro.json](evidencias/axe-antes-claro.json), [axe-despues-claro.json](evidencias/axe-despues-claro.json) y [axe-despues-oscuro.json](evidencias/axe-despues-oscuro.json).

Durante el desarrollo, este barrido detectó dos regresiones que se corrigieron antes de cerrar:

- Las burbujas ocultas del InfoTip provocaban scroll horizontal de 10 a 95 px. Ahora usan `display: none` al cerrarse.
- El nombre del buscador no coincidía con su texto visible.

## 3. Pruebas funcionales, de teclado y táctiles

Sonda en Chromium: `.claude/skills/ux-qa/scripts/probe-after.mjs`, 1280 px con ratón y teclado y 390 px táctil (`hasTouch`, `isMobile`). Resultado: **24 de 24 comprobaciones aprobadas** y ningún error de JavaScript ([sonda-interaccion-despues.json](evidencias/sonda-interaccion-despues.json)).

| Criterio de aceptación (plan, §3) | Estado | Evidencia |
| --- | --- | --- |
| 1. 0 infracciones serious/critical de axe en las 13 rutas, en claro y oscuro | Aprobado | Tabla del §2 |
| 2. InfoTip en cada sigla; se abre con teclado y toque y se cierra con Escape | Aprobado | Sonda (6 comprobaciones UX-04) y prueba vitest |
| 3. «abc» muestra un mensaje bajo el campo y el aviso nombra el campo | Aprobado | Sonda UX-03 y prueba vitest |
| 4. A 390 px todas las acciones muestran texto | Aprobado | Sonda UX-02 y prueba vitest |
| 5. Deshacer en eliminar, Ejemplo y Vaciar | Aprobado (eliminar y Ejemplo en navegador; Vaciar, con el mismo código, en vitest) | Sonda UX-07 y pruebas vitest |
| 6. Menú móvil: Escape, botón de cierre, foco al abrir y al cerrar | Aprobado | Sonda (3 comprobaciones UX-09) y prueba vitest |
| 7. El foco vuelve al cerrar la paleta | Aprobado | Sonda UX-10 |
| 8. «Saltar al contenido» es lo primero y lleva a `<main>` | Aprobado | Sonda UX-13 y prueba vitest |
| 9. «Cómo empezar» se oculta y no vuelve | Aprobado | Sonda UX-05 y prueba vitest |
| 10. La matriz doble muestra completos los valores de 4 cifras y la columna «Superior» | Aprobado (inspección visual) | [Captura](capturas/despues/1280-interpolacion-doble.png) |
| 11. Build y pruebas sin fallos; sin scroll horizontal ni errores de consola | Aprobado | §1 y §2 |

Las pruebas de regresión previas siguen pasando. Comprueban, entre otros, los resultados SPUR–SPJC y SPJC–SPQT (por ejemplo, FOB 17059,18 lb), la interpolación lineal (92,08) y doble (1330), el historial, el análisis de imagen simulado y la redirección de pruebas verificadas.

### Vuelos internacionales (ampliación)

En Chromium, con el enunciado SEGU – SPJC escrito como en el cuaderno, a 1280 y 390 px y en claro y oscuro, las respuestas son 116,01 · 11207,81 · 17607,26 · 181,45 (cada paso redondeado a 2 decimales) y la página de la prueba marca «Coincide» en a), b) y d) y «Redondeo» en c), porque la resolución escribe 17607,29. axe da 0 infracciones con el desarrollo abierto, no hay scroll horizontal y no hay errores de JavaScript.

## 4. Revisión visual

Se revisaron las capturas finales de inicio (1280 y 390), combustible, interpolación lineal (390) y doble (1280), ayudas abiertas, mensajes de error, historial con «Deshacer» y menú móvil. Están todas en [capturas/despues/](capturas/despues/) (`<ancho>[-dark]-<pantalla>.png`). Ajustes hechos tras esta revisión:

- La marca ▶ de «Nombrar variables» había desaparecido; se restauró.
- Los dos iconos ⓘ de la matriz quedaban juntos y eran ambiguos; ahora cada uno está junto a lo que explica.
- Se ocultó el atajo ⌘K en el móvil.

## 5. No validado

- **Lectores de pantalla reales** (VoiceOver, NVDA): no se probaron. Solo se verificaron nombres, roles y descripciones accesibles con axe y testing-library.
- **Análisis de fotos con Claude**: no se hizo ninguna llamada real a la API para no enviar datos a un servicio externo. Se mantienen las pruebas existentes con la respuesta simulada.
- **Safari/iOS y Firefox**: no se probaron. Todas las pruebas en navegador usaron Chromium. El comportamiento táctil del InfoTip se diseñó para Safari, que no enfoca los botones al tocarlos, pero no se verificó en ese navegador.
- **Pruebas con usuarios**: no hubo sesiones con personas; la evaluación de usuario nuevo es heurística.
- **axe a 768 px**: no se ejecutó (ver §2).
