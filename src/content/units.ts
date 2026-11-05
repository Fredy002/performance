/**
 * Significado de cada unidad o sigla que aparece junto a un dato.
 * Lo usan los campos, las opciones y las respuestas para mostrar ayuda al pasar
 * el ratón, enfocar con el teclado o tocar la unidad.
 */
export const UNIT_HELP: Record<string, string> = {
  // longitud y altitud
  ft: 'Pies (feet). 1 ft = 0,3048 m.',
  m: 'Metros.',
  km: 'Kilómetros.',
  FL: 'Nivel de vuelo (flight level): cientos de pies. FL 350 = 35 000 ft.',
  NM: 'Millas náuticas (nautical miles). 1 NM = 1852 m.',
  SM: 'Millas terrestres (statute miles). 1 SM = 1609 m.',
  // velocidad
  kt: 'Nudos (knots): millas náuticas por hora.',
  'km/h': 'Kilómetros por hora.',
  'm/s': 'Metros por segundo.',
  mph: 'Millas terrestres por hora.',
  'ft/min': 'Pies por minuto: velocidad vertical.',
  // masa y combustible
  lb: 'Libras (pounds). 1 lb = 0,4536 kg.',
  kg: 'Kilogramos.',
  t: 'Toneladas (1000 kg).',
  'lb/h': 'Libras por hora: flujo de combustible.',
  L: 'Litros.',
  USG: 'Galones estadounidenses (US gallons). 1 USG = 3,785 L.',
  IG: 'Galones imperiales. 1 IG = 4,546 L.',
  // presión
  hPa: 'Hectopascales. Equivalen a milibares: 1013,25 hPa es la presión estándar.',
  mb: 'Milibares. Equivalen a hectopascales: 1013 mb ≈ 29,92 in.Hg.',
  inHg: 'Pulgadas de mercurio (inches of mercury). Estándar: 29,92 inHg.',
  'in.Hg': 'Pulgadas de mercurio (inches of mercury). Estándar: 29,92 in.Hg.',
  'in.Hg (")': 'Pulgadas de mercurio; las comillas (") también indican pulgadas, como en 29.54".',
  mmHg: 'Milímetros de mercurio.',
  psi: 'Libras por pulgada cuadrada.',
  // temperatura
  '°C': 'Grados Celsius.',
  '°F': 'Grados Fahrenheit. °F = °C × 9/5 + 32.',
  K: 'Kelvin: 0 °C = 273,15 K.',
  ISA: 'Atmósfera estándar internacional (International Standard Atmosphere): 15 °C a nivel del mar.',
  'ISA +10 °C': '10 °C más caliente que la atmósfera estándar a esa altitud.',
  // tiempo y ángulos
  min: 'Minutos.',
  h: 'Horas.',
  '°': 'Grados de dirección: 0° a 360°, medidos desde el norte.',
  // viento
  'Cara (HW)': 'Headwind: viento de cara, de frente al avión.',
  'Cola (TW)': 'Tailwind: viento de cola, por detrás del avión.',
};

/** Ayuda de una unidad o sigla, si existe. */
export const unitHelp = (symbol: string): string | undefined => UNIT_HELP[symbol.trim()];
