# 06 — Auditoría de fuentes e integración visual

Revisión: 4 de noviembre de 2026. Este informe sustituye las conclusiones de las notas 01–05 cuando hay discrepancias. Aquellas notas y sus capturas se conservan como registro de la implementación inicial.

## Una entrada por tema

La biblioteca y la paleta de comandos pasan de once entradas a seis:

| Entrada visible | Contenido reunido dentro del detalle |
|---|---|
| Planificación de vuelo abreviada | Planificación; condiciones de crucero y ejemplo |
| Performance de espera del Boeing 737 | Matriz de espera |
| Despegue del Boeing 737 | Performance; condiciones R-1 a R-5 |
| Reglaje altimétrico a altitud de presión | Una tabla QNH y una regla QFE |
| Ascenso en ruta del Boeing 737 | ISA; ISA +10 °C; condiciones V-1 a V-5 |
| Despegue del Boeing 727 | Performance; condiciones G-1 a G-5 |

Las dos imágenes de altimetría son duplicados de contenido: mismos 21 intervalos, ejemplo y marcas de escala. Se mantiene una única tabla registrada, con la equivalencia de procedencia en sus metadatos. ISA e ISA +10 °C tienen valores diferentes: se accede a ambas mediante el selector del único conjunto de ascenso. Las direcciones anteriores siguen funcionando y las calculadoras conservan sus datos.

## Fuentes investigadas

