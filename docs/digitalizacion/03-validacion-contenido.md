> Registro de la digitalización inicial. La revisión de fuentes, las correcciones de datos y la integración visual posteriores se documentan en [06 — Auditoría de fuentes y diseño](./06-auditoria-fuentes-y-diseno.md), que prevalece sobre estas observaciones iniciales.

# 03 — Validación de contenido

Se verificó en cuatro niveles. En todos, las imágenes de [originales/](./originales/) fueron la única fuente de verdad.

## Nivel 1 — Verificación textual

Cada agente de transcripción (uno por lámina o grupo) comparó palabra por palabra el original, la transcripción (`transcripcion/figNN.md`) y los datos implementados (`src/data/tables/figNN-*.ts`). Además, los agentes de QA del nivel 4 repitieron la comparación celda a celda, con las zonas ampliadas entre x2 y x6.

Correcciones aplicadas durante la validación:

| Lámina | Diferencia detectada | Corrección |
|---|---|---|
| 83 | En los rangos de OAT, «TO» aparecía repetido en las líneas °F y °C. El original imprime un solo «TO» centrado. | Subceldas `inferior │ TO │ superior` con `TO` de `rowspan 2`. |
| 55 | Se había reducido el espacio doble de «131 131  135». | Se conserva el espacio doble. También se detectó y conservó «ALT  5660 AND ABOVE». |
| 55 | «V_{1} ADJUSTMENTS*» llevaba un espacio que el original no tiene. | `V_{1}ADJUSTMENTS*`. |
| Todas | HTML colapsa los espacios dobles al renderizar, aunque estén en los datos. | `FigText` convierte el segundo espacio y los siguientes en NBSP (`src/components/tables/figText.tsx`). |

Sumas de control registradas por los transcriptores: tiempo total de la columna TIME en la FIGURE 57, 2705 min, y en la FIGURE 58, 3109 min. Los agentes de QA las recalcularon sobre el `.ts` y coinciden.

## Nivel 2 — Verificación estructural

Se comprobaron el número de filas y columnas, las celdas combinadas (`cs`/`rs`), el orden de los bloques, los encabezados, las listas numeradas (①②③), las notas, los títulos y los pies. Correcciones estructurales aplicadas:

- **Líneas inexistentes en el original.** La propiedad `open` suprime bordes por lado. Se usa en la FIGURE 83, en los rangos de OAT, y en la FIGURE 55, en el hueco de unión y en la cabecera V_{1} V_{R} V_{2}.
- **FIGURE 54, regla QFE.** Ocupa toda la altura de la tabla (`align: 'stretch'`).
- **FIGURE 54, rangos.** Se reproducen escalonados, como en el original: inicio arriba a la izquierda, «to» y fin abajo (celdas `stagger`).
- **FIGURE 54, cabecera desalineada.** Las verticales de la cabecera no coinciden con las del cuerpo, también en el original. Se reproduce así a propósito.
- **FIGURE 55, ancho de columnas.** El rótulo «ALT  5660 AND ABOVE» ya no ensancha la columna −40: las 20 columnas de OAT quedan uniformes, como en el original.

## Nivel 4 — Revisión independiente (QA)

Cada agente de QA trabajó sin usar las transcripciones ni las notas de los transcriptores: contrastó directamente cada original ampliado con el `.ts` implementado.

| Lámina | Celdas verificadas | Diferencias seguras | Dudas (sin cambios) | Conclusión |
|---|---|---|---|---|
| 53 — B-737 Takeoff | 61 + pie | 0 | — | Coincidencia verificada |
| 54 — Altimeter Setting to Pressure Altitude | 85 + 4 títulos + ejemplo + pie + 20 marcas de la regla | 0 | Signo del EXAMPLE («▬»): se transcribe «=» | Coincidencia verificada, con 1 duda |
| 55 — B-737 Takeoff Performance | ~230 | 0 | «5660» y «1.96» parcialmente tapados | Coincidencia verificada |
| 56 — B-737 En Route Climb | 36 + pie | 0 | — | Coincidencia verificada |
| 57 — En Route Climb 280/.70 ISA | 265 | 0 | — | Coincidencia verificada |
| 58 — En Route Climb 280/.70 ISA +10 °C | ~266 | 0 | «10/2800», «15/2900» y «MIM/LB» se conservan tal como están impresos | Coincidencia verificada |
| 81 — B-727 Takeoff | 61 + pie | 0 | — | Coincidencia verificada |
| 83 — Takeoff Performance (B-727) | ~470 | 0 | «67 TO -9» sin signo; números de V1/VR/V2 atravesados por líneas | Coincidencia verificada, con 2 dudas |
| 82 (duplicado de 54) | Títulos, cabecera, 21 filas, ejemplo y regla | — | — | Idéntica a la 54 salvo el número del pie: se descarta |

Las dudas se detallan en [05-observaciones-pendientes.md](./05-observaciones-pendientes.md).

## Pruebas automáticas

- `npx tsc -b`: sin errores.
- `npx vitest run src/data src/components src/app.test.tsx`: 71/71.
- `npm run build`: correcto. `npx vitest run`: 127 pasan. Los tests de `src/services/claudeServer.test.ts` fallan solo dentro del sandbox (`listen EPERM`) y no tienen relación con este trabajo.
