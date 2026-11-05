> Registro de la digitalización inicial. La revisión de fuentes, las correcciones de datos y la integración visual posteriores se documentan en [06 — Auditoría de fuentes y diseño](./06-auditoria-fuentes-y-diseno.md), que prevalece sobre estas observaciones iniciales.

# 02 — Transcripción literal

Consolidado de las transcripciones literales en [transcripcion/](./transcripcion/). Cada sección reproduce el contenido de una lámina, con su texto, cifras y signos tal como aparecen impresos. La FIGURE 82 se descartó por ser un duplicado de la FIGURE 54; el motivo está en [duplicados.md](./transcripcion/duplicados.md).

Convenciones: `_{x}` es subíndice, `^{x}` es superíndice y `&nbsp;` marca un espacio doble del original.

---

## FIGURE 53 — B-737 – Takeoff.

Tabla con marco exterior grueso. Primera columna alineada a la izquierda; valores alineados a la derecha. Fila de cabecera en negrita.

<table>
  <thead>
    <tr><th align="left">OPERATING CONDITIONS</th><th align="right">R-1</th><th align="right">R-2</th><th align="right">R-3</th><th align="right">R-4</th><th align="right">R-5</th></tr>
  </thead>
  <tbody>
    <tr><td align="left">FIELD ELEVATION</td><td align="right">100</td><td align="right">4,000</td><td align="right">950</td><td align="right">2,000</td><td align="right">50</td></tr>
    <tr><td align="left">ALTIMETER SETTING</td><td align="right">29.50"</td><td align="right">1032 mb</td><td align="right">29.40"</td><td align="right">1017 mb</td><td align="right">30.15"</td></tr>
    <tr><td align="left">TEMPERATURE (OAT)</td><td align="right">+50 °F</td><td align="right">–15 °C</td><td align="right">+59 °F</td><td align="right">0 °C</td><td align="right">+95 °F</td></tr>
    <tr><td align="left">WEIGHT (X1000)</td><td align="right">90</td><td align="right">110</td><td align="right">100</td><td align="right">85</td><td align="right">95</td></tr>
    <tr><td align="left">FLAP POSITION</td><td align="right">15°</td><td align="right">5°</td><td align="right">5°</td><td align="right">1°</td><td align="right">1°</td></tr>
    <tr><td align="left">WIND COMPONENT (KTS)</td><td align="right">5 HW</td><td align="right">5 TW</td><td align="right">20 HW</td><td align="right">10 TW</td><td align="right">7 HW</td></tr>
    <tr><td align="left">RUNWAY SLOPE %</td><td align="right">1% UP</td><td align="right">1% DN</td><td align="right">1% UP</td><td align="right">2% DN</td><td align="right">1.5% UP</td></tr>
    <tr><td align="left">AIR CONDITIONING</td><td align="right">ON</td><td align="right">ON</td><td align="right">OFF</td><td align="right">ON</td><td align="right">OFF</td></tr>
    <tr><td align="left">ENGINE ANTI-ICE</td><td align="right">OFF</td><td align="right">ON</td><td align="right">OFF</td><td align="right">ON</td><td align="right">OFF</td></tr>
    <tr><td align="left">CG STATION</td><td align="right">635.7</td><td align="right">643.8</td><td align="right">665.2</td><td align="right">657.2</td><td align="right">638.4</td></tr>
    <tr><td colspan="6" align="center">LEMAC STA 625.0, MAC 134.0</td></tr>
  </tbody>
</table>

FIGURE 53.—B-737 – Takeoff.

### Incertidumbres

Ninguna. Todas las celdas se verificaron visualmente con ampliación x2–x3 (signo «–» de «–15 °C» es raya/en dash; comillas de pulgadas rectas).

---

## FIGURE 54 — Altimeter Setting to Pressure Altitude

Original: `docs/digitalizacion/originales/img7-fig54-altimeter-setting.png`
Implementación: `src/data/tables/fig54-altimeter-setting-pressure-altitude.ts` (`FIG54_ALTIMETER_SETTING_PRESSURE_ALTITUDE`).

> **Duplicado:** la FIGURE 82 (`docs/digitalizacion/originales/img2-fig82-altimeter-setting.png`), con pie literal
> «FIGURE 82.—Altimeter Setting to Pressure Altitude.», tiene el mismo contenido que esta lámina (salvo el número del pie)
> y no se implementa por separado. Comparación detallada en [duplicados.md](transcripcion/duplicados.md).

### Recuadro superior

<table><tr><td align="center"><b>ALTIMETER SETTING<br>TO<br>STATION PRESSURE</b></td></tr></table>

### Regla vertical (a la izquierda de la tabla)

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

### Tabla (a la derecha de la regla)

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

### Incertidumbres

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

---

## FIGURE 55 — B-737 – Takeoff Performance

Original: `docs/digitalizacion/originales/img8-fig55-b737-takeoff-performance.png`

### Bloque superior — TAKEOFF EPR

0 TO 60 KTS

**TAKEOFF EPR**   A/C ON

<table>
  <tr><td>EPR BLEED CORRECTIONS</td><td><b>Δ</b> EPR</td></tr>
  <tr><td>AIR CONDITIONING OFF</td><td>+.03</td></tr>
  <tr><td align="center">ENGINE ANTI-ICE</td><td>ZERO</td></tr>
</table>

<table>
  <tr><td rowspan="2"><b>OAT</b></td><td>°F</td><td>-65</td><td>-49</td><td>-40</td><td>-31</td><td>-22</td><td>-13</td><td>-4</td><td>5</td><td>14</td><td>23</td><td>32</td><td>41</td><td>50</td><td>59</td><td>68</td><td>77</td><td>86</td><td>95</td><td>104</td><td>120</td></tr>
  <tr><td>°C</td><td>-54</td><td>-45</td><td>-40</td><td>-35</td><td>-30</td><td>-25</td><td>-20</td><td>-15</td><td>-10</td><td>-5</td><td>0</td><td>5</td><td>10</td><td>15</td><td>20</td><td>25</td><td>30</td><td>35</td><td>40</td><td>49</td></tr>
  <tr><td colspan="2">⇒ TEMP<br>LIMIT<br>EPR</td><td>2.31</td><td>2.31</td><td>2.31</td><td>2.29</td><td>2.27</td><td>2.24</td><td>2.22</td><td>2.19</td><td>2.17</td><td>2.14</td><td>2.11</td><td>2.07</td><td>2.04</td><td>2.01</td><td>2.01</td><td>2.01</td><td>2.00</td><td>1.95</td><td>1.91</td><td>1.82</td></tr>
  <tr><td colspan="2">⇒ PRESS</td><td></td><td>EPR</td><td>[2.31]<br>ALT&nbsp; 5660 AND ABOVE</td><td></td><td></td><td></td><td>[2.22]<br>4000</td><td></td><td>[2.16]<br>3000</td><td></td><td>[2.11]<br>2000</td><td>[2.06]<br>1000</td><td></td><td></td><td></td><td>[2.01]<br>S.L.</td><td>[1.96]<br>-1000</td><td></td><td></td><td></td></tr>
</table>

Nota de formato: «TEMP» y «PRESS» van dentro de flechas gruesas hacia la derecha; «LIMIT EPR» aparece bajo la flecha TEMP. Los valores entre corchetes son recuadros con flecha que salen de la parte inferior de la fila TEMP LIMIT EPR (bajo las columnas -40, -4, 14, 32, 41, 77 y 86 °F); el texto bajo cada recuadro es la altitud. «EPR» y «ALT» están alineados a la izquierda, como rótulos de fila.

① FIND TEMP LIMIT EPR
② FIND PRESS LIMIT EPR
③ USE THE SMALLER OF THE TWO LIMITS

### Bloque inferior izquierdo

<table>
  <tr><td><b>V<sub>1</sub> , V<sub>R</sub>, V<sub>2</sub></b></td></tr>
  <tr><td><b>ANTI-SKID ON</b></td></tr>
</table>

**FLAP<br>RETRACTION/<br>MANEUVERING<br>SPEED**

<table>
  <tr><th>FLAP<br>POS</th><th>KTS IAS</th></tr>
  <tr><td>0<br>1<br>2<br>5<br>10<br>15<br>25</td><td>210<br>190<br>180<br>170<br>160<br>150<br>140</td></tr>
</table>

<table>
  <tr><td>FOR MANEUVERS IMMEDIATELY<br>AFTER TAKE-OFF EXCEEDING 15°<br>BANK, MAINTAIN AT LEAST<br>V2 + 15 AT TAKEOFF FLAPS</td></tr>
</table>

<table>
  <tr><th colspan="2">STAB, TRIM SETTING<br>-UNITS AIRPLANE NOSE UP</th></tr>
  <tr><th>CG</th><th>FLAPS<br>ALL</th></tr>
  <tr><td>6<br>8<br>10<br>12<br>14<br>16<br>18<br>20<br>22<br>24<br>26<br>28<br>30<br>32</td><td>8<br>7-3/4<br>7-1/2<br>7<br>6-3/4<br>6-1/4<br>5-3/4<br>5-1/2<br>5<br>4-1/2<br>4<br>3-1/2<br>3<br>2-1/2</td></tr>
</table>

### Bloque inferior derecho — V<sub>1</sub>, V<sub>R</sub>, V<sub>2</sub>

