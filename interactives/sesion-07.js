/* ================================================
   SESIÓN 07 — IA como Tutor de Lenguaje
   Dos demos interactivas:
     1. initReadingDemo()    — prompts de lectura asistida
     2. initPromptLibrary()  — biblioteca de prompts por categoría
================================================ */

const $ = (id) => document.getElementById(id);

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function wait(ms) {
  return sleep(prefersReducedMotion() ? Math.min(60, Math.round(ms * 0.1)) : ms);
}

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

/* ------------------------------------------------
   DEMO 1: PROMPTS DE LECTURA ASISTIDA
   Muestra cómo distintos tipos de prompt producen
   distintas respuestas útiles sobre el mismo texto.
------------------------------------------------ */

function initReadingDemo() {
  const TEXT = `"La fotosíntesis es el proceso mediante el cual los organismos autótrofos, como las plantas clorofílicas, capturan la energía lumínica proveniente del espectro solar y la convierten en energía química almacenada en moléculas de glucosa a través de reacciones de oxidación-reducción que involucran la fotólisis del agua y la reducción del dióxido de carbono mediante el ciclo de Calvin-Benson-Bassham."`;

  const PROMPTS = [
    {
      label: "Simplifica",
      prompt: "Explícame este texto como si tuviera 15 años",
      response:
`La fotosíntesis es el proceso por el que las plantas producen su propio alimento usando la luz del sol.

Puedes imaginarlo así: la planta funciona como una fábrica que toma tres ingredientes — agua del suelo, CO₂ del aire y luz solar — y los transforma en azúcar (glucosa). Esa glucosa es la energía que necesita para crecer y mantenerse viva.

Los animales no podemos hacer esto: necesitamos alimentarnos de otros seres vivos porque no podemos convertir la luz solar en energía directamente.`,
    },
    {
      label: "Resume en puntos",
      prompt: "Dame los 3 puntos más importantes de este texto",
      response:
`1. La fotosíntesis es un proceso que realizan organismos autótrofos, como las plantas.

2. Requiere tres elementos principales: luz solar, agua y dióxido de carbono (CO₂).

3. Como resultado, se produce glucosa, que la planta utiliza como fuente de energía para vivir y crecer.`,
    },
    {
      label: "Preguntas de comprensión",
      prompt: "Genera 3 preguntas sobre este texto para que yo las responda",
      response:
`Responde estas preguntas con tus propias palabras antes de volver al texto:

1. ¿Por qué los animales no pueden realizar la fotosíntesis?

2. ¿Qué tres elementos necesita una planta para llevar a cabo este proceso?

3. ¿Para qué utiliza la planta la glucosa que produce?

Cuando termines, compara tus respuestas con el texto original.`,
    },
  ];

  let activePrompt = null;
  let busy = false;

  function renderResultEmpty() {
    const text = $("rd-result-text");
    const area = $("rd-result-area");
    if (!text || !area) return;
    area.classList.remove("has-content");
    text.textContent = "Elige un tipo de prompt para ver cómo respondería una IA generativa.";
    text.classList.add("is-empty");
    setHTML("rd-result-eyebrow", "");
  }

  async function showResult(idx) {
    if (busy) return;
    busy = true;

    const p = PROMPTS[idx];
    const text = $("rd-result-text");
    const eyebrow = $("rd-result-eyebrow");
    const area = $("rd-result-area");

    // Update button states
    document.querySelectorAll(".rd-prompt-btn").forEach((btn, i) => {
      btn.classList.toggle("is-active", i === idx);
    });

    // Show prompt label
    if (eyebrow) eyebrow.textContent = `Prompt: "${p.prompt}"`;

    // Clear and animate response
    if (text) {
      text.classList.remove("is-empty");
      text.textContent = "";
      area.classList.add("has-content");
    }

    const lines = p.response.split("\n");
    for (const line of lines) {
      if (text) text.textContent += (text.textContent ? "\n" : "") + line;
      await wait(prefersReducedMotion() ? 0 : 90);
    }

    activePrompt = idx;
    busy = false;

    setInsights(
      "rd",
      `Estás viendo cómo el mismo texto puede generar respuestas distintas según el tipo de prompt que uses.`,
      `No es magia: el modelo sigue instrucciones. Un prompt ambiguo produce una respuesta genérica; uno específico te da exactamente lo que necesitas.`
    );
    setText("rd-status", `Mostrando: "${p.label}". Prueba los otros tipos de prompt.`);
  }

  function initLiveStage() {
    const live = document.querySelector("#rd-shell .demo-stage-live");
    if (!live) return;

    live.innerHTML = `
      <span class="rd-text-label">Texto a analizar</span>
      <div class="rd-text-box">${TEXT}</div>
      <div class="rd-prompt-btns" id="rd-prompt-btns"></div>
      <div class="rd-result-area" id="rd-result-area">
        <span class="rd-result-eyebrow" id="rd-result-eyebrow"></span>
        <p class="rd-result-text is-empty" id="rd-result-text">Elige un tipo de prompt para ver cómo respondería una IA generativa.</p>
      </div>
    `;

    const btnWrap = $("rd-prompt-btns");
    if (!btnWrap) return;

    PROMPTS.forEach((p, i) => {
      const btn = document.createElement("button");
      btn.className = "rd-prompt-btn";
      btn.textContent = p.label;
      btn.addEventListener("click", () => showResult(i));
      btnWrap.appendChild(btn);
    });
  }

  const startBtn = $("rd-start");
  const resetBtn = $("rd-reset");

  if (!startBtn) return;

  startBtn.addEventListener("click", async () => {
    activateShell("rd");
    initLiveStage();
    setText("rd-status", "Elige un tipo de prompt para ver cómo responde el modelo.");
    setInsights(
      "rd",
      "Un texto académico y tres tipos de prompt distintos.",
      "El tipo de prompt determina qué tipo de ayuda recibes. Aprender a pedir ayuda es la mitad del trabajo."
    );
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      deactivateShell("rd");
      activePrompt = null;
      busy = false;
      setInsights("rd", "", "");
      setText("rd-status", "");
    });
  }
}

