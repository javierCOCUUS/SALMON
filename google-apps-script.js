function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents || "{}");
    var spreadsheetId = payload.spreadsheetId;
    var sheetName = payload.sheetName || "Respuestas";
    var entry = payload.entry || {};
    var participant = entry.participant || {};
    var answers = entry.answers || {};
    var questions = Array.isArray(payload.questions) ? payload.questions : [];

    if (!spreadsheetId) {
      return jsonResponse({ ok: false, error: "Missing spreadsheetId" });
    }

    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);

    var baseHeaders = [
      "id",
      "createdAt",
      "surveyTitle",
      "sessionDate",
      "sessionNumber",
      "participantName",
      "participantCode",
      "productBatch",
      "sampleCode",
      "notes"
    ];

    var questionHeaders = questions.map(function (question) {
      return "q_" + question.id;
    });

    var labelHeaders = questions.map(function (question) {
      return "label_" + question.id;
    });

    var headers = baseHeaders.concat(questionHeaders, labelHeaders);
    ensureHeaders(sheet, headers);

    var headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var rowMap = {
      id: entry.id || "",
      createdAt: entry.createdAt || new Date().toISOString(),
      surveyTitle: payload.surveyTitle || "",
      sessionDate: participant.sessionDate || "",
      sessionNumber: participant.sessionNumber || "",
      participantName: participant.participantName || "",
      participantCode: participant.participantCode || "",
      productBatch: participant.productBatch || "",
      sampleCode: participant.sampleCode || "",
      notes: participant.notes || ""
    };

    questions.forEach(function (question) {
      rowMap["q_" + question.id] = answers[question.id] ?? "";
      rowMap["label_" + question.id] = question.label || question.id;
    });

    var row = headerRow.map(function (header) {
      return Object.prototype.hasOwnProperty.call(rowMap, header) ? rowMap[header] : "";
    });

    sheet.appendRow(row);

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function doGet() {
  return jsonResponse({ ok: true, service: "SALMON Google Sheets bridge" });
}

function ensureHeaders(sheet, expectedHeaders) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
    return;
  }

  var currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var missingHeaders = expectedHeaders.filter(function (header) {
    return currentHeaders.indexOf(header) === -1;
  });

  if (!missingHeaders.length) {
    return;
  }

  sheet.getRange(1, currentHeaders.length + 1, 1, missingHeaders.length).setValues([missingHeaders]);
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
