# 05 — Implementación

## Estado

Implementación ES/EN completada. Español sigue siendo el idioma inicial; la preferencia se guarda en `aeroperf.settings` y el selector de la barra superior cambia el idioma sin recargar la página.

## Alcance implementado

- `useI18n()` y catálogos por dominio en `src/i18n/`; las claves ausentes generan un error explícito.
- Traducción del shell, páginas, accesibilidad, paleta de comandos, calculadoras, formularios, errores, ayudas, tablas y ejercicios.
- `document.documentElement.lang` se mantiene sincronizado con el locale.
- Los formatos numéricos respetan el idioma; los datos de cálculo, valores fuente de tablas, figuras y textos proporcionados por el usuario no se transforman.
- Los mensajes de OCR/backend reciben el locale mediante `Accept-Language`.
- Los metadatos de ejercicios se muestran en inglés mediante una vista localizada; las respuestas escritas y los datos de cálculo se conservan.

## Límites

- Las ayudas inglesas de FIGURE 66, FIGURE 67 y FIGURE 69 son traducciones provisionales: el repositorio no contiene versiones inglesas completas de esos textos.
- Los resúmenes históricos guardados conservan el idioma con el que se guardaron; no se reescriben al cambiar el locale.
