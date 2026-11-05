/**
 * Aeropuertos y códigos OACI.
 * Los códigos de los ejercicios (SPJC, SPQT…) cambian en cada vuelo: son datos de entrada,
 * no constantes. Esta lista solo sirve para autocompletar y mostrar el nombre; se admite
 * cualquier código OACI válido (4 letras).
 */

export interface Airport {
  icao: string;
  city: string;
  name: string;
  /** País, solo en aeropuertos fuera del Perú */
  country?: string;
}

export interface RouteAirports {
  origin: string;
  destination: string;
  alternate: string;
}

export const EMPTY_ROUTE: RouteAirports = { origin: '', destination: '', alternate: '' };

/** Prefijo OACI de los aeródromos del Perú. */
export const PERU_ICAO_PREFIX = 'SP';

/** Principales aeropuertos del Perú (referencia; verificar siempre con el AIP vigente). */
export const PERU_AIRPORTS: Airport[] = [
  { icao: 'SPJC', city: 'Lima – Callao', name: 'Jorge Chávez' },
  { icao: 'SPQU', city: 'Arequipa', name: 'Rodríguez Ballón' },
  { icao: 'SPZO', city: 'Cusco', name: 'Alejandro Velasco Astete' },
  { icao: 'SPQT', city: 'Iquitos', name: 'Crnl. FAP Francisco Secada Vignetta' },
  { icao: 'SPST', city: 'Tarapoto', name: 'Cad. FAP Guillermo del Castillo Paredes' },
  { icao: 'SPUR', city: 'Piura', name: 'Cap. FAP Guillermo Concha Iberico' },
  { icao: 'SPSO', city: 'Pisco', name: 'Cap. FAP Renán Elías Olivera' },
  { icao: 'SPHI', city: 'Chiclayo', name: 'Cap. FAP José A. Quiñones' },
  { icao: 'SPRU', city: 'Trujillo', name: 'Cap. FAP Carlos Martínez de Pinillos' },
  { icao: 'SPTN', city: 'Tacna', name: 'Crnl. FAP Carlos Ciriani Santa Rosa' },
  { icao: 'SPJL', city: 'Juliaca', name: 'Inca Manco Cápac' },
  { icao: 'SPTU', city: 'Puerto Maldonado', name: 'Padre Aldamiz' },
  { icao: 'SPCL', city: 'Pucallpa', name: 'Cap. FAP David Abensur Rengifo' },
  { icao: 'SPYL', city: 'Talara', name: 'Cap. FAP Víctor Montes Arias' },
  { icao: 'SPME', city: 'Tumbes', name: 'Cap. FAP Pedro Canga Rodríguez' },
  { icao: 'SPJR', city: 'Cajamarca', name: 'Mayor Gral. FAP Armando Revoredo Iglesias' },
  { icao: 'SPHO', city: 'Ayacucho', name: 'Crnl. FAP Alfredo Mendívil Duarte' },
  { icao: 'SPJJ', city: 'Jauja', name: 'Francisco Carlé' },
  { icao: 'SPHZ', city: 'Huaraz (Anta)', name: 'Cmdt. FAP Germán Arias Graziani' },
  { icao: 'SPNC', city: 'Huánuco', name: 'Alf. FAP David Figueroa Fernandini' },
  { icao: 'SPHY', city: 'Andahuaylas', name: 'Andahuaylas' },
  { icao: 'SPJA', city: 'Rioja', name: 'Juan Simons Vela' },
  { icao: 'SPMS', city: 'Yurimaguas', name: 'Moisés Benzaquén Rengifo' },
  { icao: 'SPJE', city: 'Jaén', name: 'Shumba' },
  { icao: 'SPPY', city: 'Chachapoyas', name: 'Chachapoyas' },
  { icao: 'SPEO', city: 'Chimbote', name: 'Tnte. FAP Jaime Montreuil Morales' },
  { icao: 'SPLO', city: 'Ilo', name: 'Ilo' },
  { icao: 'SPZA', city: 'Nazca', name: 'María Reiche Neuman' },
];

