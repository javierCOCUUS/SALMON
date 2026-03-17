function doGet(e) {
  try {
    var action = (e.parameter.action || "").trim();
    if (action === "getSurvey") {
      return jsonResponse(handleGetSurvey(e));
    }
    return jsonResponse({ ok: true, service: "Dynamic Surveys bridge" });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents || "{}");
    var action = payload.action || "";
    if (action === "submitResponse") {
      return jsonResponse(handleSubmitResponse(payload));
    }
    return jsonResponse({ ok: false, error: "Unsupported action" });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function handleGetSurvey(e) {
  var spreadsheet = SpreadsheetApp.openById(e.parameter.spreadsheetId);
  var surveySheet = getSheetOrThrow(spreadsheet, "Encuestas");
  var questionSheet = getSheetOrThrow(spreadsheet, "Preguntas");
  var lang = (e.parameter.lang || "es").trim();
  var surveyId = (e.parameter.surveyId || "").trim();

  var surveys = sheetToObjects(surveySheet);
  var questions = sheetToObjects(questionSheet);

  var survey = surveyId
    ? surveys.find(function (item) { return item.survey_id === surveyId; })
    : surveys.find(function (item) { return String(item.activa).toUpperCase() === "TRUE" || String(item.activa).toUpperCase() === "SI"; });

  if (!survey) {
    throw new Error("Survey not found");
  }

  var surveyQuestions = questions
    .filter(function (item) { return item.survey_id === survey.survey_id; })
    .sort(function (a, b) { return Number(a.orden || 0) - Number(b.orden || 0); })
    .map(function (item) {
      return {
        id: item.id_pregunta,
        label: pickLang(item, "texto", lang),
        minLabel: pickLang(item, "min_label", lang),
        maxLabel: pickLang(item, "max_label", lang),
        defaultValue: Number(item.valor_defecto || 50)
      };
    });

  var instructions = readInstructions(survey, lang);

  return {
    ok: true,
    survey: {
      id: survey.survey_id,
      title: pickLang(survey, "titulo", lang),
      description: pickLang(survey, "descripcion", lang),
      sheetName: survey.sheet_respuestas,
      session: {
        date: survey.fecha || "",
        number: survey.sesion || ""
      },
      instructions: instructions,
      questions: surveyQuestions
    }
  };
}

function handleSubmitResponse(payload) {
  var spreadsheet = SpreadsheetApp.openById(payload.spreadsheetId);
  var surveySheet = getSheetOrThrow(spreadsheet, "Encuestas");
  var surveys = sheetToObjects(surveySheet);
  var survey = surveys.find(function (item) { return item.survey_id === payload.surveyId; });
  if (!survey) {
    throw new Error("Survey not found");
  }

  var sheetName = survey.sheet_respuestas;
  if (!sheetName) {
    throw new Error("sheet_respuestas is required");
  }

  var sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
  var entry = payload.entry || {};
  var participant = entry.participant || {};
  var answers = entry.answers || {};
  var baseHeaders = [
    "id",
    "createdAt",
    "surveyId",
    "sessionDate",
    "sessionNumber",
    "participantCode",
    "productBatch",
    "sampleCode",
    "notes"
  ];

  var answerHeaders = Object.keys(answers).sort();
  ensureHeaders(sheet, baseHeaders.concat(answerHeaders));
  var headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  var rowMap = {
    id: entry.id || "",
    createdAt: entry.createdAt || new Date().toISOString(),
    surveyId: payload.surveyId,
    sessionDate: participant.sessionDate || "",
    sessionNumber: participant.sessionNumber || "",
    participantCode: participant.participantCode || "",
    productBatch: participant.productBatch || "",
    sampleCode: participant.sampleCode || "",
    notes: participant.notes || ""
  };

  Object.keys(answers).forEach(function (key) {
    rowMap[key] = answers[key];
  });

  var row = headerRow.map(function (header) {
    return Object.prototype.hasOwnProperty.call(rowMap, header) ? rowMap[header] : "";
  });
  sheet.appendRow(row);

  return { ok: true };
}

function readInstructions(survey, lang) {
  var raw = pickLang(survey, "instrucciones", lang);
  if (!raw) {
    return [];
  }
  return raw.split(/\r?\n/).map(function (item) {
    return item.trim();
  }).filter(String);
}

function pickLang(row, prefix, lang) {
  return row[prefix + "_" + lang] || row[prefix + "_es"] || row[prefix + "_en"] || "";
}

function getSheetOrThrow(spreadsheet, name) {
  var sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    throw new Error("Missing sheet: " + name);
  }
  return sheet;
}

function sheetToObjects(sheet) {
  var values = sheet.getDataRange().getValues();
  if (!values.length) {
    return [];
  }
  var headers = values[0];
  return values.slice(1).filter(function (row) {
    return row.some(function (cell) { return cell !== ""; });
  }).map(function (row) {
    var obj = {};
    headers.forEach(function (header, index) {
      obj[String(header).trim()] = row[index];
    });
    return obj;
  });
}

function ensureHeaders(sheet, expectedHeaders) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
    return;
  }
  var currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var missing = expectedHeaders.filter(function (header) {
    return currentHeaders.indexOf(header) === -1;
  });
  if (!missing.length) {
    return;
  }
  sheet.getRange(1, currentHeaders.length + 1, 1, missing.length).setValues([missing]);
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
