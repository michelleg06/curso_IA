import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";

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

function motionDuration(ms) {
  return prefersReducedMotion() ? 0 : ms;
}

function setText(id, text) {
  const el = $(id);
  if (el) {
    el.textContent = text;
  }
}

function setHTML(id, html) {
  const el = $(id);
  if (el) {
    el.innerHTML = html;
  }
}

function setInsights(prefix, seeing, meaning) {
  setHTML(`${prefix}-seeing`, seeing);
  setHTML(`${prefix}-meaning`, meaning);
}

function activateShell(prefix) {
  const shell = $(`${prefix}-shell`);
  const start = $(`${prefix}-start`);
  const reset = $(`${prefix}-reset`);
  if (shell) shell.classList.add("is-active");
  if (start) start.disabled = true;
  if (reset) reset.disabled = false;
}

function deactivateShell(prefix) {
  const shell = $(`${prefix}-shell`);
  const start = $(`${prefix}-start`);
  const reset = $(`${prefix}-reset`);
  if (shell) shell.classList.remove("is-active");
  if (start) start.disabled = false;
  if (reset) reset.disabled = true;
}

function getHostWidth(targetId, fallback, padding = 24) {
  const host = $(targetId);
  if (!host) return fallback;
  const width = host.clientWidth || host.parentElement?.clientWidth || fallback;
  return Math.max(280, Math.min(fallback, Math.round(width - padding)));
}

function replacePlot(targetId, plot) {
  const host = $(targetId);
  if (!host) return;
  plot.style.maxWidth = "100%";
  plot.style.height = "auto";
  plot.style.display = "block";
  host.replaceChildren(plot);
}

function setupLogoFallback(root) {
  root.querySelectorAll("img[data-logo]").forEach((img) => {
    if (img.dataset.bound === "true") return;
    img.dataset.bound = "true";
    img.addEventListener("error", () => {
      img.closest(".app-tour-logo")?.classList.add("has-fallback");
    });
  });
}

function initConceptDemo() {
  const info = {
    ia: {
      tone: "ia",
      eyebrow: "Campo más amplio",
      title: "Inteligencia Artificial",
      body:
        "Incluye cualquier técnica que haga que un sistema resuelva tareas asociadas con inteligencia humana: seguir reglas, planear, reconocer patrones o tomar decisiones.",
      chips: ["Sistemas expertos", "Ajedrez programado", "Asistentes virtuales"],
      seeing:
        "La capa exterior contiene a las demás. IA es el paraguas general: no todo lo que está aquí aprende de datos.",
      meaning:
        "Este nivel nos recuerda que la IA no es solamente machine learning; es decir, aprendizaje basado en datos. También puede incluir reglas explícitas, búsqueda y lógica."
    },
    ml: {
      tone: "ml",
      eyebrow: "Subcampo de IA",
      title: "Machine Learning",
      body:
        "Aquí el sistema aprende patrones a partir de ejemplos en vez de depender solo de reglas escritas por humanos.",
      chips: ["Filtro de spam", "Predicción de tráfico", "Recomendadores", "Detección de fraude"],
      seeing:
        "La capa media representa los sistemas que aprenden a partir de (grandes) datos. Sigue siendo inteligencia artificial, pero depende de un entrenamiento riguroso basado en datos.",
      meaning:
        "Cuando hablamos de la “IA” en una app cotidiana, muchas veces en realidad nos referimos al machine learning."
    },
    dl: {
      tone: "dl",
      eyebrow: "Subcampo de ML",
      title: "Deep Learning",
      body:
        "Usa redes neuronales con muchas capas para aprender representaciones complejas de texto, imagen, audio y video.",
      chips: ["ChatGPT", "Reconocimiento facial", "DALL-E", "Transcripción de voz"],
      seeing:
        "La capa más interna es la más específica: redes profundas que aprenden representaciones cada vez más abstractas.",
      meaning:
        "El Deep learning - o aprendizaje profundo - explica gran parte de los avances tecnológicos recientes, pero sigue siendo solo una parte del machine learning."
    }
  };

  function renderPanel(key) {
    const item = info[key];
    const panel = $("concept-panel");
    if (!panel) return;
    panel.dataset.tone = item.tone;
    panel.innerHTML = `
      <div class="concept-panel-eyebrow">${item.eyebrow}</div>
      <h4 class="concept-panel-title">${item.title}</h4>
      <p class="concept-panel-body">${item.body}</p>
      <div class="concept-panel-label">Ejemplos cotidianos</div>
      <div class="concept-panel-chips">
        ${item.chips.map((chip) => `<span class="concept-chip">${chip}</span>`).join("")}
      </div>
    `;
    setText("concept-status", `${item.title}`);
    setInsights("concept", item.seeing, item.meaning);
  }

  function setActive(key) {
    document.querySelectorAll(".concept-layer").forEach((layer) => {
      const active = layer.dataset.ring === key;
      layer.classList.toggle("is-active", active);
      layer.setAttribute("aria-pressed", active ? "true" : "false");
    });
    renderPanel(key);
  }

  function start() {
    activateShell("concept");
    setActive("ia");
  }

  document.querySelectorAll(".concept-layer").forEach((layer) => {
    layer.addEventListener("click", () => {
      if (!$("concept-shell")?.classList.contains("is-active")) return;
      setActive(layer.dataset.ring);
    });
  });

  $("concept-reset")?.addEventListener("click", start);
  start();
}

