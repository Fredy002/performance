# FIGURE 54 — Altimeter Setting to Pressure Altitude

Original: `docs/digitalizacion/originales/img7-fig54-altimeter-setting.png`
Implementación: `src/data/tables/fig54-altimeter-setting-pressure-altitude.ts` (`FIG54_ALTIMETER_SETTING_PRESSURE_ALTITUDE`).

> **Duplicado:** la FIGURE 82 (`docs/digitalizacion/originales/img2-fig82-altimeter-setting.png`), con pie literal
> «FIGURE 82.—Altimeter Setting to Pressure Altitude.», tiene el mismo contenido que esta lámina (salvo el número del pie)
> y no se implementa por separado. Comparación detallada en [duplicados.md](duplicados.md).

## Recuadro superior

<table><tr><td align="center"><b>ALTIMETER SETTING<br>TO<br>STATION PRESSURE</b></td></tr></table>

## Regla vertical (a la izquierda de la tabla)

**QFE**
**STATION**
**PRESSURE**

**MBS 1000  FT**

Regla vertical con dos escalas. Posición = fracción de la longitud de la regla (0 = extremo superior, 1 = extremo inferior), medida en píxeles.

| MBS (izquierda) | posición | 1000 FT (derecha) | posición |
|---|---|---|---|
| 700 | 0.045 | 10 | 0.037 |
| 750 | 0.181 | 9 | 0.112 |
| 800 | 0.318 | 8 | 0.188 |
| 850 | 0.453 | 7 | 0.267 |
| 900 | 0.589 | 6 | 0.350 |
| 950 | 0.724 | 5 | 0.435 |
| 1000 | 0.861 | 4 | 0.522 |
| 1050 | 0.997 | 3 | 0.612 |
| | | 2 | 0.704 |
| | | 1 | 0.799 |
| | | 0 | 0.897 |
| | | -1 | 0.999 |

Marcas menores: izquierda, cada 5 mb (10 divisiones entre etiquetas de 50 mb; marcas de 10 mb algo más largas), 73 divisiones
en total, 3 de ellas por encima de 700; derecha, cada 100 ft (10 divisiones entre etiquetas; marca de 500 ft algo más larga),
115 divisiones no uniformes en total, 5 de ellas por encima de 10.

## Tabla (a la derecha de la regla)

**QNH TO PRESSURE ALTITUDE**

Las líneas verticales de la cabecera no coinciden con las del cuerpo: rejilla de 5 columnas.
En el cuerpo, cada rango está escalonado: valor inicial arriba a la izquierda; «to» y valor final más abajo, a la derecha.

<table>
  <thead>
    <tr><th>QNH<br>IN. HG.</th><th colspan="3">CORRECTION<br>TO<br>ELEVATION<br>FOR<br>PRESS. ALT<br>FT</th><th>QNH<br>MILLIBARS</th></tr>
  </thead>
  <tbody>
    <tr><td colspan="2">28.81<br>to 28.91</td><td><b>1000</b></td><td colspan="2">976<br>to 979</td></tr>
    <tr><td colspan="2">28.91<br>to 29.02</td><td><b>900</b></td><td colspan="2">979<br>to 983</td></tr>
    <tr><td colspan="2">29.02<br>to 29.12</td><td><b>800</b></td><td colspan="2">983<br>to 986</td></tr>
    <tr><td colspan="2">29.12<br>to 29.23</td><td><b>700</b></td><td colspan="2">986<br>to 990</td></tr>
    <tr><td colspan="2">29.23<br>to 29.34</td><td><b>600</b></td><td colspan="2">990<br>to 994</td></tr>
    <tr><td colspan="2">29.34<br>to 29.44</td><td><b>500</b></td><td colspan="2">994<br>to 997</td></tr>
    <tr><td colspan="2">29.44<br>to 29.55</td><td><b>400</b></td><td colspan="2">997<br>to 1001</td></tr>
    <tr><td colspan="2">29.55<br>to 29.66</td><td><b>300</b></td><td colspan="2">1001<br>to 1004</td></tr>
    <tr><td colspan="2">29.66<br>to 29.76</td><td><b>200</b></td><td colspan="2">1004<br>to 1008</td></tr>
    <tr><td colspan="2">29.76<br>to 29.87</td><td><b>100</b></td><td colspan="2">1008<br>to 1012</td></tr>
    <tr><td colspan="2">29.87<br>to 29.97</td><td><b>0</b></td><td colspan="2">1012<br>to 1015</td></tr>
    <tr><td colspan="2">29.97<br>to 30.08</td><td><b>-100</b></td><td colspan="2">1015<br>to 1019</td></tr>
    <tr><td colspan="2">30.08<br>to 30.19</td><td><b>-200</b></td><td colspan="2">1019<br>to 1022</td></tr>
    <tr><td colspan="2">30.19<br>to 30.30</td><td><b>-300</b></td><td colspan="2">1022<br>to 1026</td></tr>
    <tr><td colspan="2">30.30<br>to 30.41</td><td><b>-400</b></td><td colspan="2">1026<br>to 1030</td></tr>
    <tr><td colspan="2">30.41<br>to 30.52</td><td><b>-500</b></td><td colspan="2">1030<br>to 1034</td></tr>
    <tr><td colspan="2">30.52<br>to 30.63</td><td><b>-600</b></td><td colspan="2">1034<br>to 1037</td></tr>
    <tr><td colspan="2">30.63<br>to 30.74</td><td><b>-700</b></td><td colspan="2">1037<br>to 1041</td></tr>
    <tr><td colspan="2">30.74<br>to 30.85</td><td><b>-800</b></td><td colspan="2">1041<br>to 1045</td></tr>
    <tr><td colspan="2">30.85<br>to 30.96</td><td><b>-900</b></td><td colspan="2">1045<br>to 1048</td></tr>
    <tr><td colspan="2">30.96<br>to 31.07</td><td><b>-1000</b></td><td colspan="2">1048<br>to 1052</td></tr>
  </tbody>
</table>

<p align="center">EXAMPLE:  ELEVATION = 2500 FT<br>QNH = 29.48 IN.HG<br>CORRECTION = 400 FT.<br>PRESS ALT = 2900 FT</p>

FIGURE 54.—Altimeter Setting to Pressure Altitude.

## Incertidumbres

- **Signo «=» del bloque EXAMPLE** (4 apariciones): en el escaneo se ve como una barra corta y gruesa, sin dos trazos separados
  (ampliado ×4 y examinado píxel a píxel: ~6 × 4 px). Se transcribe «=»: es más alta que un guion del mismo cuerpo y es coherente
  con el ejemplo (2500 + 400 = 2900). Lectura alternativa: «-». Idéntico en la FIGURE 82.
- **«EXAMPLE:  ELEVATION»**: el hueco tras los dos puntos es mayor que un espacio; se transcriben dos espacios.
- **«-100» … «-1000» y «-1»**: guion corto «-» (no raya).
- **«MBS 1000  FT»**: «1000» va centrado sobre la regla, pero corresponde a la escala derecha (miles de pies); en el modelo:
  unidad izquierda «MBS», derecha «1000 FT».
- **Marcas menores**: el modelo solo admite divisiones uniformes; se usan las 73 de la escala de milibares (la escala de pies
  no es lineal).
- **Escalonado de rangos**: en la app se aproxima con dos líneas alineadas a la izquierda («28.81» / «to 28.91»).
