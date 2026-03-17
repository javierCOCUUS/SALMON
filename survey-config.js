window.SALMON_SURVEY = {
  title: "FICHA EVALUACION SENSORIAL",
  session: {
    date: "2026-03-16",
    number: "01"
  },
  instructions: [
    "Se le presentaran 6 muestras codificadas.",
    "Evalue las muestras en el orden en que se le presenten, de izquierda a derecha, comenzando por la muestra mas cercana.",
    "Observe primero la muestra y evalue color y aroma.",
    "Despues pruebe la muestra y evalue sabor y textura.",
    "Marque una linea vertical (|) en cada escala segun la intensidad percibida.",
    "El extremo izquierdo representa menor intensidad y el extremo derecho mayor intensidad.",
    "Enjuaguese la boca con agua entre muestras."
  ],
  participantFields: [
    { id: "sessionDate", label: "Fecha" },
    { id: "sessionNumber", label: "Sesion" },
    { id: "participantName", label: "Juez" },
    { id: "participantCode", label: "Codigo del juez o ID" },
    { id: "productBatch", label: "Producto o lote" },
    { id: "sampleCode", label: "MUESTRA (CODIGO)" },
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