function initAppTour() {
  const apps = [
    {
      id: "tiktok",
      name: "TikTok",
      short: "Ordena videos según señales de atención.",
      aiFamily: "IA - Machine Learning",
      logo: "https://cdn.simpleicons.org/tiktok/FFFFFF",
      logoBg: "linear-gradient(135deg, #111111 0%, #25f4ee 18%, #111111 52%, #fe2c55 100%)",
      logoBorder: "rgba(17, 17, 17, 0.18)",
      fallbackBg: "linear-gradient(135deg, #111111 0%, #25f4ee 18%, #111111 52%, #fe2c55 100%)",
      fallbackColor: "#ffffff",
      fallback: "TT",
      kind: "Recomendación",
      aiType: "Ranking + modelos de secuencia",
      detail:
        "Cada interacción funciona como una señal: tiempo de visualización, repetición, compartir, deslizar rápido o detenerse. El sistema usa esas señales para ordenar candidatos antes de mostrar el siguiente video.",
      cues: ["tiempo de vista", "volver a ver", "compartidos", "tasa de omisión"],
      seeing:
        "Una app centrada en feed (Para ti) donde la IA decide qué video aparece primero.",
      meaning:
        "No se trata de una recomendación aislada, sino de un problema continuo de ranking (categorización)."
    },
    {
      id: "spotify",
      name: "Spotify",
      short: "Combina audio, historial y comportamiento colectivo.",
      aiFamily: "IA - Machine Learning",
      logo: "https://cdn.simpleicons.org/spotify/FFFFFF",
      logoBg: "#1db954",
      logoBorder: "rgba(29, 185, 84, 0.28)",
      fallbackBg: "#1db954",
      fallbackColor: "#ffffff",
      fallback: "SP",
      kind: "Descubrimiento musical",
      aiType: "Análisis de audio + filtrado colaborativo",
      detail:
        "Spotify compara atributos del audio y también observa qué escuchan personas con gustos similares. Así construye listas como Discover Weekly o recomendaciones automáticas entre canciones.",
      cues: ["tempo", "energía", "coincidencia de usuarios", "hábitos de escucha"],
      seeing:
        "Una plataforma musical donde cada canción puede sugerir la siguiente sin intervención humana directa.",
      meaning:
        "La recomendación mezcla contenido y comportamiento: lo que suena parecido y lo que suele gustar al mismo tiempo."
    },
    {
      id: "maps",
      name: "Google Maps",
      short: "Predice tráfico y evalúa rutas en tiempo real.",
      aiFamily: "IA - Machine Learning",
      logo: "../assets/google-maps-pin.svg",
      logoBg: "linear-gradient(135deg, #ffffff 0%, #eef6ff 100%)",
      logoBorder: "rgba(66, 133, 244, 0.24)",
      fallbackBg: "linear-gradient(135deg, #dbeafe 0%, #dcfce7 100%)",
      fallbackColor: "#2563eb",
      fallback: "GM",
      kind: "Predicción",
      aiType: "Series temporales + optimización",
      detail:
        "El tiempo estimado de llegada no es una certeza: es una predicción basada en GPS, patrones históricos, incidentes actuales y modelos que ajustan el tráfico esperado por zona y horario.",
      cues: ["GPS", "histórico por hora", "incidentes", "ETA"],
      seeing:
        "Una app de navegación donde se hace una predicción de lo que pasará en una ruta establecida en un mapa digital.",
      meaning:
        "La IA aquí anticipa condiciones futuras para ayudarte a decidir en el instante."
    },
    {
      id: "instagram",
      name: "Instagram",
      short: "Detecta (landmarks) puntos faciales en tiempo real.",
      aiFamily: "IA - Deep Learning",
      logo: "https://cdn.simpleicons.org/instagram/FFFFFF",
      logoBg: "linear-gradient(135deg, #f58529 0%, #dd2a7b 50%, #8134af 100%)",
      logoBorder: "rgba(221, 42, 123, 0.24)",
      fallbackBg: "linear-gradient(135deg, #f58529 0%, #dd2a7b 50%, #8134af 100%)",
      fallbackColor: "#ffffff",
      fallback: "IG",
      kind: "Visión por computadora",
      aiType: "Redes convolucionales",
      detail:
        "Los filtros detectan puntos concretos del rostro para ubicar ojos, nariz, mejillas o boca cuadro por cuadro. Esa detección ocurre en milisegundos y permite superponer efectos con precisión.",
      cues: ["landmarks", "detección facial", "seguimiento", "render en vivo"],
      seeing:
        "Una cámara social donde el filtro parece decorativo, pero debajo hay un modelo de visión muy complejo.",
      meaning:
        "El sistema estima patrones visuales y posiciones en una imagen."
    },
    {
      id: "gmail",
      name: "Gmail",
      short: "Clasifica correos útiles, sospechosos o spam.",
      aiFamily: "IA - Machine Learning",
      logo: "../assets/gmail-icon-2020.svg",
      logoBg: "linear-gradient(135deg, #ffffff 0%, #fff7f7 100%)",
      logoBorder: "rgba(234, 67, 53, 0.22)",
      fallbackBg: "#fef2f2",
      fallbackColor: "#b91c1c",
      fallback: "GM",
      kind: "Clasificación de texto",
      aiType: "Modelos supervisados de texto",
      detail:
        "Cada mensaje se evalúa con señales como remitente, vocabulario, enlaces, formato y patrones históricos. El objetivo es separar correos legítimos de mensajes no deseados antes de que lleguen a tu atención.",
      cues: ["texto", "remitente", "enlaces", "retroalimentación"],
      seeing:
        "Una bandeja de entrada donde muchas decisiones ya fueron tomadas antes de que abras el correo.",
      meaning:
        "Es un problema clásico de clasificación: decidir a qué categoría pertenece cada mensaje."
    },
    {
      id: "ride",
      name: "Uber",
      short: "Ajusta precio, oferta y tiempo estimado.",
      aiFamily: "IA - Machine Learning",
      logo: "https://cdn.simpleicons.org/uber/FFFFFF",
      logoBg: "#111111",
      logoBorder: "rgba(15, 23, 42, 0.24)",
      fallbackBg: "#111111",
      fallbackColor: "#ffffff",
      fallback: "UB",
      kind: "Optimización dinámica",
      aiType: "Predicción geoespacial + pricing",
      detail:
        "Uber ajusta precios y tiempos en tiempo real usando demanda local, disponibilidad de conductores, clima, zona y eventos locales. La IA no solo estima cuánto tardará el viaje: también decide cuánto cuesta en ese momento.",
      cues: ["demanda", "conductores", "clima", "precio dinámico"],
      seeing:
        "Una app de movilidad donde la cifra que ves cambia según el contexto de la ciudad.",
      meaning:
        "Aquí la IA combina predicción y optimización para equilibrar mercado y logística."
    }
  ];

  let activeApp = apps[0];

  function detailMarkup(app) {
    return `
      <div class="app-tour-family-pill">${app.aiFamily}</div>
      <div class="app-tour-detail-top">
        <p class="app-tour-detail-kicker">${app.kind}</p>
        <span class="app-tour-type-pill">${app.aiType}</span>
      </div>
      <h4 class="app-tour-detail-title">${app.name}</h4>
      <p class="app-tour-detail-body">${app.detail}</p>
      <div class="app-tour-chip-row">
        ${app.cues.map((cue) => `<span class="app-tour-chip">${cue}</span>`).join("")}
      </div>
    `;
  }

  function renderCards() {
    const list = $("app-tour-list");
    if (!list) return;
    list.innerHTML = apps
      .map(
        (app) => `
          <button type="button" class="app-tour-card${app.id === activeApp.id ? " is-active" : ""}" data-app="${app.id}" aria-pressed="${app.id === activeApp.id ? "true" : "false"}">
            <div class="app-tour-card-head">
              <span
                class="app-tour-logo"
                style="--logo-bg:${app.logoBg}; --logo-border:${app.logoBorder}; --logo-fallback-bg:${app.fallbackBg}; --logo-fallback-color:${app.fallbackColor};"
              >
                <img data-logo src="${app.logo}" alt="${app.name}">
                <span class="app-tour-logo-fallback" aria-hidden="true">${app.fallback}</span>
              </span>
              <span class="app-tour-card-name">${app.name}</span>
            </div>
            <span class="app-tour-card-desc">${app.short}</span>
          </button>
        `
      )
      .join("");

    setupLogoFallback(list);
    list.querySelectorAll(".app-tour-card").forEach((card) => {
      card.addEventListener("click", () => {
        activeApp = apps.find((app) => app.id === card.dataset.app) || apps[0];
        renderCards();
        renderDetail();
      });
    });
  }

  function renderDetail() {
    setHTML("app-tour-detail", detailMarkup(activeApp));
    setText("apps-status", `${activeApp.name}`);
    setInsights("apps", activeApp.seeing, activeApp.meaning);
    setupLogoFallback(document);
  }

  function start() {
    activateShell("apps");
    renderCards();
    renderDetail();
  }

  $("apps-reset")?.addEventListener("click", () => { activeApp = apps[0]; start(); });
  start();
}

