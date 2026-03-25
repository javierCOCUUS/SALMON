# Dynamic Surveys

Aplicacion separada para cargar encuestas desde Google Sheets y guardar cada encuesta en su propia pestana.

## Estructura

- `index.html`: interfaz bilingue.
- `styles.css`: estilos.
- `app.js`: carga la encuesta y envia respuestas al Apps Script.
- `survey-config.js`: configuracion local del endpoint y textos base.
- `google-apps-script.js`: script para Google Sheets.

## Comportamiento del formulario

- Las preguntas se responden con sliders de `0` a `7`.
- La fecha se rellena automaticamente con el dia actual del dispositivo.
- La sesion queda guardada en ese navegador y se reutiliza en las siguientes sesiones.
- El codigo del catador o juez queda guardado en ese navegador y se reutiliza en las siguientes sesiones.
- El ultimo valor escrito en `Producto o lote` tambien queda guardado en ese navegador.
- Al pulsar `Limpiar formulario` o tras guardar, se conservan la sesion, el codigo del catador y el producto/lote guardados.

## Google Sheets

Crea una hoja nueva para este sistema. Necesita estas pestanas:

### `Encuestas`

Cabeceras:

```text
survey_id | activa | titulo_es | titulo_en | descripcion_es | descripcion_en | instrucciones_es | instrucciones_en | fecha | sesion | sheet_respuestas
```

Notas:

- `survey_id`: identificador unico, por ejemplo `salmon-marzo-01`
- `activa`: `TRUE` para la encuesta por defecto
- `instrucciones_*`: una instruccion por linea
- `sheet_respuestas`: nombre de la pestana donde se guardaran las respuestas

### `Preguntas`

Cabeceras:

```text
survey_id | orden | id_pregunta | texto_es | texto_en | min_label_es | min_label_en | max_label_es | max_label_en | valor_defecto
```

## Configuracion

En `survey-config.js`, rellena:

```js
endpointUrl: "https://script.google.com/macros/s/TU_ID/exec",
spreadsheetId: "TU_SPREADSHEET_ID"
```

## Flujo

- Sin parametro `survey`, la app carga la encuesta activa.
- Con `?survey=mi-encuesta`, carga esa encuesta.
- Con `?lang=en`, cambia el interfaz a ingles.

Ejemplo:

```text
https://javiercocuus.github.io/SALMON/dynamic-surveys/?survey=salmon-marzo-01&lang=en
```

## Como crear una encuesta nueva

1. Abre la Google Sheet conectada a `dynamic-surveys`.
2. En la pestana `Encuestas`, duplica una fila existente o crea una nueva.
3. Asigna un `survey_id` nuevo y unico.
   Ejemplo: `salmon-abril-02`
4. Rellena los textos en espanol e ingles.
5. Define `fecha`, `sesion` y `sheet_respuestas`.
   Ejemplo de `sheet_respuestas`: `respuestas_salmon_abril_02`
6. Si quieres que sea la encuesta por defecto, marca `activa` como `TRUE`.
7. Si habia otra encuesta activa, cambia su `activa` a `FALSE`.
8. En la pestana `Preguntas`, crea una fila por pregunta usando el mismo `survey_id`.
9. Define `orden`, `id_pregunta`, textos y extremos de escala en ambos idiomas.

## Reglas practicas

- Cada encuesta nueva debe tener su propio `survey_id`.
- Cada encuesta nueva debe tener su propia `sheet_respuestas`.
- No hace falta tocar el codigo para cambiar preguntas, textos o instrucciones.
- La web cargara la encuesta marcada como activa, salvo que se abra con `?survey=...`.

## Ejemplos de uso

- Encuesta activa por defecto:
  `https://javiercocuus.github.io/SALMON/dynamic-surveys/`
- Encuesta concreta:
  `https://javiercocuus.github.io/SALMON/dynamic-surveys/?survey=salmon-abril-02`
- Encuesta concreta en ingles:
  `https://javiercocuus.github.io/SALMON/dynamic-surveys/?survey=salmon-abril-02&lang=en`

## Mantenimiento

- Si cambias solo datos en Google Sheets, no hace falta volver a desplegar GitHub Pages.
- Si cambias el codigo del Apps Script, si hace falta volver a implementarlo en Google Apps Script.
- Si cambias archivos de `dynamic-surveys` en el repo, hay que subirlos a GitHub para que Pages los publique.

## Apps Script

1. Abre una hoja nueva en Google Sheets.
2. Ve a `Extensiones > Apps Script`.
3. Pega `google-apps-script.js`.
4. Implementa como aplicacion web con acceso `Cualquiera`.
5. Copia la URL en `survey-config.js`.
