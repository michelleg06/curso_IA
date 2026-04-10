/* ================================================
   SESIÓN 04 — IA Generativa: LLMs, Tokens, Prompts
   Tres demos interactivas:
     1. initTokenizer()      — tokenizador visual
     2. initPredictor()      — predictor de siguiente token
     3. initPromptComparator() — prompt vago vs. específico
================================================ */

const $ = (id) => document.getElementById(id);
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function prefersReducedMotion() {
  return motionQuery.matches;
}

function wait(ms) {
  if (prefersReducedMotion()) {
    return sleep(Math.min(90, Math.round(ms * 0.12)));
  }
  return sleep(ms);
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
   DEMO 1: TOKENIZADOR
   Muestra cómo el texto se divide en sub-palabras
------------------------------------------------ */

function initTokenizer() {
  const EXAMPLES = [
    {
      label: "Español: frase corta",
      text: "La inteligencia artificial es fascinante.",
      tokens: [
        "La", " intelig", "encia", " artif", "icial",
        " es", " fasci", "nante", "."
      ],
      note: "9 tokens para 5 palabras en español."
    },
    {
      label: "Inglés: misma idea",
      text: "Artificial intelligence is fascinating.",
      tokens: [
        "Art", "ificial", " intelligence",
        " is", " fascinating", "."
      ],
      note: "6 tokens para la misma frase en inglés."
    },
    {
      label: "Español: pregunta cualquiera",
      text: "¿Cómo puedo usar ChatGPT para mi tarea?",
      tokens: [
        "¿", "C", "ómo", " puedo", " usar",
        " Chat", "GPT", " para", " mi", " tarea", "?"
      ],
      note: "11 tokens: incluso palabras comunes en español se fragmentan."
    }
  ];

  const CHIP_COLORS = [
    { bg: "#dbeafe", border: "#93c5fd", text: "#1d4ed8" },
    { bg: "#dcfce7", border: "#86efac", text: "#166534" },
    { bg: "#fef3c7", border: "#fcd34d", text: "#92400e" },
    { bg: "#fce7f3", border: "#f9a8d4", text: "#9d174d" },
    { bg: "#eef2fd", border: "#a8c2f5", text: "#2b5ab8" },
    { bg: "#d1fae5", border: "#6ee7b7", text: "#065f46" },
  ];

  let currentExample = 0;
  let busy = false;
  let runToken = 0;

  function renderExampleButtons() {
    const wrap = $("tok-example-btns");
    if (!wrap) return;
    wrap.innerHTML = EXAMPLES.map((ex, i) => `
      <button class="tok-example-btn${i === currentExample ? " is-active" : ""}"
              data-idx="${i}">${ex.label}</button>
    `).join("");
    wrap.querySelectorAll(".tok-example-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (busy) return;
        currentExample = parseInt(btn.dataset.idx, 10);
        renderExampleButtons();
        animateTokens();
      });
    });
  }

  async function animateTokens() {
    if (busy) return;
    busy = true;
    const thisRun = ++runToken;
    const ex = EXAMPLES[currentExample];
    const output = $("tok-output");
    const stats = $("tok-stats");
    const orig = $("tok-original");
    if (!output) { busy = false; return; }

    if (orig) orig.textContent = ex.text;
    output.innerHTML = "";
    if (stats) stats.textContent = "";

    const delay = prefersReducedMotion() ? 0 : 90;
    for (let i = 0; i < ex.tokens.length; i++) {
      if (thisRun !== runToken) {
        busy = false;
        return;
      }
      const c = CHIP_COLORS[i % CHIP_COLORS.length];
      const chip = document.createElement("span");
      chip.className = "tok-chip tok-chip-enter";
      chip.textContent = ex.tokens[i];
      chip.style.setProperty("--chip-bg", c.bg);
      chip.style.setProperty("--chip-border", c.border);
      chip.style.setProperty("--chip-text", c.text);
      output.appendChild(chip);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => chip.classList.remove("tok-chip-enter"));
      });
      await sleep(delay);
    }

    if (thisRun !== runToken) {
      busy = false;
      return;
    }

    if (stats) {
      stats.textContent = `${ex.tokens.length} tokens · ${ex.note}`;
    }

    const isSpanish = ex.label.startsWith("Español");
    setInsights(
      "tok",
      `El texto <em>"${ex.text}"</em> se divide en <strong>${ex.tokens.length} fragmentos</strong>. Cada fragmento es un token.`,
      isSpanish
        ? "El español se fragmenta en más tokens que el inglés para frases equivalentes. Esto importa porque los modelos cobran y limitan su uso por tokens, no por palabras."
        : "El inglés suele necesitar menos tokens para transmitir la misma información. Esa diferencia afecta el costo y los límites de contexto en la práctica."
    );
    setText("tok-status", `${ex.tokens.length} tokens en total.`);
    busy = false;
  }

  function resetTok() {
    runToken++;
    busy = false;
    deactivateShell("tok");
    setHTML("tok-example-btns", "");
    setText("tok-original", "");
    setHTML("tok-output", "");
    setText("tok-stats", "");
    setInsights(
      "tok",
      "Tres ejemplos para comparar: una frase corta en español, su equivalente en inglés y una pregunta sencilla.",
      "El modelo no ve palabras completas, sino fragmentos. Eso explica por qué algunas palabras 'raras' o en otros idiomas se rompen en más tokens."
    );
    setText("tok-status", "Selecciona un ejemplo para ver cómo se tokeniza.");
  }

  $("tok-start")?.addEventListener("click", () => {
    activateShell("tok");
    renderExampleButtons();
    animateTokens();
  });
  $("tok-reset")?.addEventListener("click", resetTok);
  resetTok();
}

