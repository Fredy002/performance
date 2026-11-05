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
- **Planificación de combustible** (B737, vuelos nacionales del Perú): viaje, alterno, espera
  (45 min según la RAP) y taxi → FOB y autonomía, con desarrollo paso a paso y ejercicios resueltos.
  Origen, destino y alterno se introducen como códigos OACI (cambian en cada vuelo), con
  autocompletado de aeropuertos del Perú y avisos si un código no es peruano (SP__) o la ruta
  es incoherente.
- **Un solo paso para resolver**: en Planificación de combustible se escribe, pega o fotografía el
  enunciado y las respuestas aparecen al lado. Los datos detectados se muestran como chips de color
  (detectado, supuesto, falta); datos, desarrollo y validación quedan en secciones plegables.
- **Pruebas**: ejercicios resueltos a mano que la app vuelve a resolver con las tablas y la
  interpolación, comparando cada paso con la resolución. Al verificarse pasan a su herramienta.
- Panel con estadísticas, favoritas y actividad reciente; historial persistente.
- Menú por tareas (Calcular, Consultar, Pruebas), barra inferior en el móvil, buscador `Ctrl/⌘ + K`
  y tema claro/oscuro.
- Enlaces compartibles: cada cálculo se puede reabrir desde su URL.

## Desarrollo

```bash
npm install
cp .env.example .env.local  # set ANTHROPIC_API_KEY only in this local file
npm run dev      # frontend and image-analysis endpoint
npm test         # calculation, interface and server tests
npm run build    # frontend production build in dist/
npm start        # serve dist/ and the Claude API at http://127.0.0.1:3000
```

Requiere Node.js 22.18 o posterior para ejecutar el servidor TypeScript sin dependencias adicionales.
La clave de API se lee en el servidor desde `ANTHROPIC_API_KEY`; `.env.local` está ignorado por Git.

## Arquitectura

```
server/
  index.ts         Servidor de producción: archivos de dist/ y endpoint de captura
  claude.ts        Integración de Claude, validación y límites del endpoint
src/
  core/            Funciones puras (interpolación, ISA, viento, unidades) + tests
  data/tables/     Tablas digitalizadas (datos tipados + ayuda) y su texto fuente
  exercises/       Ejercicios de prueba: enunciado, datos y resolución manual para validar
  data/airports.ts Aeropuertos del Perú (código OACI, ciudad, nombre) y validación de rutas
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

## Pruebas (validación de ejercicios)

`src/core/tableLookup.ts` lee las tablas con interpolación (lineal o doble) y
`src/core/fuelPlanning.ts` resuelve viaje + alterno + espera + rodaje. Cada ejercicio de
`src/exercises/registry.ts` guarda los valores **tal como se escribieron** en la resolución
manual («80,4»), y la página de la prueba los compara con el cálculo de la app:
«Coincide» si son iguales con los mismos decimales, «Redondeo» si difieren menos de 0,05.

Cada ejercicio tiene `status`: `pending` (aparece en Pruebas) o `verified` (se ofrece como
ejercicio resuelto en Planificación de combustible; su ruta de Pruebas redirige allí).
Distancias entre 60 y 260 NM se interpolan entre esas dos filas (la tabla no publica las
intermedias) y el desarrollo lo indica.

## Resolver desde una captura con Claude

Las fotos, capturas y las imágenes pegadas o arrastradas se envían a nuestro endpoint
`POST /api/analyze-statement`. El servidor llama a la API de visión de Claude para
interpretar el enunciado completo y devolver datos estructurados. Ya no se usa
Tesseract para leer las imágenes. La foto sale del dispositivo y se procesa en Anthropic.

- La clave se configura en `ANTHROPIC_API_KEY`, solo en el servidor; nunca se incluye
  en `src/`, variables `VITE_`, enlaces ni almacenamiento del navegador.
- `ANTHROPIC_MODEL` permite cambiar el modelo; el valor inicial es `claude-sonnet-5-5`.
  `ANTHROPIC_WORKSPACE_ID` es opcional para las claves que necesitan seleccionar un workspace.
- Los datos ausentes o ilegibles se conservan como pendientes para corregirlos. El modelo
  no sustituye las tablas ni el núcleo de cálculo de combustible de la app.
- Los supuestos del ejercicio, como FL 015 y 45 min de espera nacional cuando no se indican,
  siguen mostrándose como «Supuesto». Si faltan datos imprescindibles, la app no resuelve.
- El enunciado escrito o pegado como texto sigue disponible sin llamada a Claude.
- Si la clave no está configurada, vence o la API falla, la interfaz muestra el error y
  permite corregir o introducir el enunciado a mano.

La integración usa [Messages API](https://platform.claude.com/docs/en/api/messages/create),
[imágenes de visión](https://platform.claude.com/docs/en/build-with-claude/vision) y
[salida JSON estructurada](https://platform.claude.com/docs/en/build-with-claude/structured-outputs).

## Despliegue con servidor Node

Para servir frontend y API desde el mismo origen:

```bash
npm install
cp .env.example .env.local
# Set ANTHROPIC_API_KEY in .env.local or your hosting secrets.
npm run build
npm start
```

`npm start` ejecuta `node --env-file-if-exists=.env.local server/index.ts`. Escucha en
`127.0.0.1:3000` por defecto. En un hosting que necesita escuchar en todas las interfaces,
configura `HOST=0.0.0.0`; `PORT` permite elegir el puerto. Publica este servidor detrás del
HTTPS y los controles de acceso de tu hosting. El servidor entrega únicamente archivos
contenidos en `dist/` y el endpoint de análisis; no publica `.env.local` ni archivos del repo.

Si el frontend y la API están en orígenes diferentes, configura antes de compilar:

```dotenv
# Public frontend build environment:
VITE_STATEMENT_API_URL=https://api.example.com/api/analyze-statement

# Private server environment:
ANTHROPIC_API_KEY=tu_clave
CLAUDE_ALLOWED_ORIGIN=https://tu-usuario.github.io
```

`CLAUDE_ALLOWED_ORIGIN` debe coincidir exactamente con el origen del frontend, sin la
ruta `/performance/` ni barra final. Usa un origen concreto; no `*`. Cambiar una variable
`VITE_` requiere compilar otra vez el frontend. Cambiar la clave requiere reiniciar el servidor.

## Despliegue en GitHub Pages

El workflow `.github/workflows/deploy.yml` compila y publica el frontend en cada push a `main`.
Activación (una sola vez): **Settings → Pages → Build and deployment → Source: GitHub Actions**.
La app queda en `https://<usuario>.github.io/performance/`.

GitHub Pages solo aloja archivos estáticos: no ejecuta el servidor Node ni guarda la clave
para llamar a Claude. Para analizar imágenes allí, despliega la API aparte, configura
`VITE_STATEMENT_API_URL` en el entorno del build del workflow y `CLAUDE_ALLOWED_ORIGIN` en
el backend como se indica arriba. No añadas la clave a secretos o variables con prefijo
`VITE_`. Sin backend configurado, las calculadoras y el enunciado escrito siguen funcionando;
el análisis de fotos requiere la API.
