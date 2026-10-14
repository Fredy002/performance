import type { PerformanceTable } from './types';

const line = (cells: (string | number)[]) => cells.map((c) => (/[",\n]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : c)).join(',');

/** Exporta una tabla a CSV (formato «largo» en la de espera para facilitar su reutilización). */
export function tableToCsv(t: PerformanceTable): string {
  switch (t.kind) {
    case 'conditions':
      return [line(['condition', 'distance_nm', 'wind_kt', 'wind_kind']), ...t.conditions.map((c) => line([c.id, c.distanceNm, c.wind.speedKt, c.wind.kind]))].join('\n');
    case 'flight-planning':
      return [
        line(['distance_nm', 'rec_alt_min_ft', 'rec_alt_max_ft', 'tas_kt', 'air_time_min', 'fuel_lb']),
        ...t.rows.map((r) => line([r.distanceNm, r.recAltFt[0], r.recAltFt[1], r.tasKt, r.airTimeMin, r.fuelLb])),
      ].join('\n');
    case 'holding':
      return [
        line(['flight_level', 'gross_weight_klb', 'epr', 'ias_kt', 'ff_per_engine_lb_hr']),
        ...t.rows.flatMap((r) => r.cells.map((c, i) => line([r.flightLevel, t.weightsKlb[i], c.epr, c.iasKt, c.ffPerEngineLbHr]))),
      ].join('\n');
  }
}