<table>
  <tr><th>PRESSURE<br>ALTITUDE<br>1000 FT</th><th colspan="7">OAT</th></tr>
  <tr><td>9 to 10</td><td>⇒ F°<br>C°</td><td></td><td></td><td>-65 to -19<br>-54 to -28</td><td>-18 to 18<br>-27 to -8</td><td>19 to 45<br>-7 to 7</td><td>46 to 86<br>8 to 30</td></tr>
  <tr><td>7 to 9</td><td>⇒ F°<br>C°</td><td></td><td>-65 to -21<br>-54 to -29</td><td>-20 to 10<br>-28 to -23</td><td>11 to 39<br>-22 to 4</td><td>40 to 87<br>5 to 31</td><td>88 to 101<br>32 to 38</td></tr>
  <tr><td>5 to 7</td><td>⇒ F°<br>C°</td><td>-65 to -15<br>-54 to -26</td><td>-14 to 15<br>-27 to -9</td><td>16 to 40<br>-8 to 4</td><td>41 to 87<br>5 to 31</td><td>88 to 105<br>32 to 40</td><td>106 to 109<br>41 to 43</td></tr>
  <tr><td>3 to 5</td><td>⇒ F°<br>C°</td><td>-65 to 20<br>-54 to -8</td><td>21 to 42<br>-7 to 6</td><td>43 to 88<br>7 to 31</td><td>89 to 103<br>32 to 39</td><td>104 to 116<br>40 to 46</td><td></td></tr>
  <tr><td>1 to 3</td><td>⇒ F°<br>C°</td><td>-65 to 46<br>-54 to 8</td><td>47 to 89<br>9 to 32</td><td>90 to 104<br>33 to 40</td><td>105 to 120<br>41 to 49</td><td></td><td></td></tr>
  <tr><td>-1 to 1</td><td>⇒ F°<br>C°</td><td>-65 to 91<br>-54 to 33</td><td>92 to 105<br>34 to 40</td><td>106 to 120<br>41 to 49</td><td></td><td></td><td></td></tr>
</table>

Nota de formato: «⇒» representa una pequeña flecha hueca dibujada delante de «F°»/«C°». Debajo de la tabla, cada columna de OAT enlaza mediante un pequeño recuadro con flecha hacia abajo con la columna V<sub>1</sub> V<sub>R</sub> V<sub>2</sub> correspondiente.

<table>
  <tr><th>FLAPS</th><th>GROSS WT<br>-1000 LB</th><th>V<sub>1</sub> V<sub>R</sub> V<sub>2</sub></th><th>V<sub>1</sub> V<sub>R</sub> V<sub>2</sub></th><th>V<sub>1</sub> V<sub>R</sub> V<sub>2</sub></th><th>V<sub>1</sub> V<sub>R</sub> V<sub>2</sub></th><th>V<sub>1</sub> V<sub>R</sub> V<sub>2</sub></th><th>V<sub>1</sub> V<sub>R</sub> V<sub>2</sub></th></tr>
  <tr><td>1</td><td>120<br>110<br>100<br>90<br>80<br>70</td>
    <td>159 161 164<br>150 152 155<br>141 143 147<br>131 133 138<br>122 124 130<br>112 116 123</td>
    <td>160 162 164<br>151 153 155<br>142 143 147<br>132 134 138<br>122 125 130<br>113 117 123</td>
    <td><br>152 154 155<br>142 144 147<br>133 135 138<br>123 126 130<br>113 117 122</td>
    <td><br><br>143 145 147<br>133 136 138<br>124 126 130<br>114 118 122</td>
    <td><br><br>144 146 147<br>134 136 138<br>125 127 130<br>115 119 122</td>
    <td><br><br><br>135 137 138<br>125 128 130<br>116 119 122</td></tr>
  <tr><td>5</td><td>120<br>110<br>100<br>90<br>80<br>70</td>
    <td>153 155 158<br>144 146 150<br>135 137 142<br>126 128 133<br>116 118 125<br>106 109 118</td>
    <td>154 156 158<br>145 147 150<br>136 138 142<br>127 129 133<br>117 119 125<br>107 110 118</td>
    <td><br><br>137 139 142<br>128 130 133<br>118 121 125<br>108 111 117</td>
    <td><br><br>138 140 142<br>129 131 133<br>119 122 125<br>109 112 117</td>
    <td><br><br><br>130 132 133<br>120 123 125<br>110 113 117</td>
    <td><br><br><br><br>121 124 125<br>112 114 117</td></tr>
  <tr><td>15</td><td>100<br>90<br>80<br>70</td>
    <td>130 130 135<br>120 121 128<br>111 112 119<br>105 105 112</td>
    <td>131 131&nbsp; 135<br>121 122 128<br>112 113 119<br>101 103 112</td>
    <td>132 132 135<br>123 123 128<br>113 114 119<br>102 105 112</td>
    <td><br>124 124 128<br>114 115 119<br>103 106 112</td>
    <td><br>125 125 128<br>115 116 119<br>105 107 112</td>
    <td><br>126 126 128<br>117 117 119<br>106 108 112</td></tr>
  <tr><td>25</td><td>100<br>90<br>80<br>70</td>
    <td>124 126 132<br>115 117 124<br>105 108 116<br>105 105 108</td>
    <td>126 127 132<br>116 118 124<br>107 109 116<br>104 104 108</td>
    <td><br>117 119 124<br>108 110 116<br>101 101 108</td>
    <td><br>118 120 124<br>109 111 116<br>99 102 108</td>
    <td><br><br>110 112 116<br>100 103 108</td>
    <td><br><br>111 113 116<br>101 104 108</td></tr>
  <tr><td colspan="8">SHADED AREA INDICATES PERFORMANCE AFFECTED BY MINIMUM CONTROL SPEED, MINIMUM<br>FIELD LENGTH FOR LIGHTEST WEIGHT ABOVE SHADED AREA IS REQUIRED.</td></tr>
</table>

(Los `<br>` iniciales de una celda indican filas de peso sin dato en esa columna. `&nbsp;` marca los espacios dobles del original.)

Nota de formato: las dos tablas forman una sola rejilla. Bajo las columnas de OAT de la franja «-1 to 1» no hay línea inferior; cada columna baja hasta un pequeño recuadro de unión, del que salen dos trazos en V que forman el borde superior de cada cabecera V<sub>1</sub> V<sub>R</sub> V<sub>2</sub>. El bloque V<sub>1</sub> ADJUSTMENTS cuelga directamente de la nota inferior, en su mitad derecha.

SPEEDS NOT VALID WHEN<br>
WEIGHTS ARE PREDICTED<br>
ON USE OF CLEARWAY,<br>
STOPWAY, IMPROVED<br>
CLIMB OR ARE LIMITED<br>
BY BRAKE ENERGY

<table>
  <tr><th colspan="2">V<sub>1</sub>ADJUSTMENTS*</th></tr>
  <tr><th>WIND</th><th>SLOPE</th></tr>
  <tr><td>ADD 1 KT PER<br>20 KTS HEADWIND<br><br>SUBTRACT 1 KT PER<br>5 KTS TAILWIND</td><td>ADD 1 KT PER<br>1% UP SLOPE<br><br>SUBTRACT 1 KT PER<br>1% DOWN SLOPE</td></tr>
</table>

*V<sub>1</sub> MUST NOT EXCEED V<sub>R</sub>

---

FIGURE 55.—B-737 – Takeoff Performance.

### Incertidumbres

- Recuadro PRESS de 2.31: se lee «ALT  5660 AND ABOVE» (no «5000»); dígitos muy pequeños, los dos centrales parecen «66». El hueco entre «ALT» y «5660» (~9 px frente a ~4 px entre palabras) se transcribe como espacio doble.
- Recuadro PRESS de 1.96: el número aparece parcialmente tachado por el trazo de la flecha; se lee «1.96» con rótulo «-1000».
- Posición de los recuadros PRESS: colocados bajo la columna de OAT donde termina su trazo (-40, -4, 14, 32, 41, 77 y 86 °F); posición aproximada.
- Rótulos «EPR» y «ALT» a la izquierda de los recuadros PRESS: parecen etiquetas de fila; «ALT» se transcribe junto a «5660 AND ABOVE» porque está en la misma línea.
- Flecha TEMP: «TEMP» dentro de la flecha y «LIMIT EPR» debajo, parcialmente tapados por la flecha PRESS.
- Zonas sombreadas de la tabla V<sub>1</sub>, V<sub>R</sub>, V<sub>2</sub>: la nota las menciona, pero en el escaneo no se aprecia ningún sombreado (fondo blanco uniforme medido en píxeles); no se marca ninguna celda.
- FLAPS 5, segunda columna, 100: «136 138 142» (el primer número podría ser «138»).
- FLAPS 15, segunda columna, 70: «101 103 112» (V<sub>1</sub> menor que en la primera columna); legible, se conserva tal cual.
- FLAPS 15, segunda columna, 100: «131 131  135», con espacio doble antes de «135» (hueco de 9 px frente a 5–6 px); se conserva. No se han detectado otros espacios dobles en las celdas de velocidades.
- «V<sub>1</sub>ADJUSTMENTS*»: el subíndice queda pegado a «ADJUSTMENTS»; se transcribe sin espacio.
- Recuadros de unión OAT → V<sub>1</sub> V<sub>R</sub> V<sub>2</sub>: en el modelo de datos son una fila de unión sin líneas horizontales; los recuadros no se dibujan.
- Bloque TAKEOFF EPR: la fila PRESS no tiene línea inferior en el original; en el modelo, el borde exterior de la tabla la dibuja.
- STAB, TRIM SETTING: el recuadro del título es más ancho que la tabla CG / FLAPS ALL.
- FLAPS 15 y 25, filas de 70: los números tocan la línea inferior («103 106 112», «105 107 112», «99 102 108»); lectura razonablemente segura.
- «EPR BĻEED CORRECTIONS»: marca de impresión bajo la L; se transcribe «BLEED».

