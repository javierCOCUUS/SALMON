# SALMON

Aplicacion web estatica para registrar participantes de una cata y guardar respuestas con sliders de 0 a 100.

## Archivos

- `index.html`: interfaz principal.
- `styles.css`: estilos.
- `app.js`: logica de captura, almacenamiento local y exportacion.
- `survey-config.js`: configuracion editable de la encuesta.

## Uso

1. Abre `index.html` en el navegador.
2. Edita `survey-config.js` para sustituir las preguntas de ejemplo.
3. Guarda respuestas desde el formulario.
4. Exporta los resultados en `CSV` o `JSON`.

## Configurar preguntas

En `survey-config.js`, cada pregunta sigue esta estructura:

```js
{
  id: "olor",
  label: "Intensidad del olor",
  minLabel: "Bajo",
  maxLabel: "Alto",
  defaultValue: 50
}
```

## Limitacion actual

Los datos se guardan en `localStorage`, es decir, en el navegador del dispositivo donde se use. Para tener una base de datos compartida entre varios dispositivos, habria que anadir un backend en una segunda fase.
