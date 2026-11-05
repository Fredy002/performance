# Cambios implementados

Cada cambio responde a un problema de [01-auditoria-y-plan.md](01-auditoria-y-plan.md). Evidencias: pruebas de `src/ux.test.tsx` (vitest), barrido axe y sonda de interacción en Chromium ([evidencias/](evidencias/)) y capturas en [capturas/despues/](capturas/despues/).

No se añadieron dependencias ni se tocó el backend (`server/`). Los procesos de cálculo (`src/core/`) no cambian, salvo el texto de un mensaje de error.

## Base reutilizable

| Pieza | Para qué | Archivos |
| --- | --- | --- |
| `InfoTip` | Ayuda contextual de 1–2 frases. Se abre con hover, foco o toque y se cierra con Escape, con un toque fuera o al quitar el puntero. El texto está siempre enlazado por `aria-describedby`, la burbuja se recoloca dentro de la pantalla y su objetivo táctil mide 24 px. | `src/components/ui/InfoTip.tsx`, `src/styles/help.css` |
| Textos de ayuda | Un único diccionario con el tono acordado: español claro, sin repetir la etiqueta y diciendo qué hacer. | `src/content/help.ts` |
| `NumberField` | Nuevas props `help` (InfoTip junto a la etiqueta o la sigla), `error` (mensaje por campo enlazado y `aria-invalid`) y `srLabel` (nombre accesible cuando la etiqueta es una sigla). Incluye el ayudante `numberError()`. | `src/components/ui/NumberField.tsx` |
| Avisos | `showToast(text, { kind, action })` con tipos éxito, error e info, botón de acción («Deshacer») y botón de cierre. Usa una región `role=status` permanente. | `src/state/toast.ts`, `src/components/layout/AppShell.tsx` |
| Historial reversible | `removeHistory` y `clearHistory` devuelven lo borrado; `restoreHistory` lo reinserta en su posición. | `src/state/history.ts` |
| Token `--result-strong` | Texto rojo de resultado o error con contraste AA sobre `--result-soft`, en ambos temas. | `src/styles/tokens.css`, `src/styles/calc.css` |

## Cambios por problema

