(function () {
  const STORAGE_KEY = "salmon-survey-entries";
  const config = window.SALMON_SURVEY;

  const participantForm = document.getElementById("participant-form");
  const surveyForm = document.getElementById("survey-form");
  const surveyQuestions = document.getElementById("survey-questions");
  const surveySummary = document.getElementById("survey-summary");
  const instructionsList = document.getElementById("instructions-list");
  const surveyTitle = document.getElementById("survey-title");
  const resultsHead = document.getElementById("results-head");
  const resultsBody = document.getElementById("results-body");
  const formStatus = document.getElementById("form-status");
  const entryCount = document.getElementById("entry-count");
  const exportCsvButton = document.getElementById("export-csv");
  const exportJsonButton = document.getElementById("export-json");
  const clearStorageButton = document.getElementById("clear-storage");
  const resetFormButton = document.getElementById("reset-form");
  const sessionDate = document.getElementById("session-date");
  const sessionNumber = document.getElementById("session-number");

  if (!config || !Array.isArray(config.questions)) {
    formStatus.textContent = "No hay configuracion de encuesta cargada.";
    formStatus.className = "status error";
    return;
  }

  if (surveyTitle && config.title) {
    surveyTitle.textContent = config.title;
  }

  sessionDate.value = config.session?.date || new Date().toISOString().slice(0, 10);
  sessionNumber.value = config.session?.number || "";
  surveySummary.textContent = `${config.questions.length} pregunta(s) configurada(s).`;

  renderInstructions();
  renderQuestions();
  renderTable();

  surveyForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const participantData = readParticipantData();
    if (!participantData) {
      return;
    }

    const answers = readAnswers();
    const entry = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      createdAt: new Date().toISOString(),
      participant: participantData,
      answers: answers
    };

    setStatus("Guardando encuesta...", "success");

    try {
      await persistEntry(entry);
      renderTable();
      resetForms();
      setStatus("Encuesta guardada correctamente.", "success");
    } catch (error) {
      setStatus(error.message || "No se pudo guardar la encuesta.", "error");
    }
  });

  exportCsvButton.addEventListener("click", function () {
    const entries = loadEntries();
    if (!entries.length) {
      setStatus("No hay datos para exportar.", "error");
      return;
    }

    const csv = buildCsv(entries);
    downloadFile("salmon-encuestas.csv", "text/csv;charset=utf-8", csv);
    setStatus("CSV exportado.", "success");
  });

  exportJsonButton.addEventListener("click", function () {
    const entries = loadEntries();
    if (!entries.length) {
      setStatus("No hay datos para exportar.", "error");
      return;
    }

    downloadFile(
      "salmon-encuestas.json",
      "application/json;charset=utf-8",
      JSON.stringify(entries, null, 2)
    );
    setStatus("JSON exportado.", "success");
  });

  clearStorageButton.addEventListener("click", function () {
    const hasEntries = loadEntries().length > 0;
    if (!hasEntries) {
      setStatus("No hay registros que borrar.", "error");
      return;
    }

    const confirmed = window.confirm("Se borraran todos los registros guardados en este navegador.");
    if (!confirmed) {
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    renderTable();
    setStatus("Todos los registros se han borrado.", "success");
  });

  resetFormButton.addEventListener("click", function () {
    resetForms();
    setStatus("Formulario reiniciado.", "success");
  });

  function renderQuestions() {
    if (!config.questions.length) {
      surveyQuestions.innerHTML = "<p>No hay preguntas configuradas.</p>";
      return;
    }

    const fragment = document.createDocumentFragment();

    config.questions.forEach(function (question, index) {
      const card = document.createElement("article");
      card.className = "question-card";

      const header = document.createElement("div");
      header.className = "question-header";

      const title = document.createElement("h3");
      title.className = "question-title";
      title.textContent = `${index + 1}. ${question.label}`;

      const value = document.createElement("span");
      value.className = "slider-value";
      value.id = `${question.id}-value`;
      value.textContent = String(question.defaultValue ?? 50);

      header.appendChild(title);
      header.appendChild(value);

      const sliderRow = document.createElement("div");
      sliderRow.className = "slider-row";

      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = "0";
      slider.max = "100";
      slider.step = "1";
      slider.name = question.id;
      slider.id = question.id;
      slider.value = String(question.defaultValue ?? 50);
      slider.required = true;
      slider.addEventListener("input", function () {
        value.textContent = slider.value;
      });

      const scale = document.createElement("div");
      scale.className = "slider-scale";
      scale.innerHTML = `<span>${question.minLabel || "0"}</span><span>${question.maxLabel || "100"}</span>`;

      sliderRow.appendChild(slider);
      sliderRow.appendChild(scale);

      card.appendChild(header);
      card.appendChild(sliderRow);
      fragment.appendChild(card);
    });

    surveyQuestions.replaceChildren(fragment);
  }

  function readParticipantData() {
    if (!participantForm.reportValidity()) {
      setStatus("Completa los datos del participante.", "error");
      return null;
    }

    return {
      participantCode: document.getElementById("participant-code").value.trim(),
      productBatch: document.getElementById("product-batch").value.trim(),
      sampleCode: Number(document.getElementById("sample-code").value),
      sessionDate: document.getElementById("session-date").value,
      sessionNumber: document.getElementById("session-number").value.trim(),
      notes: document.getElementById("notes").value.trim()
    };
  }

  function readAnswers() {
    return config.questions.reduce(function (acc, question) {
      const slider = document.getElementById(question.id);
      acc[question.id] = Number(slider.value);
      return acc;
    }, {});
  }

  function loadEntries() {
    if (config.storageMode === "remote") {
      return [];
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveEntries(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  function renderTable() {
    const entries = loadEntries();
    entryCount.textContent = config.storageMode === "remote" ? "Nube" : String(entries.length);

    const headers = [
      "Codigo",
      "Sesion",
      "Producto/Lote",
      "Muestra",
      "Fecha cata",
      "Observaciones"
    ].concat(config.questions.map(function (question) {
      return question.label;
    }));

    resultsHead.innerHTML = `<tr>${headers.map(function (header) {
      return `<th>${escapeHtml(header)}</th>`;
    }).join("")}</tr>`;

    if (config.storageMode === "remote") {
      resultsBody.innerHTML = '<tr><td class="empty-state" colspan="99">Las respuestas se envian a Google Sheets. Usa la hoja compartida para ver los registros.</td></tr>';
      return;
    }

    if (!entries.length) {
      resultsBody.innerHTML = '<tr><td class="empty-state" colspan="99">Todavia no hay respuestas guardadas.</td></tr>';
      return;
    }

    const rows = entries.map(function (entry) {
      const cells = [
        entry.participant.participantCode,
        entry.participant.sessionNumber,
        entry.participant.productBatch,
        entry.participant.sampleCode,
        entry.participant.sessionDate,
        entry.participant.notes
      ].concat(config.questions.map(function (question) {
        return entry.answers[question.id];
      }));

      return `<tr>${cells.map(function (cell) {
        return `<td>${escapeHtml(String(cell ?? ""))}</td>`;
      }).join("")}</tr>`;
    });

    resultsBody.innerHTML = rows.join("");
  }

  function buildCsv(entries) {
    const headers = [
      "createdAt",
      "participantCode",
      "sessionNumber",
      "productBatch",
      "sampleCode",
      "sessionDate",
      "notes"
    ].concat(config.questions.map(function (question) {
      return question.id;
    }));

    const rows = entries.map(function (entry) {
      return [
        entry.createdAt,
        entry.participant.participantCode,
        entry.participant.sessionNumber,
        entry.participant.productBatch,
        entry.participant.sampleCode,
        entry.participant.sessionDate,
        entry.participant.notes
      ].concat(config.questions.map(function (question) {
        return entry.answers[question.id];
      }));
    });

    return [headers].concat(rows).map(function (row) {
      return row.map(escapeCsvValue).join(",");
    }).join("\n");
  }

  async function persistEntry(entry) {
    if (config.storageMode === "remote") {
      await sendToRemote(entry);
      return;
    }

    const entries = loadEntries();
    entries.push(entry);
    saveEntries(entries);
  }

  async function sendToRemote(entry) {
    const endpointUrl = config.remote?.endpointUrl;
    if (!endpointUrl) {
      throw new Error("Falta configurar la URL del Apps Script en survey-config.js.");
    }

    const payload = {
      surveyTitle: config.title,
      spreadsheetId: config.remote?.spreadsheetId || "",
      sheetName: config.remote?.sheetName || "Respuestas",
      questionOrder: config.questions.map(function (question) {
        return question.id;
      }),
      questions: config.questions.map(function (question) {
        return {
          id: question.id,
          label: question.label,
          minLabel: question.minLabel || "0",
          maxLabel: question.maxLabel || "100"
        };
      }),
      entry: entry
    };

    const response = await fetch(endpointUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    if (!response) {
      throw new Error("No se pudo enviar la respuesta a Google Sheets.");
    }
  }

  function downloadFile(filename, mimeType, content) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function resetForms() {
    participantForm.reset();
    surveyForm.reset();
    sessionDate.value = config.session?.date || new Date().toISOString().slice(0, 10);
    sessionNumber.value = config.session?.number || "";

    config.questions.forEach(function (question) {
      const slider = document.getElementById(question.id);
      const defaultValue = String(question.defaultValue ?? 50);
      slider.value = defaultValue;
      document.getElementById(`${question.id}-value`).textContent = defaultValue;
    });
  }

  function setStatus(message, type) {
    formStatus.textContent = message;
    formStatus.className = `status ${type}`;
  }

  function renderInstructions() {
    const instructions = Array.isArray(config.instructions) ? config.instructions : [];
    if (!instructions.length) {
      instructionsList.innerHTML = "<li>No hay instrucciones configuradas.</li>";
      return;
    }

    instructionsList.innerHTML = instructions.map(function (instruction) {
      return `<li>${escapeHtml(instruction)}</li>`;
    }).join("");
  }

  function escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function escapeCsvValue(value) {
    const text = String(value ?? "");
    return `"${text.replaceAll('"', '""')}"`;
  }
})();
