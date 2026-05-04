/* ================================================
   SESION 10 - IA como Tutor Academico
   Dos demos interactivas:
     1. initPromptLab()       -> 4 modos de preguntar
     2. initPromptsMaterias() -> prompts por materia
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
   DEMO 1: LABORATORIO DE PROMPTS
------------------------------------------------ */

function initPromptLab() {
  const MODES = [
    {
      id: "directo",
      label: "⚡ Modo directo",
      prompt: "Resuélveme x² + 5x + 6 = 0",
      response: "x = −2  y  x = −3\n\nVerificación:\n(−2)² + 5(−2) + 6 = 4 − 10 + 6 = 0 ✓\n(−3)² + 5(−3) + 6 = 9 − 15 + 6 = 0 ✓",
      verdict: "riesgo",
      verdictLabel: "❌ Riesgo: recibes la respuesta, no el método",
      note: "Puedes copiar esta respuesta sin entender nada. Si en el examen aparece x² + 7x + 12 = 0, estarás igual de perdida.",
    },
    {
      id: "explicacion",
      label: "📖 Modo explicación",
      prompt: "Explícame cómo resolver ecuaciones cuadráticas paso a paso. Usa x² + 5x + 6 = 0 como ejemplo.",
      response: "Para resolver x² + 5x + 6 = 0 por factorización:\n\n1. Necesitas dos números que:\n   • Se multipliquen y den 6 (término independiente)\n   • Se sumen y den 5 (coeficiente de x)\n\n2. Los números son 2 y 3:\n   2 × 3 = 6 ✓   y   2 + 3 = 5 ✓\n\n3. Reescribe: (x + 2)(x + 3) = 0\n\n4. Para que el producto sea cero, uno de los factores lo debe ser:\n   x + 2 = 0  →  x = −2\n   x + 3 = 0  →  x = −3",
      verdict: "mejor",
      verdictLabel: "✅ Mejor: aprendes el procedimiento",
      note: "Ahora entiendes el método, no solo la respuesta. Puedes aplicarlo a cualquier ecuación cuadrática similar.",
    },
    {
      id: "analogia",
      label: "🧠 Modo analogía",
      prompt: "Explícame intuitivamente qué es una ecuación cuadrática con una analogía del mundo real. Luego muéstrame dónde aparece en x² + 5x + 6 = 0.",
      response: "Imagina que lanzas una pelota hacia arriba.\nSu altura sigue una curva: sube, alcanza un pico y vuelve a caer.\n\nUna ecuación cuadrática como x² + 5x + 6 = 0\nte pregunta: \"¿en qué momentos la pelota\nestaba exactamente al nivel del suelo?\"\n\nLas soluciones x = −2 y x = −3 son esos\ndos instantes de contacto con el piso.\n\nPor eso siempre hay (hasta) dos soluciones:\nla parábola cruza el eje horizontal dos veces.",
      verdict: "ideal",
      verdictLabel: "⭐ Ideal: construyes intuición antes de la mecánica",
      note: "La analogía te da el \"para qué\". Cuando el concepto tiene contexto, el procedimiento es mucho más fácil de recordar y aplicar.",
    },
    {
      id: "socratico",
      label: "❓ Modo socrático",
      prompt: "No me des la respuesta todavía. Quiero entender cómo factorizar x² + 5x + 6 = 0. Hazme preguntas para que llegue yo a descubrirlo.",
      response: "Perfecto. Vamos paso a paso.\n\nPrimera pregunta:\n¿Qué tipo de expresión es x² + 5x + 6?\n¿Has visto antes expresiones con x al cuadrado?\n\n→ Cuando tengas tu respuesta, dímela\n   y continuamos con la siguiente pregunta.",
      verdict: "ideal",
      verdictLabel: "⭐ Ideal: tú llegas a la respuesta, la IA solo guía",
      note: "Este modo requiere más tiempo, pero lo que aprendes así no se olvida. La IA actúa como tutor, no como calculadora.",
    },
  ];

  const SEEING_MAP = {
    directo:
      "La IA resolvió la ecuación en dos líneas. Respuesta correcta, cero comprensión transferida.",
    explicacion:
      "La IA muestra el procedimiento de factorización completo, paso a paso, con el ejemplo del programa.",
    analogia:
      "La IA usa una parábola física para construir intuición antes de explicar el método algebraico.",
    socratico:
      "La IA no da la respuesta: hace preguntas. El estudiante debe pensar para poder continuar.",
  };

  const MEANING_MAP = {
    directo:
      "El modo directo es el más común y el menos útil para aprender. Copias sin entender. En el próximo examen volverás a necesitar la IA.",
    explicacion:
      "El modo explicación transfiere el método, no solo la respuesta. Puedes aplicarlo a problemas similares sin ayuda.",
    analogia:
      "La intuición previa hace que el procedimiento tenga sentido. Es más fácil recordar lo que ya tiene contexto.",
    socratico:
      "El modo socrático obliga a pensar activamente. Requiere más esfuerzo pero produce comprensión duradera.",
  };

  function renderMode(modeId) {
    const mode = MODES.find((m) => m.id === modeId);
    if (!mode) return;

    const live = document.querySelector("#pl-shell .demo-stage-live");
    if (!live) return;

    const display = live.querySelector("#pl-display");
    if (!display) return;

    display.innerHTML = `
      <div class="pl-prompt-box">
        <span class="pl-prompt-kicker">Prompt enviado</span>
        <p class="pl-prompt-text">${mode.prompt}</p>
      </div>
      <div class="pl-response-box">
        <span class="pl-response-kicker">Respuesta simulada de la IA</span>
        <p class="pl-response-text">${mode.response}</p>
      </div>
      <div>
        <span class="pl-verdict pl-verdict-${mode.verdict}">${mode.verdictLabel}</span>
        <p class="pl-verdict-note">${mode.note}</p>
      </div>
    `;

    live.querySelectorAll(".pl-mode-btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.mode === modeId);
    });

    setInsights("pl", SEEING_MAP[modeId], MEANING_MAP[modeId]);
    setText(
      "pl-status",
      `Modo activo: ${mode.label.replace(/^.\s/, "")}. Prueba los otros modos para comparar qué tipo de aprendizaje genera cada uno.`
    );
  }

  function initLiveStage() {
    const live = document.querySelector("#pl-shell .demo-stage-live");
    if (!live) return;

    const btnsHTML = MODES.map(
      (m) =>
        `<button class="pl-mode-btn" data-mode="${m.id}">${m.label}</button>`
    ).join("");

    live.innerHTML = `
      <div class="pl-mode-btns">${btnsHTML}</div>
      <div id="pl-display"></div>
    `;

    live.querySelectorAll(".pl-mode-btn").forEach((btn) => {
      btn.addEventListener("click", () => renderMode(btn.dataset.mode));
    });

    renderMode("directo");
  }

  const startBtn = $("pl-start");
  const resetBtn = $("pl-reset");
  if (!startBtn) return;

  startBtn.addEventListener("click", () => {
    activateShell("pl");
    initLiveStage();
    setInsights(
      "pl",
      "Cuatro maneras de preguntarle a la IA sobre el mismo problema: x² + 5x + 6 = 0.",
      "El mismo problema, cuatro resultados muy distintos. La diferencia la hace cómo preguntas, no la herramienta."
    );
    setText(
      "pl-status",
      "Elige un modo para ver qué tipo de respuesta genera y qué tan útil es para aprender."
    );
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      deactivateShell("pl");
      clearLiveStage("pl");
      setInsights(
        "pl",
        "Inicia el laboratorio para comparar los cuatro modos de preguntar.",
        "La calidad del aprendizaje depende de cómo formulas la pregunta, no solo de qué herramienta usas."
      );
      setText(
        "pl-status",
        "Inicia el laboratorio para explorar los cuatro modos de preguntar."
      );
    });
  }
}