/* ------------------------------------------------
   DEMO 2: BIBLIOTECA DE PROMPTS
   Tres categorías (Lectura / Escritura / Idiomas)
   con ejemplos de prompts y respuestas ilustrativas.
------------------------------------------------ */

function initPromptLibrary() {
  const CATEGORIES = [
    {
      id: "lectura",
      label: "📚 Lectura",
      prompts: [
        {
          prompt: "Explícame este texto como si tuviera 15 años: [pega el texto aquí]",
          use: "Para simplificar párrafos académicos o científicos densos.",
          output:
`Ejemplo de respuesta del modelo:
"En palabras simples, el texto dice que [idea principal en lenguaje claro]. Puedes imaginarlo como [analogía cotidiana]. Lo más importante es entender que [punto clave], sin necesidad de usar todo el vocabulario técnico."`,
        },
        {
          prompt: "¿Cuál es la idea principal de este párrafo? Dame solo un enunciado: [pega el párrafo]",
          use: "Para identificar rápido el argumento central antes de un examen o resumen.",
          output:
`Ejemplo de respuesta del modelo:
"La idea principal es: [una oración concisa que captura el argumento central del párrafo sin parafrasear todo el texto]."`,
        },
        {
          prompt: "Haz 3 preguntas de comprensión sobre este texto para que yo las responda: [pega el texto]",
          use: "Para estudiar de forma activa — responder preguntas fuerza el entendimiento real.",
          output:
`Ejemplo de respuesta del modelo:
"1. ¿Cuál es la causa principal que describe el texto?
 2. ¿Qué consecuencia menciona el autor para [concepto]?
 3. ¿Cómo diferencia el texto entre [concepto A] y [concepto B]?

Responde con tus palabras, sin ver el texto. Luego compara."`,
        },
      ],
    },
    {
      id: "escritura",
      label: "✏️ Escritura",
      prompts: [
        {
          prompt: "Revisa este párrafo y dime qué mejorarías — sin reescribirlo: [pega tu párrafo]",
          use: "Para recibir retroalimentación sin que la IA tome el control de tu trabajo.",
          output:
`Ejemplo de respuesta del modelo:
"El párrafo tiene una idea central clara, pero hay tres cosas que mejorar:
 1. El segundo enunciado es demasiado largo — considera dividirlo en dos.
 2. La transición entre la idea 1 y la idea 2 es brusca; añade una frase de conexión.
 3. El cierre es débil; termina con una afirmación más específica o una implicación concreta."`,
        },
        {
          prompt: "¿El argumento de este texto tiene lógica? ¿Qué le falta? No lo reescribas: [pega tu texto]",
          use: "Para fortalecer el argumento antes de entregar un ensayo.",
          output:
`Ejemplo de respuesta del modelo:
"El argumento tiene una estructura lógica básica, pero le falta evidencia concreta. Afirmas que 'muchos estudios muestran', pero no citas ninguno. Para convencer a un lector escéptico, necesitas al menos un dato específico: un porcentaje, un autor o un ejemplo. La conclusión también llega demasiado rápido."`,
        },
        {
          prompt: "Haz una lista de los errores de gramática o puntuación de este texto. Solo la lista, sin correcciones: [pega tu texto]",
          use: "Para revisar sin que la IA reescriba tu trabajo.",
          output:
`Ejemplo de respuesta del modelo:
"Errores encontrados:
 1. Línea 2: 'mas' debería llevar tilde → 'más'
 2. Línea 4: falta coma después de 'asimismo' al inicio de oración
 3. Línea 6: 'porqué' debería ser 'por qué' (dos palabras con tilde)
 4. Línea 9: punto final faltante al cerrar el párrafo"`,
        },
      ],
    },
    {
      id: "idiomas",
      label: "🌐 Idiomas",
      prompts: [
        {
          prompt: "Practiquemos inglés. Yo escribo, tú me corriges si me equivoco y explicas por qué.",
          use: "Para practicar conversación con un 'tutor' que no se cansa ni te juzga.",
          output:
`Ejemplo de respuesta del modelo:
"¡Claro! Escríbeme en inglés sobre cualquier cosa — tu día, tu opinión sobre algo, lo que sea. Cada vez que cometas un error, te señalaré qué fue, cómo se dice correctamente y por qué. ¿Listo/a? Empieza cuando quieras."`,
        },
        {
          prompt: "¿Cómo se dice '[expresión en español]' en inglés informal? Dame un ejemplo en contexto.",
          use: "Para aprender expresiones naturales, no solo traducciones de diccionario.",
          output:
`Ejemplo de respuesta del modelo:
"La forma más natural en inglés informal sería: 'I have no clue' o simplemente 'No idea.'
 En contexto: 'Hey, do you know when the exam is?' — 'Honestly? No clue.'
 Evita la traducción literal 'I don't have the minimum idea' — no suena natural para un hablante nativo."`,
        },
        {
          prompt: "Hazme 5 preguntas de práctica sobre [tema] en inglés para que yo las responda.",
          use: "Para prepararte para exámenes orales o escritos en otro idioma.",
          output:
`Ejemplo de respuesta del modelo:
"Here are 5 questions about [tema]:
 1. What is the main cause of...?
 2. How did... change over the last decade?
 3. What are the key differences between... and...?
 4. Can you give an example of... in everyday life?
 5. What do you think would happen if...?

Answer each one in English. When you're done, I'll tell you what to improve."`,
        },
      ],
    },
  ];

  let activeCategory = 0;

  function renderCategory(idx) {
    const cat = CATEGORIES[idx];
    const cards = $("pl-cards");
    if (!cards) return;

    cards.innerHTML = cat.prompts
      .map(
        (p, i) => `
      <div class="pl-card" id="pl-card-${idx}-${i}">
        <div class="pl-card-header">
          <div class="pl-card-meta">
            <p class="pl-card-prompt">${p.prompt}</p>
            <p class="pl-card-use">${p.use}</p>
          </div>
          <button class="pl-toggle" data-cat="${idx}" data-idx="${i}">Ver ejemplo</button>
        </div>
        <div class="pl-output" id="pl-output-${idx}-${i}">
          <span class="pl-output-label">Ejemplo de respuesta ilustrativa</span>
          <p class="pl-output-text">${p.output}</p>
        </div>
      </div>`
      )
      .join("");

    // Attach toggle listeners
    cards.querySelectorAll(".pl-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const catIdx = parseInt(btn.dataset.cat, 10);
        const cardIdx = parseInt(btn.dataset.idx, 10);
        const output = $(`pl-output-${catIdx}-${cardIdx}`);
        const card = $(`pl-card-${catIdx}-${cardIdx}`);
        if (!output || !card) return;
        const isOpen = output.classList.toggle("is-open");
        card.classList.toggle("is-open", isOpen);
        btn.textContent = isOpen ? "Ocultar" : "Ver ejemplo";
      });
    });
  }

  function renderTabs() {
    const tabs = $("pl-tabs");
    if (!tabs) return;
    tabs.innerHTML = CATEGORIES.map(
      (cat, i) => `<button class="pl-tab-btn${i === activeCategory ? " is-active" : ""}"
        data-idx="${i}">${cat.label}</button>`
    ).join("");
    tabs.querySelectorAll(".pl-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCategory = parseInt(btn.dataset.idx, 10);
        tabs.querySelectorAll(".pl-tab-btn").forEach((b, i) =>
          b.classList.toggle("is-active", i === activeCategory)
        );
        renderCategory(activeCategory);
        setInsights(
          "pl",
          `Mostrando ${CATEGORIES[activeCategory].label}: 3 prompts listos para copiar y usar.`,
          "El prompt perfecto no existe, el que funciona es el que es específico para tu caso. Adapta estos a tu texto o tarea."
        );
      });
    });
  }

  function initLiveStage() {
    const live = document.querySelector("#pl-shell .demo-stage-live");
    if (!live) return;

    live.innerHTML = `
      <div class="pl-tabs" id="pl-tabs"></div>
      <div class="pl-cards" id="pl-cards"></div>
      <p style="font-size:0.78rem;color:#64748b;margin-top:0.65rem;">
        Copia cualquier prompt, pega tu texto al final y envíalo a ChatGPT, Gemini o Perplexity.
      </p>
    `;

    renderTabs();
    renderCategory(activeCategory);
  }

  const startBtn = $("pl-start");
  const resetBtn = $("pl-reset");

  if (!startBtn) return;

  startBtn.addEventListener("click", () => {
    activateShell("pl");
    initLiveStage();
    setInsights(
      "pl",
      `9 prompts organizados en 3 categorías: Lectura, Escritura e Idiomas.`,
      "La diferencia entre un resultado genérico y uno útil suele ser cómo pides. Estos prompts están diseñados para mantenerte en control."
    );
    setText("pl-status", "Selecciona una categoría y abre cualquier prompt.");
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      deactivateShell("pl");
      activeCategory = 0;
      setInsights("pl", "", "");
      setText("pl-status", "");
    });
  }
}

/* ------------------------------------------------
   INIT
------------------------------------------------ */

document.addEventListener("DOMContentLoaded", () => {
  initReadingDemo();
  initPromptLibrary();
});
