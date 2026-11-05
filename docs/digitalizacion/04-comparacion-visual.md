> Registro de la digitalización inicial. La revisión de fuentes, las correcciones de datos y la integración visual posteriores se documentan en [06 — Auditoría de fuentes y diseño](./06-auditoria-fuentes-y-diseno.md), que prevalece sobre estas observaciones iniciales.

# 04 — Comparación visual

Las capturas son de la app real (`npm run dev`, ruta `#/tables/<id>`). Se hicieron a 1280 px en tema claro y oscuro, y a 390 px en tema claro. Están en [capturas-finales/](./capturas-finales/) y se compararon con los originales de [originales/](./originales/).

## Comprobaciones generales

- **Sin scroll horizontal de página** en ninguna lámina, a 1280 px ni a 390 px.
- **En móvil,** cada lámina conserva su disposición y se desplaza dentro de su propio marco (`.fig-sheet`). No se reorganiza el contenido, para no alterar la secuencia ni las relaciones entre elementos.
- **Modo oscuro:** texto, bordes y regla usan `var(--text)`, con contraste completo sobre el fondo de la tarjeta.
- **Pie:** se muestra el título original sin el prefijo «FIGURE nn.—», según la convención de la app (el número de figura se guarda en `source.figure` y no se muestra).

## Diferencias detectadas y corregidas

| Lámina | Diferencia frente al original | Corrección | Archivo |
|---|---|---|---|
| Todas | Con `tabular-nums`, Inter separaba «R-1» como «R - 1» y abría los números. | `font-variant-numeric: normal` en `.fig-table`. | `src/styles/figure.css` |
| Todas | Sin negritas: el sistema solo cargaba los pesos 400 y 500. | Se carga Inter 700 y se aplica solo dentro de las láminas, mediante `--weight-bold`. | `index.html`, `src/styles/tokens.css`, `src/styles/figure.css` |
| Todas | Pie en sans; el original lo imprime en serif. | `--font-document` (serif). | `src/styles/tokens.css`, `src/styles/figure.css` |
| Todas | Se perdían los espacios dobles del original. | NBSP desde el segundo espacio. | `src/components/tables/figText.tsx` |
| 55, 83 | Las láminas anchas se salían del área de contenido. | Scroll de la lámina completa dentro de `.fig-sheet`. El marco usa `width: max-content`. | `src/styles/figure.css` |
| 54 | La regla QFE salía comprimida arriba. | La regla se estira a la altura de la tabla (`align: 'stretch'`). | `src/data/tables/fig54-*.ts`, `FigureView.tsx`, `figure.css` |
| 54 | Los rangos «28.81 to 28.91» salían apilados; en el original van escalonados. | Celdas `stagger`. | `types.ts`, `FigureView.tsx`, `figure.css` |
| 55 | La columna −40 salía muy ancha por el rótulo «ALT  5660 AND ABOVE». | El rótulo se centra y desborda sin ensanchar la columna. | `src/styles/figure.css` (`.fig-pointer-rest`) |
| 83 | «TO» duplicado en los rangos de OAT. | Un solo «TO» centrado. | `fig83-*.ts` |
| 55, 83 | Líneas que el original no tiene. | Bordes `open` por lado. | `fig55-*.ts`, `fig83-*.ts` |

## Capturas

### FIGURE 53 (`condiciones-despegue-b737`)

| Original | 1280 claro | 1280 oscuro | 390 claro |
|---|---|---|---|
| ![original](./originales/img6-fig53-b737-takeoff.png) | ![](./capturas-finales/condiciones-despegue-b737-1280-light.png) | ![](./capturas-finales/condiciones-despegue-b737-1280-dark.png) | ![](./capturas-finales/condiciones-despegue-b737-390-light.png) |

### FIGURE 54 (`reglaje-altimetrico-altitud-presion`)

| Original | 1280 claro | 1280 oscuro | 390 claro |
|---|---|---|---|
| ![original](./originales/img7-fig54-altimeter-setting.png) | ![](./capturas-finales/reglaje-altimetrico-altitud-presion-1280-light.png) | ![](./capturas-finales/reglaje-altimetrico-altitud-presion-1280-dark.png) | ![](./capturas-finales/reglaje-altimetrico-altitud-presion-390-light.png) |

### FIGURE 55 (`performance-despegue-b737`)

| Original | 1280 claro | 1280 oscuro | 390 claro |
|---|---|---|---|
| ![original](./originales/img8-fig55-b737-takeoff-performance.png) | ![](./capturas-finales/performance-despegue-b737-1280-light.png) | ![](./capturas-finales/performance-despegue-b737-1280-dark.png) | ![](./capturas-finales/performance-despegue-b737-390-light.png) |

### FIGURE 56 (`condiciones-ascenso-ruta-b737`)

| Original | 1280 claro | 1280 oscuro | 390 claro |
|---|---|---|---|
| ![original](./originales/img4-fig56-57-en-route-climb.png) | ![](./capturas-finales/condiciones-ascenso-ruta-b737-1280-light.png) | ![](./capturas-finales/condiciones-ascenso-ruta-b737-1280-dark.png) | ![](./capturas-finales/condiciones-ascenso-ruta-b737-390-light.png) |

### FIGURE 57 (`ascenso-ruta-280-070-isa`)

| Original | 1280 claro | 1280 oscuro | 390 claro |
|---|---|---|---|
| ![original](./originales/img4-fig56-57-en-route-climb.png) | ![](./capturas-finales/ascenso-ruta-280-070-isa-1280-light.png) | ![](./capturas-finales/ascenso-ruta-280-070-isa-1280-dark.png) | ![](./capturas-finales/ascenso-ruta-280-070-isa-390-light.png) |

### FIGURE 58 (`ascenso-ruta-280-070-isa-mas-10`)

| Original | 1280 claro | 1280 oscuro | 390 claro |
|---|---|---|---|
| ![original](./originales/img5-fig58-en-route-climb-isa10.png) | ![](./capturas-finales/ascenso-ruta-280-070-isa-mas-10-1280-light.png) | ![](./capturas-finales/ascenso-ruta-280-070-isa-mas-10-1280-dark.png) | ![](./capturas-finales/ascenso-ruta-280-070-isa-mas-10-390-light.png) |

### FIGURE 81 (`condiciones-despegue-b727`)

| Original | 1280 claro | 1280 oscuro | 390 claro |
|---|---|---|---|
| ![original](./originales/img1-fig81-b727-takeoff.png) | ![](./capturas-finales/condiciones-despegue-b727-1280-light.png) | ![](./capturas-finales/condiciones-despegue-b727-1280-dark.png) | ![](./capturas-finales/condiciones-despegue-b727-390-light.png) |

### FIGURE 83 (`performance-despegue-b727`)

| Original | 1280 claro | 1280 oscuro | 390 claro |
|---|---|---|---|
| ![original](./originales/img3-fig83-takeoff-performance.png) | ![](./capturas-finales/performance-despegue-b727-1280-light.png) | ![](./capturas-finales/performance-despegue-b727-1280-dark.png) | ![](./capturas-finales/performance-despegue-b727-390-light.png) |

La captura a 390 px muestra la parte visible de la lámina en el marco desplazable.
