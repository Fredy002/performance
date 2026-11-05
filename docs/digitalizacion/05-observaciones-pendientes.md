> Registro de la digitalización inicial. La revisión de fuentes, las correcciones de datos y la integración visual posteriores se documentan en [06 — Auditoría de fuentes y diseño](./06-auditoria-fuentes-y-diseno.md), que prevalece sobre estas observaciones iniciales.

# 05 — Observaciones pendientes

Fragmentos que no pudieron verificarse con certeza total. Ninguno se completó por suposición: se reproduce lo que se lee en el original. Cada lámina guarda estas notas en el campo `uncertain` de su `.ts`, y la app las muestra en la ficha de la tabla.

## Dudas de la revisión independiente (QA)

| Lámina | Ubicación | Duda | Decisión |
|---|---|---|---|
| 54 | EXAMPLE, signo entre cada término y su valor | El original imprime una barra corta y gruesa «▬», que puede ser «=» o «-». | Se transcribe «=», coherente con 2500 + 400 = 2900. |
| 55 | Recuadro PRESS de 2.31 | Dígitos muy pequeños en «5660». | Se transcribe «ALT  5660 AND ABOVE». |
| 55 | Recuadro PRESS de 1.96 | La flecha tapa parte de la cifra. | Se transcribe «1.96». |
| 58 | 35000 / 85000 | «10/2800»: por la progresión de la columna se esperaría 18. | Se conserva tal como está impreso. |
| 58 | Cabecera UNITS | «MIM/LB» (probable errata de MIN). | Se conserva tal como está impreso. |
| 83 | MAX TAKEOFF EPR, 1.ª columna de OAT | «67 TO -9» no lleva signo; por la escala de °C, debería ser −67. | Se conserva tal como está impreso. |
| 83 | V1/VR/V2, últimas filas de cada banda | Las líneas horizontales atraviesan algunos números. | Se transcriben con la lectura ampliada. |

## Limitaciones de reproducción visual

- **FIGURE 54, regla QFE.** Las marcas menores están espaciadas uniformemente; en el original, el espaciado de la escala de pies no es lineal. Las etiquetas mayores sí van en su posición medida (±0,003).
- **FIGURE 55, recuadros de unión.** No se dibujan los recuadros que unen la tabla de OAT con la de velocidades. Tampoco se reproduce la diferencia de ancho del recuadro «STAB, TRIM SETTING».
- **FIGURE 55, borde exterior.** El borde exterior del bloque TAKEOFF EPR dibuja una línea bajo la fila PRESS que el original no tiene.
- **Posición de los recuadros PRESS.** Es aproximada: van en la columna de OAT donde termina el trazo de cada uno.
- **Tipografía.** Las láminas usan Inter, en 400 y en 700 para la negrita del original, y el pie usa una serif. Las fuentes originales (Helvetica de máquina y Century Schoolbook en el pie) no se reproducen exactamente.

## Notas registradas por los transcriptores (campo `uncertain`)

### FIGURE 53 — B-737 – Takeoff. (`condiciones-despegue-b737`)

Sin fragmentos dudosos.

### FIGURE 54 — Altimeter Setting to Pressure Altitude. (`reglaje-altimetrico-altitud-presion`)

1. Bloque EXAMPLE, signo entre cada término y su valor («ELEVATION = 2500 FT», «QNH = 29.48 IN.HG», «CORRECTION = 400 FT.», «PRESS ALT = 2900 FT»): en el escaneo se ve como una barra corta y gruesa («▬»), sin separación visible entre dos trazos. Se transcribe «=» porque la marca mide unos 6 × 4 px (más alta que un guion del mismo cuerpo de letra) y es coherente con el ejemplo (2500 + 400 = 2900); podría leerse «-». Lo mismo en ambas copias del gráfico.
2. Bloque EXAMPLE: tras «EXAMPLE:» el hueco es mayor que un espacio normal; se transcriben dos espacios.
3. Columna de corrección: «-100» … «-1000» y la etiqueta «-1» de la regla se transcriben con guion «-» (trazo corto en negrita, no raya).
4. Rótulo de unidades de la regla «MBS 1000  FT»: «1000» está centrado sobre la regla, pero pertenece a la escala derecha (miles de pies); se modela como unidad izquierda «MBS» y unidad derecha «1000 FT».
5. Regla: las posiciones (0 = extremo superior, 1 = extremo inferior) se midieron en píxeles sobre las marcas mayores. La regla tiene 73 divisiones de 5 mb a la izquierda (3 de ellas por encima de 700) y 115 divisiones no uniformes de 100 ft a la derecha (5 por encima de 10); el modelo solo admite marcas menores uniformes, por lo que se dibujan las 73 de la escala de milibares.
6. Tabla: en el original las líneas verticales de la cabecera no coinciden con las del cuerpo (la cabecera central es más ancha que la columna de corrección); se reproduce con una rejilla de 5 columnas y celdas combinadas.
7. Disposición escalonada de los rangos («28.81» arriba a la izquierda; «to» y «28.91» más abajo y a la derecha): se aproxima con dos líneas («28.81» / «to 28.91») alineadas a la izquierda.

