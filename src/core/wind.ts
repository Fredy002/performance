export interface WindComponents {
  /** Positivo = viento de cara, negativo = viento de cola */
  headwind: number;
  /** Positivo = desde la derecha, negativo = desde la izquierda */
  crosswind: number;
  /** Ángulo entre viento y pista, −180…180 */
  angle: number;
}

/** Normaliza un ángulo a −180…180. */
function normalize(deg: number): number {
  return ((((deg + 180) % 360) + 360) % 360) - 180;
}

export function windComponents(runwayHeadingDeg: number, windDirDeg: number, windSpeed: number): WindComponents {
  const angle = normalize(windDirDeg - runwayHeadingDeg);
  const rad = (angle * Math.PI) / 180;
  return {
    headwind: windSpeed * Math.cos(rad),
    crosswind: windSpeed * Math.sin(rad),
    angle,
  };
}

/** "27L" → 270, "09" → 90, "36" → 360; tres dígitos se toman como rumbo en grados. */
export function runwayToHeading(input: string): number {
  const s = input.trim().toUpperCase();
  const rwy = s.match(/^(\d{1,2})[LRC]?$/);
  if (rwy) {
    const n = Number(rwy[1]);
    return n >= 1 && n <= 36 ? n * 10 : NaN;
  }
  return /^\d{3}$/.test(s) && Number(s) <= 360 ? Number(s) : NaN;
}