function initTikTokDemo() {
  const data = [
    {
      label: "Memes de fútbol",
      emoji: "⚽",
      creator: "@golazo_diario",
      bg: "linear-gradient(180deg, #172554 0%, #0f172a 100%)",
      signals: [
        { key: "Tiempo de visualización", value: 61 },
        { key: "Repeticiones", value: 38 },
        { key: "Compartidos", value: 22 }
      ]
    },
    {
      label: "Tutorial de cocina",
      emoji: "🍳",
      creator: "@cocina_rapida",
      bg: "linear-gradient(180deg, #0f766e 0%, #111827 100%)",
      signals: [
        { key: "Tiempo de visualización", value: 44 },
        { key: "Repeticiones", value: 12 },
        { key: "Compartidos", value: 9 }
      ]
    },
    {
      label: "Baile viral",
      emoji: "💃",
      creator: "@trend_hub",
      bg: "linear-gradient(180deg, #831843 0%, #111827 100%)",
      signals: [
        { key: "Tiempo de visualización", value: 74 },
        { key: "Repeticiones", value: 67 },
        { key: "Compartidos", value: 31 }
      ]
    },
    {
      label: "Resumen de noticias",
      emoji: "📰",
      creator: "@hoy_60s",
      bg: "linear-gradient(180deg, #1e3a8a 0%, #111827 100%)",
      signals: [
        { key: "Tiempo de visualización", value: 36 },
        { key: "Repeticiones", value: 8 },
        { key: "Compartidos", value: 11 }
      ]
    }
  ].map((item) => ({
    ...item,
    score: Math.round(item.signals[0].value * 0.55 + item.signals[1].value * 0.3 + item.signals[2].value * 0.15)
  }));

  let runId = 0;

  function renderCards() {
    const list = d3.select("#tt-card-list");
    const cards = list.selectAll(".tt-card").data(data, (d) => d.label);

    const enter = cards
      .enter()
      .append("div")
      .attr("class", "tt-card")
      .html(
        (d) => `
          <div class="tt-card-head">
            <div class="tt-card-title">
              <span class="tt-card-emoji">${d.emoji}</span>
              <div>
                <div>${d.label}</div>
                <div class="tt-card-meta">${d.creator}</div>
              </div>
            </div>
            <span class="tt-score-pill">0 pts</span>
          </div>
          <div class="tt-signal-list-inner">
            ${d.signals
              .map(
                (signal) => `
                  <div class="tt-signal-row" data-signal="${signal.key}">
                    <span>${signal.key}</span>
                    <div class="tt-signal-track"><div class="tt-signal-fill"></div></div>
                    <strong>0%</strong>
                  </div>
                `
              )
              .join("")}
          </div>
        `
      );

    cards.merge(enter).classed("is-winner", false).style("opacity", 1);
    list.selectAll(".tt-signal-fill").style("width", "0%");
    list.selectAll(".tt-signal-row strong").text("0%");
    list.selectAll(".tt-score-pill").text("0 pts");
  }

  function resetPhone() {
    const video = $("tt-phone-video");
    const caption = $("tt-phone-caption");
    if (video) {
      video.style.background =
        "radial-gradient(circle at top, rgba(34,211,238,0.18), transparent 28%), linear-gradient(180deg, #0f172a 0%, #111827 100%)";
      video.innerHTML = '<div class="tt-phone-placeholder">Esperando la decisión del algoritmo...</div>';
    }
    if (caption) {
      caption.innerHTML = "@algoritmo · todavía no hay una elección";
    }
  }

  function resetPreview() {
    runId += 1;
    d3.select("#tt-card-list").selectAll("*").interrupt();
    deactivateShell("tt");
    renderCards();
    resetPhone();
    setText("tt-status", "Haz clic en “Ver animación”.");
    setInsights(
      "tt",
      "Una bandeja de candidatos esperando ser evaluados. El teléfono sigue vacío porque TikTok todavía no ha elegido qué mostrar primero.",
      "Un sistema de recomendación no empieza con un solo video. Primero ordena varias opciones según señales de comportamiento."
    );
  }

  async function play() {
    const token = ++runId;
    activateShell("tt");
    renderCards();
    resetPhone();

    setText("tt-status", "Paso 1 — El modelo compara señales de comportamiento para cada video candidato.");
    setInsights(
      "tt",
      "Cada tarjeta representa un video posible. Las barras resumen señales simplificadas: cuánto te quedas, si repites y si compartes.",
      "TikTok no “te lee la mente”. Usa señales observables para estimar qué contenido tiene más probabilidad de retener tu atención."
    );

    const cards = d3.select("#tt-card-list").selectAll(".tt-card").data(data);
    cards.each(function (datum, cardIndex) {
      const card = d3.select(this);
      datum.signals.forEach((signal, signalIndex) => {
        const row = card.selectAll(".tt-signal-row").filter((_d, i, nodes) => nodes[i].dataset.signal === signal.key);
        if (prefersReducedMotion()) {
          row.select(".tt-signal-fill").style("width", `${signal.value}%`);
          row.select("strong").text(`${signal.value}%`);
        } else {
          row
            .select(".tt-signal-fill")
            .transition()
            .delay(cardIndex * 140 + signalIndex * 180)
            .duration(motionDuration(680))
            .ease(d3.easeCubicOut)
            .style("width", `${signal.value}%`);
          row
            .select("strong")
            .transition()
            .delay(cardIndex * 140 + signalIndex * 180)
            .duration(motionDuration(680))
            .tween("text", function () {
              const node = this;
              const interpolate = d3.interpolateNumber(0, signal.value);
              return (t) => {
                node.textContent = `${Math.round(interpolate(t))}%`;
              };
            });
        }
      });

      if (prefersReducedMotion()) {
        card.select(".tt-score-pill").text(`${datum.score} pts`);
      } else {
        card
          .select(".tt-score-pill")
          .transition()
          .delay(cardIndex * 180 + 240)
          .duration(motionDuration(760))
          .tween("text", function () {
            const node = this;
            const interpolate = d3.interpolateNumber(0, datum.score);
            return (t) => {
              node.textContent = `${Math.round(interpolate(t))} pts`;
            };
          });
      }
    });

    await wait(2000);
    if (token !== runId) return;

    const winner = data.reduce((best, item) => (item.score > best.score ? item : best), data[0]);
    d3.select("#tt-card-list")
      .selectAll(".tt-card")
      .classed("is-winner", (d) => d.label === winner.label)
      .style("opacity", (d) => (d.label === winner.label ? 1 : 0.58));

    setText("tt-status", "Paso 2 — El sistema ordena los candidatos y elige el de mayor puntuación.");
    setInsights(
      "tt",
      "Ahora solo queda un ganador claro: el video con la puntuación más alta según las señales anteriores.",
      "La primera pieza del feed es una decisión de ranking. El modelo estima relevancia y coloca arriba lo que cree que maximizará tu atención."
    );

    await wait(950);
    if (token !== runId) return;

    const video = $("tt-phone-video");
    const caption = $("tt-phone-caption");
    if (video) {
      video.style.background = winner.bg;
      video.innerHTML = `<div class="tt-phone-emoji">${winner.emoji}</div>`;
    }
    if (caption) {
      caption.innerHTML = `${winner.creator} · este video quedó arriba porque obtuvo la mayor puntuación`;
    }

    setText("tt-status", `Resultado — “${winner.label}” queda primero con ${winner.score} puntos estimados.`);
    setInsights(
      "tt",
      "La maqueta del teléfono conserva un contexto familiar para el estudiante, pero el resto del sistema muestra el ranking detrás de esa interfaz.",
      "Ese es el punto medio: mantener el “Para ti” como referencia visual, pero enseñar explícitamente que detrás hay un proceso de puntuación y ordenamiento."
    );
  }

  renderCards();
  resetPhone();
  $("tt-start")?.addEventListener("click", play);
  $("tt-reset")?.addEventListener("click", resetPreview);
  resetPreview();
}

