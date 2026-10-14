# AeroPerf · Performance de aeronaves

Aplicación web para cálculos de performance de aeronaves. Empieza con la
interpolación lineal de tablas del AFM/POH y está pensada para crecer.

```
X = A1 + (B1 − A1)(C − A) / (B − A)
A = 600 → A1 = 89 · B = 650 → B1 = 96 · C = 622 → X = 92,08
```

## Funciones

- **Interpolación lineal**: gráfica, desarrollo paso a paso y aviso de extrapolación.
- **Interpolación doble** (bilineal) para tablas de dos entradas.
- **Altitud de densidad**: altitud de presión, desviación ISA, σ.
- **Componentes de viento**: cara/cola y cruzado, con diagrama y límite.
- **Conversor de unidades**: altitud, distancia, velocidad, masa, presión, temperatura, volumen.
- **Tablas de performance de aeronaves** (solo consulta): planificación de vuelo en crucero Mach 0,74,
  planificación de vuelo abreviada y performance de espera del B-737 (suplemento FAA),
  con ayuda de uso, glosario, ejemplos resueltos y exportación a CSV.
- Panel con estadísticas, favoritas y actividad reciente; historial persistente.
- Buscador `Ctrl/⌘ + K`, tema claro/oscuro, menú colapsable, diseño responsive.
- Enlaces compartibles: cada cálculo se puede reabrir desde su URL.

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm test         # tests del núcleo de cálculo
npm run build    # build estático en dist/
```

## Arquitectura

```
src/
  core/            Funciones puras (interpolación, ISA, viento, unidades) + tests
  data/tables/     Tablas digitalizadas (datos tipados + ayuda) y su texto fuente
  tools/           Una carpeta por calculadora
  tools/registry.ts  Registro central de herramientas
  components/      Layout (menú, barra superior, buscador) y UI reutilizable
  pages/           Panel, historial, ajustes
  state/           Ajustes e historial persistidos en localStorage
```

### Añadir una calculadora

1. Escribe la lógica en `src/core/` con sus tests.
2. Crea el componente en `src/tools/<id>/` (usa `useFormValues`, `ToolActions`, `ResultHero`…).
3. Añade una entrada en `src/tools/registry.ts`.

El menú, el panel, el buscador y la ruta `/#/tools/<id>` se generan solos.

> Herramienta de apoyo. Verifica siempre los resultados con la documentación
> oficial de la aeronave.

## Tablas digitalizadas

Cada tabla vive en `src/data/tables/` como datos tipados, transcritos tal cual la
fuente (sin corregir valores). `__fixtures__/` guarda la transcripción literal y
`tables.test.ts` comprueba celda a celda que los datos coinciden con ella.
Para añadir una tabla: crea su archivo, regístrala en `index.ts` y añade su fixture y tests.

## Despliegue en GitHub Pages

El workflow `.github/workflows/deploy.yml` compila y publica la app en cada push a `main`.
Activación (una sola vez): **Settings → Pages → Build and deployment → Source: GitHub Actions**.
La app queda en `https://<usuario>.github.io/performance/`.
