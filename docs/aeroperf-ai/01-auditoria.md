# Auditoría de AeroPerf

Revisión del repositorio: 5 de noviembre de 2026. Se preservaron los cambios de trabajo preexistentes en Inicio, menú, registro, pruebas y documentación UX.

## Arquitectura encontrada

React 19 + TypeScript + Vite, HashRouter. `src/tools/registry.ts` controla herramientas, navegación y rutas `/tools/:toolId`. Cada calculadora carga parámetros mediante `useFormValues`; antes del asistente, los valores no especificados se completaban con ejemplos. Esto requiere especial cuidado en el flujo IA para evitar mezclar un ejercicio nuevo con datos de muestra.

`src/core/` contiene funciones deterministas; `src/data/tables/` contiene transcripciones tipadas y pruebas contra fuentes. Los resultados y desarrollos existentes son reutilizables. No se modifican fórmulas ni tablas para incorporar IA.

## Módulos

| Módulo / ruta | Entradas | Motor y referencias | Validación / salida |
|---|---|---|---|
| Combustible `/tools/fuel` | OACI de origen, destino y alterno; distancias NM; viento kt y sentido; peso lb, FL y minutos de espera; taxi lb; FL de tramos informativos | `solveFuelPlan`, FIG 67 y 69; reglas educativas de ámbito en `exercises/registry.ts` | Rango de tablas sin extrapolación; tiempo y combustible por tramo, espera, contingencia, FOB y autonomía; desarrollo detallado |
| EPR `/tools/takeoff-epr` | B737/B727, elevación ft, QNH y unidad, OAT y unidad, A/C, antihielo y sexta etapa B727 | `solveB737TakeoffEpr`, FIG 53–55; `solveTakeoffEpr`, FIG 81–83 | Límites y sangrados según tabla/avión; EPR corregido y lecturas intermedias |
| Ascenso `/tools/en-route-climb` | B737, peso lb, altitud de crucero ft, elevación ft, ISA/ISA+10, viento kt y sentido | `solveEnRouteClimb`, FIG 56–58 | Bloquea celdas vacías, rangos y corte entre 6000–22000 ft; tiempo, combustible, distancia y TAS |
| Interpolación `/tools/linear` | A, B, C, A1 y B1 | `linearInterpolate`: X = A1 + (B1−A1)(C−A)/(B−A) | Números finitos, A ≠ B; indica extrapolación; X y sustitución |
| Doble `/tools/bilinear` | x1,x2,x,y1,y2,y,q11,q12,q21,q22 | `bilinearInterpolate` | Ejes no degenerados; R1, R2 y resultado; extrapolación visible |
| Unidades `/tools/units` | Magnitud, valor y unidad de entrada; destino explícito para el asistente | `convert`, factores `core/units.ts` | Compatibilidad entre unidades de la misma magnitud; equivalencias |
| Densidad `/tools/density-altitude` | Elevación, QNH, OAT | `core/atmosphere.ts` | Calculadora manual existente; fuera del clasificador solicitado |
| Viento `/tools/wind` | Pista, dirección, velocidad y límite | `core/wind.ts` | Componentes longitudinal y cruzada; calculadora manual existente |

## IA anterior

`StatementBox` concentra texto, ejemplos, cámara (`capture=environment`), carga, arrastre, pegado, previsualización y borrado. `parseStatement` interpreta texto de combustible; `analyzeParsedStatement` genera chips verdes, naranjas y rojos y aplica supuestos visibles de espera. `FuelPlanning` calcula cuando el informe está completo.

> **Actualización (5 de noviembre de 2026):** primero se retiró la captura de imágenes de `StatementBox` y después la tarjeta «Enunciado» completa (`StatementBox` se eliminó, con sus chips y «Completar a mano»). Plan de combustible solo tiene la tarjeta «Datos», con «Cargar un ejemplo», y las respuestas. El enunciado, escrito o en foto, se interpreta solo desde el asistente de Inicio, que revisa los datos y después abre esta calculadora con ellos.

`recognizeImage` (`services/ocr.ts`) reduce imágenes a 2400 px, limita 25 MiB de entrada y 5 MiB después de preparar, convierte a base64 y llama a `POST /api/analyze-statement`. No utiliza Tesseract. `server/claude.ts` llama a Anthropic Messages con salida estructurada y credenciales exclusivamente en Node. El servidor valida MIME, firma de archivo, tamaño, origen, concurrencia, tiempo y respuesta. Vite y el servidor de producción comparten ese middleware. Se conserva la compatibilidad del contrato anterior.

## Persistencia e internacionalización

El historial anterior usa `aeroperf.history` (máximo 200 entradas), enlaces con parámetros y eliminación reversible; no conserva imágenes. `createPersistedStore` tolera fallos de localStorage. Los catálogos ES/EN se combinan en `i18n/index.ts` y cuentan con pruebas de paridad. Los enunciados y textos oficiales de tabla deben conservarse en su idioma original.

## Riesgos que orientan el cambio

- La clasificación y las rutas deben salir de una lista cerrada, nunca de una URL generada por Claude.
- Los valores extraídos son propuestas, no confirmaciones; las configuraciones y unidades ausentes bloquean la resolución.
- El cambio de módulo no puede perder datos ni crear un historial por paso.
- Las imágenes no deben persistirse silenciosamente en localStorage.
- Las tablas disponibles son material educativo histórico, no datos operacionales aprobados de una aeronave actual.
