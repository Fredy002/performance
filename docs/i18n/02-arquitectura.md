# 02 — Arquitectura i18n

## Diseño

- `src/i18n/index.ts` expone `useI18n()`, `translate()` y la comprobación de paridad de catálogos.
- `src/i18n/types.ts` define `Locale` (`es` | `en`).
- `src/i18n/messages/` contiene catálogos por dominio: `common`, `pages`, `tools`, `content`, `tables` y `exercises`.
- `src/state/settings.ts` persiste el locale en el store existente `aeroperf.settings`; las preferencias antiguas sin `locale` siguen abriendo en español.
- `useApplyLocale()` actualiza `document.documentElement.lang`.
- `setLocale()` cambia el estado persistido; los componentes suscritos se actualizan sin recargar ni cambiar de ruta.

## Convenciones

1. Usar claves semánticas estables, por ejemplo `common.home`, nunca texto visible como ID.
2. Mantener claves equivalentes en los catálogos ES y EN; resolver claves ausentes explícitamente y probar la paridad.
3. Mantener identificadores de ruta, IDs, datos persistidos, valores de enums y lógica de negocio independientes del idioma.
4. Mantener el español existente sin alteraciones de contenido salvo cambios expresamente solicitados.
5. Localizar también `aria-*`, `title`, placeholders, validaciones, mensajes dinámicos, notificaciones y textos auxiliares.
6. Conservar los valores de tablas, unidades y originales FAA; localizar solo títulos de interfaz, explicaciones y ayuda no literal.
7. Marcar traducciones inglesas provisionales cuando no hay un original verificable en el repo.

## Formatos

La localización de texto no cambia la aritmética ni los valores persistidos. Los números se formatean en la capa de presentación según locale; la precisión configurada por el usuario se mantiene. Unidades de aviación, códigos OACI, identificadores y cifras impresas en fuentes se preservan.
