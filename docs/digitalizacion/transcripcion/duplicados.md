# Gráficos duplicados

## FIGURE 54 / FIGURE 82 — Altimeter Setting to Pressure Altitude

- A: `docs/digitalizacion/originales/img7-fig54-altimeter-setting.png` (768 × 1177 px), pie «FIGURE 54.—Altimeter Setting to Pressure Altitude.»
- B: `docs/digitalizacion/originales/img2-fig82-altimeter-setting.png` (768 × 1272 px), pie «FIGURE 82.—Altimeter Setting to Pressure Altitude.»

### Qué se comparó

Ambas láminas se recortaron al marco, se normalizaron a la misma altura y se compararon lado a lado en 5 franjas,
con ampliaciones ×3–×4 (LANCZOS) de las zonas dudosas y mediciones de píxeles:

1. Recuadro «ALTIMETER SETTING / TO / STATION PRESSURE»: mismo texto, mismos saltos de línea, mismo recuadro.
2. Rótulos de la regla «QFE / STATION / PRESSURE» y «MBS 1000  FT»: idénticos.
3. Regla vertical: etiquetas MBS 700, 750, 800, 850, 900, 950, 1000, 1050 y 1000 FT 10 … 0, -1; misma disposición relativa
   a la tabla (700 a la altura de la cabecera, 1050/-1 a la altura de la primera línea del EXAMPLE), mismo patrón de marcas
   menores (cada 5 mb a la izquierda; cada 100 ft a la derecha, no lineal).
4. Título «QNH TO PRESSURE ALTITUDE» y cabecera de 3 columnas («QNH / IN. HG.», «CORRECTION / TO / ELEVATION / FOR / PRESS. ALT / FT»,
   «QNH / MILLIBARS»), incluida la peculiaridad de que las líneas verticales de la cabecera no coinciden con las del cuerpo.
5. Las 21 filas, celda a celda (63 celdas, 105 valores + «to»): 28.81 to 28.91 | 1000 | 976 to 979 … 30.96 to 31.07 | -1000 | 1048 to 1052.
   Todos los valores, negritas (solo la columna de corrección) y la disposición escalonada coinciden.
6. Bloque EXAMPLE de 4 líneas centradas: mismo texto, misma puntuación («IN.HG» sin espacio, «FT.» con punto solo en CORRECTION)
   y el mismo signo dudoso «=» (barra corta y gruesa en ambas).

### Diferencias encontradas (solo de escaneo / maquetación)

- Pie: «FIGURE 54.—» frente a «FIGURE 82.—»; el resto del pie es idéntico.
- Tamaño y escala de la imagen: el marco mide 598 × 1090 px en A y 635 × 1160 px en B (B ≈ 6 % mayor); proporción casi igual
  (0,549 frente a 0,547), con un ligero estiramiento vertical de B (< 0,5 %).
- Márgenes distintos alrededor del marco (A: marco desde x = 81, y = 39; B: desde x = 72, y = 56).
- B tiene una columna gris tenue en el borde derecho de la imagen (x = 767), fuera del marco; A no.
- Diferencias menores de nitidez/grosor de trazo propias del escaneo; ninguna altera la lectura de un carácter.

No se halló ninguna diferencia tipográfica de contenido (cifras, letras, puntuación, espacios, guiones).

### Conclusión

Contenido idéntico salvo el número del pie. Se implementa una sola vez como FIGURE 54
(`src/data/tables/fig54-altimeter-setting-pressure-altitude.ts`, id `reglaje-altimetrico-altitud-presion`);
la FIGURE 82 se descarta como duplicado.