/**
 * Aeropuertos internacionales frecuentes desde el Perú (referencia para autocompletar).
 * Se admite cualquier otro código OACI: basta con que no empiece por SP para que el vuelo sea internacional.
 */
export const INTERNATIONAL_AIRPORTS: Airport[] = [
  { icao: 'SEGU', city: 'Guayaquil', name: 'José Joaquín de Olmedo', country: 'Ecuador' },
  { icao: 'SEQM', city: 'Quito', name: 'Mariscal Sucre', country: 'Ecuador' },
  { icao: 'SKBO', city: 'Bogotá', name: 'El Dorado', country: 'Colombia' },
  { icao: 'SCEL', city: 'Santiago', name: 'Arturo Merino Benítez', country: 'Chile' },
  { icao: 'SLLP', city: 'La Paz', name: 'El Alto', country: 'Bolivia' },
  { icao: 'SLVR', city: 'Santa Cruz', name: 'Viru Viru', country: 'Bolivia' },
  { icao: 'SAEZ', city: 'Buenos Aires', name: 'Ministro Pistarini (Ezeiza)', country: 'Argentina' },
  { icao: 'SBGR', city: 'São Paulo', name: 'Guarulhos', country: 'Brasil' },
  { icao: 'MPTO', city: 'Ciudad de Panamá', name: 'Tocumen', country: 'Panamá' },
  { icao: 'KMIA', city: 'Miami', name: 'Miami International', country: 'Estados Unidos' },
];

export const normalizeIcao = (code: string) => code.trim().toUpperCase();

export const isIcaoCode = (code: string) => /^[A-Z]{4}$/.test(normalizeIcao(code));

export function findAirport(code: string): Airport | undefined {
  const c = normalizeIcao(code);
  return PERU_AIRPORTS.find((a) => a.icao === c) ?? INTERNATIONAL_AIRPORTS.find((a) => a.icao === c);
}

/** Código OACI válido de un aeropuerto fuera del Perú (no empieza por SP). */
export const isForeignAirport = (code: string) => isIcaoCode(code) && !normalizeIcao(code).startsWith(PERU_ICAO_PREFIX);

/** Aeropuertos de la ruta que no son del Perú (origen, destino o alterno). */
export function foreignAirports(route: RouteAirports): string[] {
  return [route.origin, route.destination, route.alternate].map(normalizeIcao).filter(isForeignAirport);
}

/** «SPJC · Lima – Callao» o solo el código si no está en la lista. */
export function airportLabel(code: string): string {
  const a = findAirport(code);
  return a ? `${a.icao} · ${a.city}` : normalizeIcao(code);
}

export const ROLE_LABEL: Record<keyof RouteAirports, string> = {
  origin: 'origen',
  destination: 'destino',
  alternate: 'alterno',
};

/**
 * Comprobaciones de la ruta (no bloquean el cálculo, que no depende de los códigos).
 * `domesticOnly`: en vuelos nacionales todos los aeropuertos deben ser del Perú (SP__).
 */
export function routeWarnings(route: RouteAirports, domesticOnly: boolean): string[] {
  const out: string[] = [];
  const r = {
    origin: normalizeIcao(route.origin),
    destination: normalizeIcao(route.destination),
    alternate: normalizeIcao(route.alternate),
  };
  (Object.keys(r) as (keyof RouteAirports)[]).forEach((role) => {
    const code = r[role];
    if (!code) return;
    if (!isIcaoCode(code)) {
      out.push(`«${code}» no es un código OACI válido para el ${ROLE_LABEL[role]} (deben ser 4 letras, p. ej. SPJC).`);
    } else if (domesticOnly && !code.startsWith(PERU_ICAO_PREFIX)) {
      out.push(
        `${code} (${ROLE_LABEL[role]}) no es un aeropuerto del Perú: en vuelos nacionales los códigos OACI empiezan por ${PERU_ICAO_PREFIX}.`,
      );
    }
  });
  if (r.origin && r.origin === r.destination) out.push('El origen y el destino son el mismo aeropuerto.');
  if (r.destination && r.destination === r.alternate) out.push('El alterno debe ser un aeropuerto distinto del destino.');
  return out;
}