La publicación que coincide con las imágenes es **FAA-CT-8080-7C, 2005**, Computer Testing Supplement for Airline Transport Pilot and Aircraft Dispatcher. Se consultó el documento original de autoría FAA en una [copia archivada del PDF](https://aviationexplorer.com/FAA_Pilot_Training_Testing_Manuals/Computer%20Testing%20Supplement%20for%20Airline%20Transport%20Pilot%20and%20Aircraft%20Dispatcher%20%28FAA-CT-8080-7C%29.pdf), alojada por un tercero. Cada tabla enlaza su página específica.

Como contraste independiente se descargó el [FAA-CT-8080-7D de 2019 desde FAA](https://www.faa.gov/sites/faa.gov/files/training_testing/testing/supplements/atp_akts.pdf), edición que aparece en el [catálogo oficial de suplementos FAA](https://www.faa.gov/training_testing/testing/supplements). La numeración y algunos valores cambian; esa edición no reemplaza silenciosamente a la de 2005.

| Contenido | Página PDF 2005 | Página PDF 2019 para contraste |
|---|---:|---:|
| Condiciones B737 de despegue | 105 | 135 |
| Altimetría, dos láminas equivalentes | 106 / 123 | 131, con otra numeración |
| Performance B737 de despegue | 107 | 136 |
| Condiciones y ascenso ISA | 108 | 137 |
| Ascenso ISA +10 °C | 109 | 138 |
| Crucero y planificación abreviada | 113 | 142 |
| Espera B737 | 114 | 143 |
| Condiciones B727 de despegue | 122 | Sin equivalente en esta edición |
| Performance B727 de despegue | 124 | Sin equivalente en esta edición |

SHA-256 de las descargas usadas:

```text
2005: 5dda9d39172d3d778bb934cc1e8b7f4541cd1942f4e22bd54ca36368a35a9a4a
2019: e52e0cc655eb351aba6e665d2d4c8223203e87da68489bd6f9e22a76dfde7140
```

## Correcciones y límites de la comprobación

- **B727, última fila de EPR:** 3858 → **3856 ft**. El PDF de 2005 permite resolver la confusión entre 6 y 8.
- **B727, flaps 15, 140000 lb, cuarta banda OAT:** V2 de 138 → **136 kt**, comprobado en la misma página de mayor resolución.
- **Ascenso ISA +10:** MIM/LB → **MIN/LB**, contrastado con el suplemento FAA. La separación de `41/ 5900` en ISA se normaliza a `41/5900` sin cambiar el valor.
- **QNH:** tres columnas semánticas alinean rango en in.Hg, corrección en ft y rango en mb. Se elimina la rejilla de cinco columnas que imitaba la desalineación del papel.
- **B737, EPR:** temperatura y presión se presentan en dos tablas independientes. Las posiciones de las flechas del escaneo no expresan una relación numérica entre esos dos ejes.
- **Ayuda:** TAS se describe como tabulada; el efecto de aeropuertos elevados sobre tiempo/distancia se describe como despreciable según la fuente. Los términos con subíndices se muestran correctamente.

Resultados del contraste automático con el texto publicado en 2019, después de inspeccionar las páginas renderizadas:

| Comprobación | Resultado |
|---|---|
| Ascenso ISA, 198 celdas de peso/altitud | Sin diferencias |
| Ascenso ISA +10, 198 celdas | Sin diferencias |
| B737, 276 velocidades en 20 bandas de peso/flaps | Sin diferencias |
| Planificación abreviada, 25 filas completas | Sin diferencias |
| Espera, 264 valores EPR/IAS/FF | Una diferencia de edición documentada |

Los resultados están en [climb-audit.json](./validacion/climb-audit.json) y [remaining-audit.json](./validacion/remaining-audit.json). Las lecturas B727 se revisaron visualmente contra el PDF escaneado; no se presenta esa revisión como una extracción automática exhaustiva de todas sus celdas.

Se conservan y explican las siguientes limitaciones reales de la publicación:

- R-5: **+95 °F en 2005**, frente a +95 °C en 2019.
- Límite EPR 1.96: **−1000 ft en 2005**, frente a 1000 sin signo en 2019.
- Espera FL150 / 110000 lb: **2680 lb/h por motor en 2005**, frente a 2668 en 2019. Se mantiene 2680 y los resultados actuales de combustible.
- Ascenso ISA +10, 35000 ft / 85000 lb: **10/2800** aparece en ambas publicaciones. Se señala el tiempo anómalo sin inventar una corrección.
- Algunos rangos °F/°C del B737 no son equivalentes. El primer rango EPR del B727 imprime `67 TO -9` frente a `-55 TO -23` °C. Ambas inconsistencias permanecen visibles con una observación.
- El escaneo B737 no permite reconstruir las zonas sombreadas por velocidad mínima de control. La regla QFE se basa en las posiciones del escaneo y no constituye un conversor de precisión. Los intervalos QNH comparten extremos sin indicar prioridad.

Esta comprobación valida la transcripción y la atribución de material de ejercicios; no certifica performance operativa de una matrícula o variante de aeronave.

## Diseño y revisión visual

`FigureView` utiliza las mismas tarjetas, tablas y avisos que las calculadoras: Inter/DM Sans, pesos 400/500, colores de tokens y scroll contenido en cada tabla. Se eliminan Times, marcos de fotocopia, flechas superpuestas, columnas de impresión y el peso 700 añadido inicialmente. Las celdas combinadas y los espacios sin datos conservan su significado. Solo la primera columna lógica queda fija al desplazar; las celdas que siguen un rowspan no se superponen.

Se capturaron **48 combinaciones**: biblioteca y once detalles, a 1280 y 390 px, con tema claro y oscuro. Sin errores JavaScript, sin desbordamiento horizontal de página y sin pesos superiores a 500 dentro de los nuevos detalles. Se inspeccionaron las vistas de conjunto y las capturas relevantes. [Registro de dimensiones y errores](./validacion/report.json).

| Cambio | Antes | Después |
|---|---|---|
| Biblioteca: once tarjetas → seis conjuntos | [1280 claro](./capturas-revision/antes-tables-1280-light.png) | [1280 claro](./capturas-revision/tables-1280-light.png) |
| Biblioteca móvil | [390 oscuro](./capturas-revision/antes-tables-390-dark.png) | [390 oscuro](./capturas-revision/tables-390-dark.png) |
| B737: presentación y límites EPR separados | [1280 claro](./capturas-finales/performance-despegue-b737-1280-light.png) | [1280 claro](./capturas-revision/performance-despegue-b737-1280-light.png) |
| Altimetría: tarjetas y columnas alineadas | [1280 claro](./capturas-finales/reglaje-altimetrico-altitud-presion-1280-light.png) | [1280 claro](./capturas-revision/reglaje-altimetrico-altitud-presion-1280-light.png) |
| Ascenso: tema oscuro y selector de condiciones | [1280 oscuro](./capturas-finales/ascenso-ruta-280-070-isa-1280-dark.png) | [1280 oscuro](./capturas-revision/ascenso-ruta-280-070-isa-1280-dark.png) |

## Archivos principales

- `src/data/tables/index.ts:56`: agrupación única en la biblioteca y búsqueda.
- `src/pages/tables/TableDetail.tsx:67`: selector de variantes y referencias cruzadas sin repetir conjuntos.
- `src/components/tables/FigureView.tsx:59`: EPR separado; tarjetas nativas y encabezados semánticos.
- `src/styles/figure.css:1`: integración visual mediante tokens, scroll y columna fija.
- `src/components/tables/TableHelp.tsx:31`: términos con subíndices y ajuste del glosario.
- `src/data/tables/fig83-b727-takeoff-performance.ts:69`: 3856 ft; `:221`: V2 de 136 kt.
- `src/data/tables/sources.ts:1`: edición y vínculos de procedencia.
- `src/data/tables/source-review.test.ts:1`: regresiones de lecturas, ediciones y agrupación.

## Verificación y reproducción

`npm run build && npx vitest run`: **compilación correcta y 153 tests aprobados**. jsdom imprime avisos de `Window.scrollTo` no implementado durante navegación; la suite finaliza con código 0.

Los scripts de contraste requieren Node 24 y Python 3. Extraer con Poppler `pdftotext -layout` las páginas 136, 137, 138, 142 y 143 del PDF FAA 2019 a `page136.txt`, `page137.txt`, `page138.txt`, `related-142.txt` y `related-143.txt` dentro de un directorio local. Después, desde la raíz del repositorio:

```sh
node docs/digitalizacion/validacion/export-data.mjs /tmp/performance-tables.json
python3 docs/digitalizacion/validacion/check_climb.py /tmp/performance-tables.json /ruta/a/textos-pdf
python3 docs/digitalizacion/validacion/check_remaining.py /tmp/performance-tables.json /ruta/a/textos-pdf
```

Los scripts fallan si encuentran diferencias distintas de la revisión de espera documentada. No hacen llamadas a servicios de IA ni requieren credenciales.