/* ------------------------------------------------
   DEMO 2: PREDICTOR DE SIGUIENTE TOKEN
   Muestra cómo el modelo asigna probabilidades
   al siguiente token y elige paso a paso
------------------------------------------------ */

function initPredictor() {
  const STEPS = [
    {
      sentence: "Los científicos descubrieron que el cerebro humano",
      candidates: [
        { word: "puede",    pct: 31 },
        { word: "tiene",    pct: 27 },
        { word: "procesa",  pct: 18 },
        { word: "almacena", pct: 14 },
        { word: "necesita", pct: 10 },
      ],
      pick: 0,
    },
    {
      sentence: "Los científicos descubrieron que el cerebro humano puede",
      candidates: [
        { word: "aprender",  pct: 40 },
        { word: "adaptarse", pct: 28 },
        { word: "cambiar",   pct: 17 },
        { word: "generar",   pct:  9 },
        { word: "olvidar",   pct:  6 },
      ],
      pick: 0,
    },
    {
      sentence: "Los científicos descubrieron que el cerebro humano puede aprender",
      candidates: [
        { word: "nuevas", pct: 35 },
        { word: "de",     pct: 29 },
        { word: "a",      pct: 19 },
        { word: "mejor",  pct: 11 },
        { word: "más",    pct:  6 },
      ],
      pick: 0,
    },
    {
      sentence: "Los científicos descubrieron que el cerebro humano puede aprender nuevas",
      candidates: [
        { word: "habilidades", pct: 52 },
        { word: "conexiones",  pct: 22 },
        { word: "cosas",       pct: 14 },
        { word: "formas",      pct:  8 },
        { word: "ideas",       pct:  4 },
      ],
      pick: 0,
    },
  ];

  const FINAL = "Los científicos descubrieron que el cerebro humano puede aprender nuevas habilidades";
  let runToken = 0;
  let running = false;

  async function runPredictor() {
    if (running) return;
    running = true;
    const thisRun = ++runToken;
    activateShell("pred");
    setInsights("pred", "Observa cómo el modelo calcula qué token es más probable.", "Cada barra muestra cuántas veces ese fragmento apareció en contextos parecidos al entrenar el modelo.");
    setText("pred-status", "Calculando…");

    for (let s = 0; s < STEPS.length; s++) {
      if (thisRun !== runToken) {
        running = false;
        return;
      }
      const step = STEPS[s];

      // Mostrar la oración actual
      setHTML("pred-sentence", `<span class="pred-sentence-text">${step.sentence}</span><span class="pred-cursor">▋</span>`);
      setText("pred-status", `Paso ${s + 1} de ${STEPS.length}: eligiendo el siguiente token…`);

      // Renderizar opciones con barras en 0
      const candidatesEl = $("pred-candidates");
      if (candidatesEl) {
        candidatesEl.innerHTML = step.candidates.map((c, i) => `
          <div class="pred-bar-row${i === step.pick ? " pred-bar-winner" : ""}">
            <span class="pred-bar-label">${c.word}</span>
            <div class="pred-bar-track">
              <div class="pred-bar-fill" data-pct="${c.pct}" style="width: 0%"></div>
            </div>
            <span class="pred-bar-pct">${c.pct}%</span>
          </div>
        `).join("");
      }

      await wait(300);

      if (thisRun !== runToken) {
        running = false;
        return;
      }

      // Animar barras
      candidatesEl?.querySelectorAll(".pred-bar-fill").forEach((bar) => {
        const pct = bar.dataset.pct;
        requestAnimationFrame(() => {
          bar.style.transition = `width ${prefersReducedMotion() ? 0 : 600}ms cubic-bezier(.4,0,.2,1)`;
          bar.style.width = pct + "%";
        });
      });

      await wait(prefersReducedMotion() ? 200 : 1400);

      if (thisRun !== runToken) {
        running = false;
        return;
      }

      // Resaltar ganador
      candidatesEl?.querySelectorAll(".pred-bar-row").forEach((row, i) => {
        if (i === step.pick) row.classList.add("pred-bar-selected");
      });
      setText("pred-status", `Token elegido: "${step.candidates[step.pick].word}" (${step.candidates[step.pick].pct}%)`);

      await wait(prefersReducedMotion() ? 200 : 900);
    }

    if (thisRun !== runToken) {
      running = false;
      return;
    }

    // Mostrar resultado final
    setHTML("pred-sentence", `<span class="pred-sentence-text pred-sentence-done">${FINAL}</span>`);
    const candidatesEl = $("pred-candidates");
    if (candidatesEl) {
      candidatesEl.innerHTML = `
        <div class="pred-final-msg">
          La oración completa no nació de un "pensamiento" del modelo, sino de la elección, token por token, de lo más probable en cada paso.
        </div>
      `;
    }
    setText("pred-status", "¡Listo!");
    setInsights(
      "pred",
      `La oración <em>"${FINAL}"</em> se construyó en 4 pasos, eligiendo el token más probable en cada uno.`,
      "Esto explica las alucinaciones: si el modelo nunca vio que '2 + 2 = 5' es falso, puede predecirlo con confianza si estadísticamente encaja en el contexto."
    );
    running = false;
  }

  function resetPredictor() {
    runToken++;
    running = false;
    deactivateShell("pred");
    setHTML("pred-sentence", `<span class="pred-sentence-placeholder">La oración aparecerá aquí token por token…</span>`);
    setHTML("pred-candidates", "");
    setText("pred-status", "Haz clic en «Ver animación» para comenzar.");
    setInsights(
      "pred",
      "4 pasos de predicción, cada uno con 5 opciones y sus probabilidades.",
      "Ojo: el modelo no escribe la oración de un golpe. La construye un fragmento a la vez, evaluando probabilidades en cada paso."
    );
  }

  $("pred-start")?.addEventListener("click", runPredictor);
  $("pred-reset")?.addEventListener("click", resetPredictor);
  resetPredictor();
}

