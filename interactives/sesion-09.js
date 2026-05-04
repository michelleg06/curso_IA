/* ================================================
   SESIÓN 09 — IA para Organización y Productividad
   Dos demos interactivas:
     1. initStudyPlan()    → priorización semanal
     2. initHerramientas() → herramientas según tarea
================================================ */

const $ = (id) => document.getElementById(id);

function setText(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}

function setHTML(id, html) {
  const el = $(id);
  if (el) el.innerHTML = html;
}

function setInsights(prefix, seeing, meaning) {
  setHTML(`${prefix}-seeing`, seeing);
  setHTML(`${prefix}-meaning`, meaning);
}

function activateShell(prefix) {
  $(`${prefix}-shell`)?.classList.add("is-active");
  const start = $(`${prefix}-start`);
  const reset = $(`${prefix}-reset`);
  if (start) start.disabled = true;
  if (reset) reset.disabled = false;
}

function deactivateShell(prefix) {
  $(`${prefix}-shell`)?.classList.remove("is-active");
  const start = $(`${prefix}-start`);
  const reset = $(`${prefix}-reset`);
  if (start) start.disabled = false;
  if (reset) reset.disabled = true;
}

function clearLiveStage(prefix) {
  const live = document.querySelector(`#${prefix}-shell .demo-stage-live`);
  if (live) live.innerHTML = "";
}

/* ------------------------------------------------
   DEMO 1: ORGANIZADOR SEMANAL
------------------------------------------------ */

