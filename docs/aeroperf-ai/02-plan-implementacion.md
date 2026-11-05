# Plan de implementación

1. Auditar integración y contratos de las calculadoras. Preservar cambios previos y compatibilidad del flujo manual.
2. Definir un esquema compartido con módulos, campos, evidencia, fuentes y dependencias controladas.
3. Extender el mismo middleware Claude para interpretar texto e imágenes en una llamada estructurada; compartir preparación de imágenes y limitar caché/reintentos.
4. Crear una captura compartida visible en Inicio e invocable desde las herramientas.
5. Persistir ejercicios como sesiones sin imágenes; revisar/corregir y confirmar datos antes de llamar a los motores existentes.
6. Aplicar enlaces explícitos entre resultados y entradas de pasos dependientes. Bloquear referencias ausentes y configuraciones no soportadas.
7. Integrar historial de borradores y resoluciones sin duplicar por módulo; borrar el contexto cuando se elimina su entrada.
8. Ejecutar regresiones, pruebas del contrato, del endpoint, de cálculos y de interacción; inspeccionar navegador de escritorio y móvil.
9. Documentar arquitectura, integración, pruebas efectivamente ejecutadas, manual con capturas reales y skills locales reutilizables.

## División de trabajo

Una primera sesión (con Copilot) empezó la implementación: la captura en Inicio (`AIIntake`), el contrato y el prompt (`aeroAnalysis.ts`), el analizador local y la llamada al servidor (`aeroEngine.ts`) y los cálculos (`aiCalculation.ts`). La dejó a medias: faltaban el estado de sesión y los textos del flujo, por lo que la app local no compilaba.

Esta sesión la completó:

- `src/state/aiSession.ts`: sesiones dentro del Historial, supuestos documentados e imágenes solo en memoria.
- `src/i18n/messages/aiWorkflow.ts` y `src/components/ai/AIReview.tsx`: revisión, cálculo, varios pasos y apertura en el módulo.
- `src/pages/ToolPage.tsx`: integración con rutas controladas y asistente compacto en los módulos.
- `server/claude.ts`: modo `exercise`, hecho por un agente en paralelo con propiedad exclusiva del servidor y sus pruebas.
- Ajustes del prompt, pruebas y documentación.

El orquestador integró y verificó todo.
