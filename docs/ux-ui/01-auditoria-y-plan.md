# Auditoría UX/UI y plan de mejora — AeroPerf

Fecha: 4 de noviembre de 2026 · Rama: `main` (commit `a6f8133`)

## 0. Método y alcance

- **Ejecución real**: `vite` en `http://127.0.0.1:5191/` (servidor de desarrollo), navegado con Chromium 1248 vía Playwright 1.64 (instalado fuera del repositorio, sin añadir dependencias).
- **Anchos**: 1280 px (escritorio), 768 px (tableta) y 390 px (móvil, táctil), tema claro. Capturas completas en [`capturas/antes/`](capturas/antes/) (`<ancho>-<pantalla>.png`).
- **Accesibilidad automática**: axe-core 4 con reglas WCAG 2.0/2.1/2.2 A y AA + buenas prácticas, en 13 rutas × 2 anchos.
- **Interacción**: recorrido con teclado (Tab, Escape, flechas), menú móvil, paleta de búsqueda, guardar/borrar en el historial, entradas no numéricas, enunciado incompleto.
- **Línea base técnica**: `npx vitest run` → 153 pruebas aprobadas en 10 archivos; `tsc -b` sin errores; ninguna página con scroll horizontal ni errores de JavaScript.
- Se reutilizó la revisión visual previa ([`docs/visual-review/README.md`](../visual-review/README.md)), que ya corrigió contraste de textos secundarios, desbordes y alineaciones; no se repiten esos análisis.

**Limitaciones**: el análisis de imágenes con Claude (`/api/analyze-statement`) no se probó con una llamada real para no enviar datos a un servicio externo ni consumir la clave; se evaluaron sus estados de interfaz (carga, error) desde el código y las pruebas existentes. No hay usuarios reales disponibles: la evaluación de «usuario nuevo» es heurística.

## 1. Inventario de pantallas y funcionalidades

| Ruta | Pantalla | Función principal | Estado verificado |
| --- | --- | --- | --- |
| `#/` | Inicio | Accesos directos (combustible, interpolar, tablas), otras herramientas, próximamente, actividad reciente | Funciona |
| `#/tools/fuel` | Planificación de combustible | Enunciado escrito/pegado/foto → T.T, T.F, FOB, autonomía; datos editables; desarrollo; validación | Funciona (texto); foto no probada con API real |
| `#/tools/linear` | Interpolación lineal | A, B, C, A1, B1 → X con gráfica y desarrollo | Funciona |
| `#/tools/bilinear` | Interpolación doble | Matriz 2×2 → valor interpolado | Funciona; campos truncados (UX-01) |
| `#/tools/density-altitude` | Altitud de densidad | Elevación, QNH, OAT → DA | Funciona |
| `#/tools/wind` | Componentes de viento | Pista, viento → cara/cola y cruzado | Funciona |
| `#/tools/units` | Conversor de unidades | 7 magnitudes, copiar equivalencias | Funciona |
| `#/tables`, `#/tables/:id` | Tablas de aeronaves | Consulta de 10 tablas FAA, variantes, ayuda, CSV | Funciona |
| `#/pruebas`, `#/pruebas/:id` | Pruebas | Comparación con resoluciones manuales | Funciona |
| `#/history` | Historial | Reabrir, filtrar, eliminar, borrar todo | Funciona; borrado sin deshacer (UX-07) |
| `#/settings` | Ajustes | Tema y decimales | Funciona |
| `*` | Página no encontrada | Volver al inicio | Funciona |
| Global | Menú lateral, barra superior con migas, barra inferior móvil, paleta `⌘/Ctrl K`, avisos (toast) | — | Ver UX-09, UX-10, UX-11 |

**Perfiles de usuario y permisos**: la aplicación no tiene autenticación ni roles. Hay un único perfil (estudiante/piloto que resuelve ejercicios de performance). Todo se guarda en `localStorage` del navegador. Por tanto, el manual no documenta «acceso» con credenciales, sino la apertura de la app.

