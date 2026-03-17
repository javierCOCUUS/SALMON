# Dynamic Surveys

Aplicacion separada para cargar encuestas desde Google Sheets y guardar cada encuesta en su propia pestana.

## Estructura

- `index.html`: interfaz bilingue.
- `styles.css`: estilos.
- `app.js`: carga la encuesta y envia respuestas al Apps Script.
- `survey-config.js`: configuracion local del endpoint y textos base.
- `google-apps-script.js`: script para Google Sheets.

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

## Apps Script

1. Abre una hoja nueva en Google Sheets.
2. Ve a `Extensiones > Apps Script`.
3. Pega `google-apps-script.js`.
4. Implementa como aplicacion web con acceso `Cualquiera`.
5. Copia la URL en `survey-config.js`.