function initRegressionDemo() {
  const students = [
    { name: "Ana", x: 1, y: 55 },
    { name: "Carlos", x: 2, y: 60 },
    { name: "María", x: 3, y: 65 },
    { name: "Diego", x: 4, y: 72 },
    { name: "Sofía", x: 5, y: 75 },
    { name: "Luis", x: 6, y: 82 },
    { name: "Fernanda", x: 7, y: 88 },
    { name: "Emilio", x: 8, y: 90 }
  ];
  const learnedSlope = 5.23;
  const learnedIntercept = 49.86;
  const startSlope = 3.4;
  const startIntercept = 57;
  let runId = 0;
  let currentSlope = startSlope;
  let currentIntercept = startIntercept;
  let residualsVisible = false;
  let predictionX = 5;
  let predictionVisible = false;
  let mode = "preview";
  let controlsLocked = false;
  let triangleVisible = false;
  let hasInteracted = false;

  function meanAbsoluteError(slopeValue, interceptValue) {
    return d3.mean(students, (student) => Math.abs(student.y - (slopeValue * student.x + interceptValue)));
  }

  function feedbackLabel(error) {
    if (error < 3.2) return "Casi perfecto";
    if (error < 5.5) return "Vas muy cerca";
    if (error < 8.5) return "Vas cerca";
    return "Sigue ajustando";
  }

  function slopeTriangle(slopeValue, interceptValue) {
    const x0 = 2;
    const x1 = 3;
    const y0 = slopeValue * x0 + interceptValue;
    const y1 = slopeValue * x1 + interceptValue;
    return {
      segments: [
        { x1: x0, y1: y0, x2: x1, y2: y0 },
        { x1, y1: y0, x2: x1, y2: y1 }
      ],
      labels: [
        { x: (x0 + x1) / 2, y: y0 - 2.1, text: "+1 h" },
        { x: x1 + 0.58, y: (y0 + y1) / 2, text: `+${slopeValue.toFixed(1)}` }
      ]
    };
  }

  function regressionPlot() {
    const lineColor = mode === "machine" || mode === "fitting" ? "#2563eb" : "#0ea5e9";
    const lineData = d3.range(0, 9.1, 0.25).map((x) => ({ x, y: currentSlope * x + currentIntercept }));
    const residuals = students.map((point) => ({
      x1: point.x,
      y1: point.y,
      x2: point.x,
      y2: currentSlope * point.x + currentIntercept
    }));
    const prediction = predictionVisible ? [{ x: predictionX, y: currentSlope * predictionX + currentIntercept }] : [];
    const guides =
      !predictionVisible
        ? []
        : [
            { x1: predictionX, y1: 40, x2: predictionX, y2: currentSlope * predictionX + currentIntercept },
            { x1: 0, y1: currentSlope * predictionX + currentIntercept, x2: predictionX, y2: currentSlope * predictionX + currentIntercept }
          ];
    const triangle = slopeTriangle(currentSlope, currentIntercept);

    return Plot.plot({
      width: getHostWidth("lr-plot", 420),
      height: 300,
      marginTop: 18,
      marginRight: 18,
      marginBottom: 48,
      marginLeft: 48,
      style: {
        background: "transparent",
        fontFamily: "system-ui, sans-serif",
        color: "#1e293b"
      },
      x: { domain: [0, 9], label: "Horas de estudio", grid: true, tickFormat: (d) => `${d}` },
      y: { domain: [40, 100], label: "Calificación", grid: true },
      marks: [
        Plot.ruleY([40, 50, 60, 70, 80, 90, 100], { stroke: "#e2e8f0" }),
        Plot.ruleX([1, 2, 3, 4, 5, 6, 7, 8], { stroke: "#f1f5f9" }),
        residualsVisible && residuals.length
          ? Plot.link(residuals, {
              x1: "x1",
              y1: "y1",
              x2: "x2",
              y2: "y2",
              stroke: "#f97316",
              strokeOpacity: 0.75,
              strokeDasharray: "4,4",
              strokeWidth: 1.5
            })
          : null,
        Plot.line(lineData, {
          x: "x",
          y: "y",
          stroke: lineColor,
          strokeWidth: 3,
          curve: "linear"
        }),
        guides.length
          ? Plot.link(guides, {
              x1: "x1",
              y1: "y1",
              x2: "x2",
              y2: "y2",
              stroke: "#f59e0b",
              strokeOpacity: 0.7,
              strokeDasharray: "4,4",
              strokeWidth: 1.5
            })
          : null,
        triangleVisible ? Plot.link(triangle.segments, {
          x1: "x1",
          y1: "y1",
          x2: "x2",
          y2: "y2",
          stroke: "#f59e0b",
          strokeWidth: 2.2
        }) : null,
        triangleVisible ? Plot.text(triangle.labels, {
          x: "x",
          y: "y",
          text: "text",
          fill: "#b45309",
          fontSize: 11,
          fontWeight: 700
        }) : null,
        Plot.dot(students, {
          x: "x",
          y: "y",
          r: 5.5,
          fill: "#0ea5e9",
          stroke: "#ffffff",
          strokeWidth: 1.8
        }),
        prediction.length
          ? Plot.dot(prediction, {
              x: "x",
              y: "y",
              r: 6.5,
              fill: "#f59e0b",
              stroke: "#ffffff",
              strokeWidth: 2
            })
          : null
      ].filter(Boolean)
    });
  }

  function updatePrediction() {
    const predicted = Math.round(currentSlope * predictionX + currentIntercept);
    setText("lr-predict-value", `${predictionX.toFixed(1)} h`);
    setText("lr-predict-score", `≈ ${predicted} pts`);
  }

  function updateManualMessage() {
    const error = meanAbsoluteError(currentSlope, currentIntercept);
    const feedback = feedbackLabel(error);
    if (error < 5.5) triangleVisible = true;

    setText("lr-status", `Reto: mueve m y b. Error promedio: ${error.toFixed(1)} pts. ${feedback}.`);

    if (error < 3.2) {
      setInsights(
        "lr",
        "Tu línea ya atraviesa muy bien la nube de puntos. El triángulo naranja te recuerda cuánto sube la recta (calificación) por cada hora extra de estudio.",
        "Este proceso es funamental: pendiente e intersección. Aquí “aprender” significa encontrar los números que minimicen el error entre una línea y una nube de puntos."
      );
    } else if (error < 5.5) {
      setInsights(
        "lr",
        "La recta ya empieza a seguir la tendencia general de los puntos, aunque todavía no llega a su ubicación final.",
        "Vas descubriendo la lógica del ajuste: si la pendiente o el arranque (inicio) se pasan, el error aumenta."
      );
    } else {
      setInsights(
        "lr",
        "Los puntos azules son datos de estudiantes que hemos recopilado. La línea azul es tu hipótesis actual sobre cómo se relacionan las horas de estudio con la calificación obtenida en un examen.",
        "Machine learning empieza así: propones una relación, mides el error y ajustas. No hay magia; hay álgebra y prueba de hipótesis."
      );
    }
  }

  function syncRegressionUI() {
    const active = mode !== "preview";
    const error = meanAbsoluteError(currentSlope, currentIntercept);
    const slopeInput = $("lr-slope-slider");
    const interceptInput = $("lr-intercept-slider");
    const autoButton = $("lr-auto");

    if (slopeInput) {
      slopeInput.value = String(currentSlope);
      slopeInput.disabled = !active || controlsLocked;
    }
    if (interceptInput) {
      interceptInput.value = String(currentIntercept);
      interceptInput.disabled = !active || controlsLocked;
    }

    if (autoButton) {
      autoButton.disabled = !active || controlsLocked || mode === "machine";
    }

    setText("lr-slope-value", currentSlope.toFixed(1));
    setText("lr-intercept-value", currentIntercept.toFixed(1));
    setText("lr-rise-value", `+${currentSlope.toFixed(1)} pts`);
    setText("lr-rise-chip", `+${currentSlope.toFixed(1)} puntos`);
    setText("lr-error-value", active ? `${error.toFixed(1)} pts` : "—");
    setText("lr-feedback-value", active ? feedbackLabel(error) : "—");

    if (mode === "preview") {
      setHTML("lr-equation", "Tu recta aparecerá aquí cuando abras el reto.");
    } else if (mode === "machine") {
      setHTML(
        "lr-equation",
        `La máquina encontró: ŷ = <span class="formula-highlight">${currentSlope.toFixed(2)}</span> · x + <span class="formula-highlight">${currentIntercept.toFixed(2)}</span>`
      );
    } else {
      setHTML(
        "lr-equation",
        `Tu recta actual: ŷ = <span class="formula-highlight">${currentSlope.toFixed(2)}</span> · x + <span class="formula-highlight">${currentIntercept.toFixed(2)}</span>`
      );
    }

    if (predictionVisible) {
      $("lr-prediction-card")?.removeAttribute("hidden");
      updatePrediction();
    } else {
      $("lr-prediction-card")?.setAttribute("hidden", "hidden");
    }
  }

  function renderRegression() {
    replacePlot("lr-plot", regressionPlot());
    syncRegressionUI();
  }

  function enterChallenge() {
    runId += 1;
    activateShell("lr");
    mode = "manual";
    controlsLocked = false;
    residualsVisible = false;
    predictionVisible = false;
    triangleVisible = false;
    hasInteracted = false;
    predictionX = 5;
    currentSlope = startSlope;
    currentIntercept = startIntercept;
    $("lr-rise-card")?.setAttribute("hidden", "hidden");
    renderRegression();
    setText("lr-status", "Reto: ajusta una recta antes que la máquina.");
    setInsights(
      "lr",
      "Los puntos azules son estudiantes. La línea azul es tu primer intento de explicar la relación entre horas de estudio y calificación.",
      "Este es el meollo del asunto: el aprendizaje de una máquina (machine learning) puede empezar con algo que ya conoces de álgebra, `y = mx + b`."
    );
    updateManualMessage();
  }


  async function autoFit() {
    const token = ++runId;
    if (mode !== "manual") return;
    mode = "fitting";
    controlsLocked = true;
    predictionVisible = false;
    residualsVisible = false;
    triangleVisible = false;
    renderRegression();

    // Paso 1 — Mide el error
    setText("lr-status", "Paso 1 — Mide el error: la máquina calcula qué tan lejos queda la recta de cada punto.");
    setInsights(
      "lr",
      "La recta todavía es la tuya. Ahora el sistema convierte la diferencia entre la línea y los puntos en un número medible.",
      "Si puedes medir el error, puedes intentar reducirlo. Eso es lo que hace posible el aprendizaje."
    );
    await wait(600);
    if (token !== runId) return;
    residualsVisible = true;
    renderRegression();
    await wait(1500);

    // Paso 2 — Empieza a ajustar
    if (token !== runId) return;
    setText("lr-status", "Paso 2 — Ajusta m y b: la recta empieza a inclinarse hacia los datos.");
    setInsights(
      "lr",
      "Todavía no hay nada extraordinario: solo una línea que se mueve para acercarse mejor al patrón de los puntos.",
      "Aprender, en este ejemplo, significa cambiar dos números —m y b— hasta encontrar una recta que reduzca el error."
    );
    await wait(1200);

    // Animación de ajuste — con pausa de "Paso 3" a mitad
    if (token !== runId) return;
    residualsVisible = false;
    const initialSlope = currentSlope;
    const initialIntercept = currentIntercept;
    const steps = prefersReducedMotion() ? 1 : 36;
    const midStep = Math.floor(steps / 2);
    for (let step = 0; step <= steps; step += 1) {
      if (token !== runId) return;
      currentSlope = d3.interpolateNumber(initialSlope, learnedSlope)(step / steps);
      currentIntercept = d3.interpolateNumber(initialIntercept, learnedIntercept)(step / steps);
      renderRegression();
      if (step === midStep) {
        setText("lr-status", "Paso 3 — Reduce el error: la recta se acerca cada vez más a los puntos…");
      }
      await wait(55);
    }

    // Paso 4 — Error mínimo, resultado final
    if (token !== runId) return;
    mode = "machine";
    controlsLocked = true;
    residualsVisible = true;
    triangleVisible = true;
    predictionVisible = true;
    predictionX = 5;
    $("lr-rise-card")?.removeAttribute("hidden");
    renderRegression();
    setText("lr-status", "Paso 4 — ¡Error minimizado! La máquina encontró la mejor recta aproximada y ya puede predecir.");
    setInsights(
      "lr",
      "La línea final no pasa por todos los puntos, pero sí captura muy bien la tendencia general. El punto amarillo es una predicción nueva.",
      "Aprender no fue magia. Fue ajustar dos números —m y b— hasta reducir el error. Eso es machine learning (o aprendizaje de máquinas)."
    );
  }

  function handleManualChange() {
    if (mode !== "manual" || controlsLocked) return;
    if (!hasInteracted) {
      hasInteracted = true;
      $("lr-rise-card")?.removeAttribute("hidden");
    }
    currentSlope = Number($("lr-slope-slider")?.value ?? startSlope);
    currentIntercept = Number($("lr-intercept-slider")?.value ?? startIntercept);
    renderRegression();
    updateManualMessage();
  }

  $("lr-auto")?.addEventListener("click", autoFit);
  $("lr-reset")?.addEventListener("click", enterChallenge);
  $("lr-slope-slider")?.addEventListener("input", handleManualChange);
  $("lr-intercept-slider")?.addEventListener("input", handleManualChange);
  $("lr-predict-slider")?.addEventListener("input", (event) => {
    predictionX = Number(event.target.value);
    renderRegression();
  });
  window.addEventListener("resize", () => renderRegression());
  enterChallenge();
}