function initStudyPlan() {
  const PRIORITY = {
    quimica: {
      label: "Química",
      focus: "Química necesita los bloques más largos al inicio de la semana.",
      monday: "Química: repaso de conceptos base y lista de dudas concretas.",
      tuesday: "Química: ejercicios y errores frecuentes antes del examen.",
      wednesday: "Química: repaso ligero de fórmulas y tipos de reacción.",
      thursdayAfter: "Descanso breve después del examen y cierre de errores para no arrastrarlos.",
      weekendReflection: "Anotar qué estrategias sí funcionaron en Química y cuáles no para la siguiente evaluación.",
      tip: "Cuando Química es la materia más importante, lo peor que podemos hacer es dejarla para después de la presentación. Hay que darle los mejores bloques antes del jueves.",
    },
    matematicas: {
      label: "Matemáticas",
      focus: "Las matemáticas necesitan práctica deliberada y revisión de errores antes del viernes.",
      monday: "Matemáticas: identificar los procedimientos que más fallan y hacer ejercicios guiados.",
      tuesday: "Matemáticas: práctica mixta con factorización, cuadráticas y sistemas.",
      wednesday: "Matemáticas: bloque corto de mantenimiento para no llegar fría al jueves por la noche.",
      thursdayAfter: "Matemáticas: práctica final después del examen de Química, enfocada en los errores de procedimiento.",
      weekendReflection: "Anotar qué errores de procedimiento reaparecieron en Matemáticas para no repetirlos en la siguiente unidad.",
      tip: "Cuando Matemáticas representa la mayor carga, es preferible distribuir la práctica a lo largo de la semana en lugar de concentrarla en un solo bloque al final.",
    },
  };

  const PRESENTATION = {
    ordenar: {
      label: "Solo falta ordenar",
      monday: "Comunicación: definir apertura, orden de ideas y quién dice cada parte.",
      wednesday: "Presentación de Comunicación y corrección final del guión.",
      prompt:
        "La presentación de Comunicación ya tiene contenido, pero todavía necesita estructura y reparto claro de tareas.",
    },
    repartir: {
      label: "Todavía faltan acuerdos",
      monday: "Comunicación: cerrar pendientes con el equipo y repartir diapositivas y tiempos.",
      wednesday: "Presentación de Comunicación con margen para resolver cambios de último momento.",
      prompt:
        "La presentación de Comunicación sigue desordenada y el equipo todavía tiene que ponerse de acuerdo y repartir tareas.",
    },
  };

  const HOURS = {
    2: {
      label: "2 horas por tarde",
      mondayExtra: "1 bloque principal y 1 bloque corto. No intentes abarcar todo el material en un solo bloque.",
      tuesdayExtra: "Enfócate solo en lo que sí puede mejorar tu desempeño esta semana.",
      wednesdayHistory: "Historia: repaso ligero de 30–40 min porque el día ya está ocupado.",
      fridayHistory: "Historia: primer bloque de estudio después del examen de Matemáticas.",
      weekendLoad: "Dos bloques de estudio por día con pausas claras.",
      tip: "Con 2 horas por día, la clave es priorizar: una materia pesada, una tarea de mantenimiento y nada más.",
    },
    3: {
      label: "3 horas por tarde",
      mondayExtra: "1 bloque profundo y 2 bloques cortos; ya hay espacio para una segunda materia de mantenimiento.",
      tuesdayExtra: "Hay margen para práctica y corrección de errores en la misma tarde.",
      wednesdayHistory: "Historia: repaso breve de 45–60 min si todavía queda energía después de la presentación.",
      fridayHistory: "Historia: bloque de estudio y organización de apuntes después del examen de Matemáticas.",
      weekendLoad: "Dos bloques profundos por día y un cierre corto de repaso.",
      tip: "Con 3 horas por día puedes repartir mejor la carga de trabajo, pero eso no elimina la necesidad de priorizar.",
    },
  };

  function buildPrompt(hoursKey, priorityKey, presentationKey) {
    const hours = HOURS[hoursKey];
    const priority = PRIORITY[priorityKey];
    const presentation = PRESENTATION[presentationKey];

    return [
      "Soy estudiante de preparatoria y necesito organizar esta semana con apoyo de IA.",
      "Tengo una presentación de Comunicación el miércoles, examen de Química el jueves, examen de Matemáticas el viernes y examen de Historia el lunes siguiente.",
      `Puedo estudiar ${hours.label} después de clases.`,
      `La materia que más necesito reforzar es ${priority.label}.`,
      "Historia es la materia que mejor llevo, así que no hace falta darle tanta prioridad al inicio.",
      presentation.prompt,
      "Dame un plan de la semana, día por día, que priorice lo urgente, evite cargar los días de examen y explique por qué algunas tareas llevan más tiempo que otras.",
    ].join(" ");
  }

  function buildDays(hoursKey, priorityKey, presentationKey) {
    const hours = HOURS[hoursKey];
    const priority = PRIORITY[priorityKey];
    const presentation = PRESENTATION[presentationKey];
    const secondary = priorityKey === "quimica" ? "Matemáticas" : "Química";

    return [
      {
        label: "Lunes",
        tasks: [
          presentation.monday,
          priority.monday,
          `${secondary}: bloque corto de mantenimiento para no dejarla abandonada.`,
          hours.mondayExtra,
        ],
      },
      {
        label: "Martes",
        tasks: [
          priority.tuesday,
          `${secondary}: repaso breve de fórmulas, conceptos o procedimientos clave.`,
          hours.tuesdayExtra,
        ],
      },
      {
        label: "Miércoles",
        tasks: [
          presentation.wednesday,
          priority.wednesday,
          hours.wednesdayHistory,
        ],
      },
      {
        label: "Jueves · Examen de Química",
        tasks: [
          "Repaso muy breve antes del examen: nada de temas nuevos.",
          priorityKey === "quimica"
            ? "Después del examen, ya no metas carga pesada de Química: ese tiempo ya no rinde."
            : "Después del examen de Química, pasa el bloque más importante a Matemáticas.",
          priority.thursdayAfter,
        ],
      },
      {
        label: "Viernes · Examen de Matemáticas",
        tasks: [
          "Repaso corto antes del examen: procedimientos clave y errores comunes.",
          hours.fridayHistory,
          "Historia: ordenar apuntes y detectar qué temas requieren lectura más profunda el fin de semana.",
        ],
      },
      {
        label: "Sábado",
        tasks: [
          "Historia: convertir apuntes largos en una guía corta de estudio.",
          "Historia: consolidar línea de tiempo, actores y conexiones entre períodos.",
          priority.weekendReflection,
          hours.weekendLoad,
        ],
      },
      {
        label: "Domingo",
        tasks: [
          "Historia: preguntas de repaso antes del examen del lunes.",
          `Revisar si ${priority.label} realmente quedó resuelta o solo fue aplazada.`,
          "Ajustar el lunes por la mañana según el cansancio acumulado y los pendientes del equipo.",
        ],
      },
    ];
  }

  function buildHumanChecks(priorityKey, presentationKey) {
    const priority = PRIORITY[priorityKey];
    const presentation = PRESENTATION[presentationKey];

    return [
      `Confirmar si ${priority.label} de verdad es la materia más pesada o si el diagnóstico está equivocado.`,
      "Verificar qué temas vienen en cada examen antes de seguir el plan.",
      `Revisar si el estado de la presentación coincide con "${presentation.label.toLowerCase()}".`,
      "Ajustar el miércoles si la presentación consume más tiempo o energía de lo previsto.",
      "Decidir si el fin de semana basta para Historia o si se necesita empezar antes.",
    ];
  }

  function buildPlanHTML(hoursKey, priorityKey, presentationKey) {
    const prompt = buildPrompt(hoursKey, priorityKey, presentationKey);
    const days = buildDays(hoursKey, priorityKey, presentationKey);
    const checks = buildHumanChecks(priorityKey, presentationKey);
    const priority = PRIORITY[priorityKey];
    const hours = HOURS[hoursKey];

    const daysHTML = days
      .map(
        (day) => `
        <div class="sp-day-block">
          <span class="sp-day-label">${day.label}</span>
          <ul class="sp-day-tasks">
            ${day.tasks.map((task) => `<li>${task}</li>`).join("")}
          </ul>
        </div>`
      )
      .join("");

    const checksHTML = checks.map((item) => `<li>${item}</li>`).join("");

    return `
      <div class="sp-output-box">
        <span class="sp-output-kicker">Instrucción simulada</span>
        <p class="sp-output-title">Así se ve una petición mejor contextualizada:</p>
        <p class="sp-prompt-box">${prompt}</p>

        <span class="sp-output-kicker">Borrador semanal generado</span>
        <div class="sp-day-list">${daysHTML}</div>

        <div class="sp-tip-box">
          <span class="sp-tip-label">Criterio de priorización</span>
          ${priority.focus} ${hours.tip} ${priority.tip}
        </div>

        <div class="sp-reflection">
          <span class="sp-reflection-title">Decisiones que la IA no puede tomar por ti</span>
          <ul class="sp-reflection-list">
            ${checksHTML}
          </ul>
        </div>
      </div>`;
  }

  function initLiveStage() {
    const live = document.querySelector("#sp-shell .demo-stage-live");
    if (!live) return;

    live.innerHTML = `
      <div class="sp-selectors">
        <div class="sp-selector-group">
          <span class="sp-selector-label">Horas disponibles</span>
          <select class="sp-selector" id="sp-horas">
            <option value="2">2 horas por tarde</option>
            <option value="3">3 horas por tarde</option>
          </select>
        </div>
        <div class="sp-selector-group">
          <span class="sp-selector-label">Materia más difícil</span>
          <select class="sp-selector" id="sp-prioridad">
            <option value="quimica">Química</option>
            <option value="matematicas">Matemáticas</option>
          </select>
        </div>
        <div class="sp-selector-group" style="flex-direction:row; align-items:flex-end; gap:0.6rem;">
          <div style="flex:1; display:flex; flex-direction:column; gap:0.25rem;">
            <span class="sp-selector-label">Estado de la presentación</span>
            <select class="sp-selector" id="sp-presentacion">
              <option value="ordenar">Solo falta ordenar</option>
              <option value="repartir">Faltan acuerdos del equipo</option>
            </select>
          </div>
          <button class="sp-generate-btn" id="sp-generate">Generar semana →</button>
        </div>
      </div>
      <div id="sp-result"></div>
    `;

    $("sp-generate").addEventListener("click", () => {
      const hoursKey = $("sp-horas").value;
      const priorityKey = $("sp-prioridad").value;
      const presentationKey = $("sp-presentacion").value;
      const priorityLabel = PRIORITY[priorityKey].label;

      setHTML("sp-result", buildPlanHTML(hoursKey, priorityKey, presentationKey));
      setInsights(
        "sp",
        `Borrador semanal para Valentina con ${HOURS[hoursKey].label}, prioridad en ${priorityLabel} y estado de la presentación señalado.`,
        "Un buen plan permite identificar qué tareas tienen mayor peso, qué días presentan saturación y qué decisiones siguen dependiendo del criterio humano."
      );
      setText(
        "sp-status",
        `Semana generada con prioridad en ${priorityLabel}. Revisa si la distribución coincide con la dificultad de la tarea y la energía disponible.`
      );
    });
  }

  const startBtn = $("sp-start");
  const resetBtn = $("sp-reset");
  if (!startBtn) return;

  startBtn.addEventListener("click", () => {
    activateShell("sp");
    initLiveStage();
    setInsights(
      "sp",
      "Selecciona restricciones concretas para ver cómo cambia el borrador semanal.",
      "La IA puede estructurar una primera versión de la semana. La dificultad sigue estando en definir prioridades y determinar qué queda fuera."
    );
    setText("sp-status", "Elige horas, materia crítica y estado de la presentación. Luego genera la semana.");
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      deactivateShell("sp");
      clearLiveStage("sp");
      setInsights("sp", "Inicia el simulador para ver cómo una IA convierte restricciones en un borrador de semana.", "Planificar con IA no es obedecer un calendario generado. Es hacer visibles las prioridades, revisar los compromisos y ajustar el plan a tu semana.");
      setText("sp-status", "Inicia el simulador para construir la semana de Valentina.");
    });
  }
}

