# Feedback del equipo

Esta carpeta guarda los documentos de feedback del equipo sobre el ERP, para
mantener **trazabilidad** (qué se pidió, cuándo y por qué) y **respaldo**.

## Cómo entregar feedback

El equipo puede seguir usando su método habitual: un documento **Word (.docx)**
con comentarios e **imágenes/capturas** de referencia. Claude Code puede leer
esos archivos directamente, incluidas las imágenes.

Guarda cada documento aquí, con un nombre que incluya la fecha, por ejemplo:
`2026-07-20-feedback-productos.docx`.

## Cómo escribir cada comentario (para que sea fácil de accionar)

Para cada punto, ayuda mucho incluir:

1. **Prioridad** — `[Importante]`, `[Menor]` o `[Idea a futuro]`.
2. **Tipo** — *Error* (algo no funciona) o *Mejora* (funciona, pero lo quieres distinto).
3. **Dónde** — en qué pantalla y en qué parte (una captura marcada con una flecha o círculo es ideal).
4. **Qué** — qué quieres que pase.
5. **Por qué** — el motivo. Esto permite proponer la mejor solución, no solo obedecer literal.

### Ejemplo

> **[Importante] · Error** — Pantalla: Nuevo producto
> Al escribir el precio con puntos de miles (12.990), no lo acepta.
> *(captura adjunta)*
> **Por qué:** el equipo está acostumbrado a escribir los miles con punto.

## Qué hace Claude Code con el feedback

1. Lee el documento completo y devuelve un **resumen** agrupado por tema y prioridad.
2. Señala si algo **choca con el plan maestro** antes de ejecutar (regla R8).
3. Propone **qué abordar ahora y qué dejar para después** (una tarea por sesión, R6).
4. Recién entonces, hace los cambios.

## Consejos

- **Capturas mejor que descripciones largas.** Una imagen marcada ahorra idas y vueltas.
- Puedes **mezclar temas** (visual, funcional, textos) en un mismo documento; se ordenan después.
- Cuando el documento esté aquí, menciónalo en el chat (o indica la ruta) para que Claude lo abra.