/* ------------------------------------------------
   DEMO 3: COMPARADOR DE PROMPTS
   Vago vs. específico — 3 escenarios intercambiables
------------------------------------------------ */

function initPromptComparator() {
  const SCENARIOS = [
    {
      id: "receta",
      label: "🍳 Receta",
      vague: {
        prompt: "dame una receta",
        response: "¡Claro! Aquí tienes una receta fácil:\n\nPasta con salsa de tomate\n\nIngredientes:\n• Pasta\n• Tomate\n• Ajo\n• Aceite\n• Sal\n\nInstrucciones:\nCocina la pasta según las instrucciones del paquete. Prepara la salsa sofriendo el ajo, agrega el tomate y cocina. Mezcla con la pasta y sirve."
      },
      specific: {
        prompt: "Dame una receta vegetariana para 4 personas que se pueda hacer en menos de 30 minutos con ingredientes fáciles de conseguir en México.",
        response: "Tacos de hongos portobello con rajas de chile poblano\n⏱ 25 min · 4 porciones\n\nIngredientes:\n• 8 tortillas de maíz\n• 400 g hongos portobello en tiras\n• 2 chiles poblanos asados y en rajas\n• 1 cebolla blanca\n• 2 dientes de ajo\n• Queso Oaxaca al gusto\n• Sal, pimienta y aceite\n\nPasos:\n1. Sofríe cebolla y ajo, agrega los hongos.\n2. Incorpora las rajas y sazona.\n3. Calienta las tortillas y sirve con queso derretido encima."
      }
    },
    {
      id: "correo",
      label: "✉️ Correo",
      vague: {
        prompt: "escríbeme un correo para mi maestro",
        response: "Estimado maestro:\n\nLe escribo para comunicarle algo importante sobre mi situación académica. Espero que pueda considerar mi caso con atención.\n\nQuedo a la espera de su respuesta.\n\nAtentamente,\n[Tu nombre]"
      },
      specific: {
        prompt: "Escribe un correo formal pero amigable para pedirle a mi maestro de Química una prórroga de 3 días para entregar el proyecto final. Tuve problemas técnicos con el software de modelado molecular.",
        response: "Estimado Profesor [Apellido]:\n\nEspero que se encuentre bien. Le escribo para solicitar respetuosamente una prórroga de tres días para la entrega del proyecto final de Química.\n\nDurante el fin de semana tuve dificultades técnicas con el software de modelado molecular que impidieron avanzar en la parte experimental. Ya resolví el problema y tengo claro el camino para terminarlo, pero necesito unos días más para hacerlo con la calidad que el trabajo merece.\n\nAgradezco de antemano su comprensión.\n\nAtentamente,\n[Tu nombre]"
      }
    },
    {
      id: "resumen",
      label: "📄 Resumen",
      vague: {
        prompt: "resúmeme este texto",
        response: "El texto habla sobre varios temas importantes relacionados con el medio ambiente y el cambio climático. Menciona datos relevantes sobre emisiones y hace recomendaciones para el futuro. Es un tema muy importante que nos afecta a todos."
      },
      specific: {
        prompt: "Resume este artículo en exactamente 3 puntos clave, máximo 2 líneas cada uno, en lenguaje sencillo para alumnos de preparatoria.",
        response: "1. Las emisiones de CO₂ a nivel global aumentaron 2.3% en 2024, principalmente por el sector industrial y el transporte.\n\n2. México se comprometió a reducir sus emisiones 35% para 2030, lo que requiere una transición parcial hacia energías renovables.\n\n3. Los expertos recomiendan tres acciones individuales: reducir consumo de carne roja, usar transporte público y eficientar el consumo eléctrico en casa."
      }
    }
  ];

  let currentScenario = 0;
  let typewriterLeft = null;
  let typewriterRight = null;

  function stopTypewriters() {
    if (typewriterLeft) { clearInterval(typewriterLeft); typewriterLeft = null; }
    if (typewriterRight) { clearInterval(typewriterRight); typewriterRight = null; }
  }

  function typewrite(el, text, speed, onDone) {
    if (prefersReducedMotion()) { el.textContent = text; if (onDone) onDone(); return null; }
    let i = 0;
    el.textContent = "";
    const id = setInterval(() => {
      el.textContent += text[i];
      i++;
      if (i >= text.length) { clearInterval(id); if (onDone) onDone(); }
    }, speed);
    return id;
  }

  function renderScenario(idx) {
    stopTypewriters();
    const sc = SCENARIOS[idx];

    // Tabs
    const tabs = $("pcomp-tabs");
    if (tabs) {
      tabs.innerHTML = SCENARIOS.map((s, i) => `
        <button class="pcomp-tab${i === idx ? " is-active" : ""}" data-idx="${i}">${s.label}</button>
      `).join("");
      tabs.querySelectorAll(".pcomp-tab").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (!$("pcomp-shell")?.classList.contains("is-active")) return;
          currentScenario = parseInt(btn.dataset.idx, 10);
          renderScenario(currentScenario);
        });
      });
    }

    // Prompts
    const lPrompt = $("pcomp-left-prompt");
    const rPrompt = $("pcomp-right-prompt");
    if (lPrompt) lPrompt.textContent = sc.vague.prompt;
    if (rPrompt) rPrompt.textContent = sc.specific.prompt;

    // Responses (typewriter)
    const lResp = $("pcomp-left-response");
    const rResp = $("pcomp-right-response");

    if (lResp) {
      typewriterLeft = typewrite(lResp, sc.vague.response, prefersReducedMotion() ? 0 : 12, null);
    }
    if (rResp) {
      typewriterRight = typewrite(rResp, sc.specific.response, prefersReducedMotion() ? 0 : 8, null);
    }

    setText("pcomp-status", `Escenario: ${sc.label.replace(/\S+\s/, "")}`);
    setInsights(
      "pcomp",
      `Prompt ambiguo (izquierda) vs. prompt específico (derecha) para el mismo caso: <strong>${sc.label}</strong>.`,
      "Un prompt específico no es 'más largo', es más informativo. Contexto, restricciones y un ejemplo de lo que quieres son las tres variables que mejoran una respuesta."
    );
  }

  function startPcomp() {
    activateShell("pcomp");
    renderScenario(currentScenario);
  }

  function resetPcomp() {
    stopTypewriters();
    deactivateShell("pcomp");
    setInsights(
      "pcomp",
      "Tres escenarios: receta, correo y resumen. Cada uno con el mismo tipo de petición hecha de forma ambigua y de forma específica.",
      "La calidad de la respuesta depende en parte de la calidad de la instrucción."
    );
  }

  $("pcomp-start")?.addEventListener("click", startPcomp);
  $("pcomp-reset")?.addEventListener("click", resetPcomp);
  resetPcomp();
}

/* ------------------------------------------------
   INIT
------------------------------------------------ */

document.addEventListener("DOMContentLoaded", () => {
  initTokenizer();
  initPredictor();
  initPromptComparator();
});