**Design system existente**: tokens en `src/styles/tokens.css` (paleta teal + tinta, tipografía DM Sans/Inter, espaciado base 8, radios 8/16/24/48, temas claro/oscuro) y componentes en `src/components/ui/` (`Card`, `PageHeader`, `NumberField`, `Alert`, `ResultHero`, `Disclosure`) más `ToolActions`. Faltaba un componente de ayuda contextual, mensajes por campo y avisos con acciones.

## 2. Problemas detectados

Prioridad: **P0** impide completar un proceso · **P1** lo dificulta mucho · **P2** confusión o fricción · **P3** refinamiento. Complejidad: S (< 1 h), M (1–3 h), L (> 3 h).

No se encontró ningún **P0**: todos los procesos principales se pueden completar.

| ID | Prio. | Problema | Evidencia | Impacto | Propuesta | Compl. |
| --- | --- | --- | --- | --- | --- | --- |
| UX-01 | P1 | Interpolación doble: las celdas Q11–Q22 no tienen etiqueta visible ni accesible, aunque el desarrollo las nombra; a 1280 px los valores se cortan («200(» por 2000) y la columna «Superior» queda oculta. | `capturas/antes/1280-interpolacion-doble.png`; axe `empty-table-header` | No se puede comprobar lo escrito ni relacionar la tabla con la fórmula; un lector de pantalla anuncia «0». | Etiquetas Q11–Q22 visibles y nombres accesibles descriptivos; campos compactos en la matriz para mostrar 4–5 cifras. | M |
| UX-02 | P1 | En móvil, «Vaciar», «Ejemplo» y «Compartir» son solo iconos; su texto está en `title`, que no se ve en pantallas táctiles. | `390-interpolacion-lineal.png`; sonda: botones con texto vacío | El usuario no sabe qué hace cada icono; «Ejemplo» sobrescribe sus datos. | Mostrar siempre el texto corto de cada acción. | S |
| UX-03 | P1 | Validación imprecisa: escribir «abc» en A muestra «Completa los cinco valores», aunque el campo está lleno; el campo se marca en rojo sin decir qué está mal. | Sonda de interacción | El usuario no entiende qué corregir. | Mensaje por campo («Escribe solo números…») enlazado con `aria-describedby`; aviso general que nombra los campos a revisar. | M |
| UX-04 | P1 | Siglas sin explicación junto al dato: T.T, T.F, FOB, HW/TW, FL, QNH, OAT, σ, A/B/C/A1/B1. Las únicas ayudas son atributos `title`, invisibles con teclado y táctil. | Inventario de `title` (16 en Inicio) | Usuarios nuevos no saben qué introducir ni cómo leer los resultados. | Sistema reutilizable de ayuda contextual (`InfoTip`): botón ⓘ que funciona con ratón, teclado y toque, de 1–2 frases, con textos centralizados. | M |
| UX-05 | P2 | Inicio sin orientación de primer uso: no explica el flujo ni que los datos se guardan solo en este navegador. | `1280-inicio.png` | Mayor tiempo hasta la primera tarea. | Tarjeta «Cómo empezar» de 3 pasos, descartable y recordada. | S |
| UX-06 | P2 | «Guardar» aparece deshabilitado sin explicar por qué. | Sonda: botón `disabled` sin texto de ayuda | Parece un fallo. | Texto breve junto a las acciones: «Guardar se activa cuando hay un resultado». | S |
| UX-07 | P2 | Eliminar una entrada del historial es inmediato y sin forma de deshacer. «Ejemplo»/«Vaciar» sobrescriben los datos sin deshacer. | Sonda: 0 diálogos, entrada eliminada | Pérdida accidental de información. | Aviso con botón «Deshacer» para eliminar, cargar ejemplo y vaciar. | M |
| UX-08 | P2 | Los avisos muestran siempre el icono de éxito, también en errores («No se pudo copiar»); la región `role=status` solo existe mientras hay aviso, por lo que algunos lectores no lo anuncian. | `AppShell.tsx`, `toast.ts` | Mensajes de error que parecen confirmaciones. | Avisos con tipo (éxito/error/info), región viva permanente y acción opcional. | S |
| UX-09 | P2 | Menú móvil sin botón de cierre; Escape no lo cierra y el foco no entra en él. | `390-menu-movil.png`; sonda | Usuarios de teclado y lectores quedan atrapados detrás del menú. | Botón «Cerrar menú», Escape, foco al abrir y retorno al botón «Más». | S |
| UX-10 | P2 | Paleta de búsqueda: al cerrarla el foco se pierde (`BODY`); su botón dice «Buscar herramienta» pero también busca tablas y ejercicios (axe `label-content-name-mismatch`); sin sugerencias cuando no hay resultados. | Sonda; axe | Desorientación con teclado; expectativas erróneas. | Devolver el foco, texto «Buscar…», sugerencias en estado vacío. | S |
| UX-11 | P2 | Migas: en una herramienta, el primer nivel muestra la categoría («Performance de aeronaves») pero enlaza a Inicio. | `1280-combustible.png` | El enlace no lleva donde dice. | Migas «Inicio › Categoría › Herramienta» con la categoría como texto. | S |
| UX-12 | P2 | Chips de datos del enunciado: el significado de verde/naranja/rojo y del asterisco solo se intuye o está en letra pequeña al final. | `1280-combustible.png` | El usuario no sabe si la app inventó un dato (supuesto). | Leyenda breve bajo los chips. | S |
| UX-13 | P2 | No existe enlace «Saltar al contenido»; con teclado hay que recorrer ~17 enlaces del menú. | Sonda de Tab | Lentitud para usuarios de teclado (WCAG 2.4.1). | Enlace de salto visible al recibir el foco. | S |
| UX-14 | P2 | Contraste insuficiente en las salidas rojas X/R1/R2 sobre fondo rosado. | axe `color-contrast` (1 nodo en lineal, 5 en doble) | Lectura difícil (WCAG 1.4.3). | Token `--result-strong` para texto de resultado sobre `--result-soft`. | S |
| UX-15 | P2 | Estructura de encabezados: tarjetas de Tablas con `h3` sin `h2`; detalle de tabla inexistente y 404 sin `h1`; cabecera vacía en la matriz. | axe `heading-order`, `page-has-heading-one`, `empty-table-header` | Navegación por encabezados confusa. | Ajustar niveles y nombrar la celda. | S |
| UX-16 | P2 | Ajustes: el control de decimales no tiene etiqueta visible y su objetivo táctil mide menos de 24 px. | `1280-ajustes.png`; sonda de objetivos | Difícil de usar en móvil (WCAG 2.5.8). | Etiqueta visible y control más alto. | S |
| UX-17 | P3 | En móvil, «Actividad reciente» queda al final, después de «Próximamente». | `390-inicio.png` | Lo útil queda por debajo de lo no disponible. | «Próximamente» al final, a ancho completo. | S |
| UX-18 | P3 | El botón de tema cambia en ciclo (sistema → claro → oscuro) sin indicar el siguiente estado. | `Topbar.tsx` | Resultado impredecible. | Nombre accesible y ayuda «Tema: X. Pulsa para cambiar a Y». | S |
| UX-19 | P3 | Estados vacíos poco orientativos: diagrama de viento «Sin datos»; carga de página «Cargando…» como texto plano. | `WindComponents.tsx`, `AppShell.tsx` | No dice qué hacer; sensación de salto. | Mensaje con instrucción y esqueleto de carga. | S |
| UX-20 | P3 | «Nombrar variables (opcional)» tiene un objetivo táctil de menos de 24 px de alto. | Sonda de objetivos | Toque impreciso. | Altura mínima de 32 px. | S |

> **Hallazgos añadidos durante la implementación** (detalle en [02-cambios-implementados.md](02-cambios-implementados.md)): UX-21 (P2), el menú móvil cerrado seguía recibiendo el foco del teclado; UX-22 (P2), las tablas con desplazamiento horizontal no eran accesibles con el teclado; UX-23 (P3), un mensaje de error hablaba de «división por cero».

## 3. Plan por fases

| Fase | Contenido | Problemas |
| --- | --- | --- |
| 1 · Base reutilizable | `InfoTip` (ayuda contextual), textos de ayuda centralizados (`src/content/help.ts`), `NumberField` con `help` y `error`, avisos con tipo y acción «Deshacer», token `--result-strong`, utilidades `sr-only` y `skip-link`. | UX-04, UX-08, UX-14 |
| 2 · Formularios y calculadoras | Mensajes por campo, ayudas en todos los campos con siglas, matriz de interpolación doble, acciones con texto en móvil, explicación de «Guardar», deshacer en «Ejemplo/Vaciar». | UX-01, UX-02, UX-03, UX-06, UX-07 |
| 3 · Navegación y orientación | Saltar al contenido, menú móvil accesible, paleta, migas, tarjeta «Cómo empezar», orden del inicio, leyenda de chips, deshacer en historial, botón de tema. | UX-05, UX-07, UX-09–UX-13, UX-17, UX-18 |
| 4 · Accesibilidad y refinamiento | Encabezados, ajustes, estados vacíos y de carga, objetivos táctiles. | UX-15, UX-16, UX-19, UX-20 |
| 5 · QA y documentación | Pruebas automáticas nuevas, axe, navegación real a 1280/768/390 en claro y oscuro, manual con capturas anotadas, skills. | — |

### Componentes y convenciones nuevas (contrato para la implementación)

- `InfoTip` (`src/components/ui/InfoTip.tsx`): `<InfoTip label="FOB">texto</InfoTip>`. Botón de 24 px con icono ⓘ y nombre «Qué es FOB». Se abre con hover, foco o toque; se cierra con Escape, clic fuera o al perder el foco. El texto está siempre en el DOM y enlazado por `aria-describedby`.
- `src/content/help.ts`: único lugar para los textos de ayuda (máx. dos frases, sin repetir la etiqueta, en segunda persona, con el «qué hacer»).
- `NumberField`: props nuevas `help` (texto de `InfoTip`), `error` (mensaje que sustituye a la pista) y `srLabel` (nombre accesible cuando la etiqueta visible es una sigla).
- `showToast(text, { kind, action })` con `kind: 'success' | 'error' | 'info'` y `action: { label, run }`.

### Dependencias técnicas y riesgos

- **Sin dependencias nuevas**: React 19, lucide-react y CSS propio bastan.
- **Riesgo de regresión en pruebas** (`src/app.test.tsx` usa nombres accesibles y textos): se ajustarán solo cuando el cambio de texto sea intencionado y se añadirán pruebas para los nuevos comportamientos.
- **Clases protegidas por la revisión visual previa**: se mantienen; los cambios de estilo se limitan a reglas nuevas y tokens.
- **jsdom** no implementa `scrollTo`/`scrollIntoView` (avisos ya existentes); el `InfoTip` no debe depender de APIs de posicionamiento no disponibles allí.

### Criterios de aceptación verificables

1. axe-core: 0 infracciones `serious`/`critical` en las 13 rutas a 1280 y 390 px (tema claro) y en las principales en oscuro.
2. Cada campo con siglas (A, B, C, A1, B1, X, Q11–Q22, QNH, OAT, FL, HW/TW, T.T, T.F, A.F, FOB) tiene un `InfoTip` que se abre con teclado (Enter/Espacio o foco) y con toque, y se cierra con Escape.
3. Escribir «abc» en un campo muestra bajo ese campo: «Escribe solo números; usa coma o punto para los decimales.» y el aviso general nombra el campo.
4. A 390 px, todos los botones de acción muestran texto visible.
5. Eliminar del historial, «Ejemplo» y «Vaciar» ofrecen «Deshacer» durante 6 s y lo restauran.
6. Menú móvil: se cierra con Escape y con «Cerrar menú»; el foco entra al abrirlo y vuelve a «Más» al cerrarlo.
7. Tras cerrar la paleta, el foco vuelve al botón que la abrió.
8. «Saltar al contenido» es el primer elemento enfocable y lleva el foco a `<main>`.
9. La tarjeta «Cómo empezar» aparece la primera vez, se descarta y no vuelve a salir tras recargar.
10. Interpolación doble a 1280 px muestra completos «2000», «4000» y la columna «Superior».
11. `npm run build` y `npx vitest run` sin fallos; sin scroll horizontal ni errores de consola en 1280/768/390.
