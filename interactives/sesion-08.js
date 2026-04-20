/* ================================================
   SESIÓN 08 — IA para Creatividad: Arte, Música y Diseño
   Dos demos interactivas:
     1. initCreativeIteration() — objetivo → variantes → refinamiento
     2. initCreativeTools()     — explorador de herramientas por categoría
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

/* ------------------------------------------------
   DEMO 1: LABORATORIO DE ITERACIÓN CREATIVA
   Tres objetivos con tres rondas cada uno.
   Cada ronda muestra el prompt, tres variantes
   y el análisis de qué decisión humana empuja
   la siguiente versión.
------------------------------------------------ */

function initCreativeIteration() {
  const OBJETIVO = {
    goal: "Cartel para un festival de cine en San Luis Potosí.",
    audience: "Preparatoria y universidad; difusión en redes y pantallas del campus.",
    constraint: "Debe reflejar la identidad de la ciudad, leerse bien en cualquier celular y no verse tan genérico como un cartel de ciencia ficción cualquiera.",
  };

  const ROUNDS = [
    {
      name: "Ronda 1",
      kicker: "Prompt inicial",
      prompt:
        "Cartel de festival de cine en San Luis Potosí, estilo cinematográfico, iluminación dramática, colores cálidos",
      result: {
        title: "Espectacular, pero intercambiable",
        copy: "Mucho brillo y dramatismo. Podría pertenecer a cualquier festival del mundo. No hay identidad local ni jerarquía visual: el prompt no le dio al modelo información suficiente para diferenciarse.",
        format: "poster",
        tone: "gold",
        img: "../assets/sesion-08/cartel1.png",
      },
      critique:
        "La primera generación se ve apantallante, pero el problema no es técnico: falta identidad local y jerarquía visual.",
      next:
        "Especificar referencias del lugar, formato y uso del cartel.",
    },
    {
      name: "Ronda 2",
      kicker: "Con contexto y lugar",
      prompt:
        "Cartel vertical para festival de cine en San Luis Potosí, texturas de cantera rosa, área de título contundente, jerarquía clara, paleta de atardecer cálido, legible en espacio público",
      result: {
        title: "Más local, mejor jerarquía",
        copy: "La referencia a la cantera rosa y el formato vertical le dan carácter propio. El resultado mejora gracias a la dirección más específica en el prompt.",
        format: "poster",
        tone: "amber",
        img: "../assets/sesion-08/cartel2.png",
      },
      critique:
        "Ahora hay dirección creativa. Ya aparecen contexto, materialidad y un objetivo claro de lectura.",
      next:
        "Priorizar claridad sobre espectacularidad, pensando en el uso práctico de la pieza.",
    },
    {
      name: "Ronda 3",
      kicker: "Con uso y restricciones",
      prompt:
        "Cartel de festival de cine para estudiantes de San Luis Potosí, formato vertical, cantera rosa y luz de farol, título centrado en negrita, espacio negativo generoso, legible desde celular y pantallas del campus",
      result: {
        title: "La más cercana a una propuesta final",
        copy: "Combina identidad, claridad y atmósfera. Ya se siente como la base de un trabajo práctico e intencionado, no solo como imagen llamativa.",
        format: "poster",
        tone: "cobalt",
        img: "../assets/sesion-08/cartel3.png",
      },
      critique:
        "La tercera versión ya traduce mejor el objetivo establecido al inicio. No depende de estética exótica: depende de claridad, lugar y uso.",
      next:
        "Aún falta trabajo humano: tipografía, fechas del evento, exportación de formatos y verificación en contexto.",
    },
  ];

  let activeRound = 0;

  function renderObjetivoCard() {
    setHTML(
      "it-objetivo-card",
      `
        <p class="it-brief-kicker">Objetivo del encargo</p>
        <h5 class="it-brief-title">${OBJETIVO.goal}</h5>
        <div class="it-brief-meta">
          <div><span class="it-meta-label">Público</span><p>${OBJETIVO.audience}</p></div>
          <div><span class="it-meta-label">Restricción</span><p>${OBJETIVO.constraint}</p></div>
        </div>
      `
    );
  }

  function renderRoundTabs() {
    const tabs = $("it-round-tabs");
    if (!tabs) return;

    tabs.innerHTML = ROUNDS.map(
      (round, index) =>
        `<button class="it-round-tab${index === activeRound ? " is-active" : ""}" data-idx="${index}">${round.name}</button>`
    ).join("");

    tabs.querySelectorAll(".it-round-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeRound = parseInt(btn.dataset.idx, 10);
        tabs.querySelectorAll(".it-round-tab").forEach((tab, i) => {
          tab.classList.toggle("is-active", i === activeRound);
        });
        renderRound();
      });
    });
  }

  function variantPreviewInner(format) {
    if (format === "board") {
      return `
        <div class="it-mk-body">
          <div class="it-mk-bars">
            <div class="it-mk-title-bar"></div>
            <div class="it-mk-sub-bar"></div>
            <div class="it-mk-sub-bar short"></div>
            <div class="it-mk-info-dots"><span></span><span></span><span></span></div>
          </div>
          <div class="it-mk-shape"></div>
        </div>`;
    }
    return `
      <div class="it-mk-body">
        <div class="it-mk-shape"></div>
        <div class="it-mk-bars">
          <div class="it-mk-title-bar"></div>
          <div class="it-mk-sub-bar"></div>
          <div class="it-mk-sub-bar short"></div>
        </div>
      </div>`;
  }

  function renderRound() {
    const round = ROUNDS[activeRound];
    const v = round.result;

    setText("it-round-kicker", `${round.name} · ${round.kicker}`);
    setText("it-prompt-box", round.prompt);
    setText("it-critique-copy", round.critique);
    setText("it-next-copy", round.next);

    setHTML(
      "it-variant-grid",
      v.img
        ? `<div class="it-variant-card it-variant-single">
            <img src="${v.img}" alt="${v.title}" class="it-variant-img" onerror="this.style.display='none'">
            <p class="it-variant-title">${v.title}</p>
            <p class="it-variant-copy">${v.copy}</p>
          </div>`
        : `<div class="it-variant-card it-variant-single">
            <div class="it-variant-preview it-format-${v.format} it-tone-${v.tone}">
              <span class="it-variant-badge">Resultado</span>
              ${variantPreviewInner(v.format)}
              <span class="it-variant-mark">${v.title}</span>
            </div>
            <p class="it-variant-title">${v.title}</p>
            <p class="it-variant-copy">${v.copy}</p>
          </div>`
    );

    setInsights(
      "it",
      `${round.name}: ${round.kicker}. Observa cómo cambia la calidad del resultado cuando el objetivo se vuelve más específico.`,
      "La mejora no viene solo de escribir más palabras. Viene de tomar decisiones más claras sobre lugar, uso, público y restricciones prácticas."
    );

    setText(
      "it-status",
      `${round.name} · ${round.kicker}: revisa el resultado y la decisión que determina la siguiente iteración.`
    );
  }

  function initLiveStage() {
    const live = document.querySelector("#it-shell .demo-stage-live");
    if (!live) return;

    live.innerHTML = `
      <div class="it-live">
        <div class="it-brief-panel">
          <div class="it-brief-card" id="it-objetivo-card"></div>
        </div>
        <div class="it-round-tabs" id="it-round-tabs"></div>
        <div class="it-round-panel">
          <span class="it-round-kicker" id="it-round-kicker"></span>
          <div class="it-callout-box">
            <span class="it-panel-label">Prompt de esta ronda</span>
            <p class="it-prompt-box" id="it-prompt-box"></p>
          </div>
          <div class="it-variant-grid" id="it-variant-grid"></div>
          <div class="it-analysis-grid">
            <div class="it-analysis-card">
              <span class="it-panel-label">Qué cambia aquí</span>
              <p id="it-critique-copy"></p>
            </div>
            <div class="it-analysis-card">
              <span class="it-panel-label">Siguiente decisión humana</span>
              <p id="it-next-copy"></p>
            </div>
          </div>
        </div>
        <p class="it-img-note">🎨 Imágenes generadas con <strong>Nano Banana</strong> dentro de <strong>Gemini</strong>.</p>
      </div>
    `;

    renderObjetivoCard();
    renderRoundTabs();
    renderRound();
  }

  const startBtn = $("it-start");
  const resetBtn = $("it-reset");
  if (!startBtn) return;

  startBtn.addEventListener("click", () => {
    activateShell("it");
    initLiveStage();
    setInsights(
      "it",
      "Un objetivo creativo y tres rondas de iteración.",
      "La creatividad con IA es un proceso de dirección y edición."
    );
    setText("it-status", "Recorre las tres rondas para ver cómo mejora el resultado.");
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      deactivateShell("it");
      activeRound = 0;
      setInsights("it", "", "");
      setText("it-status", "");
    });
  }
}

