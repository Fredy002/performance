/**
 * Textos de ayuda contextual (InfoTip). Un único lugar para mantener el tono:
 * español claro, una o dos frases, sin repetir la etiqueta y diciendo qué hacer.
 */
export const HELP = {
  // ---------- mensajes de validación ----------
  invalidNumber: 'Escribe solo números; usa coma o punto para los decimales.',

  // ---------- interpolación lineal ----------
  linearInput: 'A y B son las dos filas de la tabla que rodean tu dato C. Escríbelas tal como aparecen en el manual.',
  linearResult: 'A1 y B1 son los valores que la tabla da para A y B. X es el valor que corresponde a C.',
  linearA: 'Fila de la tabla justo por debajo de tu dato.',
  linearB: 'Fila de la tabla justo por encima de tu dato.',
  linearC: 'Tu dato real, el que no aparece en la tabla.',
  linearA1: 'Valor que la tabla da para la fila A.',
  linearB1: 'Valor que la tabla da para la fila B.',

  // ---------- interpolación doble ----------
  bilinearAxes: 'X son las columnas (p. ej. temperatura) e Y las filas (p. ej. altitud). Escribe los valores que rodean tu dato en cada eje.',
  bilinearCells: 'Q11–Q22 son los cuatro valores de la tabla en los cruces de esas filas y columnas. El primer número es la columna y el segundo, la fila.',

  // ---------- atmósfera ----------
  elevation: 'Altura del aeródromo sobre el nivel del mar, en pies. Figura en la carta del aeródromo.',
  qnh: 'Presión del aeródromo reducida al nivel del mar, del METAR o del ATIS. Si te la dan en inHg, conviértela primero.',
  oat: 'Temperatura del aire exterior en el aeródromo, en grados Celsius.',
  sigma: 'Densidad del aire comparada con la estándar a nivel del mar. Menos de 1 significa aire menos denso y menor rendimiento.',

  // ---------- viento ----------
  runway: 'Escribe el número de pista (27, 09L) o su rumbo magnético en grados (274).',
  windDirection: 'Dirección desde la que sopla el viento, en grados, tal como la da el METAR.',
  crosswindLimit: 'Viento cruzado máximo demostrado del manual de la aeronave. Si lo indicas, la app avisa cuando se supera.',

  // ---------- combustible ----------
  tt: 'Tiempo de vuelo de origen a destino, corregido por el viento.',
  tf: 'Combustible que se consume de origen a destino, corregido por el viento.',
  fob: 'Fuel On Board: todo el combustible que debe llevar el avión al salir. Suma viaje, alterno, espera y taxi, más el 10 % del viaje en vuelos internacionales.',
  endurance: 'Tiempo total que el avión puede volar con ese combustible: viaje, alterno y espera, más el 10 % del viaje en vuelos internacionales.',
  windKind: 'HW (viento de cara) aumenta tiempo y combustible; TW (viento de cola) los reduce.',
  flightLevel: 'Nivel de vuelo en cientos de pies: FL 350 son 35 000 ft. Déjalo vacío si el enunciado no lo da.',
  holdingLevel: 'Altitud a la que se vuela la espera; con ella y el peso se lee el consumo en la tabla. Si el enunciado no la da, se usa 1 500 ft (FL 015), la altura que fija la norma para la reserva.',
  holdingWeight: 'Peso del avión al llegar a la espera. Con él se lee el consumo en la tabla de espera.',
  taxi: 'Combustible que se gasta rodando hasta la pista. Se suma al FOB.',
  statementChips: 'Así entendió la app el enunciado. Revisa cada grupo antes de usar las respuestas.',
  icao: 'Código de cuatro letras del aeropuerto. Los del Perú empiezan por SP; si alguno no, el vuelo es internacional.',

  // ---------- EPR de despegue (B727) ----------
  epr: 'Engine Pressure Ratio: el empuje que se fija en cada motor para despegar. Los motores 1 y 3 y el motor 2 tienen valores distintos.',
  takeoffScenario: 'Carga las condiciones de los ejercicios: R-1 a R-5 (B737) o G-1 a G-5 (B727). Después puedes cambiar cualquier dato.',
  fieldElevation: 'Altura del aeródromo sobre el nivel del mar, en pies.',
  altimeterSetting: 'Reglaje altimétrico (QNH). Elige la unidad: pulgadas de mercurio (29.54") o milibares (1016 mb).',
  takeoffOat: 'Temperatura exterior. Si está en °C, la app la pasa a °F para buscar la columna de la tabla.',
  airCondEng13: 'La tabla supone el aire acondicionado de los motores 1 y 3 conectado (ON). Si está OFF, se suma 0,04 a su EPR.',
  antiIceEng2: 'Con el antihielo del motor 2 conectado (ON) se resta 0,03 al EPR del motor 2.',
  aircraftEpr: 'Cada avión tiene su tabla: el B737 compara un límite por temperatura y otro por presión; el B727 da un EPR para los motores 1 y 3 y otro para el motor 2.',
  airCondB737: 'La tabla supone el aire acondicionado conectado (A/C ON). Si está OFF, se suma 0,03 al límite por temperatura.',
  antiIceB737: 'En el B737 el antihielo de motor no cambia el EPR: su corrección es cero.',
  tempLimitEpr: 'EPR máximo según la temperatura exterior. Se lee en la fila TEMP LIMIT EPR de la tabla.',
  pressLimitEpr: 'EPR máximo según la altitud de presión. Se lee en los recuadros PRESS de la tabla; se usa el menor de los dos límites.',
  sixthStage: 'Con el sangrado de 6.ª etapa ON y OAT de 10 °C (50 °F) o más, se resta 0,05 al EPR del motor 2.',

  // ---------- ascenso en ruta (B737) ----------
  climbScenario: 'Carga las condiciones V-1 a V-5 de la tabla de ascenso en ruta del B737. Después puedes cambiar cualquier dato.',
  brakeReleaseWeight: 'Peso del avión al soltar frenos para despegar, en libras. Es la columna de la tabla.',
  cruiseAlt: 'Altitud de presión a la que termina el ascenso, en pies. Es la fila de la tabla.',
  airportElevation: 'Altura del aeropuerto de salida. Desde 2000 ft resta combustible (ajuste por aeropuerto elevado).',
  climbTemp: 'ISA usa la tabla en atmósfera estándar; ISA +10 °C, la tabla para 10 °C más caliente.',
  climbWind: 'Viento medio durante el ascenso. De cara (HW) acorta la distancia recorrida; de cola (TW) la alarga.',
  climbFuel: 'Combustible que se gasta en el ascenso: el de la tabla más el ajuste por elevación del aeropuerto.',
  climbDistance: 'Distancia sobre el terreno: la de la tabla menos lo que el viento de cara «resta» (o más, con viento de cola).',

  // ---------- ajustes ----------
  decimals: 'Cantidad de cifras decimales en los resultados. Las tablas siempre se muestran como en la fuente.',
} as const;