/* ------------------------------------------------
   DEMO 2: PROMPTS POR MATERIA
------------------------------------------------ */

function initPromptsMaterias() {
  const SUBJECTS = [
    {
      label: "📐 Matemáticas",
      examples: [
        {
          type: "bad",
          prompt: "Dame las derivadas",
          why: "Demasiado ambiguo. La IA no sabe qué función, qué contexto ni qué nivel de detalle necesitas. Te dará una lista genérica que no te ayudará a estudiar.",
        },
        {
          type: "good",
          prompt:
            "Explícame intuitivamente qué es la derivada con una analogía del mundo real. Luego muéstrame cómo derivar f(x) = x² paso a paso.",
          why: "Pides intuición primero, luego mecánica. La analogía da contexto; el ejemplo concreto da práctica con un caso específico.",
        },
        {
          type: "good",
          prompt:
            "Soy estudiante de prepa y no entiendo la factorización. Explícame cuándo usarla y dónde puede fallar. No quiero solo pasos, quiero entender el concepto.",
          why: "Le das tu nivel, tu objetivo y le aclaras que no quieres una receta. La IA adapta la explicación y te da más contexto.",
        },
      ],
    },
    {
      label: "🧪 Química y Biología",
      examples: [
        {
          type: "bad",
          prompt: "¿Qué es la fotosíntesis?",
          why: "Obtendrás la definición del libro. Útil para saber qué es, pero no para entender cómo funciona ni por qué importa.",
        },
        {
          type: "good",
          prompt:
            "Soy estudiante de prepa y no entiendo la fotosíntesis. Explícamela como si fuera una fábrica: qué entra, qué procesa y qué produce.",
          why: "La analogía de la fábrica convierte un proceso abstracto en algo con partes concretas y una lógica de causa y efecto clara.",
        },
        {
          type: "good",
          prompt:
            "Tengo que estudiar estequiometría. Explícame la idea central con un ejemplo de cocina o de mezclar materiales. Sin fórmulas todavía.",
          why: "Pides primero intuición cotidiana. Las fórmulas tienen mucho más sentido cuando ya entiendes el concepto que representan.",
        },
      ],
    },
    {
      label: "📜 Historia",
      examples: [
        {
          type: "bad",
          prompt: "Explícame la Revolución Mexicana",
          why: "Sin contexto ni límite, la IA puede darte desde tres líneas hasta diez párrafos sobre cualquier aspecto. No sabes qué esperar ni si sirve para tu examen.",
        },
        {
          type: "good",
          prompt:
            "Soy estudiante de prepa. Explícame en 5 ideas clave por qué estalló la Revolución Mexicana. Quiero causas, no solo cronología.",
          why: "Le das formato (5 ideas), nivel (prepa) y enfoque (causas vs. fechas). Obtienes material directamente procesable para estudiar.",
        },
        {
          type: "good",
          prompt:
            "Tengo estos apuntes sobre el Porfiriato. Reordénalos en: 1) ideas centrales, 2) errores comunes de los estudiantes, 3) tres preguntas de examen posibles. No inventes información nueva.",
          why: "Trabajas con tu propio material. Le pides estructura específica y le prohíbes inventar. Resultado: resumen procesable y fiel a tus apuntes.",
        },
      ],
    },
    {
      label: "⚗️ Física",
      examples: [
        {
          type: "bad",
          prompt: "¿Qué es la aceleración?",
          why: "Recibirás la definición estándar. Si ya la sabes, no aprendes nada nuevo. Si no la entiendes, una definición sola no la va a aclarar.",
        },
        {
          type: "good",
          prompt:
            "Explícame la diferencia entre velocidad y aceleración con ejemplos de la vida cotidiana. Incluye un caso donde se confunden fácilmente.",
          why: "Pides comparación, ejemplos reales y el punto donde falla la intuición. Aprendes el concepto y sus trampas en un solo prompt.",
        },
        {
          type: "good",
          prompt:
            "No entiendo por qué en caída libre la aceleración es constante pero la velocidad cambia. Ayúdame a resolver esta confusión con preguntas, no dándome la respuesta directa.",
          why: "Le explicas exactamente qué no entiendes y pides modo socrático. La IA guía tu razonamiento en lugar de sustituirlo.",
        },
      ],
    },
  ];

  let activeSubject = 0;

  function badgeHTML(type) {
    return type === "bad"
      ? '<span class="pm-ex-badge pm-ex-badge-bad">❌ No ayuda a aprender</span>'
      : '<span class="pm-ex-badge pm-ex-badge-good">✅ Genera comprensión</span>';
  }

  function renderSubject(index) {
    const subject = SUBJECTS[index];
    const cards = $("pm-examples");
    if (!cards) return;

    cards.innerHTML = subject.examples
      .map(
        (ex) => `
      <div class="pm-example-card">
        <div class="pm-ex-header">
          ${badgeHTML(ex.type)}
          <span class="pm-ex-label">${ex.type === "bad" ? "Prompt débil" : "Prompt que enseña"}</span>
        </div>
        <p class="pm-ex-prompt">"${ex.prompt}"</p>
        <p class="pm-ex-why${ex.type === "good" ? " pm-ex-why-good" : ""}">${ex.why}</p>
      </div>`
      )
      .join("");
  }

  function renderTabs() {
    const tabs = $("pm-tabs");
    if (!tabs) return;

    tabs.innerHTML = SUBJECTS.map(
      (s, i) =>
        `<button class="pm-tab-btn${i === activeSubject ? " is-active" : ""}" data-idx="${i}">${s.label}</button>`
    ).join("");

    tabs.querySelectorAll(".pm-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeSubject = parseInt(btn.dataset.idx, 10);
        tabs.querySelectorAll(".pm-tab-btn").forEach((tab, i) => {
          tab.classList.toggle("is-active", i === activeSubject);
        });
        renderSubject(activeSubject);
        setInsights(
          "pm",
          `Prompts para ${SUBJECTS[activeSubject].label.replace(/^.\s/, "")}: lo que no ayuda y lo que sí genera comprensión.`,
          "La técnica es siempre la misma: dar contexto, pedir explicación o analogía, y nunca pedir solo la respuesta."
        );
      });
    });
  }

  function initLiveStage() {
    const live = document.querySelector("#pm-shell .demo-stage-live");
    if (!live) return;

    live.innerHTML = `
      <div class="pm-tabs" id="pm-tabs"></div>
      <div class="pm-examples" id="pm-examples"></div>
    `;

    renderTabs();
    renderSubject(activeSubject);
  }

  const startBtn = $("pm-start");
  const resetBtn = $("pm-reset");
  if (!startBtn) return;

  startBtn.addEventListener("click", () => {
    activateShell("pm");
    initLiveStage();
    setInsights(
      "pm",
      "Prompts organizados por materia: Matemáticas, Química/Bio, Historia y Física.",
      "Los mismos principios aplican en todas las materias: da contexto, pide comprensión, nunca solo la respuesta."
    );
    setText(
      "pm-status",
      "Selecciona una materia para ver ejemplos de prompts débiles y prompts que sí enseñan."
    );
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      deactivateShell("pm");
      activeSubject = 0;
      clearLiveStage("pm");
      setInsights(
        "pm",
        "Inicia el explorador para ver ejemplos de prompts por materia.",
        "Un buen prompt de aprendizaje siempre incluye: quién eres, qué no entiendes y qué tipo de explicación quieres."
      );
      setText(
        "pm-status",
        "Inicia el explorador para comparar prompts por materia."
      );
    });
  }
}

/* ------------------------------------------------
   INIT
------------------------------------------------ */

document.addEventListener("DOMContentLoaded", () => {
  initPromptLab();
  initPromptsMaterias();
});
