window.SALMON_SURVEY = {
  title: "FICHA EVALUACION SENSORIAL",
  storageMode: "remote",
  remote: {
    endpointUrl: "https://script.google.com/macros/s/AKfycbyUXQpI6aiUaO1FTVnEgRZ6YzJfCYH-rfRxM-r8x9Ni2C1jg97hWP-lg5cDT9pNbRg_/exec",
    spreadsheetId: "1hFiZNTfYn7lgudhcSBatdz-G9bNTY540xyzQ1E2MNig",
    sheetName: "Respuestas"
  },
  session: {
    date: "2026-03-16",
    number: "01"
  },
  instructions: [
    "Se le presentaran 6 muestras codificadas.",
    "Evalúe las muestras en el orden en que se le presenten, de izquierda a derecha, comenzando por la muestra más cercana.",
    "Observe primero la muestra y evalúe color y aroma.",
    "Después pruebe la muestra y evalúe sabor y textura.",
    "Desplace el control en cada escala según la intensidad percibida.",
    "El extremo izquierdo representa menor intensidad y el extremo derecho mayor intensidad.",
    "Enjuáguese la boca con agua entre muestras."
  ],
  participantFields: [
    { id: "sessionDate", label: "Fecha" },
    { id: "sessionNumber", label: "Sesión" },
    { id: "participantCode", label: "Código del juez o ID" },
    { id: "productBatch", label: "Producto o lote" },
    { id: "sampleCode", label: "MUESTRA (CÓDIGO)" },
    { id: "notes", label: "Observaciones" }
  ],
  questions: [
    {
      id: "color",
      label: "COLOR: rosado/naranja",
      minLabel: "Muy palido",
      maxLabel: "Muy intenso",
      defaultValue: 50
    },
    {
      id: "aroma",
      label: "AROMA: aroma a pescado cocido",
      minLabel: "Nulo",
      maxLabel: "Muy intenso",
      defaultValue: 50
    },
    {
      id: "sabor",
      label: "SABOR: sabor a salmon cocido",
      minLabel: "Nulo",
      maxLabel: "Muy intenso",
      defaultValue: 50
    },
    {
      id: "textura",
      label: "TEXTURA: firmeza/dureza",
      minLabel: "Muy blando",
      maxLabel: "Muy firme",
      defaultValue: 50
    },
    {
      id: "elasticidad",
      label: "ELASTICIDAD",
      minLabel: "Nada elastico",
      maxLabel: "Muy elastico",
      defaultValue: 50
    },
    {
      id: "jugosidad",
      label: "JUGOSIDAD",
      minLabel: "Nada jugoso",
      maxLabel: "Muy jugoso",
      defaultValue: 50
    },
    {
      id: "cohesividad",
      label: "COHESIVIDAD",
      minLabel: "Se desmorona",
      maxLabel: "Muy cohesivo",
      defaultValue: 50
    },
    {
      id: "granulosidad",
      label: "GRANULOSIDAD",
      minLabel: "Nada granuloso",
      maxLabel: "Muy granuloso",
      defaultValue: 50
    }
  ]
};
