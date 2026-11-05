# Mejoras pendientes

Solo se incluyen los puntos que no se resolvieron y el motivo. Los problemas UX-01 a UX-23 de la auditoría están implementados y verificados (ver [02](02-cambios-implementados.md) y [03](03-resultados-qa.md)).

| Prioridad | Punto | Motivo por el que queda pendiente | Siguiente paso sugerido |
| --- | --- | --- | --- |
| P2 | Verificar con lectores de pantalla reales (VoiceOver en iOS y macOS, NVDA en Windows). | Este entorno no permite ejecutar ni escuchar un lector de pantalla. Se validó solo la semántica (axe, nombres accesibles). | Recorrer combustible, interpolación e historial con VoiceOver; prestar atención al anuncio de los avisos y de los InfoTip. |
| P2 | Probar en Safari/iOS y Firefox. | Solo hay Chromium disponible. | Repetir `probe-after.mjs` con `webkit` y `firefox` de Playwright cuando se instalen esos navegadores. |
| P2 | Validar el análisis de fotos con una llamada real a Claude. | Requiere clave de API y envía datos a un servicio externo; no se hizo sin autorización explícita. | Con una clave de pruebas, fotografiar un enunciado y comprobar los estados de carga, error y «Faltan datos». |
| P3 | «Borrar todo» usa el `confirm()` del navegador. | Es accesible y funciona en el móvil, y la acción ya puede deshacerse; un diálogo propio no aportaba lo suficiente para esta fase. | Si se quiere coherencia visual, crear un `ConfirmDialog` con `<dialog>` y reutilizarlo. |
| P3 | El conversor de unidades enfoca el campo al abrirse (`autoFocus`), lo que despliega el teclado en el móvil. | Es una decisión de producto previa (escribir enseguida en el escritorio); cambiarla no corresponde a un problema medido. | Decidir si enfocar solo en el escritorio. |
| P3 | En las tarjetas de respuestas de combustible estrechas, el icono ⓘ pasa a una segunda línea. | Es solo estético; no afecta a la lectura ni al uso. | Ajustar la rejilla `.answer-label` si molesta. |
| P3 | Peso de las capturas en el repositorio (unos 17 MB en `docs/ux-ui/capturas/`). | Se conservan como evidencia completa de antes y después en 3 anchos y 2 temas. | Si el tamaño importa, conservar solo 1280 y 390 en claro, o mover las capturas a Git LFS. |
| — | Pruebas con usuarios nuevos. | Requiere participantes. | 3–5 sesiones con la tarea «resolver el ejercicio SPUR–SPJC sin ayuda», midiendo el tiempo y los errores. |