function initKMeansDemo() {
  const songs = [
    { artist: "Bad Bunny", x: 8.5, y: 8.8, cluster: 0 },
    { artist: "Karol G", x: 8.8, y: 8.2, cluster: 0 },
    { artist: "J Balvin", x: 7.8, y: 8.6, cluster: 0 },
    { artist: "Daddy Yankee", x: 9.0, y: 9.0, cluster: 0 },
    { artist: "Maluma", x: 7.5, y: 8.0, cluster: 0 },
    { artist: "The Weeknd", x: 6.2, y: 5.8, cluster: 1 },
    { artist: "Dua Lipa", x: 6.8, y: 6.5, cluster: 1 },
    { artist: "Harry Styles", x: 5.5, y: 5.2, cluster: 1 },
    { artist: "Taylor Swift", x: 6.5, y: 6.0, cluster: 1 },
    { artist: "Doja Cat", x: 5.8, y: 6.3, cluster: 1 },
    { artist: "Ed Sheeran", x: 3.2, y: 3.5, cluster: 2 },
    { artist: "Coldplay", x: 4.0, y: 4.2, cluster: 2 },
    { artist: "Billie Eilish", x: 2.5, y: 3.0, cluster: 2 },
    { artist: "Olivia Rodrigo", x: 3.8, y: 4.0, cluster: 2 },
    { artist: "Adele", x: 2.2, y: 2.8, cluster: 2 }
  ];

  const colors = ["#2563eb", "#14b8a6", "#f59e0b"];
  const initialCenters = [
    { x: 6.9, y: 4.5, color: colors[0] },
    { x: 4.0, y: 7.2, color: colors[1] },
    { x: 5.6, y: 3.4, color: colors[2] }
  ];
  const finalCenters = [
    { x: 8.32, y: 8.52, color: colors[0] },
    { x: 6.16, y: 5.96, color: colors[1] },
    { x: 3.14, y: 3.5, color: colors[2] }
  ];

  let runId = 0;
  let shown = 0;
  let colorized = false;
  let centersVisible = false;
  let centers = initialCenters.map((center) => ({ ...center }));

  function clusterPlot() {
    const visibleSongs = songs.slice(0, shown);
    return Plot.plot({
      width: getHostWidth("km-plot", 420),
      height: 300,
      marginTop: 20,
      marginRight: 24,
      marginBottom: 46,
      marginLeft: 48,
      style: {
        background: "transparent",
        fontFamily: "system-ui, sans-serif",
        color: "#1e293b"
      },
      x: { domain: [1, 10], label: "Energía", grid: true },
      y: { domain: [1, 10], label: "Ritmo", grid: true },
      marks: [
        Plot.ruleX([2, 4, 6, 8], { stroke: "#e5eef7" }),
        Plot.ruleY([2, 4, 6, 8], { stroke: "#e5eef7" }),
        Plot.dot(visibleSongs, {
          x: "x",
          y: "y",
          r: 6,
          fill: (song) => (colorized ? colors[song.cluster] : "#cbd5e1"),
          stroke: "#ffffff",
          strokeWidth: 1.5
        }),
        centersVisible
          ? Plot.text(centers, {
              x: "x",
              y: "y",
              text: "×",
              fontSize: 22,
              fontWeight: 800,
              fill: "color"
            })
          : null
      ].filter(Boolean)
    });
  }

  function renderClusterPlot() {
    replacePlot("km-plot", clusterPlot());
  }

  function resetPreview() {
    runId += 1;
    shown = 0;
    colorized = false;
    centersVisible = false;
    centers = initialCenters.map((center) => ({ ...center }));
    deactivateShell("km");
    renderClusterPlot();
    setHTML("km-tags", "");
    setText("km-status", "");
    setInsights(
      "km",
      "Una nube de canciones sin etiquetas visibles. Cada punto representa una canción descrita por dos características numéricas.",
      "En aprendizaje no supervisado no hay respuestas correctas entregadas por humanos. El algoritmo solo recibe datos y trata de encontrar estructura."
    );
  }

  async function play() {
    const token = ++runId;
    activateShell("km");
    shown = 0;
    colorized = false;
    centersVisible = false;
    centers = initialCenters.map((center) => ({ ...center }));
    setHTML("km-tags", "");
    renderClusterPlot();

    setText("km-status", "Paso 1 — Aparecen canciones descritas por energía y ritmo, pero sin géneros escritos.");
    setInsights(
      "km",
      "Los puntos grises son canciones sin clasificar. Solo tienen atributos medibles: qué tan intensas suenan y qué ritmo tienen.",
      "K-means no empieza con categorías como “pop” o “reggaetón”. Empieza con geometría en un espacio de características."
    );

    for (let index = 1; index <= songs.length; index += 1) {
      if (token !== runId) return;
      shown = index;
      renderClusterPlot();
      await wait(130);
    }

    if (token !== runId) return;
    centersVisible = true;
    renderClusterPlot();
    setText("km-status", "Paso 2 — El algoritmo coloca centros iniciales y empieza a probar agrupaciones.");
    setInsights(
      "km",
      "Las cruces son centros provisionales. No son géneros; son posiciones iniciales desde las que el algoritmo empieza a ordenar puntos.",
      "K-means alterna dos operaciones: asignar cada punto al centro más cercano y luego mover cada centro al promedio de su grupo."
    );
    await wait(900);

    if (token !== runId) return;
    colorized = true;
    renderClusterPlot();
    setText("km-status", "Paso 3 — Cada canción se pinta según el centro que le queda más cerca.");
    setInsights(
      "km",
      "Los colores muestran la asignación temporal de cada canción a uno de los tres centros actuales.",
      "El grupo no aparece porque alguien lo nombró. Aparece porque ciertas canciones quedan más cerca entre sí en este espacio numérico."
    );
    await wait(900);

    if (token !== runId) return;
    const steps = prefersReducedMotion() ? 1 : 20;
    for (let step = 0; step <= steps; step += 1) {
      if (token !== runId) return;
      centers = centers.map((center, index) => ({
        ...center,
        x: d3.interpolateNumber(initialCenters[index].x, finalCenters[index].x)(step / steps),
        y: d3.interpolateNumber(initialCenters[index].y, finalCenters[index].y)(step / steps)
      }));
      renderClusterPlot();
      await wait(55);
    }

    if (token !== runId) return;
    setHTML(
      "km-tags",
      `
        <span class="km-cluster-tag km-cluster-a">Grupo A: alta energía</span>
        <span class="km-cluster-tag km-cluster-b">Grupo B: pop / dance intermedio</span>
        <span class="km-cluster-tag km-cluster-c">Grupo C: acústico / chill</span>
      `
    );
    setText("km-status", "Resultado — Los centros convergen y recién después un humano interpreta qué “tipo” de grupo encontró.");
    setInsights(
      "km",
      "Las etiquetas de abajo son una lectura humana posterior. El algoritmo solo encontró tres zonas densas; nosotros interpretamos qué podrían significar.",
      "Eso evita una confusión común: clustering descubre estructura, pero el nombre del grupo lo pone una persona después."
    );
  }

  $("km-start")?.addEventListener("click", play);
  $("km-reset")?.addEventListener("click", resetPreview);
  window.addEventListener("resize", () => renderClusterPlot());
  resetPreview();
}

