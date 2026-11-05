> Registro de la digitalización inicial. La revisión de fuentes, las correcciones de datos y la integración visual posteriores se documentan en [06 — Auditoría de fuentes y diseño](./06-auditoria-fuentes-y-diseno.md), que prevalece sobre estas observaciones iniciales.

# 01 — Inventario de imágenes

Fuente: FAA — Computer Testing Supplement (ATP / Aircraft Dispatcher), Appendix 2.
Se recibieron 8 imágenes, que contienen 9 figuras. Las copias originales están en [`originales/`](./originales/).

| # | Archivo | Tamaño (px) | Figura(s) | Pie literal | Estado |
|---|---------|-------------|-----------|-------------|--------|
| 1 | `img1-fig81-b727-takeoff.png` | 1206 × 606 | FIGURE 81 | FIGURE 81.—B-727 – Takeoff. | Implementada |
| 2 | `img2-fig82-altimeter-setting.png` | 768 × 1272 | FIGURE 82 | FIGURE 82.—Altimeter Setting to Pressure Altitude. | **Duplicado** de la FIGURE 54: descartada (ver [`transcripcion/duplicados.md`](./transcripcion/duplicados.md)) |
| 3 | `img3-fig83-takeoff-performance.png` | 768 × 1109 | FIGURE 83 | FIGURE 83.—Takeoff Performance. | Implementada |
| 4 | `img4-fig56-57-en-route-climb.png` | 768 × 958 | FIGURE 56 (arriba) y FIGURE 57 (abajo) | FIGURE 56.—B-737 – En Route Climb. / FIGURE 57.—En Route Climb 280/.70 ISA. | Implementadas por separado |
| 5 | `img5-fig58-en-route-climb-isa10.png` | 833 × 768 | FIGURE 58 | FIGURE 58.—En Route Climb 280/.70 ISA +10 °C. | Implementada |
| 6 | `img6-fig53-b737-takeoff.png` | 1206 × 699 | FIGURE 53 | FIGURE 53.—B-737 – Takeoff. | Implementada |
| 7 | `img7-fig54-altimeter-setting.png` | 768 × 1177 | FIGURE 54 | FIGURE 54.—Altimeter Setting to Pressure Altitude. | Implementada (también cubre la FIGURE 82) |
| 8 | `img8-fig55-b737-takeoff-performance.png` | 768 × 937 | FIGURE 55 | FIGURE 55.—B-737 – Takeoff Performance. | Implementada |

## Orden lógico

Se sigue la numeración del suplemento, agrupada por aeronave y fase:

1. Boeing 737, despegue: 53 (condiciones R-1…R-5) → 54 (reglaje altimétrico) → 55 (performance de despegue).
2. Boeing 737, ascenso en ruta: 56 (condiciones V-1…V-5) → 57 (ISA) → 58 (ISA +10 °C).
3. Boeing 727, despegue: 81 (condiciones G-1…G-5) → 82 (= 54) → 83 (performance de despegue).

## Bloques de contenido por figura

| Figura | Bloques |
|--------|---------|
| 53 | Tabla de condiciones R-1…R-5 (10 filas) con fila final combinada «LEMAC STA 625.0, MAC 134.0». |
| 54 / 82 | Recuadro «ALTIMETER SETTING TO STATION PRESSURE»; regla QFE STATION PRESSURE (MBS / 1000 FT); tabla «QNH TO PRESSURE ALTITUDE» (21 filas); bloque EXAMPLE. |
| 55 | TAKEOFF EPR (OAT, TEMP LIMIT EPR, PRESS, correcciones de sangrado, pasos ①②③); V₁, V_R, V₂ ANTI-SKID ON (rangos de OAT y velocidades por flaps/peso, zonas sombreadas); FLAP RETRACTION/MANEUVERING SPEED; STAB, TRIM SETTING; V₁ ADJUSTMENTS; notas. |
| 56 | Tabla de condiciones V-1…V-5 (5 filas). |
| 57 | Tabla EN ROUTE CLIMB 280/.70 ISA (altitud × peso de suelta de frenos, TIME/FUEL y DIST./TAS), corte de filas y ajuste por aeropuertos elevados. |
| 58 | Igual que la 57, para ISA +10 °C. |
| 81 | Tabla de condiciones G-1…G-5 (9 filas) con fila final combinada «LEMAC – STA 860.5, MAC 180.9"». |
| 83 | MAX TAKEOFF EPR con correcciones; V₁, V_R, V₂ ANTI-SKID OPERATIVE; STAB TRIM SETTING; FLAP RETRACTION/ MANEUVERING SPEEDS; notas. |

## Convención de la aplicación sobre los números de figura

Se mantiene la convención existente, protegida por pruebas en `src/app.test.tsx` y `src/data/tables/tables.test.ts`: la interfaz no muestra números de figura. El número queda en `source.figure` y el pie se muestra sin el prefijo «FIGURE nn.—». En este documento y en [`02-transcripcion-literal.md`](./02-transcripcion-literal.md) se conservan los pies literales completos.