### FIGURE 55 — B-737 – Takeoff Performance. (`performance-despegue-b737`)

1. Recuadro PRESS de 2.31: se lee «ALT  5660 AND ABOVE» (no «5000»); dígitos muy pequeños, los dos centrales parecen «66». Entre «ALT» y «5660» hay un hueco de unos 9 px frente a unos 4 px entre las demás palabras; se transcribe como espacio doble.
2. Recuadro PRESS de 1.96: el número aparece parcialmente tachado por el trazo de la flecha; se lee «1.96» con rótulo «-1000».
3. Posición de los recuadros PRESS: cada uno se ha colocado bajo la columna de OAT donde termina su trazo (-40, -4, 14, 32, 41, 77 y 86 °F); posición aproximada.
4. Rótulos «EPR» y «ALT» a la izquierda de los recuadros PRESS: parecen etiquetas de fila; «EPR» se modela como celda aparte y «ALT» dentro del recuadro de 2.31, tal como aparece en la misma línea que «5660 AND ABOVE».
5. Rótulo de la flecha TEMP: «TEMP» dentro de la flecha y «LIMIT EPR» debajo, parcialmente tapados por la flecha PRESS; se transcribe en tres líneas «TEMP», «LIMIT», «EPR».
6. Zonas sombreadas de la tabla V1, VR, V2: la nota las menciona, pero en el escaneo no se aprecia ningún sombreado (fondo blanco uniforme); no se marca ninguna celda como sombreada.
7. FLAPS 5, segunda columna, 100: se lee «136 138 142» (el primer número podría ser «138»).
8. FLAPS 15, segunda columna, 70: «101 103 112» (V1 menor que en la primera columna, «105 105 112»); legible, se conserva tal cual.
9. FLAPS 15, segunda columna, 100: «131 131  135» con espacio doble antes de «135» (hueco medido de 9 px frente a 5–6 px en el resto de celdas); se conserva. No se han detectado otros espacios dobles en las celdas de velocidades.
10. «V_{1}ADJUSTMENTS*»: el subíndice 1 queda prácticamente pegado a «ADJUSTMENTS» (hueco menor que un espacio entre palabras); se transcribe sin espacio.
11. FLAPS 15 y 25, filas de 70: los números tocan la línea inferior de la celda («103 106 112», «105 107 112», «99 102 108»); lectura razonablemente segura.
12. Recuadros de unión entre la tabla de OAT y las cabeceras V_{1} V_{R} V_{2}: ambas tablas se modelan como una sola rejilla de 9 columnas con una fila de unión vacía. Bajo las columnas de OAT de la última franja se suprime la línea inferior y sobre las cabeceras de velocidades la superior (en el original, trazos en V que bajan de cada recuadro). En la fila de unión se suprimen las verticales a la izquierda y se mantienen las de las columnas de OAT (aproximan las líneas que entran en los recuadros). Los recuadros en sí no se dibujan, y el borde exterior izquierdo de la tabla sigue visible en el hueco.
13. Bloque TAKEOFF EPR: bajo la fila PRESS el original no tiene línea (solo el marco general de la lámina, más abajo), pero el borde exterior de la tabla la dibuja; `open` no actúa sobre el borde de la tabla.
14. STAB, TRIM SETTING: el recuadro del título es más ancho que la tabla CG / FLAPS ALL, que cuelga debajo; se modela como cabecera de la misma tabla, con el mismo ancho.
15. Tabla de velocidades: el marco exterior no parece más grueso que las líneas interiores; se ha quitado `heavy`.
16. «BĻEED» en «EPR BLEED CORRECTIONS»: marca de impresión bajo la L; se transcribe «BLEED».

### FIGURE 56 — B-737 – En Route Climb. (`condiciones-ascenso-ruta-b737`)

Sin fragmentos dudosos.