---

## FIGURE 56 — B-737 – En Route Climb.

Tabla con marco exterior grueso. Primera columna alineada a la izquierda; valores alineados a la derecha. Fila de cabecera en negrita.
(La tabla inferior de la misma imagen corresponde a otra lámina y no se transcribe aquí.)

<table>
  <thead>
    <tr><th align="left">OPERATING CONDITIONS</th><th align="right">V-1</th><th align="right">V-2</th><th align="right">V-3</th><th align="right">V-4</th><th align="right">V-5</th></tr>
  </thead>
  <tbody>
    <tr><td align="left">BRK REL WEIGHT (X1000)</td><td align="right">110</td><td align="right">95</td><td align="right">85</td><td align="right">105</td><td align="right">75</td></tr>
    <tr><td align="left">CRUISE PRESS ALT</td><td align="right">33,000</td><td align="right">27,000</td><td align="right">35,000</td><td align="right">22,000</td><td align="right">31,000</td></tr>
    <tr><td align="left">AIRPORT ELEVATION</td><td align="right">2,000</td><td align="right">3,000</td><td align="right">2,000</td><td align="right">4,000</td><td align="right">2,000</td></tr>
    <tr><td align="left">ISA TEMPERATURE</td><td align="right">+10°</td><td align="right">ISA</td><td align="right">ISA</td><td align="right">+10°</td><td align="right">+10°</td></tr>
    <tr><td align="left">AVG WIND COMP (KTS)</td><td align="right">20 HW</td><td align="right">20 TW</td><td align="right">30 HW</td><td align="right">10 TW</td><td align="right">40 HW</td></tr>
  </tbody>
</table>

FIGURE 56.—B-737 – En Route Climb.

### Incertidumbres

Ninguna. Todas las celdas se verificaron visualmente con ampliación x2.

---

## EN ROUTE CLIMB 280/.70 ISA

<table>
<thead>
<tr><th rowspan="2"><b>PRESSURE<br>ALTITUDE<br>-FT</b></th><th rowspan="2"><b>UNITS<br>MIN/LB<br>NM/KNOTS</b></th><th colspan="11">BRAKE RELEASE WEIGHT - LB</th></tr>
<tr><th>120000</th><th>115000</th><th>110000</th><th>105000</th><th>100000</th><th>95000</th><th>90000</th><th>85000</th><th>80000</th><th>75000</th><th>65000</th></tr>
</thead>
<tbody>
<tr><td align="center">37000</td><td align="center">TIME/FUEL<br>DIST./TAS</td><td align="right"></td><td align="right">41/5700<br>251/387</td><td align="right">32/4700<br>192/384</td><td align="right">27/4100<br>162/382</td><td align="right">24/3700<br>140/380</td><td align="right">21/3400<br>124/379</td><td align="right">19/3100<br>111/378</td><td align="right">17/2800<br>100/377</td><td align="right">16/2500<br>90/376</td><td align="right">14/2300<br>82/375</td><td align="right">12/1900<br>67/374</td></tr>
<tr><td align="center">36000</td><td align="center">TIME/FUEL<br>DIST./TAS</td><td align="right">41/ 5900<br>246/386</td><td align="right">33/4900<br>194/383</td><td align="right">28/4300<br>164/381</td><td align="right">25/3900<br>143/379</td><td align="right">22/3500<br>127/378</td><td align="right">20/3200<br>114/377</td><td align="right">18/2900<br>103/376</td><td align="right">16/2700<br>93/375</td><td align="right">15/2500<br>84/374</td><td align="right">14/2300<br>77/374</td><td align="right">11/1900<br>63/373</td></tr>
<tr><td align="center">35000</td><td align="center">TIME/FUEL<br>DIST./TAS</td><td align="right">33/5100<br>197/382</td><td align="right">29/4500<br>168/380</td><td align="right">25/4100<br>147/378</td><td align="right">23/3700<br>131/377</td><td align="right">21/3400<br>117/376</td><td align="right">19/3100<br>106/375</td><td align="right">17/2800<br>96/374</td><td align="right">16/2600<br>87/373</td><td align="right">14/2400<br>80/373</td><td align="right">13/2200<br>73/372</td><td align="right">11/1800<br>60/371</td></tr>
<tr><td align="center">34000</td><td align="center">TIME/FUEL<br>DIST./TAS</td><td align="right">29/4700<br>171/379</td><td align="right">26/4300<br>150/377</td><td align="right">23/3900<br>134/376</td><td align="right">21/3500<br>120/375</td><td align="right">19/3200<br>109/374</td><td align="right">18/3000<br>99/373</td><td align="right">16/2700<br>90/372</td><td align="right">15/2500<br>82/372</td><td align="right">14/2300<br>75/371</td><td align="right">12/2100<br>69/371</td><td align="right">10/1800<br>57/370</td></tr>
<tr><td align="center">33000</td><td align="center">TIME/FUEL<br>DIST./TAS</td><td align="right">27/4400<br>153/376</td><td align="right">24/4000<br>137/375</td><td align="right">22/3700<br>123/374</td><td align="right">20/3400<br>112/373</td><td align="right">18/3100<br>102/372</td><td align="right">17/2900<br>93/371</td><td align="right">15/2700<br>85/370</td><td align="right">14/2500<br>78/370</td><td align="right">13/2300<br>71/369</td><td align="right">12/2100<br>65/369</td><td align="right">10/1700<br>54/368</td></tr>
<tr><td align="center">32000</td><td align="center">TIME/FUEL<br>DIST./TAS</td><td align="right">25/4200<br>139/374</td><td align="right">23/3900<br>126/372</td><td align="right">21/3600<br>114/371</td><td align="right">19/3300<br>104/370</td><td align="right">17/3000<br>95/370</td><td align="right">16/2800<br>87/369</td><td align="right">15/2600<br>80/368</td><td align="right">14/2400<br>74/368</td><td align="right">12/2200<br>67/367</td><td align="right">11/2000<br>62/367</td><td align="right">10/1700<br>51/366</td></tr>
<tr><td align="center">31000</td><td align="center">TIME/FUEL<br>DIST./TAS</td><td align="right">23/4000<br>128/371</td><td align="right">21/3700<br>117/370</td><td align="right">19/3400<br>107/369</td><td align="right">18/3200<br>98/368</td><td align="right">16/2900<br>90/367</td><td align="right">15/2700<br>82/367</td><td align="right">14/2500<br>76/366</td><td align="right">13/2300<br>70/366</td><td align="right">12/2100<br>64/365</td><td align="right">11/2000<br>59/365</td><td align="right">9/1700<br>49/364</td></tr>
<tr><td align="center">30000</td><td align="center">TIME/FUEL<br>DIST./TAS</td><td align="right">22/3900<br>119/368</td><td align="right">20/3600<br>109/367</td><td align="right">18/3300<br>100/366</td><td align="right">17/3100<br>92/365</td><td align="right">16/2800<br>84/365</td><td align="right">15/2600<br>78/364</td><td align="right">13/2400<br>72/364</td><td align="right">12/2300<br>66/363</td><td align="right">11/2100<br>61/363</td><td align="right">11/1900<br>56/363</td><td align="right">9/1600<br>47/362</td></tr>
<tr><td align="center">29000</td><td align="center">TIME/FUEL<br>DIST./TAS</td><td align="right">21/3700<br>111/365</td><td align="right">19/3400<br>102/364</td><td align="right">18/3200<br>93/363</td><td align="right">16/3000<br>86/363</td><td align="right">15/2700<br>79/362</td><td align="right">14/2500<br>73/362</td><td align="right">13/2400<br>68/361</td><td align="right">12/2200<br>62/361</td><td align="right">11/2000<br>57/361</td><td align="right">10/1900<br>53/360</td><td align="right">9/1600<br>44/360</td></tr>
<tr><td align="center">28000</td><td align="center">TIME/FUEL<br>DIST./TAS</td><td align="right">19/3600<br>103/362</td><td align="right">18/3300<br>95/361</td><td align="right">17/3100<br>88/360</td><td align="right">15/2900<br>81/360</td><td align="right">14/2700<br>75/359</td><td align="right">13/2500<br>69/359</td><td align="right">12/2300<br>64/359</td><td align="right">11/2100<br>59/358</td><td align="right">11/2000<br>54/358</td><td align="right">10/1800<br>50/358</td><td align="right">8/1500<br>42/357</td></tr>
<tr><td align="center">27000</td><td align="center">TIME/FUEL<br>DIST./TAS</td><td align="right">19/3400<br>96/358</td><td align="right">17/3200<br>89/358</td><td align="right">16/3000<br>82/357</td><td align="right">15/2800<br>76/357</td><td align="right">14/2600<br>71/356</td><td align="right">13/2400<br>65/356</td><td align="right">12/2200<br>60/356</td><td align="right">11/2100<br>56/356</td><td align="right">10/1900<br>52/355</td><td align="right">9/1800<br>47/355</td><td align="right">8/1500<br>40/355</td></tr>
<tr><td align="center">26000</td><td align="center">TIME/FUEL<br>DIST./TAS</td><td align="right">17/3300<br>88/354</td><td align="right">16/3000<br>82/354</td><td align="right">15/2800<br>76/353</td><td align="right">14/2600<br>70/353</td><td align="right">13/2500<br>65/352</td><td align="right">12/2300<br>60/352</td><td align="right">11/2100<br>56/352</td><td align="right">10/2000<br>52/352</td><td align="right">10/1800<br>48/351</td><td align="right">9/1700<br>44/351</td><td align="right">7/1400<br>37/351</td></tr>
<tr><td align="center">25000</td><td align="center">TIME/FUEL<br>DIST./TAS</td><td align="right">16/3100<br>81/350</td><td align="right">15/2900<br>75/350</td><td align="right">14/2700<br>70/349</td><td align="right">13/2500<br>65/349</td><td align="right">12/2400<br>60/349</td><td align="right">11/2200<br>56/348</td><td align="right">11/2000<br>52/348</td><td align="right">10/1900<br>48/348</td><td align="right">9/1800<br>45/348</td><td align="right">8/1600<br>41/348</td><td align="right">7/1400<br>35/347</td></tr>
<tr><td align="center">24000</td><td align="center">TIME/FUEL<br>DIST./TAS</td><td align="right">15/3000<br>75/346</td><td align="right">14/2800<br>69/346</td><td align="right">13/2600<br>65/345</td><td align="right">12/2400<br>60/345</td><td align="right">12/2300<br>56/345</td><td align="right">11/2100<br>52/345</td><td align="right">10/2000<br>48/345</td><td align="right">9/1800<br>45/344</td><td align="right">9/1700<br>41/344</td><td align="right">8/1600<br>38/344</td><td align="right">7/1300<br>32/344</td></tr>
<tr><td align="center">23000</td><td align="center">TIME/FUEL<br>DIST./TAS</td><td align="right">14/2800<br>69/342</td><td align="right">13/2700<br>64/342</td><td align="right">13/2500<br>60/342</td><td align="right">12/2300<br>56/342</td><td align="right">11/2200<br>52/342</td><td align="right">10/2000<br>48/341</td><td align="right">9/1900<br>45/341</td><td align="right">9/1800<br>41/341</td><td align="right">8/1600<br>38/341</td><td align="right">8/1500<br>35/341</td><td align="right">6/1300<br>30/341</td></tr>
<tr><td align="center">22000</td><td align="center">TIME/FUEL<br>DIST./TAS</td><td align="right">14/2700<br>63/339</td><td align="right">13/2500<br>59/339</td><td align="right">12/2400<br>55/338</td><td align="right">11/2200<br>51/338</td><td align="right">10/2100<br>48/338</td><td align="right">10/1900<br>45/338</td><td align="right">9/1800<br>41/338</td><td align="right">8/1700<br>38/338</td><td align="right">8/1600<br>36/338</td><td align="right">7/1400<br>33/338</td><td align="right">6/1200<br>28/337</td></tr>
<tr><td colspan="13">═══════ (marca de corte: 4 líneas paralelas) ═══════</td></tr>
<tr><td align="center">6000</td><td align="center">TIME/FUEL<br>DIST./TAS</td><td align="right">4/1000<br>9/295</td><td align="right">4/1000<br>9/295</td><td align="right">4/900<br>8/295</td><td align="right">4/800<br>8/295</td><td align="right">3/800<br>7/295</td><td align="right">3/700<br>7/295</td><td align="right">3/700<br>6/295</td><td align="right">3/700<br>6/295</td><td align="right">3/600<br>5/295</td><td align="right">2/600<br>5/295</td><td align="right">2/500<br>4/295</td></tr>
<tr><td align="center">1500</td><td align="center">TIME/FUEL</td><td align="right">2/600</td><td align="right">2/600</td><td align="right">2/500</td><td align="right">2/500</td><td align="right">2/500</td><td align="right">2/400</td><td align="right">2/400</td><td align="right">2/400</td><td align="right">1/400</td><td align="right">1/300</td><td align="right">1/300</td></tr>
</tbody>
</table>