function initRLDemo() {
  const scale = 3;
  const charWidth = 8 * scale;
  const charHeight = 10 * scale;
  const frames = {
    stand: [
      [0, 0, 1, 1, 1, 1, 0, 0], [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 3, 3, 2, 2, 3, 0, 0], [0, 2, 2, 2, 2, 2, 2, 0],
      [0, 2, 3, 3, 3, 2, 0, 0], [0, 0, 1, 4, 4, 1, 0, 0],
      [0, 4, 4, 4, 4, 4, 4, 0], [0, 4, 4, 0, 0, 4, 4, 0],
      [0, 3, 3, 0, 0, 3, 3, 0], [3, 3, 3, 0, 0, 3, 3, 3]
    ],
    run1: [
      [0, 0, 1, 1, 1, 1, 0, 0], [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 3, 3, 2, 2, 3, 0, 0], [0, 2, 2, 2, 2, 2, 2, 0],
      [0, 2, 3, 3, 3, 2, 0, 0], [0, 0, 1, 4, 4, 1, 0, 0],
      [0, 4, 4, 4, 4, 0, 0, 0], [0, 4, 4, 4, 0, 3, 0, 0],
      [0, 3, 3, 0, 0, 3, 3, 0], [0, 3, 0, 0, 0, 0, 3, 0]
    ],
    run2: [
      [0, 0, 1, 1, 1, 1, 0, 0], [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 3, 3, 2, 2, 3, 0, 0], [0, 2, 2, 2, 2, 2, 2, 0],
      [0, 2, 3, 3, 3, 2, 0, 0], [0, 0, 1, 4, 4, 1, 0, 0],
      [0, 0, 0, 4, 4, 4, 4, 0], [0, 0, 3, 0, 4, 4, 4, 0],
      [0, 3, 3, 0, 0, 3, 3, 0], [0, 3, 0, 0, 0, 0, 3, 0]
    ],
    jump: [
      [0, 0, 1, 1, 1, 1, 0, 0], [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 3, 3, 2, 2, 3, 0, 0], [0, 2, 2, 2, 2, 2, 2, 0],
      [0, 2, 3, 3, 3, 2, 0, 0], [1, 0, 4, 4, 4, 4, 0, 1],
      [0, 4, 4, 4, 4, 4, 4, 0], [0, 4, 3, 3, 3, 3, 4, 0],
      [0, 3, 3, 0, 0, 3, 3, 0], [0, 0, 0, 0, 0, 0, 0, 0]
    ],
    fall: [
      [0, 0, 1, 1, 1, 1, 0, 0], [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 3, 3, 2, 2, 3, 0, 0], [2, 2, 2, 2, 2, 2, 2, 2],
      [0, 2, 3, 3, 3, 2, 0, 0], [0, 0, 1, 4, 4, 1, 0, 0],
      [4, 4, 4, 4, 4, 4, 4, 4], [0, 0, 4, 4, 4, 4, 0, 0],
      [4, 3, 0, 0, 0, 0, 3, 4], [3, 0, 0, 0, 0, 0, 0, 3]
    ]
  };
  const colors = { 1: "#cc3300", 2: "#ffbf9b", 3: "#6b3f1b", 4: "#2255cc" };
  const width = 460;
  const height = 240;
  const groundY = 192;
  const gapX1 = 180;
  const gapX2 = 296;

  let canvas;
  let ctx;
  let runId = 0;
  let animationFrame = null;

  const state = {
    phase: 0,
    frameCount: 0,
    x: 12,
    y: groundY - charHeight,
    vx: 0,
    vy: 0,
    score: 0,
    attempt: 0,
    runFrame: 0,
    runTick: 0,
    currentFrame: frames.stand,
    particles: [],
    messages: []
  };

  function setMetric(id, value) {
    setText(`rl-${id}`, value);
  }

  function resetCharacter() {
    state.x = 12;
    state.y = groundY - charHeight;
    state.vx = 0;
    state.vy = 0;
    state.runFrame = 0;
    state.runTick = 0;
  }

  function foot() {
    return state.y + charHeight;
  }

  function center() {
    return state.x + charWidth / 2;
  }

  function onGround() {
    const currentCenter = center();
    return foot() >= groundY && (currentCenter < gapX1 || currentCenter > gapX2);
  }

  function inGap() {
    const currentCenter = center();
    return currentCenter > gapX1 && currentCenter < gapX2;
  }

  function tickRunFrame() {
    state.runTick += 1;
    if (state.runTick % 9 === 0) {
      state.runFrame = (state.runFrame + 1) % 2;
    }
    return state.runFrame === 0 ? frames.run1 : frames.run2;
  }

  function addParticles(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * 3.5,
        vy: Math.sin(angle) * 3.5 - 1.5,
        alpha: 1,
        color,
        size: 3 + Math.random() * 2
      });
    }
  }

  function addMessage(text, color, x, y) {
    state.messages.push({ text, color, x, y, alpha: 1 });
  }

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);
  }

  function drawScene() {
    const gradient = ctx.createLinearGradient(0, 0, 0, groundY);
    gradient.addColorStop(0, "#dbeafe");
    gradient.addColorStop(1, "#f8fbff");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, groundY);

    ctx.fillStyle = "#eef2ff";
    ctx.fillRect(0, groundY, width, height - groundY);

    const gapGradient = ctx.createLinearGradient(0, groundY, 0, height);
    gapGradient.addColorStop(0, "rgba(248, 113, 113, 0.22)");
    gapGradient.addColorStop(1, "rgba(248, 113, 113, 0.04)");
    ctx.fillStyle = gapGradient;
    ctx.fillRect(gapX1, groundY, gapX2 - gapX1, height - groundY);

    ctx.fillStyle = "#22c55e";
    ctx.fillRect(0, groundY, gapX1, 7);
    ctx.fillRect(gapX2, groundY, width - gapX2, 7);
    ctx.fillStyle = "#a16207";
    ctx.fillRect(0, groundY + 7, gapX1, height - groundY - 7);
    ctx.fillRect(gapX2, groundY + 7, width - gapX2, height - groundY - 7);

    ctx.fillStyle = "rgba(0,0,0,0.05)";
    for (let bx = 0; bx < width; bx += 32) {
      for (let by = groundY + 7; by < height; by += 12) {
        ctx.fillRect(bx + (by % 24 === 0 ? 0 : 16), by, 30, 10);
      }
    }

    [[70, 38, 28], [195, 25, 22], [360, 42, 32]].forEach((cloud) => {
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(cloud[0], cloud[1], cloud[2], 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cloud[0] + cloud[2], cloud[1] + 6, cloud[2] * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cloud[0] - cloud[2] * 0.7, cloud[1] + 6, cloud[2] * 0.6, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "#64748b";
    ctx.fillRect(gapX2 + 62, groundY - 58, 3, 58);
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.moveTo(gapX2 + 65, groundY - 58);
    ctx.lineTo(gapX2 + 87, groundY - 48);
    ctx.lineTo(gapX2 + 65, groundY - 38);
    ctx.closePath();
    ctx.fill();
  }

  function drawCharacter(frame, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    frame.forEach((row, rowIndex) => {
      row.forEach((value, columnIndex) => {
        if (!value) return;
        ctx.fillStyle = colors[value];
        ctx.fillRect(state.x + columnIndex * scale, state.y + rowIndex * scale, scale, scale);
      });
    });
    ctx.restore();
  }

  function drawParticles() {
    for (let index = state.particles.length - 1; index >= 0; index -= 1) {
      const particle = state.particles[index];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.2;
      particle.alpha -= 0.022;
      if (particle.alpha <= 0) {
        state.particles.splice(index, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
      ctx.restore();
    }
  }

  function drawMessages() {
    for (let index = state.messages.length - 1; index >= 0; index -= 1) {
      const message = state.messages[index];
      message.y -= 0.6;
      message.alpha -= 0.011;
      if (message.alpha <= 0) {
        state.messages.splice(index, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = message.alpha;
      ctx.font = "bold 15px system-ui";
      ctx.textAlign = "center";
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.lineWidth = 4;
      ctx.strokeText(message.text, message.x, message.y);
      ctx.fillStyle = message.color;
      ctx.fillText(message.text, message.x, message.y);
      ctx.restore();
    }
  }

  function renderScene() {
    ctx.clearRect(0, 0, width, height);
    drawScene();
    let alpha = 1;
    if (inGap() && foot() > groundY) {
      alpha = Math.max(0, 1 - (foot() - groundY) / 45);
    }
    drawCharacter(state.currentFrame, alpha);
    drawParticles();
    drawMessages();
  }

  function updateMetrics(panelState, action, reward, policy) {
    setMetric("attempt-value", panelState.attempt);
    setMetric("state-value", panelState.state);
    setMetric("action-value", action);
    setMetric("reward-value", reward);
    setMetric("total-value", `${state.score >= 0 ? "+" : ""}${state.score}`);
    setMetric("policy-value", policy);
  }

  function setReducedScene(config) {
    state.score = config.score;
    state.currentFrame = config.frame;
    state.x = config.x;
    state.y = config.y;
    state.particles = [];
    state.messages = [];
    if (config.message) {
      addMessage(config.message.text, config.message.color, config.message.x, config.message.y);
    }
    renderScene();
    setText("rl-status", config.status);
    setInsights("rl", config.seeing, config.meaning);
    updateMetrics(config.panelState, config.action, config.reward, config.policy);
  }

  async function playReducedMotion(token) {
    activateShell("rl");
    setReducedScene({
      score: 0,
      frame: frames.stand,
      x: 12,
      y: groundY - charHeight,
      status: "Intento 1 — El agente observa el problema y todavía no tiene una política útil.",
      seeing:
        "Mismo entorno, mismo hueco y misma meta. Lo único que cambiará entre escenas será la estrategia.",
      meaning:
        "En refuerzo importa la relación entre estado, acción y recompensa, no la animación continua del personaje.",
      panelState: { attempt: "1 / 3", state: "Inicio frente al hueco" },
      action: "Esperar",
      reward: "0 pts",
      policy: "Todavía no se ha aprendido una política"
    });
    await wait(700);
    if (token !== runId) return;

    setReducedScene({
      score: -10,
      frame: frames.fall,
      x: 214,
      y: groundY + 34,
      message: { text: "-10 pts", color: "#ef4444", x: 226, y: groundY + 12 },
      status: "Resultado 1 — El salto es corto y el entorno devuelve una penalización fuerte.",
      seeing:
        "El agente cae en el hueco tras una mala combinación de carrera y salto.",
      meaning:
        "La recompensa negativa le dice al sistema que esta acción no conviene repetirla en ese estado.",
      panelState: { attempt: "1 / 3", state: "Caída" },
      action: "Saltar",
      reward: "-10 pts",
      policy: "Evitar este salto corto"
    });
    await wait(800);
    if (token !== runId) return;

    setReducedScene({
      score: -15,
      frame: frames.fall,
      x: 276,
      y: groundY + 26,
      message: { text: "-5 pts", color: "#f97316", x: 288, y: groundY + 8 },
      status: "Resultado 2 — La política mejora, pero aún se queda corta cerca del borde.",
      seeing:
        "El segundo intento llega más lejos. El error es menor, pero sigue siendo un fracaso.",
      meaning:
        "Eso también es aprendizaje: comparar recompensas y ajustar la política gradualmente.",
      panelState: { attempt: "2 / 3", state: "Casi llega" },
      action: "Correr más rápido y saltar",
      reward: "-5 pts",
      policy: "Explora una acción mejor"
    });
    await wait(800);
    if (token !== runId) return;

    setReducedScene({
      score: 85,
      frame: frames.stand,
      x: gapX2 + 36,
      y: groundY - charHeight,
      message: { text: "+100 pts", color: "#10b981", x: gapX2 + 48, y: groundY - 12 },
      status: "Resultado 3 — Recompensa alta. El agente cruza el hueco y refuerza esa política.",
      seeing:
        "Mismo entorno, pero ahora el agente ejecuta una secuencia de acciones que sí supera el hueco.",
      meaning:
        "Aprendizaje por refuerzo es exactamente esto: prueba, error, recompensa y ajuste iterativo de la estrategia.",
      panelState: { attempt: "3 / 3", state: "Meta alcanzada" },
      action: "Saltar",
      reward: "+100 pts",
      policy: "Repetir la política exitosa"
    });
  }

  function step() {
    state.frameCount += 1;
    const currentToken = runId;

    if (state.phase === 1) {
      state.currentFrame = frames.stand;
      if (state.frameCount === 1) {
        state.attempt = 1;
        resetCharacter();
        setText("rl-status", "Intento 1 — El agente no sabe todavía qué velocidad necesita.");
        setInsights(
          "rl",
          "El agente observa un estado inicial muy simple: hay plataforma, hueco y meta. Todavía no tiene una política buena.",
          "En refuerzo, aprender significa ajustar qué acción conviene más en cada situación según la recompensa obtenida."
        );
        updateMetrics(
          { attempt: "1 / 3", state: "Inicio frente al hueco" },
          "Esperar",
          "0 pts",
          "Aún no hay una estrategia aprendida"
        );
      }
      if (state.frameCount > 70) {
        state.phase = 2;
        state.frameCount = 0;
      }
    } else if (state.phase === 2) {
      state.currentFrame = tickRunFrame();
      state.x += 2.5;
      updateMetrics(
        { attempt: "1 / 3", state: "Acelerando" },
        "Correr",
        "0 pts",
        "Prueba una política todavía débil"
      );
      if (center() >= gapX1 - 4) {
        state.phase = 3;
        state.frameCount = 0;
        state.vx = 2.6;
        state.vy = -8;
      }
    } else if (state.phase === 3) {
      state.currentFrame = state.vy > 1 ? frames.fall : frames.jump;
      state.x += state.vx;
      state.y += state.vy;
      state.vy += 0.5;
      updateMetrics(
        { attempt: "1 / 3", state: "Salto demasiado corto" },
        "Saltar",
        "Pendiente",
        "La política todavía subestima la distancia"
      );
      if (onGround()) state.y = groundY - charHeight;
      if (inGap() && foot() > groundY + 36) {
        state.score -= 10;
        addParticles(center(), groundY + 10, "#ef4444", 10);
        addMessage("-10 pts", "#ef4444", center(), groundY + 6);
        setText("rl-status", "Resultado — Cayó al hueco. El entorno devuelve una penalización fuerte.");
        setInsights(
          "rl",
          "El agente ejecutó una acción, vio el resultado y recibió una señal cuantitativa negativa.",
          "Esa recompensa negativa le dice al sistema que esta combinación de velocidad y salto no conviene repetirla."
        );
        updateMetrics(
          { attempt: "1 / 3", state: "Caída" },
          "Saltar",
          "-10 pts",
          "Evitar esta acción en este estado"
        );
        state.phase = 4;
        state.frameCount = 0;
      }
    } else if (state.phase === 4) {
      state.currentFrame = frames.stand;
      if (state.frameCount > 90) {
        state.attempt = 2;
        resetCharacter();
        state.phase = 5;
        state.frameCount = 0;
        setText("rl-status", "Intento 2 — El agente ajusta la acción: más impulso, pero todavía no basta.");
      }
    } else if (state.phase === 5) {
      state.currentFrame = tickRunFrame();
      state.x += 2.8;
      updateMetrics(
        { attempt: "2 / 3", state: "Segundo intento" },
        "Correr más rápido",
        "0 pts",
        "Explora una acción mejor"
      );
      if (center() >= gapX1 - 4) {
        state.phase = 6;
        state.frameCount = 0;
        state.vx = 3.1;
        state.vy = -8.5;
      }
    } else if (state.phase === 6) {
      state.currentFrame = state.vy > 1 ? frames.fall : frames.jump;
      state.x += state.vx;
      state.y += state.vy;
      state.vy += 0.5;
      updateMetrics(
        { attempt: "2 / 3", state: "Casi llega" },
        "Saltar",
        "Pendiente",
        "La política mejora, pero sigue siendo insuficiente"
      );
      if (onGround()) state.y = groundY - charHeight;
      if (inGap() && foot() > groundY + 36) {
        state.score -= 5;
        addParticles(center(), groundY + 10, "#f97316", 10);
        addMessage("-5 pts", "#f97316", center(), groundY + 6);
        setText("rl-status", "Resultado — Cayó cerca del borde. La penalización es menor, pero sigue siendo una mala acción.");
        updateMetrics(
          { attempt: "2 / 3", state: "Error parcial" },
          "Saltar",
          "-5 pts",
          "Acercarse a la meta mejora la política"
        );
        state.phase = 7;
        state.frameCount = 0;
      }
    } else if (state.phase === 7) {
      state.currentFrame = frames.stand;
      if (state.frameCount > 90) {
        state.attempt = 3;
        resetCharacter();
        state.phase = 8;
        state.frameCount = 0;
        setText("rl-status", "Intento 3 — El agente usa la mejor política encontrada hasta ahora.");
      }
    } else if (state.phase === 8) {
      state.currentFrame = tickRunFrame();
      state.x += 3.2;
      updateMetrics(
        { attempt: "3 / 3", state: "Política mejorada" },
        "Correr más rápido",
        "0 pts",
        "Explota la mejor opción aprendida"
      );
      if (center() >= gapX1 - 4) {
        state.phase = 9;
        state.frameCount = 0;
        state.vx = 3.8;
        state.vy = -9;
      }
    } else if (state.phase === 9) {
      state.currentFrame = state.vy > 1 ? frames.fall : frames.jump;
      state.x += state.vx;
      state.y += state.vy;
      state.vy += 0.5;
      updateMetrics(
        { attempt: "3 / 3", state: "Salto óptimo" },
        "Saltar",
        "Pendiente",
        "La política ya supera el hueco"
      );
      if (foot() >= groundY && center() > gapX2) {
        state.y = groundY - charHeight;
        state.vx = 0;
        state.vy = 0;
        state.currentFrame = frames.stand;
        state.score += 100;
        addParticles(center(), state.y, "#10b981", 14);
        addParticles(center(), state.y, "#f59e0b", 8);
        addMessage("+100 pts", "#10b981", center(), state.y - 10);
        setText("rl-status", "Resultado — Recompensa alta. El agente cruzó el hueco y refuerza esa política.");
        setInsights(
          "rl",
          "El panel deja claro qué cambió: mismo entorno, distinta política, recompensa mucho mejor.",
          "Aprendizaje por refuerzo es exactamente eso: prueba, error, recompensa y ajuste iterativo de la estrategia."
        );
        updateMetrics(
          { attempt: "3 / 3", state: "Meta alcanzada" },
          "Saltar",
          "+100 pts",
          "Repetir una política exitosa"
        );
        state.phase = 10;
        state.frameCount = 0;
      }
    } else if (state.phase === 10) {
      state.currentFrame = frames.stand;
      if (state.frameCount % 18 === 0 && state.frameCount < 130) {
        addParticles(state.x + charWidth / 2, state.y - 10, "#f59e0b", 6);
        addParticles(state.x + charWidth / 2, state.y - 10, "#10b981", 6);
      }
      if (state.frameCount > 140) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
        return;
      }
    }

    renderScene();
    if (currentToken === runId) {
      animationFrame = requestAnimationFrame(step);
    }
  }

  function resetPreview() {
    runId += 1;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = null;
    state.phase = 0;
    state.frameCount = 0;
    state.score = 0;
    state.attempt = 0;
    state.particles = [];
    state.messages = [];
    state.currentFrame = frames.stand;
    resetCharacter();
    deactivateShell("rl");
    renderScene();
    setText("rl-status", "");
    setInsights(
      "rl",
      "Un agente frente a un hueco y una meta. Se empieza solo con un problema por resolver.",
      "La gracia del bloque está en ver cómo cambian las acciones y recompensas entre intentos, no solo en mirar al personaje moverse."
    );
    updateMetrics(
      { attempt: "—", state: "Sin ejecutar" },
      "—",
      "0 pts",
      "Todavía no se ha probado ninguna política"
    );
  }

  function start() {
    activateShell("rl");
    runId += 1;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    state.phase = 1;
    state.frameCount = 0;
    state.score = 0;
    state.attempt = 0;
    state.particles = [];
    state.messages = [];
    state.currentFrame = frames.stand;
    resetCharacter();

    if (prefersReducedMotion()) {
      playReducedMotion(runId);
      return;
    }

    animationFrame = requestAnimationFrame(step);
  }

  canvas = $("rl-canvas");
  if (canvas) {
    ctx = canvas.getContext("2d");
    resizeCanvas();
  }

  $("rl-start")?.addEventListener("click", start);
  $("rl-reset")?.addEventListener("click", resetPreview);
  window.addEventListener("resize", () => {
    resizeCanvas();
    renderScene();
  });
  resetPreview();
}

// ── Learn List: step-by-step cartesian plane visualization ──
// Built via JS innerHTML to bypass Pandoc's HTML-attribute mangling of {=html} blocks.
function initLearnList() {
  const mount = document.getElementById("learn-list-mount");
  if (!mount) return;

  // SVG coordinate system — viewBox "0 0 200 155"
  // Axis origin SVG (42, 125).
  // x: hours 0-5  →  SVG x = 42 + h*27.6   (0h→42, 2h→97, 4h→152, 5h→180)
  // y: grade 55-88 →  SVG y = 125 - (g-55)*3.33  (60→108, 70→75, 80→42, 85→25)
  // The 3 data points from the table: (0h,60) (2h,70) (4h,80) — all on y=5x+60.

  const base = `
    <rect width="200" height="155" fill="#f8fafc"/>
    <line x1="42" y1="108" x2="180" y2="108" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="42" y1="75"  x2="180" y2="75"  stroke="#e2e8f0" stroke-width="1"/>
    <line x1="42" y1="42"  x2="180" y2="42"  stroke="#e2e8f0" stroke-width="1"/>
    <line x1="97"  y1="15" x2="97"  y2="125" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="152" y1="15" x2="152" y2="125" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="42" y1="125" x2="183" y2="125" stroke="#64748b" stroke-width="1.5"/>
    <line x1="42" y1="125" x2="42"  y2="13"  stroke="#64748b" stroke-width="1.5"/>
    <line x1="42"  y1="125" x2="42"  y2="129" stroke="#64748b" stroke-width="1.5"/>
    <text x="42"  y="138" text-anchor="middle" font-size="9" fill="#475569">0</text>
    <line x1="97"  y1="125" x2="97"  y2="129" stroke="#64748b" stroke-width="1.5"/>
    <text x="97"  y="138" text-anchor="middle" font-size="9" fill="#475569">2</text>
    <line x1="152" y1="125" x2="152" y2="129" stroke="#64748b" stroke-width="1.5"/>
    <text x="152" y="138" text-anchor="middle" font-size="9" fill="#475569">4</text>
    <text x="111" y="150" text-anchor="middle" font-size="8" fill="#64748b" font-style="italic">horas de estudio</text>
    <line x1="42" y1="108" x2="38" y2="108" stroke="#64748b" stroke-width="1.5"/>
    <text x="36" y="111" text-anchor="end" font-size="9" fill="#475569">60</text>
    <line x1="42" y1="75"  x2="38" y2="75"  stroke="#64748b" stroke-width="1.5"/>
    <text x="36" y="78"  text-anchor="end" font-size="9" fill="#475569">70</text>
    <line x1="42" y1="42"  x2="38" y2="42"  stroke="#64748b" stroke-width="1.5"/>
    <text x="36" y="45"  text-anchor="end" font-size="9" fill="#475569">80</text>
    <text x="13" y="75" text-anchor="middle" font-size="8" fill="#64748b" font-style="italic" transform="rotate(-90 13 75)">calificación</text>
    <circle cx="42"  cy="108" r="5" fill="#2780e3" stroke="#fff" stroke-width="1.5"/>
    <circle cx="97"  cy="75"  r="5" fill="#2780e3" stroke="#fff" stroke-width="1.5"/>
    <circle cx="152" cy="42"  r="5" fill="#2780e3" stroke="#fff" stroke-width="1.5"/>`;

  const svgWrap = (inner) =>
    `<svg class="learn-chart" viewBox="0 0 200 155" role="img">${base}${inner}</svg>`;

  const steps = [
    {
      num: "01",
      title: "Los datos en el plano cartesiano",
      caption: "Cada fila de la tabla es un punto: x = horas estudiadas, y = calificación obtenida.",
      chart: svgWrap(`
        <text x="52"  y="105" font-size="8" fill="#2780e3" font-weight="600">(0, 60)</text>
        <text x="100" y="70"  font-size="8" fill="#2780e3" font-weight="600">(2, 70)</text>
        <text x="155" y="37"  font-size="8" fill="#2780e3" font-weight="600">(4, 80)</text>`),
    },
    {
      num: "02",
      title: "Una recta al azar — con error",
      caption: "La máquina empieza con una línea plana (m=0). Las barras rojas muestran cuánto se equivoca.",
      chart: svgWrap(`
        <line x1="42" y1="75" x2="180" y2="75" stroke="#f97316" stroke-width="2" stroke-dasharray="6 3"/>
        <line x1="42"  cy="108" x2="42"  y2="75" stroke="#ef4444" stroke-width="2"/>
        <line x1="42"  y1="108" x2="42"  y2="75" stroke="#ef4444" stroke-width="2"/>
        <line x1="152" y1="42"  x2="152" y2="75" stroke="#ef4444" stroke-width="2"/>
        <text x="50"  y="94"  font-size="8" fill="#ef4444" font-weight="600">error</text>
        <text x="156" y="61"  font-size="8" fill="#ef4444" font-weight="600">error</text>`),
    },
    {
      num: "03",
      title: "Ajusta m y b — la recta se inclina",
      caption: "Cambia m (pendiente) y b (arranque). El error se reduce, la recta se acerca a los datos.",
      chart: svgWrap(`
        <line x1="42" y1="75" x2="180" y2="75" stroke="#f97316" stroke-width="1" stroke-dasharray="4 3" opacity="0.3"/>
        <line x1="42" y1="97" x2="180" y2="51" stroke="#f97316" stroke-width="2" stroke-dasharray="6 3"/>`),
    },
    {
      num: "04",
      title: "ŷ = 5x + 60 — error mínimo",
      caption: "La recta pasa exactamente por los tres puntos. La máquina encontró m = 5 y b = 60.",
      chart: svgWrap(`
        <line x1="42" y1="108" x2="180" y2="21" stroke="#22c55e" stroke-width="2.5"/>
        <text x="98" y="53" font-size="9" fill="#22c55e" font-weight="700">ŷ = 5x + 60 ✓</text>`),
    },
  ];

  mount.innerHTML = steps
    .map(
      (s) => `
    <div class="learn-item">
      <span class="learn-num" aria-hidden="true">${s.num}</span>
      <div class="learn-text">
        <p class="learn-title">${s.title}</p>
        <p class="learn-caption">${s.caption}</p>
      </div>
      ${s.chart}
    </div>`
    )
    .join("\n");
}

document.addEventListener("DOMContentLoaded", () => {
  initLearnList();
  initConceptDemo();
  initAppTour();
  initTikTokDemo();
  initRegressionDemo();
  initKMeansDemo();
  initRLDemo();
  initScrollReveal();
});

/* ---- Scroll-reveal: fade-up for demos + content components ---- */
function initScrollReveal() {
  if (prefersReducedMotion()) return;

  // Fade-up reveal for demos and standalone content components
  const revealTargets = document.querySelectorAll(
    ".demo-wrap, .ai-definition, .ai-properties, .key-moment, " +
    ".flowchart-figure, .ia-myth, .resource-card, .app-row, .paradigm-card"
  );
  if (revealTargets.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    revealTargets.forEach((el) => {
      el.classList.add("will-reveal");
      revealObserver.observe(el);
    });
  }

  // Auto-play: trigger start button when demo scrolls into view
  const autoPlayWrappers = document.querySelectorAll(".demo-wrap[data-autoplay]");
  if (autoPlayWrappers.length) {
    const playObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const startBtn = entry.target.querySelector(".demo-btn-primary:not([disabled])");
            if (startBtn) startBtn.click();
            playObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.32 }
    );
    autoPlayWrappers.forEach((wrap) => playObserver.observe(wrap));
  }
}
