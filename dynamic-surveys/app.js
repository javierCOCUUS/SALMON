(function () {
  const config = window.DYNAMIC_SURVEYS_CONFIG || {};
  const params = new URLSearchParams(window.location.search);

  const state = {
    lang: params.get("lang") || config.defaultLanguage || "es",
    surveyId: params.get("survey") || config.fallbackSurveyId || "",
    survey: null
  };

  const storage = {
    participantCode: "dynamic-surveys.participant-code",
    productBatch: "dynamic-surveys.product-batch"
  };

  const els = {
    title: document.getElementById("survey-title"),
    desc: document.getElementById("survey-description"),
    surveyId: document.getElementById("survey-id"),
    summary: document.getElementById("survey-summary"),
    detail: document.getElementById("status-detail"),
    status: document.getElementById("form-status"),
    instructions: document.getElementById("instructions-list"),
    questions: document.getElementById("survey-questions"),
    metaForm: document.getElementById("meta-form"),
    surveyForm: document.getElementById("survey-form"),
    reset: document.getElementById("reset-form"),
    lang: document.getElementById("language-switcher"),
    sessionDate: document.getElementById("session-date"),
    sessionNumber: document.getElementById("session-number"),
    participantCode: document.getElementById("participant-code"),
    productBatch: document.getElementById("product-batch")
  };

  els.lang.value = state.lang;
  applyTexts();
  setStatus(t("loading"), "success");

  els.lang.addEventListener("change", function () {
    state.lang = els.lang.value;
    syncUrl();
    applyTexts();
    if (state.survey) {
      renderSurvey();
    }
  });

  els.reset.addEventListener("click", function () {
    resetForms();
    setStatus("", "");
  });

  els.participantCode.addEventListener("input", function () {
    persistField(storage.participantCode, els.participantCode.value.trim());
  });

  els.productBatch.addEventListener("input", function () {
    persistField(storage.productBatch, els.productBatch.value.trim());
  });

  els.surveyForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!state.survey) {
      setStatus(t("loadingError"), "error");
      return;
    }

    const meta = readMeta();
    if (!meta) {
      return;
    }

    const payload = {
      action: "submitResponse",
      spreadsheetId: config.spreadsheetId,
      surveyId: state.survey.id,
      lang: state.lang,
      entry: {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        createdAt: new Date().toISOString(),
        participant: meta,
        answers: readAnswers()
      }
    };

    try {
      await postPayload(payload);
      resetForms();
      setStatus(t("saveSuccess"), "success");
    } catch (error) {
      setStatus(error.message || t("saveError"), "error");
    }
  });

  loadSurvey();

  async function loadSurvey() {
    try {
      const survey = await fetchSurvey();
      state.survey = survey;
      renderSurvey();
      setStatus(t("surveyLoaded"), "success");
    } catch (error) {
      setStatus(error.message || t("loadingError"), "error");
    }
  }

  async function fetchSurvey() {
    if (!config.endpointUrl) {
      throw new Error(t("missingEndpoint"));
    }

    const url = new URL(config.endpointUrl);
    url.searchParams.set("action", "getSurvey");
    url.searchParams.set("spreadsheetId", config.spreadsheetId || "");
    url.searchParams.set("lang", state.lang);
    if (state.surveyId) {
      url.searchParams.set("surveyId", state.surveyId);
    }

    const response = await fetch(url.toString(), { method: "GET" });
    if (!response.ok) {
      throw new Error(t("loadingError"));
    }

    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.error || t("loadingError"));
    }

    state.surveyId = data.survey.id;
    syncUrl();
    return data.survey;
  }

  async function postPayload(payload) {
    if (!config.endpointUrl) {
      throw new Error(t("missingEndpoint"));
    }

    await fetch(config.endpointUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
  }

  function renderSurvey() {
    const survey = state.survey;
    document.documentElement.lang = state.lang;
    els.title.textContent = survey.title || "Dynamic Surveys";
    els.desc.textContent = survey.description || "";
    els.surveyId.textContent = survey.id || "-";
    els.summary.textContent = `${survey.questions.length} item(s)`;
    els.detail.textContent = survey.sheetName ? `${survey.sheetName}` : "";
    els.sessionDate.value = getTodayDate();
    els.sessionNumber.value = survey.session?.number || "";
    hydratePersistentFields();

    renderInstructionsList(survey.instructions || []);
    renderQuestions(survey.questions || []);
  }

  function renderInstructionsList(items) {
    els.instructions.innerHTML = items.map(function (item) {
      return `<li>${escapeHtml(item)}</li>`;
    }).join("");
  }

  function renderQuestions(questions) {
    if (!questions.length) {
      els.questions.innerHTML = `<p>${escapeHtml(t("noQuestions"))}</p>`;
      return;
    }

    const fragment = document.createDocumentFragment();
    questions.forEach(function (question, index) {
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
      slider.addEventListener("input", function () {
        value.textContent = slider.value;
      });

      const scale = document.createElement("div");
      scale.className = "slider-scale";
      scale.innerHTML = `<span>${escapeHtml(question.minLabel || "0")}</span><span>${escapeHtml(question.maxLabel || "100")}</span>`;

      sliderRow.appendChild(slider);
      sliderRow.appendChild(scale);
      card.appendChild(header);
      card.appendChild(sliderRow);
      fragment.appendChild(card);
    });

    els.questions.replaceChildren(fragment);
  }

  function readMeta() {
    if (!els.metaForm.reportValidity()) {
      setStatus(t("fillMeta"), "error");
      return null;
    }

    return {
      sessionDate: document.getElementById("session-date").value,
      sessionNumber: document.getElementById("session-number").value.trim(),
      participantCode: document.getElementById("participant-code").value.trim(),
      productBatch: document.getElementById("product-batch").value.trim(),
      sampleCode: Number(document.getElementById("sample-code").value),
      notes: document.getElementById("notes").value.trim()
    };
  }

  function readAnswers() {
    return state.survey.questions.reduce(function (acc, question) {
      acc[question.id] = Number(document.getElementById(question.id).value);
      return acc;
    }, {});
  }

  function resetForms() {
    els.metaForm.reset();
    els.surveyForm.reset();
    if (state.survey) {
      els.sessionDate.value = getTodayDate();
      els.sessionNumber.value = state.survey.session?.number || "";
      hydratePersistentFields();
      state.survey.questions.forEach(function (question) {
        const slider = document.getElementById(question.id);
        const val = String(question.defaultValue ?? 50);
        slider.value = val;
        document.getElementById(`${question.id}-value`).textContent = val;
      });
    }
  }

  function applyTexts() {
    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      node.textContent = t(node.dataset.i18n);
    });
  }

  function t(key) {
    return config.texts?.[state.lang]?.[key] || config.texts?.es?.[key] || key;
  }

  function setStatus(message, type) {
    els.status.textContent = message;
    els.status.className = type ? `status ${type}` : "status";
  }

  function syncUrl() {
    const url = new URL(window.location.href);
    if (state.surveyId) {
      url.searchParams.set("survey", state.surveyId);
    }
    url.searchParams.set("lang", state.lang);
    window.history.replaceState({}, "", url.toString());
  }

  function hydratePersistentFields() {
    els.participantCode.value = readPersistedField(storage.participantCode);
    els.productBatch.value = readPersistedField(storage.productBatch);
  }

  function persistField(key, value) {
    try {
      if (value) {
        window.localStorage.setItem(key, value);
      } else {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      // Ignore storage failures and keep the form usable.
    }
  }

  function readPersistedField(key) {
    try {
      return window.localStorage.getItem(key) || "";
    } catch (error) {
      return "";
    }
  }

  function getTodayDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
})();