<table>
<tr><td rowspan="2"><b>FUEL ADJUSTMENT FOR HIGH ELEVATION AIRPORTS<br>EFFECT ON TIME AND DISTANCE IS NEGLIGIBLE</b></td><td><b>AIRPORT ELEVATION</b></td><td><b>2000</b></td><td><b>4000</b></td><td><b>6000</b></td><td><b>8000</b></td><td><b>10000</b></td><td><b>12000</b></td></tr>
<tr><td><b>FUEL ADJUSTMENT</b></td><td><b>-100</b></td><td><b>-200</b></td><td><b>-400</b></td><td><b>-500</b></td><td><b>-600</b></td><td><b>-700</b></td></tr>
</table>

FIGURE 57.—En Route Climb 280/.70 ISA.

### Notas de disposición

- La tabla de ajuste por aeropuertos elevados está pegada bajo la tabla principal, empieza en el borde izquierdo de la columna UNITS y termina dentro de la columna 75000; su rejilla no coincide con las columnas de peso.
- En la celda izquierda del ajuste no hay línea horizontal entre «FUEL ADJUSTMENT FOR HIGH ELEVATION AIRPORTS» (alineado con la fila AIRPORT ELEVATION) y «EFFECT ON TIME AND DISTANCE IS NEGLIGIBLE» (alineado con la fila FUEL ADJUSTMENT); por eso se modela como una sola celda con rowspan 2.
- Marca de corte entre 22000 y 6000: dos pares de líneas gruesas paralelas (4 líneas) que atraviesan todas las columnas.
- Celda vacía: 37000 / 120000.
- Espacio anómalo conservado: 36000 / 120000 «41/ 5900».

### Suma de control (primer número de TIME/FUEL, minutos, por columna; filas 37000–22000, 6000 y 1500; celdas vacías = 0)

| Peso | 120000 | 115000 | 110000 | 105000 | 100000 | 95000 | 90000 | 85000 | 80000 | 75000 | 65000 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Σ min | 341 | 348 | 312 | 284 | 259 | 240 | 219 | 202 | 187 | 170 | 143 |

Total general: 2705

### Incertidumbres

- Ninguna lectura numérica dudosa tras ampliar x4 cada fila; todas las filas y columnas son monótonas (no crecientes) en tiempo, combustible, distancia y TAS, lo que respalda la lectura.
- «280/.70» en el pie aparece con un ligero espaciado tipográfico tras el punto; se transcribe sin espacio (como en el título de la tabla).

---

## FIGURE 58 — transcripción literal

### EN ROUTE CLIMB 280/.70 ISA +10 °C