/* ------------------------------------------------
   DEMO 2: EXPLORADOR DE HERRAMIENTAS CREATIVAS
   Tres categorías (Imagen / Música / Diseño)
   con fichas de herramientas representativas.
------------------------------------------------ */

function initCreativeTools() {
  const CATEGORIES = [
    {
      label: "🎨 Imagen",
      tools: [
        {
          logo: "🖼️",
          name: "Midjourney",
          maker: "Midjourney",
          for_: "Generar imágenes estilizadas a partir de prompts de texto",
          sample:
            "Cartel vertical para festival de cine estudiantil en San Luis Potosí, cantera rosa, luz de atardecer, jerarquía tipográfica clara",
          access: "Web",
          free: "freemium",
          note: "Destaca cuando buscas exploración visual rápida y estilos muy marcados.",
        },
        {
          logo: "🔥",
          name: "Adobe Firefly",
          maker: "Adobe",
          for_: "Generar y editar imágenes dentro de flujos de trabajo de diseño",
          sample:
            "Extender fondo de fotografía de producto con luz suave y espacio limpio para texto",
          access: "Web y apps Adobe",
          free: "freemium",
          note: "Más útil para trabajo de diseño aplicado que para arte experimental.",
        },
        {
          logo: "🔮",
          name: "ImageFX",
          maker: "Google (Imagen 3)",
          for_: "Generar imágenes de alta calidad a partir de texto, con control de estilo y composición",
          sample:
            "Portada cuadrada para EP de cumbia electrónica, lluvia nocturna, textura analógica, tono íntimo",
          access: "Web",
          free: "free",
          note: "Más reciente y detallado que DALL·E. Destaca en composición y coherencia visual. Acceso gratuito sin suscripción.",
        },
      ],
    },
    {
      label: "🎵 Música",
      tools: [
        {
          logo: "🎶",
          name: "Suno",
          maker: "Suno",
          for_: "Generar canciones completas con letra, voz y producción",
          sample:
            "Cumbia lenta sobre lluvia en la ciudad, voz masculina íntima, sintetizadores analógicos",
          access: "Web",
          free: "freemium",
          note: "Útil para explorar ideas musicales completas con muy baja barrera de entrada.",
        },
        {
          logo: "🎸",
          name: "Udio",
          maker: "Udio",
          for_: "Componer música con mayor control de tono e instrumentación",
          sample:
            "Bolero melancólico con trompeta, guitarra eléctrica limpia y pulso lento",
          access: "Web",
          free: "freemium",
          note: "Suele ser mejor cuando quieres comparar varias direcciones sonoras para un mismo objetivo.",
        },
        {
          logo: "🎹",
          name: "Blob Opera",
          maker: "Google Arts & Culture",
          for_: "Explorar armonía y estructura vocal de manera intuitiva",
          sample:
            "Mueve las voces para escuchar cómo cambia la armonía en tiempo real",
          access: "Web",
          free: "free",
          note: "No es una herramienta de producción, pero sí una forma muy accesible de experimentar con IA musical.",
        },
      ],
    },
    {
      label: "✏️ Diseño",
      tools: [
        {
          logo: "✨",
          name: "Canva IA",
          maker: "Canva",
          for_: "Crear piezas visuales y adaptarlas a muchos formatos rápidamente",
          sample:
            "Campaña para noche de museo estudiantil, tono institucional juvenil, espacio para agenda",
          access: "Web",
          free: "freemium",
          note: "Muy útil cuando necesitas pasar de idea a piezas publicables en poco tiempo.",
        },
        {
          logo: "🧠",
          name: "Galileo AI",
          maker: "Galileo",
          for_: "Producir conceptos de interfaz a partir de un objetivo en texto",
          sample:
            "Panel de control para app de hábitos de estudio, limpio, claro, con módulos adaptables",
          access: "Web / beta",
          free: "paid",
          note: "Sirve más para explorar direcciones de interfaz que para cerrar un producto listo para desarrollo.",
        },
        {
          logo: "🖌️",
          name: "Generative Fill",
          maker: "Adobe (Photoshop / Firefly)",
          for_: "Editar fotos o composiciones ampliando, limpiando o reemplazando elementos",
          sample:
            "Extender fondo de cartel para adaptarlo a pantalla horizontal sin perder coherencia visual",
          access: "Photoshop / Firefly",
          free: "freemium",
          note: "Buen ejemplo de IA como acelerador de ejecución dentro de un flujo de diseño más amplio.",
        },
      ],
    },
  ];

  let activeCategory = 0;

  function renderTools(index) {
    const category = CATEGORIES[index];
    const cards = $("ct-cards");
    if (!cards) return;

    cards.innerHTML = category.tools
      .map(
        (tool) => `
          <div class="ct-card">
            <div class="ct-card-header">
              <span class="ct-card-logo">${tool.logo}</span>
              <div>
                <p class="ct-card-name">${tool.name}</p>
                <p class="ct-card-maker">${tool.maker}</p>
              </div>
            </div>
            <div class="ct-card-row">
              <span class="ct-card-label">Para:</span>
              <span class="ct-card-value">${tool.for_}</span>
            </div>
            <div class="ct-card-row">
              <span class="ct-card-label">Ejemplo:</span>
              <span class="ct-card-value ct-card-sample">"${tool.sample}"</span>
            </div>
            <div class="ct-card-row">
              <span class="ct-card-label">Acceso:</span>
              <span class="ct-card-value">${tool.access}<span class="ct-card-tag ct-card-tag-${tool.free}">${tool.free === "free" ? "Gratis" : tool.free === "freemium" ? "Freemium" : "De pago"}</span></span>
            </div>
            <div class="ct-card-row">
              <span class="ct-card-label">Nota:</span>
              <span class="ct-card-value">${tool.note}</span>
            </div>
          </div>
        `
      )
      .join("");
  }

  function renderTabs() {
    const tabs = $("ct-tabs");
    if (!tabs) return;

    tabs.innerHTML = CATEGORIES.map(
      (category, index) =>
        `<button class="ct-tab-btn${index === activeCategory ? " is-active" : ""}" data-idx="${index}">${category.label}</button>`
    ).join("");

    tabs.querySelectorAll(".ct-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCategory = parseInt(btn.dataset.idx, 10);
        tabs.querySelectorAll(".ct-tab-btn").forEach((tab, index) => {
          tab.classList.toggle("is-active", index === activeCategory);
        });
        renderTools(activeCategory);
        setInsights(
          "ct",
          `Mostrando herramientas de ${CATEGORIES[activeCategory].label}.`,
          "La herramienta no reemplaza el criterio. Lo importante es en qué momento del proceso creativo te ayuda: ideación, iteración, edición o adaptación."
        );
      });
    });
  }

  function initLiveStage() {
    const live = document.querySelector("#ct-shell .demo-stage-live");
    if (!live) return;

    live.innerHTML = `
      <div class="ct-tabs" id="ct-tabs"></div>
      <div class="ct-cards" id="ct-cards"></div>
      <p class="ct-footnote">Las condiciones de acceso cambian con frecuencia. Verifica disponibilidad y costo antes de usar una app.</p>
    `;

    renderTabs();
    renderTools(activeCategory);
  }

  const startBtn = $("ct-start");
  const resetBtn = $("ct-reset");
  if (!startBtn) return;

  startBtn.addEventListener("click", () => {
    activateShell("ct");
    initLiveStage();
    setInsights(
      "ct",
      "Herramientas agrupadas por tipo de resultado: imagen, música y diseño.",
      "Después de entender el proceso creativo, tiene más sentido comparar herramientas. Antes de eso, solo son nombres de marcas."
    );
    setText("ct-status", "Selecciona una categoría para comparar herramientas.");
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      deactivateShell("ct");
      activeCategory = 0;
      setInsights("ct", "", "");
      setText("ct-status", "");
    });
  }
}

/* ------------------------------------------------
   INIT
------------------------------------------------ */

document.addEventListener("DOMContentLoaded", () => {
  initCreativeIteration();
  initCreativeTools();
});