| ID | Problema original | Solución implementada | Archivos modificados | Resultado y evidencia |
| --- | --- | --- | --- | --- |
| UX-01 | Matriz de interpolación doble sin etiquetas Q11–Q22 y con valores cortados | Cada casilla muestra su sigla y tiene un nombre accesible («Q21, valor de la tabla en X2 y Y1»). Se reducen la sigla y el relleno dentro de la matriz y su ancho mínimo baja de 460 a 400 px. Hay ayudas para los ejes y las casillas, y los mensajes hablan de X1/X2 e Y1/Y2. | `src/tools/bilinear/BilinearInterpolation.tsx`, `src/styles/help.css`, `src/styles/calc.css` | A 1280 px se leen «2000», «4000» y la columna «Superior» completa ([captura](capturas/despues/1280-interpolacion-doble.png)). Lo cubre la prueba «cada casilla tiene nombre propio». |
| UX-02 | En el móvil, las acciones solo mostraban un icono | «Vaciar», «Ejemplo», «Compartir» y «Guardar» muestran siempre su texto y se reparten en varias líneas si no caben. | `src/components/ToolActions.tsx` | Sonda: «Acciones con texto visible en móvil» aprobada ([captura](capturas/despues/390-interpolacion-lineal.png)). |
| UX-03 | Un texto no numérico se trataba como campo vacío | Cada campo explica su error («Escribe solo números; usa coma o punto para los decimales.») y el aviso general indica qué campos revisar o completar. También hay mensajes específicos para pistas no válidas, QNH ≤ 0, velocidad negativa y códigos OACI. | `LinearInterpolation.tsx`, `BilinearInterpolation.tsx`, `DensityAltitude.tsx`, `WindComponents.tsx`, `UnitConverter.tsx`, `FuelPlanForm.tsx`, `AirportField.tsx`, `src/core/interpolation.ts` (texto) | Prueba «un valor no numérico se explica…» y sonda UX-03 aprobadas ([captura](capturas/despues/1280-lineal-error-campo.png)). |
| UX-04 | Siglas sin explicación | Se añadió un InfoTip a A/B/C/A1/B1, X/Y, Q11–Q22, elevación, QNH, OAT, σ, pista, dirección del viento, límite de viento cruzado, HW/TW, FL, peso en espera, taxi, código OACI, T.T, T.F, FOB, autonomía, datos detectados y decimales. | Componentes anteriores, más `FuelPlanAnswers.tsx`, `StatementBox.tsx` y `Settings.tsx` | La sonda comprueba el foco, Escape, Enter, hover, el toque y que la burbuja quede dentro de la pantalla a 390 px ([teclado](capturas/despues/1280-ayuda-qnh-teclado.png), [táctil](capturas/despues/390-ayuda-fob-tactil.png)). |
| UX-05 | El inicio no orientaba la primera visita | Tarjeta «Cómo empezar» con 3 pasos y la nota «se guarda solo en este navegador». Se oculta con «Entendido, ocultar» y la preferencia se guarda en Ajustes (`onboardingDismissed`). El atajo ⌘K solo se menciona en escritorio. | `src/pages/Dashboard.tsx`, `src/state/settings.ts`, `src/styles/help.css` | La prueba y la sonda confirman que se muestra, se oculta y no vuelve tras recargar. |
| UX-06 | «Guardar» aparecía deshabilitado sin explicación | Texto «Guardar se activa cuando hay un resultado.», enlazado al botón con `aria-describedby`. | `src/components/ToolActions.tsx` | Prueba y sonda UX-06 aprobadas. |
| UX-07 | Borrados y sobrescrituras sin vuelta atrás | «Deshacer» durante 6 s tras eliminar una entrada, borrar todo (que además pide confirmación con el número de entradas), «Ejemplo» y «Vaciar» en todas las calculadoras, incluido el enunciado de combustible. | `ToolActions.tsx`, `History.tsx`, `history.ts`, las 5 calculadoras con acciones y `FuelPlanning.tsx` | Pruebas «Ejemplo se puede deshacer» y «eliminar… lo restaura». La sonda comprueba «abc» → Ejemplo → Deshacer → «abc» ([captura](capturas/despues/1280-historial-deshacer.png)). |
| UX-08 | Los errores se mostraban con el icono de éxito | Icono y color según el tipo. Los mensajes de error dicen qué hacer: «Copia la dirección desde la barra del navegador». | `AppShell.tsx`, `toast.ts`, `ToolActions.tsx`, `UnitConverter.tsx` | Prueba «un error al copiar se muestra como error». |
| UX-09 | Menú móvil sin forma de cerrarlo con teclado | Botón «Cerrar menú». Escape lo cierra, el foco entra al abrirlo y vuelve a «Más» al cerrarlo. «Más» indica su estado con `aria-expanded` y `aria-controls`. | `AppShell.tsx`, `Sidebar.tsx`, `BottomNav.tsx`, `help.css` | Tres comprobaciones de la sonda y una prueba ([captura](capturas/despues/390-menu-movil.png)). |
| UX-10 | La paleta perdía el foco y su nombre no coincidía con lo que busca | El foco vuelve al control que abrió la paleta. El botón ahora dice «Buscar…» y el campo «Buscar herramientas, tablas y ejercicios». Si no hay resultados, sugiere búsquedas. | `AppShell.tsx`, `Topbar.tsx`, `CommandPalette.tsx` | Sonda aprobada; desaparece la infracción axe `label-content-name-mismatch`. |
| UX-11 | La miga de la categoría llevaba a Inicio | Migas «Inicio › Categoría › Herramienta», con la categoría como texto y `aria-current="page"`. | `Topbar.tsx` | Prueba y sonda UX-11 aprobadas. |
| UX-12 | Los colores de los chips no se explicaban | Leyenda «Leído del enunciado · * Supuesto (no figura) · Falta», con InfoTip. | `StatementBox.tsx`, `help.css` | Prueba «las respuestas de combustible explican sus siglas». |
| UX-13 | No había forma de saltar el menú | «Saltar al contenido» es el primer elemento enfocable; lleva el foco a `<main id="contenido">` sin romper el HashRouter. | `AppShell.tsx`, `help.css` | Prueba y sonda aprobadas. |
| UX-14 | Contraste bajo en X/R1/R2 | `--result-strong` (#b42318 en claro, #fda29b en oscuro). | `tokens.css`, `calc.css` | axe `color-contrast`: 0 infracciones (antes, 6 nodos). |
| UX-15 | Encabezados mal anidados y una celda de cabecera vacía | Tarjetas de Tablas con `h2`. Las páginas 404 y «en desarrollo» usan `h1`. Las cabeceras de la matriz tienen `scope` y la celda vacía, texto para lectores. Se corrigió la ruta mal escrita del detalle de tabla en la auditoría. | `TablesLibrary.tsx`, `NotFound.tsx`, `ToolPage.tsx`, `BilinearInterpolation.tsx`, `components.css` | axe: 0 infracciones `heading-order`, `page-has-heading-one` y `empty-table-header`. |
| UX-16 | Ajustes sin etiqueta visible | Etiqueta «Decimales en los resultados» con InfoTip, `aria-valuetext` y control de 32 px de alto. Nota sobre «Sistema». | `Settings.tsx`, `help.css` | No quedan objetivos táctiles de menos de 24 px. |
| UX-17 | «Próximamente» aparecía antes que la actividad en el móvil | «Próximamente» pasa al final, a ancho completo. | `Dashboard.tsx` | [Captura a 390 px](capturas/despues/390-inicio.png); prueba existente «el inicio ofrece tres accesos directos» aprobada. |
| UX-18 | El botón de tema no indicaba qué haría | Nombre y `title`: «Tema claro. Cambiar a tema oscuro». | `Topbar.tsx` | Comprobado por inspección del nombre accesible. |
| UX-19 | Estados vacíos y de carga poco claros | Esqueleto de carga con `aria-busy`. Los estados vacíos de la gráfica, el diagrama de viento y el historial dicen qué hacer (el historial ofrece «Resolver un ejercicio»). Hay mensajes nuevos en «en desarrollo» y 404. | `AppShell.tsx`, `LinearInterpolation.tsx`, `WindComponents.tsx`, `History.tsx`, `ToolPage.tsx`, `NotFound.tsx` | Capturas de [historial vacío](capturas/despues/1280-historial.png) y [404](capturas/despues/1280-no-encontrada.png). |
| UX-20 | «Nombrar variables» tenía un objetivo pequeño | Relleno vertical de 8 px. | `help.css` | No quedan objetivos táctiles de menos de 24 px. |

## Mejoras adicionales encontradas durante la implementación

| ID | Hallazgo | Solución | Evidencia |
| --- | --- | --- | --- |
| UX-21 (P2) | El menú lateral cerrado en el móvil seguía recibiendo el foco con Tab (unos 17 enlaces invisibles). | `visibility: hidden` cuando está cerrado, aplicado después de la animación. | Sonda: «Menú cerrado no es enfocable». |
| UX-22 (P2) | Las tablas con desplazamiento horizontal no se podían desplazar con el teclado (axe `scrollable-region-focusable`). | `tabIndex=0`, `role="region"` y un nombre en los contenedores desplazables. | axe: 0 infracciones. |
| UX-23 (P3) | El texto de error de la interpolación hablaba de «división por cero». | «A y B no pueden ser iguales: escribe dos filas distintas de la tabla.» | Prueba de regresión existente actualizada. |
| QA | Al validar el InfoTip apareció un fallo propio: tras abrirlo con foco y cerrarlo con Escape, Enter no lo reabría. | Se distingue si la ayuda estaba abierta al tocar (también funciona en Safari, que no enfoca los botones al tocarlos). | Prueba «se abre con foco o toque…» y sonda «Enter vuelve a abrirlo». |

## Pruebas actualizadas

`src/app.test.tsx` usaba atributos que han cambiado (`aria-label` en un `div` sin rol, `title` de botones y nombres «C»/«B»). Se actualizaron cuatro selectores para usar los nuevos nombres accesibles, que son más descriptivos; los valores esperados no cambian. Se añadió `src/ux.test.tsx`, con 13 pruebas.

## Ampliación posterior: vuelos internacionales

A partir de la resolución manual del ejercicio SEGU (Guayaquil) – SPJC:

| Cambio | Archivos | Evidencia |
| --- | --- | --- |
| El ámbito se deduce de los códigos OACI: si origen, destino **o** alterno no empieza por SP, el vuelo es internacional. La espera pasa a 30 min y se suma el 10 % de T.T y de T.F a la autonomía y al FOB. Si el usuario no cambió el tiempo de espera, se ajusta solo al cambiar un aeropuerto. | `src/core/fuelPlanning.ts` (`contingencyPct`, `contingency`), `src/exercises/registry.ts` (`SCOPES.internacional`, `routeScope`), `src/components/fuel/fuelForm.ts`, `src/tools/fuel/FuelPlanning.tsx` | Pruebas «ejercicio B737 SEGU – SPJC» y «ámbito del vuelo» |
| Aviso «Vuelo internacional (… no es un aeropuerto del Perú)», líneas «10 % T.T / 10 % T.F» en el desarrollo y nota bajo las respuestas. | `FuelPlanForm.tsx`, `FuelPlanSteps.tsx`, `FuelPlanAnswers.tsx`, `src/content/help.ts` | [Captura](capturas/despues/1280-combustible-internacional-desarrollo.png) |
| Aeropuertos extranjeros para el autocompletado (SEGU, SEQM, SKBO, SCEL, SLLP, SLVR, SAEZ, SBGR, MPTO, KMIA). Se admite cualquier otro código OACI. | `src/data/airports.ts`, `AirportField.tsx` | `src/data/airports.test.ts` |
| El enunciado admite la ciudad entre paréntesis: «SEGU(Guayaquil) - SPJC». | `src/exercises/parseStatement.ts` | `parseStatement.test.ts` |
| Ejercicio SEGU – SPJC en Pruebas (pendiente de verificación): 20 de 21 pasos coinciden exactamente. El FOB difiere en 0,04 porque la resolución suma A.F = 2536,7 redondeado (17607,29 frente al exacto 17607,25). | `src/exercises/registry.ts` | [Captura](capturas/despues/1280-prueba-segu-spjc.png) |
| UX-24 (P2): los valores rojos del desarrollo paso a paso tenían un contraste de 4,39:1, también en las pruebas ya existentes. Ahora usan `--result-strong`. | `src/styles/calc.css` | axe: 0 infracciones en combustible (desarrollo abierto) y en la prueba, en claro y oscuro |
| Ayuda ⓘ en «Nivel de espera»: qué es, para qué se usa en la tabla y por qué se toma 1 500 ft (FL 015) cuando el enunciado no lo da. | `src/content/help.ts`, `FuelPlanForm.tsx` | Prueba en `src/ux.test.tsx`; [captura a 390 px](capturas/despues/390-ayuda-nivel-espera.png) |
| Fallo del InfoTip en pantallas táctiles: tras el toque, el navegador emite un `mouseout` que cerraba la burbuja al instante. El hover ahora solo responde a un ratón real (`pointerType === 'mouse'`). | `src/components/ui/InfoTip.tsx` | Toque en tres ayudas a 390 px: se abren y permanecen abiertas; sonda de 24 comprobaciones aprobada (incluye hover con ratón) |
| **Redondeo por pasos en combustible.** La app sumaba valores exactos y mostraba sumandos redondeados, así que el total no coincidía con la suma de lo que se veía (FOB 17607,25 frente a 11207,81 + 1120,78 + 2536,67 + 2342 + 400 = 17607,26). Ahora cada paso se redondea a los decimales de Ajustes antes de usarse en el siguiente, como a mano. La validación de las Pruebas usa siempre 2 decimales por paso, como las resoluciones. | `src/core/fuelPlanning.ts` (`SolveOptions.decimals`), `src/components/fuel/fuelForm.ts`, `ExerciseValidation.tsx` (`VALIDATION_DECIMALS`), `Settings.tsx` | `src/core/core.test.ts`: para los 3 ejercicios y de 0 a 6 decimales, FOB y autonomía son la suma exacta de lo mostrado. En Chromium: SEGU – SPJC con 2 decimales da 17607,26, con 3 da 17607,254 y con 0 da 17607, siempre 21/21 |
| **Redondeo de la mitad.** `toFixed` redondeaba mal valores como 1,005 → «1,00» o 2,675 → «2,67». Nuevo `roundTo()`, que redondea la mitad alejándose de cero (1,01; 2,68), usado por `formatPlain` y `formatNumber` en toda la app. | `src/core/format.ts` | `src/core/core.test.ts` |

## Ampliación posterior: EPR de despegue del B727

Replica la resolución manual de las condiciones G-5 (FIGURE 81, 82 y 83).

| Cambio | Archivos | Evidencia |
| --- | --- | --- |
| Nueva herramienta **EPR de despegue (B727)**. Pasos: altitud de presión con el reglaje (in.Hg o mb); columna de OAT (°C → °F); interpolación por altitud de presión entre filas, y también entre columnas si la OAT no coincide con una; correcciones (aire acondicionado OFF +0,04 a 1 y 3; antihielo ON −0,03 al motor 2; 6.ª etapa ON con 50 °F o más −0,05 al motor 2); redondeo final a 2 decimales. Selector G-1 a G-5, botones ON/OFF y ayuda ⓘ en cada dato. | `src/core/takeoffEpr.ts`, `src/tools/takeoff-epr/TakeoffEpr.tsx`, `src/components/takeoff/*`, `src/tools/registry.ts`, `src/content/help.ts` | `src/core/takeoffEpr.test.ts` y `src/ux.test.tsx`; [captura](capturas/despues/1280-epr-despegue.png) |
| Las láminas 54/82 y 83 exportan sus filas como datos; la lámina y el cálculo usan la misma fuente y el texto visible no cambia. Las condiciones G-1 a G-5 se comprueban celda a celda contra la FIGURE 81. | `fig54-…ts`, `fig83-…ts`, `src/data/tables/b727Takeoff.ts` | Las pruebas de tablas existentes siguen aprobadas; nueva prueba de coherencia |
| Prueba **EPR de despegue B727 · condiciones G-5** (pendiente de verificación): 7 de 7 pasos coinciden exactamente (corrección +400 ft, altitud de presión 2550 ft, 2,2375, 2,253, −0,03, 2,24 y 2,22). Pruebas admite ya otro tipo de ejercicio además de combustible. | `src/exercises/registry.ts`, `TakeoffEprExerciseView.tsx`, `ExerciseDetail.tsx`, `ExercisesList.tsx`, `exerciseLinks.ts` | [Captura](capturas/despues/1280-prueba-epr-g5.png) |
| Manual de usuario: nueva sección «Calcular el EPR de despegue (B727)». La anotación admite un recuadro que abarca varios elementos. | `.claude/skills/visual-user-manual/scripts/*` | PDF de 16 páginas |

## Ampliación posterior: EPR de despegue del B737

Replica la resolución manual de las condiciones R-5 (FIGURE 53, 54 y 55).

| Cambio | Archivos | Evidencia |
| --- | --- | --- |
| La herramienta pasa a **EPR de despegue (B737 y B727)**, con selector de avión. B737: ① TEMP LIMIT EPR por OAT (interpolando entre columnas si hace falta) + 0,03 con el aire acondicionado OFF; ② PRESS LIMIT EPR por altitud de presión, interpolado entre recuadros (desde 5660 ft, 2,31); ③ el menor de los dos, redondeado a 2 decimales. El antihielo no corrige (ZERO). La respuesta indica qué límite manda. | `src/core/takeoffEprB737.ts`, `src/components/takeoff/*`, `src/tools/takeoff-epr/TakeoffEpr.tsx` | `src/core/takeoffEprB737.test.ts` y `src/ux.test.tsx`; [captura](capturas/despues/1280-epr-despegue-b737-r5.png) |
| Los datos del B737 salen de las láminas: OAT y TEMP LIMIT exportados de la FIGURE 55; recuadros PRESS comprobados contra la lámina; condiciones R-1 a R-5 comprobadas celda a celda contra la FIGURE 53. El módulo de datos pasa a llamarse `takeoffEprData.ts`. | `fig55-…ts`, `src/data/tables/takeoffEprData.ts` | Pruebas de coherencia |
| Prueba **EPR de despegue B737 · condiciones R-5** (pendiente de verificación): 6 de 6 pasos coinciden (−200 ft, −150 ft, 1,95, 1,98, 2,0025 y 1,98). | `src/exercises/registry.ts`, `TakeoffEprExerciseView.tsx` | `src/ux.test.tsx` |
| Manual: la captura falla con un mensaje claro si un elemento queda fuera de la imagen, en lugar de dejar capturas antiguas. | `.claude/skills/visual-user-manual/scripts/capture.mjs` | Las 14 capturas se regeneraron desde la versión actual |

## Ampliación posterior: ascenso en ruta del B737

Replica las dos resoluciones manuales de las condiciones V-5 (FIGURE 56, 57 y 58): combustible consumido y distancia recorrida.

| Cambio | Archivos | Evidencia |
| --- | --- | --- |
| Nueva herramienta **Ascenso en ruta (B737)**. Lee TIME/FUEL y DIST./TAS en la tabla ISA o ISA +10 °C por altitud de crucero y peso al soltar frenos, interpolando entre pesos y altitudes. No lee el tramo sin filas publicadas entre 6000 y 22000 ft ni las celdas vacías, y lo explica. Combustible = tabla + ajuste por aeropuerto elevado (interpolado entre elevaciones; sin ajuste por debajo de 2000 ft). Distancia = tabla ∓ (tiempo ÷ 60 × viento). Cada paso se redondea a los decimales de Ajustes. | `src/core/enRouteClimb.ts`, `src/data/tables/enRouteClimbData.ts`, `src/components/climb/*`, `src/tools/en-route-climb/EnRouteClimb.tsx`, `src/tools/registry.ts`, `src/content/help.ts` | `src/core/enRouteClimb.test.ts` y `src/ux.test.tsx`; [captura](capturas/despues/1280-ascenso-ruta.png) |
| Los valores se leen de las filas que muestran las FIGURE 57 y 58 (sin copiarlos a mano); las condiciones V-1 a V-5 se comprueban contra la FIGURE 56. | `enRouteClimbData.ts` | Pruebas de coherencia |
| Dos pruebas (pendientes de verificación): **Combustible en ascenso en ruta · V-5** (4 de 4 pasos: 13, 2100, −100, 2000) y **Distancia en ascenso en ruta · V-5** (4 de 4: 13, 70, 8,67, 61,33). | `src/exercises/registry.ts`, `ClimbExerciseView.tsx`, `exerciseLinks.ts`, `ExerciseDetail.tsx` | [Captura](capturas/despues/1280-prueba-ascenso-distancia.png) |
| `Choice` (grupo de opciones con etiqueta y ayuda) pasa a ser un componente compartido. Los enlaces dentro de notas y ayudas tienen un área táctil de 24 px. | `src/components/ui/Choice.tsx`, `src/styles/help.css` | Auditoría: 0 objetivos táctiles menores de 24 px en 57 pantallas por tema |

## Ajustes de menú, gráfica y unidades

| Cambio | Archivos | Evidencia |
| --- | --- | --- |
| Menú lateral simplificado: se ocultan Interpolación doble, Altitud de densidad, Componentes de viento, Pruebas y Próximamente. Solo se quitan del menú: siguen disponibles por su ruta, en el inicio y con «Buscar». | `src/tools/registry.ts` (`hideInSidebar`), `src/components/layout/Sidebar.tsx` | Prueba «el menú lateral muestra solo Calcular y Consultar» |
| «Interpolación lineal» pasa a llamarse **Interpolación**. Las migas no repiten la categoría cuando coincide con el nombre de la herramienta. | `src/tools/registry.ts`, `LinearInterpolation.tsx`, `Topbar.tsx` | Pruebas de regresión actualizadas |
| Explicación de cómo leer la gráfica de interpolación, bajo el título «Gráfica»: ejes, puntos A y B, lectura de X y zona de extrapolación. Usa los nombres de variables si el usuario los define. | `src/tools/linear/LinearInterpolation.tsx` | `src/tools/linear/chartHelp.test.tsx` |
| Ayuda de unidades: cada unidad de los campos y de las respuestas (ft, °F, lb, NM, kt, in.Hg, mb, FL…) se subraya con puntos y explica su significado al pasar el ratón, enfocarla o tocarla. Las opciones de unidades (°F/°C, in.Hg/mb, ISA, HW/TW) lo muestran en el `title` y en la ayuda del grupo. Los textos están en un único diccionario. El `InfoTip` se posiciona respecto a la ventana, así que ningún campo ni tabla recorta la burbuja. | `src/content/units.ts`, `src/components/ui/Unit.tsx`, `InfoTip.tsx`, `NumberField.tsx`, `Choice.tsx`, `ResultHero.tsx`, respuestas, `help.css` | `src/ux.test.tsx` («ayuda de unidades»); en Chromium la burbuja de °F se ve completa a 1280 y 390 px |