<table>
<thead>
<tr><th rowspan="2">PRESSURE<br>ALTITUDE<br>-FT</th><th rowspan="2">UNITS<br>MIM/LB<br>NM/KNOTS</th><th colspan="11">BRAKE RELEASE WEIGHT - LB</th></tr>
<tr><th>120000</th><th>115000</th><th>110000</th><th>105000</th><th>100000</th><th>95000</th><th>90000</th><th>85000</th><th>80000</th><th>75000</th><th>65000</th></tr>
</thead>
<tbody>
<tr><td>37000</td><td>TIME/FUEL<br>DIST./TAS</td><td></td><td></td><td>42/5700<br>263/395</td><td>34/4700<br>206/391</td><td>29/4100<br>174/389</td><td>25/3700<br>151/388</td><td>23/3300<br>133/386</td><td>20/3000<br>119/385</td><td>18/2700<br>107/384</td><td>16/2500<br>96/384</td><td>13/2100<br>78/382</td></tr>
<tr><td>36000</td><td>TIME/FUEL<br>DIST./TAS</td><td></td><td>43/5900<br>266/394</td><td>35/5000<br>211/391</td><td>30/4400<br>179/389</td><td>26/3900<br>156/387</td><td>23/3500<br>138/385</td><td>21/3200<br>123/384</td><td>19/2900<br>111/383</td><td>17/2700<br>100/383</td><td>16/2400<br>90/382</td><td>13/2000<br>74/381</td></tr>
<tr><td>35000</td><td>TIME/FUEL<br>DIST./TAS</td><td>45/6200<br>275/394</td><td>36/5300<br>219/390</td><td>31/4600<br>186/388</td><td>27/4100<br>162/386</td><td>24/3700<br>143/385</td><td>22/3400<br>128/384</td><td>20/3100<br>115/383</td><td>10/2800<br>104/382</td><td>16/2600<br>94/381</td><td>15/2400<br>85/380</td><td>12/2000<br>70/379</td></tr>
<tr><td>34000</td><td>TIME/FUEL<br>DIST./TAS</td><td>38/5600<br>228/390</td><td>32/4900<br>193/387</td><td>28/4400<br>168/386</td><td>25/3900<br>149/384</td><td>23/3600<br>133/383</td><td>21/3300<br>120/382</td><td>19/3000<br>108/381</td><td>17/2700<br>98/380</td><td>16/2500<br>89/379</td><td>14/2300<br>81/379</td><td>12/1900<br>67/378</td></tr>
<tr><td>33000</td><td>TIME/FUEL<br>DIST./TAS</td><td>34/5100<br>200/387</td><td>30/4600<br>174/385</td><td>26/4100<br>154/383</td><td>24/3800<br>138/382</td><td>22/3400<br>124/381</td><td>20/3100<br>113/380</td><td>18/2900<br>102/379</td><td>16/2600<br>93/378</td><td>15/2400<br>85/378</td><td>14/2200<br>77/377</td><td>11/1900<br>64/376</td></tr>
<tr><td>32000</td><td>TIME/FUEL<br>DIST./TAS</td><td>31/4800<br>180/384</td><td>28/4400<br>160/382</td><td>25/4000<br>143/381</td><td>23/3600<br>129/379</td><td>21/3300<br>116/378</td><td>19/3000<br>106/378</td><td>17/2800<br>96/377</td><td>16/2600<br>88/376</td><td>14/2400<br>80/376</td><td>13/2200<br>73/375</td><td>11/1800<br>61/374</td></tr>
<tr><td>31000</td><td>TIME/FUEL<br>DIST./TAS</td><td>29/4600<br>165/381</td><td>26/4200<br>147/379</td><td>23/3800<br>133/378</td><td>21/3500<br>120/377</td><td>20/3200<br>109/376</td><td>18/2900<br>100/375</td><td>16/2700<br>91/375</td><td>15/2500<br>83/374</td><td>14/2300<br>76/374</td><td>13/2100<br>70/373</td><td>11/1800<br>58/372</td></tr>
<tr><td>30000</td><td>TIME/FUEL<br>DIST./TAS</td><td>27/4400<br>152/378</td><td>24/4000<br>137/376</td><td>22/3700<br>124/375</td><td>20/3400<br>113/374</td><td>19/3100<br>103/374</td><td>17/2900<br>94/373</td><td>16/2600<br>86/372</td><td>14/2400<br>79/372</td><td>13/2200<br>72/371</td><td>12/2100<br>66/371</td><td>10/1700<br>55/370</td></tr>
<tr><td>29000</td><td>TIME/FUEL<br>DIST./TAS</td><td>25/4200<br>141/375</td><td>23/3800<br>128/374</td><td>21/3500<br>116/373</td><td>19/3200<br>106/372</td><td>18/3000<br>97/371</td><td>16/2800<br>89/370</td><td>15/2600<br>82/370</td><td>14/2400<br>75/369</td><td>13/2200<br>69/369</td><td>12/2000<br>63/369</td><td>10/1700<br>52/368</td></tr>
<tr><td>28000</td><td>TIME/FUEL<br>DIST./TAS</td><td>24/4000<br>131/371</td><td>22/3700<br>119/370</td><td>20/3400<br>109/369</td><td>18/3100<br>100/369</td><td>17/2900<br>91/368</td><td>16/2700<br>84/368</td><td>14/2500<br>77/367</td><td>13/2300<br>71/367</td><td>12/2100<br>65/366</td><td>11/1900<br>60/366</td><td>9/1600<br>50/365</td></tr>
<tr><td>27000</td><td>TIME/FUEL<br>DIST./TAS</td><td>22/3800<br>121/368</td><td>21/3500<br>111/367</td><td>19/3300<br>102/366</td><td>18/3000<br>93/366</td><td>16/2800<br>86/365</td><td>15/2600<br>79/364</td><td>14/2400<br>73/364</td><td>13/2200<br>67/364</td><td>12/2000<br>61/363</td><td>11/1900<br>56/363</td><td>9/1600<br>47/363</td></tr>
<tr><td>26000</td><td>TIME/FUEL<br>DIST./TAS</td><td>21/3600<br>110/363</td><td>19/3400<br>101/362</td><td>18/3100<br>93/362</td><td>16/2900<br>86/361</td><td>15/2700<br>79/361</td><td>14/2500<br>73/360</td><td>13/2300<br>67/360</td><td>12/2100<br>62/360</td><td>11/2000<br>57/359</td><td>10/1800<br>52/359</td><td>9/1500<br>44/359</td></tr>
<tr><td>25000</td><td>TIME/FUEL<br>DIST./TAS</td><td>19/3400<br>101/358</td><td>18/3200<br>93/358</td><td>17/3000<br>85/357</td><td>15/2800<br>79/357</td><td>14/2600<br>73/357</td><td>13/2400<br>67/356</td><td>12/2200<br>62/356</td><td>11/2000<br>57/356</td><td>10/1900<br>53/356</td><td>10/1700<br>48/355</td><td>8/1500<br>41/355</td></tr>
<tr><td>24000</td><td>TIME/FUEL<br>DIST./TAS</td><td>18/3300<br>92/354</td><td>17/3000<br>85/354</td><td>16/2800<br>78/353</td><td>15/2600<br>72/353</td><td>13/2400<br>67/353</td><td>12/2300<br>62/352</td><td>12/2100<br>57/352</td><td>11/1900<br>53/352</td><td>10/1800<br>49/352</td><td>9/1700<br>45/352</td><td>8/1400<br>38/351</td></tr>
<tr><td>23000</td><td>TIME/FUEL<br>DIST./TAS</td><td>17/3100<br>84/350</td><td>16/2900<br>78/350</td><td>15/2900<br>72/350</td><td>14/2500<br>67/349</td><td>13/2300<br>62/349</td><td>12/2200<br>57/349</td><td>11/2000<br>53/349</td><td>10/1900<br>49/348</td><td>9/1700<br>45/348</td><td>9/1600<br>42/348</td><td>7/1300<br>35/348</td></tr>
<tr><td>22000</td><td>TIME/FUEL<br>DIST./TAS</td><td>16/3000<br>77/346</td><td>15/2800<br>71/346</td><td>14/2600<br>66/346</td><td>13/2400<br>61/346</td><td>12/2200<br>57/345</td><td>11/2100<br>53/345</td><td>10/1900<br>49/345</td><td>10/1800<br>45/345</td><td>9/1700<br>42/345</td><td>8/1500<br>38/345</td><td>7/1300<br>32/344</td></tr>
<tr><td colspan="13">═════ (marca de corte: dos líneas paralelas) ═════</td></tr>
<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td colspan="13">═════ (marca de corte: dos líneas paralelas) ═════</td></tr>
<tr><td>6000</td><td>TIME/FUEL<br>DIST./TAS</td><td>5/1100<br>10/301</td><td>4/1000<br>10/301</td><td>4/900<br>9/301</td><td>4/900<br>9/301</td><td>4/800<br>8/301</td><td>3/800<br>8/301</td><td>3/700<br>7/301</td><td>3/700<br>7/301</td><td>3/600<br>6/301</td><td>3/600<br>6/301</td><td>2/500<br>5/301</td></tr>
<tr><td>1500</td><td>TIME/FUEL</td><td>3/600</td><td>2/600</td><td>2/500</td><td>2/500</td><td>2/500</td><td>2/500</td><td>2/400</td><td>2/400</td><td>2/400</td><td>1/300</td><td>1/300</td></tr>
</tbody>
</table>

<table>
<tr><td>FUEL ADJUSTMENT FOR HIGH ELEVATION AIRPORTS</td><td>AIRPORT ELEVATION</td><td>2000</td><td>4000</td><td>6000</td><td>8000</td><td>10000</td><td>12000</td></tr>
<tr><td>EFFECT ON TIME AND DISTANCE IS NEGLIGIBLE</td><td>FUEL ADJUSTMENT</td><td>-100</td><td>-300</td><td>-400</td><td>-500</td><td>-600</td><td>-800</td></tr>
</table>

FIGURE 58.—En Route Climb 280/.70 ISA +10 °C.

### Suma de control (no forma parte del original)

Suma, por columna de peso, del primer número de TIME/FUEL (minutos) en todas las filas impresas (37000–22000, 6000 y 1500); las celdas vacías no cuentan.

| Peso (LB) | Suma de minutos |
|---|---|
| 120000 | 374 |
| 115000 | 376 |
| 110000 | 378 |
| 105000 | 338 |
| 100000 | 308 |
| 95000 | 279 |
| 90000 | 256 |
| 85000 | 226 |
| 80000 | 214 |
| 75000 | 197 |
| 65000 | 163 |
| **Total** | **3109** |

### Incertidumbres

- 35000 / 85000: se lee claramente "10/2800" (ampliado x6). Por la progresión de la columna cabría esperar 18, pero se transcribe tal cual la fuente.
- 23000 / 110000: "15/2900" (igual combustible que 115000); se lee con claridad y se mantiene.
- Título: el símbolo de grado aparece pequeño y elevado, separado del número por un espacio ("+10 °C"); se transcribe como "°".
- La cabecera dice "MIM/LB" (no "MIN/LB"); se conserva.
- Marca de corte: entre 22000 y 6000 hay dos pares de líneas paralelas gruesas separados por una franja en blanco; se representa como corte (2 líneas) + fila vacía + corte (2 líneas).
- La tabla FUEL ADJUSTMENT no sigue la rejilla de columnas de pesos (empieza bajo la columna UNITS y termina antes de la columna 65000); se transcribe como tabla aparte.

---

## FIGURE 81 — B-727 – Takeoff.

Tabla con marco exterior grueso. Primera columna alineada a la izquierda; valores alineados a la derecha. Fila de cabecera en negrita. La fila final combinada usa un cuerpo de letra algo menor.

<table>
  <thead>
    <tr><th align="left">OPERATING CONDITIONS</th><th align="right">G-1</th><th align="right">G-2</th><th align="right">G-3</th><th align="right">G-4</th><th align="right">G-5</th></tr>
  </thead>
  <tbody>
    <tr><td align="left">FIELD ELEVATION FT</td><td align="right">1,050</td><td align="right">2,000</td><td align="right">4,350</td><td align="right">3,050</td><td align="right">2,150</td></tr>
    <tr><td align="left">ALTIMETER SETTING</td><td align="right">29.36"</td><td align="right">1016 mb</td><td align="right">30.10"</td><td align="right">1010 mb</td><td align="right">29.54"</td></tr>
    <tr><td align="left">TEMPERATURE</td><td align="right">+23 °F</td><td align="right">+10 °C</td><td align="right">+68 °F</td><td align="right">–5 °C</td><td align="right">+5 °F</td></tr>
    <tr><td align="left">AIR COND ENGS 1 AND 3</td><td align="right">OFF</td><td align="right">ON</td><td align="right">ON</td><td align="right">ON</td><td align="right">ON</td></tr>
    <tr><td align="left">ANTI-ICE ENG 2</td><td align="right">ON</td><td align="right">OFF</td><td align="right">OFF</td><td align="right">ON</td><td align="right">ON</td></tr>
    <tr><td align="left">GROSS WEIGHT (X1000)</td><td align="right">140</td><td align="right">190</td><td align="right">180</td><td align="right">160</td><td align="right">120</td></tr>
    <tr><td align="left">6TH STAGE BLEED</td><td align="right">OFF</td><td align="right">ON</td><td align="right">ON</td><td align="right">OFF</td><td align="right">OFF</td></tr>
    <tr><td align="left">FLAP POSITION</td><td align="right">15°</td><td align="right">5°</td><td align="right">25°</td><td align="right">15°</td><td align="right">5°</td></tr>
    <tr><td align="left">CG STATION</td><td align="right">911.2</td><td align="right">882.2</td><td align="right">914.8</td><td align="right">932.9</td><td align="right">925.6</td></tr>
    <tr><td colspan="6" align="center"><small>LEMAC – STA 860.5, MAC 180.9"</small></td></tr>
  </tbody>