### FIGURE 57 — En Route Climb 280/.70 ISA. (`ascenso-ruta-280-070-isa`)

1. Pie: «280/.70» muestra un ligero espaciado tipográfico tras el punto; se transcribe sin espacio, igual que el título de la tabla.

### FIGURE 58 — En Route Climb 280/.70 ISA +10 °C. (`ascenso-ruta-280-070-isa-mas-10`)

1. 35000 ft / 85000 lb: se lee claramente «10/2800» (ampliado x6); por la progresión de la columna cabría esperar 18, pero se transcribe tal cual.
2. 23000 ft / 110000 lb: «15/2900» (mismo combustible que 115000 lb); legible y se mantiene.
3. Título: el grado aparece pequeño, elevado y separado por un espacio de «+10»; se transcribe «+10 °C».
4. Cabecera «MIM/LB» (y no «MIN/LB»): se conserva tal cual.
5. Marca de corte entre 22000 y 6000: dos pares de líneas paralelas separados por una franja en blanco; modelado como corte + fila vacía + corte.
6. La tabla de ajuste por elevación no sigue la rejilla de pesos; se modela como tabla aparte con anchos aproximados.

### FIGURE 81 — B-727 – Takeoff. (`condiciones-despegue-b727`)

Sin fragmentos dudosos.

### FIGURE 83 — Takeoff Performance. (`performance-despegue-b727`)

1. MAX TAKEOFF EPR, cabecera de la primera columna de OAT: se lee «67 TO -9» sin signo menos visible delante de 67 (en °C sí aparece «-55 TO -23»); se transcribe tal cual sin añadir el signo.
2. MAX TAKEOFF EPR: la columna estrecha sin texto entre la altitud y «1 & 3 / 2» está vacía y sin líneas horizontales en el original; se modela como una sola celda vacía con rowspan 6.
3. MAX TAKEOFF EPR, valores con 6/8 (p. ej. 2.06, 2.16, 2.08, 1.96): a la resolución de la lámina el 6 y el 8 se parecen; se eligen las lecturas que se ven tras ampliar x4–x6 (2.06/2.16/1.96 en la fila de ENG 2 y 2.08 en la columna 86 °F).
4. Signos de grado: el original imprime un signo pequeño parecido a un apóstrofo («'F», «'C», «15'»); se transcribe como «°».
5. EPR BLEED CORRECTIONS: los guiones «-» de las celdas sin corrección y el signo de «-.03» son trazos cortos; se transcriben como guion «-».
6. Nota «REDUCE ENG 2 EPR…»: la última línea «(50 °F) OAT & WARMER» está parcialmente cortada por abajo en la imagen, pero es legible.
7. Tabla V1, VR, V2 (rangos de OAT): cada rango muestra los límites en °F arriba y en °C abajo con un único «TO» centrado entre ambas líneas; se modela con 3 subcolumnas (inferior, «TO» con rowspan 2, superior) y 2 subfilas (°F, °C), sin líneas entre ellas, como en el original.
8. Tabla V1, VR, V2: los números de la última fila de cada banda (pesos 190, 150 y 120) en la columna de la 2.ª OAT aparecen atravesados por la línea horizontal (p. ej. 157/167, 136/149, 120/134 con flaps 5; 148/158, 128/141, 113/127 con flaps 15; 143/153, 124/137, 109/123 con flaps 20; 138/149, 120/133, 106/120 con flaps 25); se eligen las lecturas más probables.
9. Tabla V1, VR, V2, flaps 15, peso 140: V2 de la 3.ª columna de OAT se lee «136» y la de la 4.ª «138» (posible confusión 6/8); se dejan así tras ampliar x8.
10. Tabla V1, VR, V2, flaps 20, peso 130, 4.ª columna de OAT: V1 = VR se lee «116» (posible 118).
11. Tabla V1, VR, V2, flaps 5, peso 210, 2.ª columna de OAT: V1 = VR se lee «166» (posible 168).
12. Nota final: «15'» se interpreta como «15°» y «V2» con el 2 en subíndice.
13. Estructura: en el original la etiqueta de altitud (p. ej. «9 TO 11») y las unidades «°F / °C» comparten casilla, igual que «PRESS ALT FT» y «OAT °F / °C» en MAX TAKEOFF EPR, y «(ABOVE CERTIFIED ALTITUDE)» con el rango «-65 TO 25»; aquí son celdas separadas con los lados comunes abiertos (`open`), por lo que no se dibuja línea entre ellas.