/* ------------------------------------------------
   DEMO 2: HERRAMIENTAS SEGÚN TAREA
------------------------------------------------ */

function initHerramientas() {
  const CATEGORIES = [
    {
      label: "🧭 Planificar",
      tools: [
        {
          logo: "✨",
          name: "Gemini",
          maker: "Google",
          for_: "Organizar una semana, distribuit tareas por prioridad o convertir una lista de pendientes en un plan con criterios explícitos.",
          sample:
            "Tengo tres exámenes esta semana y solo dos horas por las tardes. Ayúdame a priorizar según el grado de dificultad y urgencia de cada materia, y explica por qué asignas más tiempo a unas materias que a otras.",
          access: "Gratuito · gemini.google.com y aplicación móvil",
          note: "Funciona bien en el contexto de Google Workspace. Pero recuerda, no sabe cuánta energía te queda ni qué cambios de último momento surgirán.",
        },
        {
          logo: "🤖",
          name: "ChatGPT / Claude",
          maker: "OpenAI / Anthropic",
          for_: "Convertir tus restricciones en un primer borrador de agenda, lista de prioridades o plan semanal.",
          sample:
            "Tengo examen de Química el jueves y de Matemáticas el viernes. Solo puedo estudiar 2 horas por las tardes. Priorízame la semana y explica tus decisiones.",
          access: "Gratuito con límites · Web y aplicación móvil",
          note: "Son útiles para pensar y distribuir el trabajo, pero no conocen tu cansancio acumulado ni tus cambios de último momento.",
        },
        {
          logo: "🪟",
          name: "Microsoft Copilot",
          maker: "Microsoft",
          for_: "Organizar tareas directamente dentro de Word, OneNote o Teams sin salir del flujo del trabajo escolar.",
          sample:
            "Convierte estas notas de la reunión con mi equipo en una lista de tareas pendientes, asigna a los responsables de cada tarea e incluye las fechas límite.",
          access: "Gratuito · copilot.microsoft.com y dentro de Office 365",
          note: "Útil si tu escuela ya usa Microsoft. La integración con Word y OneNote reduce el número de herramientas abiertas al mismo tiempo.",
        },
        {
          logo: "👾",
          name: "Goblin.tools",
          maker: "Goblin",
          for_: "Dividir una tarea que se siente demasiado grande en pasos concretos y manejables.",
          sample:
            "Preparar la presentación de Comunicación para el miércoles",
          access: "100% gratuito, sin registro · goblin.tools",
          note: "Herramienta puntual: no organiza toda tu semana, pero convierte cualquier tarea ambigua en una lista de acciones concretas. Sin necesidad de abrir una cuenta ni establecer una configuración.",
        },
      ],
    },
    {
      label: "📝 Sintetizar",
      tools: [
        {
          logo: "📓",
          name: "NotebookLM",
          maker: "Google",
          for_: "Subir tus propios documentos, apuntes o PDFs y hacerle preguntas directamente al material que tú aportaste.",
          sample:
            "Aquí están mis apuntes de Historia. ¿Cuáles son los cinco temas más importantes según este material?",
          access: "Gratuito · notebooklm.google",
          note: "Solo trabaja con el material que tú subes. No inventa información externa, lo que reduce el riesgo de datos incorrectos y alucinaciones.",
        },
        {
          logo: "🤖",
          name: "ChatGPT / Claude",
          maker: "OpenAI / Anthropic",
          for_: "Reorganizar tus apuntes, detectar ideas repetidas y convertir un texto largo en una guía de estudio más manejable.",
          sample:
            "Aquí están mis apuntes de estequiometría. Reordénalos en conceptos clave, errores comunes y 5 preguntas de repaso sin agregar información nueva.",
          access: "Gratuito con límites · Web y aplicación móvil",
          note: "La calidad sube cuando pegas tu propio material y pides explícitamente que genere preguntas en lugar de responderlas.",
        },
        {
          logo: "📓",
          name: "Notion AI",
          maker: "Notion",
          for_: "Resumir páginas largas y transformar notas dispersas en listas, esquemas o listas de verificación dentro del mismo cuaderno digital.",
          sample:
            "Resume esta página en 5 ideas clave y crea una lista de verificación para el repaso.",
          access: "De pago (~$350/mes) · notion.com",
          note: "Es útil si ya estudias en Notion. Aceptar el resumen de su IA sin compararlo con el material original sigue siendo riesgoso.",
        },
        {
          logo: "🎨",
          name: "Gamma",
          maker: "Gamma",
          for_: "Pasar de notas desordenadas a una estructura visual inicial para exposiciones o esquemas de trabajo.",
          sample:
            "Convierte este resumen en una presentación corta de 6 diapositivas para una tarea de tercer año de preparatoria.",
          access: "Gratuito con límites · gamma.app",
          note: "Sirve para arrancar rápido, pero el igual debes revisar el contenido y corregirlo.",
        },
      ],
    },
    {
      label: "🔍 Investigar con fuentes",
      tools: [
        {
          logo: "🔎",
          name: "Perplexity",
          maker: "Perplexity AI",
          for_: "Obtener una primera respuesta con enlaces cuando todavía no sabes bien por dónde empezar a investigar.",
          sample:
            "¿Qué evidencia hay sobre aprendizaje espaciado? Incluye enlaces para revisar las fuentes.",
          access: "Gratuito con límites · perplexity.ai",
          note: "Te facilita la búsqueda de fuentes para un tema concreto, pero tú tienes que visitar los enlaces y corroborar lo que que se establece en el resumen.",
        },
        {
          logo: "🧬",
          name: "Consensus",
          maker: "Consensus",
          for_: "Buscar literatura científica cuando tu pregunta sí tiene investigación académica acumulada.",
          sample:
            "¿Qué dice la investigación científica sobre el sueño y el rendimiento académico?",
          access: "Gratuito con límites · consensus.app",
          note: "Es más útil con preguntas científicas que con temas de actualidad o cultura general.",
        },
        {
          logo: "📚",
          name: "Google Scholar",
          maker: "Google",
          for_: "Ir directamente a resultados académicos sin una respuesta generativa intermedia.",
          sample:
            "Buscar: aprendizaje espaciado + retención + educación media-superior",
          access: "Gratuito · scholar.google.com",
          note: "De la lista de artículos, debes seleccionar los más pertinentes, leerlos, y citar con el formato adecuado en tu trabajo.",
        },
      ],
    },
  ];

  let activeCategory = 0;

  function renderTools(index) {
    const category = CATEGORIES[index];
    const cards = $("ht-cards");
    if (!cards) return;

    cards.innerHTML = category.tools
      .map(
        (tool) => `
        <div class="ht-card">
          <div class="ht-card-header">
            <span class="ht-card-logo">${tool.logo}</span>
            <div>
              <p class="ht-card-name">${tool.name}</p>
              <p class="ht-card-maker">${tool.maker}</p>
            </div>
          </div>
          <div class="ht-card-row">
            <span class="ht-card-label">Para:</span>
            <span class="ht-card-value">${tool.for_}</span>
          </div>
          <div class="ht-card-row">
            <span class="ht-card-label">Ejemplo:</span>
            <span class="ht-card-value ht-card-sample">"${tool.sample}"</span>
          </div>
          <div class="ht-card-row">
            <span class="ht-card-label">Acceso:</span>
            <span class="ht-card-value">${tool.access}</span>
          </div>
          <div class="ht-card-row">
            <span class="ht-card-label">Nota:</span>
            <span class="ht-card-value">${tool.note}</span>
          </div>
        </div>`
      )
      .join("");
  }

  function renderTabs() {
    const tabs = $("ht-tabs");
    if (!tabs) return;

    tabs.innerHTML = CATEGORIES.map(
      (category, index) =>
        `<button class="ht-tab-btn${index === activeCategory ? " is-active" : ""}" data-idx="${index}">${category.label}</button>`
    ).join("");

    tabs.querySelectorAll(".ht-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCategory = parseInt(btn.dataset.idx, 10);
        tabs.querySelectorAll(".ht-tab-btn").forEach((tab, i) => {
          tab.classList.toggle("is-active", i === activeCategory);
        });
        renderTools(activeCategory);
        setInsights(
          "ht",
          `Mostrando herramientas para ${CATEGORIES[activeCategory].label.toLowerCase()}.`,
          "Planificar, sintetizar e investigar no requieren el mismo tipo de trabajo mental."
        );
      });
    });
  }

  function initLiveStage() {
    const live = document.querySelector("#ht-shell .demo-stage-live");
    if (!live) return;

    live.innerHTML = `
      <div class="ht-tabs" id="ht-tabs"></div>
      <div class="ht-cards" id="ht-cards"></div>
      <p class="ht-footnote">Las funciones, los planes gratuitos y las condiciones de acceso cambian con frecuencia. Antes de recomendar una herramienta, conviene revisar si sigue disponible y qué incluye.</p>
    `;

    renderTabs();
    renderTools(activeCategory);
  }

  const startBtn = $("ht-start");
  const resetBtn = $("ht-reset");
  if (!startBtn) return;

  startBtn.addEventListener("click", () => {
    activateShell("ht");
    initLiveStage();
    setInsights(
      "ht",
      "Apps de IA agrupadas por tipo de tarea: planificar, sintetizar o investigar con fuentes.",
      "Saber elegir la herramienta adecuada también es parte de organizarse mejor."
    );
    setText("ht-status", "Selecciona una categoría para explorar las herramientas disponibles.");
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      deactivateShell("ht");
      activeCategory = 0;
      clearLiveStage("ht");
      setInsights(
        "ht",
        "Inicia el explorador para ver qué app ayuda en cada tarea.",
        "Una app que funciona muy bien para resumir no necesariamente es la mejor para hacer citas. Y una app que encuentra fuentes no necesariamente te ayuda a organizar tu semana."
      );
      setText("ht-status", "Inicia el explorador para comparar apps de acuerdo a cada tarea.");
    });
  }
}

/* ------------------------------------------------
   INIT
------------------------------------------------ */

document.addEventListener("DOMContentLoaded", () => {
  initStudyPlan();
  initHerramientas();
});