</table>

FIGURE 81.—B-727 – Takeoff.

### Incertidumbres

Ninguna. Todas las celdas se verificaron visualmente con ampliación x2–x3 («–5 °C» y «LEMAC – STA» con raya/en dash; comillas de pulgadas rectas).

---

<!-- Transcripción literal. Las tablas en HTML reproducen celdas combinadas; <br> = salto de línea del original; &nbsp; = línea vacía dentro de una casilla; style="border-…:none" = lado sin línea en el original. -->

## TAKEOFF EPR, SPEEDS AND STAB TRIM SETTING

### MAX TAKEOFF EPR

0 - 60 KNOTS

<table>
  <tr><td>ENG 1 &amp; 3</td><td>AIRBLEED ON</td></tr>
  <tr><td>ENG 2</td><td>NO AIRBLEED</td></tr>
</table>

<table>
  <tr><th colspan="2" style="border-right:none">PRESS<br>ALT<br>FT</th><th style="border-left:none">OAT °F<br>°C</th><th>67 TO -9<br>-55 TO -23</th><th>-4<br>-20</th><th>5<br>-15</th><th>14<br>-10</th><th>23<br>-5</th><th>32<br>0</th><th>41<br>5</th><th>50<br>10</th><th>59<br>15</th><th>68<br>20</th><th>77<br>25</th><th>86<br>30</th><th>95<br>35</th><th>104<br>40</th><th>113<br>45</th><th>120<br>49</th></tr>
  <tr><td>-1000</td><td rowspan="6"></td><td>1 &amp; 3<br>2</td><td>2.04<br>2.06</td><td>2.04<br>2.06</td><td>2.04<br>2.06</td><td>2.04<br>2.06</td><td>2.04<br>2.06</td><td>2.04<br>2.06</td><td>2.04<br>2.06</td><td>2.04<br>2.06</td><td>2.04<br>2.06</td><td>2.04<br>2.06</td><td>2.04<br>2.06</td><td>2.04<br>2.06</td><td>2.03<br>2.05</td><td>1.99<br>2.00</td><td>1.94<br>1.96</td><td>1.91<br>1.92</td></tr>
  <tr><td>S.L.</td><td>1 &amp; 3<br>2</td><td>2.10<br>2.11</td><td>2.10<br>2.11</td><td>2.10<br>2.11</td><td>2.10<br>2.11</td><td>2.10<br>2.11</td><td>2.10<br>2.11</td><td>2.10<br>2.11</td><td>2.10<br>2.11</td><td>2.10<br>2.11</td><td>2.10<br>2.11</td><td>2.10<br>2.11</td><td>2.08<br>2.10</td><td>2.03<br>2.05</td><td>1.99<br>2.00</td><td>1.94<br>1.96</td><td>1.91<br>1.92</td></tr>
  <tr><td>1000</td><td>1 &amp; 3<br>2</td><td>2.15<br>2.16</td><td>2.15<br>2.16</td><td>2.15<br>2.16</td><td>2.15<br>2.16</td><td>2.15<br>2.16</td><td>2.15<br>2.16</td><td>2.15<br>2.16</td><td>2.13<br>2.15</td><td>2.12<br>2.13</td><td>2.12<br>2.13</td><td>2.11<br>2.12</td><td>2.08<br>2.10</td><td>2.03<br>2.05</td><td>1.99<br>2.00</td><td>1.94<br>1.96</td><td>1.91<br>1.92</td></tr>
  <tr><td>2000</td><td>1 &amp; 3<br>2</td><td>2.21<br>2.22</td><td>2.21<br>2.22</td><td>2.21<br>2.22</td><td>2.21<br>2.22</td><td>2.21<br>2.22</td><td>2.20<br>2.21</td><td>2.17<br>2.18</td><td>2.14<br>2.16</td><td>2.14<br>2.16</td><td>2.14<br>2.15</td><td>2.11<br>2.12</td><td>2.08<br>2.10</td><td>2.03<br>2.05</td><td>1.99<br>2.00</td><td>1.94<br>1.96</td><td>1.91<br>1.92</td></tr>
  <tr><td>3000</td><td>1 &amp; 3<br>2</td><td>2.26<br>2.28</td><td>2.26<br>2.28</td><td>2.26<br>2.28</td><td>2.25<br>2.27</td><td>2.23<br>2.24</td><td>2.20<br>2.21</td><td>2.17<br>2.18</td><td>2.14<br>2.16</td><td>2.14<br>2.16</td><td>2.14<br>2.15</td><td>2.11<br>2.12</td><td>2.08<br>2.10</td><td>2.03<br>2.05</td><td>1.99<br>2.00</td><td>1.94<br>1.96</td><td>1.91<br>1.92</td></tr>
  <tr><td>3858 &amp;<br>ABOVE</td><td>1 &amp; 3<br>2</td><td>2.31<br>2.32</td><td>2.29<br>2.31</td><td>2.27<br>2.29</td><td>2.25<br>2.27</td><td>2.23<br>2.24</td><td>2.20<br>2.21</td><td>2.17<br>2.18</td><td>2.14<br>2.16</td><td>2.14<br>2.16</td><td>2.14<br>2.15</td><td>2.11<br>2.12</td><td>2.08<br>2.10</td><td>2.03<br>2.05</td><td>1.99<br>2.00</td><td>1.94<br>1.96</td><td>1.91<br>1.92</td></tr>
</table>

<table>
  <tr><td>EPR BLEED CORRECTIONS</td><td>ENG 1 &amp; 3</td><td>ENG 2</td></tr>
  <tr><td>AIR CONDITIONING</td><td>OFF +.04</td><td>-</td></tr>
  <tr><td>ENGINE ANTI-ICE ON</td><td>-</td><td>-.03</td></tr>
</table>

REDUCE ENG 2 EPR BY .05 WITH 6TH<br>
STAGE BLEED ON (IF INSTALLED) FOR 10 °C<br>
(50 °F) OAT & WARMER

> V<sub>1</sub>, V<sub>R</sub>, V<sub>2</sub><br>
> ANTI-SKID OPERATIVE

