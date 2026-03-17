# SALMON

Aplicacion web estatica para registrar participantes de una cata y guardar respuestas con sliders de 0 a 100.

## Archivos

- `index.html`: interfaz principal.
- `styles.css`: estilos.
- `app.js`: logica de captura, almacenamiento local o remoto y exportacion.
- `survey-config.js`: configuracion editable de la encuesta.
- `google-apps-script.js`: script para guardar respuestas en Google Sheets.

## Uso

1. Abre `index.html` en el navegador.
2. Edita `survey-config.js` para ajustar preguntas, fecha y sesion.
3. Si usas Google Sheets, publica primero el Apps Script y pega su URL en `survey-config.js`.
4. Guarda respuestas desde el formulario.
5. Si el modo es local, exporta los resultados en `CSV` o `JSON`.

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

## Guardado compartido en Google Sheets

1. Abre la hoja de Google Sheets destino.
2. Ve a `Extensiones > Apps Script`.
3. Pega el contenido de `google-apps-script.js`.
4. Guarda el proyecto.
5. Pulsa `Implementar > Nueva implementacion`.
6. Tipo: `Aplicacion web`.
7. Ejecutar como: tu cuenta.
8. Quien tiene acceso: `Cualquiera`.
9. Copia la URL del web app.
10. Pega esa URL en `survey-config.js`, en `remote.endpointUrl`.

Ejemplo:

```js
remote: {
  endpointUrl: "https://script.google.com/macros/s/TU_ID/exec",
  spreadsheetId: "1hFiZNTfYn7lgudhcSBatdz-G9bNTY540xyzQ1E2MNig",
  sheetName: "Respuestas"
}
```

El script crea encabezados si faltan y anade nuevas columnas si cambian las preguntas.

## Limitacion del modo local

Los datos se guardan en `localStorage`, es decir, en el navegador del dispositivo donde se use. Para tener una base de datos compartida entre varios dispositivos, habria que anadir un backend en una segunda fase.
