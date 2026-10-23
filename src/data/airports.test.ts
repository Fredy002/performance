import { describe, expect, it } from 'vitest';
import { airportLabel, findAirport, isIcaoCode, PERU_AIRPORTS, routeWarnings } from './airports';

describe('aeropuertos', () => {
  it('la lista tiene códigos OACI peruanos únicos', () => {
    const codes = PERU_AIRPORTS.map((a) => a.icao);
    expect(new Set(codes).size).toBe(codes.length);
    codes.forEach((c) => expect(c).toMatch(/^SP[A-Z]{2}$/));
  });

  it('incluye los aeropuertos de los ejercicios', () => {
    for (const c of ['SPJC', 'SPQT', 'SPST', 'SPUR', 'SPSO']) expect(findAirport(c)).toBeDefined();
    expect(findAirport('spjc')?.city).toBe('Lima – Callao');
    expect(airportLabel('SPQT')).toBe('SPQT · Iquitos');
    expect(airportLabel('SPXX')).toBe('SPXX');
  });

  it('valida el formato OACI', () => {
    expect(isIcaoCode('SPJC')).toBe(true);
    expect(isIcaoCode(' spjc ')).toBe(true);
    expect(isIcaoCode('SPJ')).toBe(false);
    expect(isIcaoCode('LIM')).toBe(false);
  });

  it('avisa de rutas incoherentes y de aeropuertos no peruanos en vuelos nacionales', () => {
    expect(routeWarnings({ origin: 'SPJC', destination: 'SPQT', alternate: 'SPST' }, true)).toEqual([]);
    expect(routeWarnings({ origin: '', destination: '', alternate: '' }, true)).toEqual([]);
    expect(routeWarnings({ origin: 'SPJC', destination: 'SKBO', alternate: 'SPST' }, true)[0]).toMatch(/SKBO \(destino\) no es un aeropuerto del Perú/);
    expect(routeWarnings({ origin: 'SPJC', destination: 'SKBO', alternate: 'SPST' }, false)).toEqual([]);
    expect(routeWarnings({ origin: 'LIM', destination: 'SPQT', alternate: 'SPST' }, true)[0]).toMatch(/no es un código OACI válido/);
    expect(routeWarnings({ origin: 'SPJC', destination: 'SPJC', alternate: 'SPST' }, true)).toContain('El origen y el destino son el mismo aeropuerto.');
    expect(routeWarnings({ origin: 'SPJC', destination: 'SPQT', alternate: 'SPQT' }, true)).toContain('El alterno debe ser un aeropuerto distinto del destino.');
  });
});