<table>
  <tr><th colspan="2">PRESSURE<br>ALT - 1000 FT</th><th colspan="12">OAT</th></tr>
  <tr><td rowspan="2" style="border-right:none">9 TO 11</td><td style="border-left:none;border-bottom:none">°F</td><td colspan="6" rowspan="2" style="border-right:none">(ABOVE CERTIFIED ALTITUDE)</td><td style="border-left:none;border-right:none;border-bottom:none">-65</td><td rowspan="2" style="border-left:none;border-right:none">TO</td><td style="border-left:none;border-bottom:none">25</td><td style="border-right:none;border-bottom:none">26</td><td rowspan="2" style="border-left:none;border-right:none">TO</td><td style="border-left:none;border-bottom:none">87</td></tr>
  <tr><td style="border-left:none;border-top:none">°C</td><td style="border-left:none;border-right:none;border-top:none">-54</td><td style="border-left:none;border-top:none">-4</td><td style="border-right:none;border-top:none">-3</td><td style="border-left:none;border-top:none">31</td></tr>
  <tr><td rowspan="2" style="border-right:none">7 TO 9</td><td style="border-left:none;border-bottom:none">°F</td><td colspan="3" rowspan="2"></td><td style="border-right:none;border-bottom:none">-65</td><td rowspan="2" style="border-left:none;border-right:none">TO</td><td style="border-left:none;border-bottom:none">9</td><td style="border-right:none;border-bottom:none">10</td><td rowspan="2" style="border-left:none;border-right:none">TO</td><td style="border-left:none;border-bottom:none">75</td><td style="border-right:none;border-bottom:none">76</td><td rowspan="2" style="border-left:none;border-right:none">TO</td><td style="border-left:none;border-bottom:none">104</td></tr>
  <tr><td style="border-left:none;border-top:none">°C</td><td style="border-right:none;border-top:none">-54</td><td style="border-left:none;border-top:none">-13</td><td style="border-right:none;border-top:none">-12</td><td style="border-left:none;border-top:none">24</td><td style="border-right:none;border-top:none">25</td><td style="border-left:none;border-top:none">40</td></tr>
  <tr><td rowspan="2" style="border-right:none">5 TO 7</td><td style="border-left:none;border-bottom:none">°F</td><td style="border-right:none;border-bottom:none">-65</td><td rowspan="2" style="border-left:none;border-right:none">TO</td><td style="border-left:none;border-bottom:none">-10</td><td style="border-right:none;border-bottom:none">-8</td><td rowspan="2" style="border-left:none;border-right:none">TO</td><td style="border-left:none;border-bottom:none">42</td><td style="border-right:none;border-bottom:none">43</td><td rowspan="2" style="border-left:none;border-right:none">TO</td><td style="border-left:none;border-bottom:none">97</td><td style="border-right:none;border-bottom:none">98</td><td rowspan="2" style="border-left:none;border-right:none">TO</td><td style="border-left:none;border-bottom:none">111</td></tr>
  <tr><td style="border-left:none;border-top:none">°C</td><td style="border-right:none;border-top:none">-54</td><td style="border-left:none;border-top:none">-23</td><td style="border-right:none;border-top:none">-22</td><td style="border-left:none;border-top:none">5</td><td style="border-right:none;border-top:none">6</td><td style="border-left:none;border-top:none">36</td><td style="border-right:none;border-top:none">37</td><td style="border-left:none;border-top:none">44</td></tr>
  <tr><td rowspan="2" style="border-right:none">3 TO 5</td><td style="border-left:none;border-bottom:none">°F</td><td style="border-right:none;border-bottom:none">-65</td><td rowspan="2" style="border-left:none;border-right:none">TO</td><td style="border-left:none;border-bottom:none">32</td><td style="border-right:none;border-bottom:none">33</td><td rowspan="2" style="border-left:none;border-right:none">TO</td><td style="border-left:none;border-bottom:none">90</td><td style="border-right:none;border-bottom:none">91</td><td rowspan="2" style="border-left:none;border-right:none">TO</td><td style="border-left:none;border-bottom:none">113</td><td style="border-right:none;border-bottom:none">114</td><td rowspan="2" style="border-left:none;border-right:none">TO</td><td style="border-left:none;border-bottom:none">120</td></tr>
  <tr><td style="border-left:none;border-top:none">°C</td><td style="border-right:none;border-top:none">-54</td><td style="border-left:none;border-top:none">0</td><td style="border-right:none;border-top:none">1</td><td style="border-left:none;border-top:none">32</td><td style="border-right:none;border-top:none">33</td><td style="border-left:none;border-top:none">45</td><td style="border-right:none;border-top:none">46</td><td style="border-left:none;border-top:none">49</td></tr>
  <tr><td rowspan="2" style="border-right:none">1 TO 3</td><td style="border-left:none;border-bottom:none">°F</td><td style="border-right:none;border-bottom:none">-65</td><td rowspan="2" style="border-left:none;border-right:none">TO</td><td style="border-left:none;border-bottom:none">83</td><td style="border-right:none;border-bottom:none">84</td><td rowspan="2" style="border-left:none;border-right:none">TO</td><td style="border-left:none;border-bottom:none">106</td><td style="border-right:none;border-bottom:none">107</td><td rowspan="2" style="border-left:none;border-right:none">TO</td><td style="border-left:none;border-bottom:none">120</td><td colspan="3" rowspan="2"></td></tr>
  <tr><td style="border-left:none;border-top:none">°C</td><td style="border-right:none;border-top:none">-54</td><td style="border-left:none;border-top:none">28</td><td style="border-right:none;border-top:none">29</td><td style="border-left:none;border-top:none">41</td><td style="border-right:none;border-top:none">42</td><td style="border-left:none;border-top:none">49</td></tr>
  <tr><td rowspan="2" style="border-right:none">-1 TO 1</td><td style="border-left:none;border-bottom:none">°F</td><td style="border-right:none;border-bottom:none">-65</td><td rowspan="2" style="border-left:none;border-right:none">TO</td><td style="border-left:none;border-bottom:none">99</td><td style="border-right:none;border-bottom:none">100</td><td rowspan="2" style="border-left:none;border-right:none">TO</td><td style="border-left:none;border-bottom:none">120</td><td colspan="3" rowspan="2"></td><td colspan="3" rowspan="2"></td></tr>
  <tr><td style="border-left:none;border-top:none">°C</td><td style="border-right:none;border-top:none">-54</td><td style="border-left:none;border-top:none">37</td><td style="border-right:none;border-top:none">38</td><td style="border-left:none;border-top:none">49</td></tr>
  <tr><th>FLAPS</th><th>GROSS<br>WEIGHT<br>1000 LB</th><th colspan="2" style="border-right:none">V<sub>1</sub> =V<sub>R</sub></th><th style="border-left:none">V<sub>2</sub></th><th colspan="2" style="border-right:none">V<sub>1</sub> =V<sub>R</sub></th><th style="border-left:none">V<sub>2</sub></th><th colspan="2" style="border-right:none">V<sub>1</sub> =V<sub>R</sub></th><th style="border-left:none">V<sub>2</sub></th><th colspan="2" style="border-right:none">V<sub>1</sub> =V<sub>R</sub></th><th style="border-left:none">V<sub>2</sub></th></tr>
  <tr><td rowspan="3">5</td><td>210<br>200<br>190</td><td colspan="2" style="border-right:none">165<br>160<br>155</td><td style="border-left:none">175<br>171<br>167</td><td colspan="2" style="border-right:none">166<br>162<br>157</td><td style="border-left:none">175<br>171<br>167</td><td colspan="2" style="border-right:none">&nbsp;<br>&nbsp;<br>158</td><td style="border-left:none">&nbsp;<br>&nbsp;<br>167</td><td colspan="2" style="border-right:none"></td><td style="border-left:none"></td></tr>
  <tr><td>180<br>170<br>160<br>150</td><td colspan="2" style="border-right:none">150<br>144<br>140<br>135</td><td style="border-left:none">163<br>159<br>154<br>149</td><td colspan="2" style="border-right:none">152<br>147<br>141<br>136</td><td style="border-left:none">163<br>159<br>153<br>149</td><td colspan="2" style="border-right:none">154<br>149<br>143<br>138</td><td style="border-left:none">163<br>159<br>153<br>149</td><td colspan="2" style="border-right:none">&nbsp;<br>150<br>145<br>140</td><td style="border-left:none">&nbsp;<br>158<br>153<br>148</td></tr>
  <tr><td>140<br>130<br>120</td><td colspan="2" style="border-right:none">129<br>124<br>119</td><td style="border-left:none">145<br>140<br>135</td><td colspan="2" style="border-right:none">130<br>125<br>120</td><td style="border-left:none">145<br>139<br>134</td><td colspan="2" style="border-right:none">132<br>126<br>120</td><td style="border-left:none">144<br>138<br>134</td><td colspan="2" style="border-right:none">134<br>128<br>121</td><td style="border-left:none">144<br>138<br>133</td></tr>
  <tr><td rowspan="3">15</td><td>210<br>200<br>190</td><td colspan="2" style="border-right:none">156<br>151<br>146</td><td style="border-left:none">166<br>162<br>158</td><td colspan="2" style="border-right:none">157<br>153<br>148</td><td style="border-left:none">166<br>162<br>158</td><td colspan="2" style="border-right:none">&nbsp;<br>&nbsp;<br>149</td><td style="border-left:none">&nbsp;<br>&nbsp;<br>158</td><td colspan="2" style="border-right:none"></td><td style="border-left:none"></td></tr>
  <tr><td>180<br>170<br>160<br>150</td><td colspan="2" style="border-right:none">141<br>136<br>132<br>127</td><td style="border-left:none">154<br>150<br>146<br>141</td><td colspan="2" style="border-right:none">143<br>138<br>133<br>128</td><td style="border-left:none">154<br>150<br>145<br>141</td><td colspan="2" style="border-right:none">145<br>140<br>135<br>130</td><td style="border-left:none">154<br>150<br>145<br>141</td><td colspan="2" style="border-right:none">&nbsp;<br>141<br>137<br>132</td><td style="border-left:none">&nbsp;<br>149<br>145<br>140</td></tr>
  <tr><td>140<br>130<br>120</td><td colspan="2" style="border-right:none">122<br>117<br>112</td><td style="border-left:none">137<br>133<br>128</td><td colspan="2" style="border-right:none">123<br>118<br>113</td><td style="border-left:none">137<br>132<br>127</td><td colspan="2" style="border-right:none">124<br>118<br>113</td><td style="border-left:none">136<br>131<br>127</td><td colspan="2" style="border-right:none">126<br>120<br>115</td><td style="border-left:none">138<br>131<br>126</td></tr>
  <tr><td rowspan="3">20</td><td>210<br>200<br>190</td><td colspan="2" style="border-right:none">151<br>146<br>141</td><td style="border-left:none">161<br>157<br>153</td><td colspan="2" style="border-right:none">152<br>148<br>143</td><td style="border-left:none">161<br>157<br>153</td><td colspan="2" style="border-right:none">&nbsp;<br>&nbsp;<br>144</td><td style="border-left:none">&nbsp;<br>&nbsp;<br>153</td><td colspan="2" style="border-right:none"></td><td style="border-left:none"></td></tr>
  <tr><td>180<br>170<br>160<br>150</td><td colspan="2" style="border-right:none">136<br>132<br>128<br>123</td><td style="border-left:none">150<br>146<br>142<br>137</td><td colspan="2" style="border-right:none">138<br>133<br>129<br>124</td><td style="border-left:none">150<br>146<br>141<br>137</td><td colspan="2" style="border-right:none">140<br>135<br>131<br>126</td><td style="border-left:none">149<br>145<br>141<br>136</td><td colspan="2" style="border-right:none">&nbsp;<br>136<br>133<br>128</td><td style="border-left:none">&nbsp;<br>145<br>141<br>136</td></tr>
  <tr><td>140<br>130<br>120</td><td colspan="2" style="border-right:none">118<br>113<br>109</td><td style="border-left:none">133<br>129<br>124</td><td colspan="2" style="border-right:none">119<br>114<br>109</td><td style="border-left:none">133<br>128<br>123</td><td colspan="2" style="border-right:none">120<br>114<br>109</td><td style="border-left:none">132<br>127<br>123</td><td colspan="2" style="border-right:none">122<br>116<br>111</td><td style="border-left:none">132<br>127<br>122</td></tr>
  <tr><td rowspan="3">25</td><td>210<br>200<br>190</td><td colspan="2" style="border-right:none">146<br>141<br>137</td><td style="border-left:none">157<br>153<br>149</td><td colspan="2" style="border-right:none">147<br>143<br>138</td><td style="border-left:none">157<br>153<br>149</td><td colspan="2" style="border-right:none">&nbsp;<br>&nbsp;<br>139</td><td style="border-left:none">&nbsp;<br>&nbsp;<br>149</td><td colspan="2" style="border-right:none"></td><td style="border-left:none"></td></tr>
  <tr><td>180<br>170<br>160<br>150</td><td colspan="2" style="border-right:none">132<br>127<br>123<br>119</td><td style="border-left:none">145<br>141<br>137<br>133</td><td colspan="2" style="border-right:none">134<br>129<br>124<br>120</td><td style="border-left:none">145<br>141<br>137<br>133</td><td colspan="2" style="border-right:none">136<br>131<br>126<br>122</td><td style="border-left:none">145<br>141<br>137<br>133</td><td colspan="2" style="border-right:none">&nbsp;<br>132<br>128<br>124</td><td style="border-left:none">&nbsp;<br>140<br>136<br>132</td></tr>
  <tr><td>140<br>130<br>120</td><td colspan="2" style="border-right:none">114<br>109<br>105</td><td style="border-left:none">129<br>125<br>120</td><td colspan="2" style="border-right:none">115<br>110<br>106</td><td style="border-left:none">129<br>124<br>120</td><td colspan="2" style="border-right:none">116<br>110<br>106</td><td style="border-left:none">128<br>124<br>119</td><td colspan="2" style="border-right:none">118<br>112<br>108</td><td style="border-left:none">128<br>123<br>118</td></tr>
</table>

### STAB TRIM SETTING

<table>
  <tr><th rowspan="3">CG</th><th colspan="3">FLAPS</th></tr>
  <tr><th>5</th><th>15 / 20</th><th>25</th></tr>
  <tr><th colspan="3">UNITS AIRPLANE NOSE UP</th></tr>
  <tr><td>10<br>12<br>14<br>16</td><td>6 3/4<br>6 1/2<br>6 1/4<br>6</td><td>7 1/2<br>7 1/4<br>7<br>6 3/4</td><td>8 1/4<br>8<br>7 3/4<br>7 1/2</td></tr>
  <tr><td>18<br>20<br>22<br>24</td><td>5 3/4<br>5 1/2<br>5<br>4 3/4</td><td>6 1/2<br>6<br>5 3/4<br>5 1/4</td><td>7<br>6 1/2<br>6 1/4<br>5 3/4</td></tr>
  <tr><td>26<br>28<br>30<br>32</td><td>4 1/2<br>4<br>3 3/4<br>3 1/2</td><td>4 3/4<br>4 1/2<br>4<br>3 3/4</td><td>5 1/4<br>4 3/4<br>4 1/4<br>4</td></tr>
  <tr><td>34<br>36<br>38<br>40<br>42</td><td>3 1/4<br>2 3/4<br>2 1/2<br>2 1/2<br>2 1/2</td><td>3 1/4<br>3<br>2 1/2<br>2 1/2<br>2 1/2</td><td>3 1/2<br>3<br>2 1/2<br>2 1/2<br>2 1/2</td></tr>
</table>

### FLAP RETRACTION/ MANEUVERING SPEEDS

<table>
  <tr><th rowspan="2">GROSS<br>WEIGHT<br>LB</th><th colspan="4">FLAP POSITION</th></tr>
  <tr><th>15</th><th>5</th><th>2</th><th>0</th></tr>
  <tr><td>154500<br>&amp; BELOW</td><td>150</td><td>160</td><td>190</td><td>200</td></tr>
  <tr><td>154501<br>TO<br>176000</td><td>160</td><td>170</td><td>200</td><td>210</td></tr>
  <tr><td>176001<br>TO<br>191000</td><td>170</td><td>180</td><td>210</td><td>220</td></tr>
  <tr><td>ABOVE<br>191000</td><td>180</td><td>190</td><td>225</td><td>235</td></tr>
</table>

FOR MANEUVERS IMMEDIATELY AFTER<br>
TAKEOFF EXCEEDING 15° BANK MAINTAIN<br>
AT LEAST V<sub>2</sub> +10 AT TAKEOFF FLAPS

FIGURE 83.—Takeoff Performance.

### Incertidumbres

- MAX TAKEOFF EPR, cabecera de la primera columna de OAT: se lee «67 TO -9» sin signo menos visible delante de 67 (en °C sí aparece «-55 TO -23»); se transcribe tal cual sin añadir el signo.
- MAX TAKEOFF EPR: la columna estrecha sin texto entre la altitud y «1 & 3 / 2» está vacía y sin líneas horizontales en el original; se modela como una sola celda vacía con rowspan 6.
- MAX TAKEOFF EPR, valores con 6/8 (p. ej. 2.06, 2.16, 2.08, 1.96): a la resolución de la lámina el 6 y el 8 se parecen; se eligen las lecturas que se ven tras ampliar x4–x6 (2.06/2.16/1.96 en la fila de ENG 2 y 2.08 en la columna 86 °F).
- Signos de grado: el original imprime un signo pequeño parecido a un apóstrofo («'F», «'C», «15'»); se transcribe como «°».
- EPR BLEED CORRECTIONS: los guiones «-» de las celdas sin corrección y el signo de «-.03» son trazos cortos; se transcriben como guion «-».
- Nota «REDUCE ENG 2 EPR…»: la última línea «(50 °F) OAT & WARMER» está parcialmente cortada por abajo en la imagen, pero es legible.
- Tabla V1, VR, V2 (rangos de OAT): cada rango muestra los límites en °F arriba y en °C abajo con un único «TO» centrado entre ambas líneas; se modela con 3 subcolumnas (inferior, «TO» con rowspan 2, superior) y 2 subfilas (°F, °C), sin líneas entre ellas, como en el original.
- Tabla V1, VR, V2: los números de la última fila de cada banda (pesos 190, 150 y 120) en la columna de la 2.ª OAT aparecen atravesados por la línea horizontal (p. ej. 157/167, 136/149, 120/134 con flaps 5; 148/158, 128/141, 113/127 con flaps 15; 143/153, 124/137, 109/123 con flaps 20; 138/149, 120/133, 106/120 con flaps 25); se eligen las lecturas más probables.
- Tabla V1, VR, V2, flaps 15, peso 140: V2 de la 3.ª columna de OAT se lee «136» y la de la 4.ª «138» (posible confusión 6/8); se dejan así tras ampliar x8.
- Tabla V1, VR, V2, flaps 20, peso 130, 4.ª columna de OAT: V1 = VR se lee «116» (posible 118).
- Tabla V1, VR, V2, flaps 5, peso 210, 2.ª columna de OAT: V1 = VR se lee «166» (posible 168).
- Nota final: «15'» se interpreta como «15°» y «V2» con el 2 en subíndice.
- Estructura: en el original la etiqueta de altitud (p. ej. «9 TO 11») y las unidades «°F / °C» comparten casilla, igual que «PRESS ALT FT» y «OAT °F / °C» en MAX TAKEOFF EPR, y «(ABOVE CERTIFIED ALTITUDE)» con el rango «-65 TO 25»; aquí son celdas separadas con los lados comunes abiertos (`open`), por lo que no se dibuja línea entre ellas.

---

## Gráficos duplicados

### FIGURE 54 / FIGURE 82 — Altimeter Setting to Pressure Altitude

- A: `docs/digitalizacion/originales/img7-fig54-altimeter-setting.png` (768 × 1177 px), pie «FIGURE 54.—Altimeter Setting to Pressure Altitude.»
- B: `docs/digitalizacion/originales/img2-fig82-altimeter-setting.png` (768 × 1272 px), pie «FIGURE 82.—Altimeter Setting to Pressure Altitude.»

#### Qué se comparó

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

#### Diferencias encontradas (solo de escaneo / maquetación)

- Pie: «FIGURE 54.—» frente a «FIGURE 82.—»; el resto del pie es idéntico.
- Tamaño y escala de la imagen: el marco mide 598 × 1090 px en A y 635 × 1160 px en B (B ≈ 6 % mayor); proporción casi igual
  (0,549 frente a 0,547), con un ligero estiramiento vertical de B (< 0,5 %).
- Márgenes distintos alrededor del marco (A: marco desde x = 81, y = 39; B: desde x = 72, y = 56).
- B tiene una columna gris tenue en el borde derecho de la imagen (x = 767), fuera del marco; A no.
- Diferencias menores de nitidez/grosor de trazo propias del escaneo; ninguna altera la lectura de un carácter.

No se halló ninguna diferencia tipográfica de contenido (cifras, letras, puntuación, espacios, guiones).

#### Conclusión

Contenido idéntico salvo el número del pie. Se implementa una sola vez como FIGURE 54
(`src/data/tables/fig54-altimeter-setting-pressure-altitude.ts`, id `reglaje-altimetrico-altitud-presion`);
la FIGURE 82 se descarta como duplicado.
