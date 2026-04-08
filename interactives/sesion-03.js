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

function initKMeansDemo() {
  if (!$("km-shell") || !$("km-plot")) return;

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
      "En aprendizaje no supervisado no hay respuestas correctas entregadas por humanos. El algoritmo solo recibe datos e intenta encontrar estructura."
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
      "K-Means no empieza con categorías como 'pop' o 'reggaetón'. Empieza con geometría en un espacio de características."
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
      "Las cruces son centros provisionales. No son géneros: son posiciones iniciales desde las que el algoritmo empieza a ordenar puntos.",
      "K-Means alterna dos operaciones: asignar cada punto al centro más cercano y mover cada centro al promedio de su grupo."
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
    setText("km-status", "Resultado — Los centros convergen y recién después un humano interpreta qué tipo de grupo encontró.");
    setInsights(
      "km",
      "Las etiquetas de abajo son una lectura humana posterior. El algoritmo solo encontró tres zonas densas; nosotros interpretamos qué podrían significar.",
      "Eso evita una confusión común: clustering descubre estructura, pero el nombre del grupo lo pone una persona después."
    );
  }

  $("km-start")?.addEventListener("click", play);
  $("km-reset")?.addEventListener("click", resetPreview);
  window.addEventListener("resize", renderClusterPlot);
  resetPreview();
}

function initRLDemo() {
  if (!$("rl-shell") || !$("rl-canvas")) return;

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

  let canvas = $("rl-canvas");
  let ctx = canvas.getContext("2d");
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
      seeing: "Mismo entorno, mismo hueco y misma meta. Lo único que cambiará entre escenas será la estrategia.",
      meaning: "En refuerzo importa la relación entre estado, acción y recompensa, no la animación continua del personaje.",
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
      seeing: "El agente cae en el hueco tras una mala combinación de carrera y salto.",
      meaning: "La recompensa negativa le dice al sistema que esta acción no conviene repetirla en ese estado.",
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
      seeing: "El segundo intento llega más lejos. El error es menor, pero sigue siendo un fracaso.",
      meaning: "Eso también es aprendizaje: comparar recompensas y ajustar la política gradualmente.",
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
      seeing: "Mismo entorno, pero ahora el agente ejecuta una secuencia de acciones que sí supera el hueco.",
      meaning: "Aprendizaje por refuerzo es exactamente esto: prueba, error, recompensa y ajuste iterativo de la estrategia.",
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
        state.vy = -8.3;
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
      "La clave está en ver cómo cambian las acciones y recompensas entre intentos, no solo en mirar al personaje moverse."
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

  resizeCanvas();
  $("rl-start")?.addEventListener("click", start);
  $("rl-reset")?.addEventListener("click", resetPreview);
  window.addEventListener("resize", () => {
    resizeCanvas();
    renderScene();
  });
  resetPreview();
}

function initMatchDemo() {
  if (!$("match-shell") || !$("match-cards")) return;

  const problems = [
    {
      id: "p1",
      emoji: "🚗",
      scenario: "¿Cuánto tarda tu DiDi en llegar?",
      context: "Tienes el historial de miles de viajes: distancia, hora del día, tráfico y tiempo real de llegada.",
      correct: "regression",
      limit: "Solo funciona bien cuando la relación entre variables es aproximadamente lineal o cuasi-lineal."
    },
    {
      id: "p2",
      emoji: "📧",
      scenario: "¿Es spam este mensaje?",
      context: "Tienes millones de mensajes ya etiquetados como spam o no spam.",
      correct: "tree",
      limit: "Se confunde con mensajes muy distintos a los que vio durante el entrenamiento."
    },
    {
      id: "p3",
      emoji: "🎵",
      scenario: "¿Qué tipo de oyente eres en Spotify?",
      context: "Solo tienes el historial de reproducción de miles de usuarios, sin categorías predefinidas.",
      correct: "kmeans",
      limit: "Tú debes decidir cuántos grupos quieres; el algoritmo no elige ese número por sí solo."
    },
    {
      id: "p4",
      emoji: "📸",
      scenario: "¿Este video tiene contenido inapropiado?",
      context: "Tienes millones de frames de video etiquetados como apropiado o inapropiado.",
      correct: "cnn",
      limit: "Necesita enormes cantidades de imágenes etiquetadas y puede ser engañada por ataques adversariales."
    },
    {
      id: "p5",
      emoji: "🌐",
      scenario: "¿Cómo traduzco este tuit al inglés?",
      context: "Tienes pares de oraciones en español e inglés como datos de entrenamiento.",
      correct: "transformer",
      limit: "Es costoso de entrenar desde cero, puede alucinar y captura sesgos del texto de entrenamiento."
    },
    {
      id: "p6",
      emoji: "🎮",
      scenario: "¿Cómo aprende un bot a jugar Free Fire?",
      context: "No hay datos etiquetados. El bot solo puede probar acciones y recibir puntos si le va bien en partida.",
      correct: "rl",
      limit: "Necesita un simulador y millones de intentos. Transferirlo al mundo real sigue siendo difícil."
    }
  ];

  const algorithms = [
    { id: "regression", label: "Regresión", emoji: "📈" },
    { id: "tree", label: "Árbol decis.", emoji: "🌳" },
    { id: "kmeans", label: "K-Means", emoji: "🔵" },
    { id: "cnn", label: "CNN", emoji: "👁" },
    { id: "transformer", label: "Transformer", emoji: "💬" },
    { id: "rl", label: "Refuerzo", emoji: "🎮" }
  ];

  const selections = {};
  const shell = $("match-shell");
  const container = $("match-cards");
  const verifyBtn = $("match-verify");
  const resetBtn = $("match-reset");

  shell.classList.add("is-active");

  problems.forEach((problem) => {
    const card = document.createElement("div");
    card.className = "match-card";
    card.id = `card-${problem.id}`;
    card.innerHTML =
      `<div class="match-card-header">` +
        `<span class="match-card-emoji">${problem.emoji}</span>` +
        `<h5 class="match-card-title">${problem.scenario}</h5>` +
      `</div>` +
      `<p class="match-card-context">${problem.context}</p>` +
      `<div class="match-algo-grid">` +
        algorithms.map((algorithm) =>
          `<button class="match-algo-btn" data-problem="${problem.id}" data-algo="${algorithm.id}">${algorithm.emoji} ${algorithm.label}</button>`
        ).join("") +
      `</div>` +
      `<div class="match-feedback" id="feedback-${problem.id}" hidden></div>`;
    container.appendChild(card);
  });

  container.addEventListener("click", (event) => {
    const btn = event.target.closest(".match-algo-btn");
    if (!btn) return;

    const problemId = btn.dataset.problem;
    const algorithmId = btn.dataset.algo;

    document.querySelectorAll(`[data-problem="${problemId}"]`).forEach((node) => {
      node.classList.remove("is-selected");
    });
    btn.classList.add("is-selected");
    selections[problemId] = algorithmId;

    const remaining = problems.filter((problem) => !selections[problem.id]).length;
    verifyBtn.disabled = remaining > 0;
    setText(
      "match-status",
      remaining > 0
        ? `Falta asignar ${remaining} problema${remaining > 1 ? "s" : ""}.`
        : "Todos asignados. Verifica tus respuestas cuando estés lista o listo."
    );
  });

  verifyBtn?.addEventListener("click", () => {
    let correct = 0;

    problems.forEach((problem) => {
      const card = $(`card-${problem.id}`);
      const feedback = $(`feedback-${problem.id}`);
      const isCorrect = selections[problem.id] === problem.correct;
      const correctAlgorithm = algorithms.find((algorithm) => algorithm.id === problem.correct);

      if (isCorrect) correct += 1;

      card?.classList.remove("match-correct", "match-incorrect");
      card?.classList.add(isCorrect ? "match-correct" : "match-incorrect");

      if (feedback) {
        feedback.hidden = false;
        feedback.innerHTML = isCorrect
          ? `<span class="match-feedback-ok">Correcto — ${correctAlgorithm.emoji} ${correctAlgorithm.label}</span><span class="match-feedback-limit">Límite: ${problem.limit}</span>`
          : `<span class="match-feedback-err">Era: ${correctAlgorithm.emoji} ${correctAlgorithm.label}</span><span class="match-feedback-limit">Límite: ${problem.limit}</span>`;
      }
    });

    const pct = Math.round((correct / problems.length) * 100);
    setText("match-seeing", `Respondiste correctamente ${correct} de ${problems.length} problemas (${pct}%).`);
    setText(
      "match-meaning",
      correct >= 5
        ? "Excelente. Ya tienes el mapa de métodos bastante claro. Conserva también el límite de cada familia."
        : correct >= 3
          ? "Buen intento. Revisa los problemas incorrectos y vuelve al diagrama de las dos preguntas."
          : "Regresa al mapa de métodos y clasifica cada caso desde arriba. La intuición se construye con práctica."
    );

    verifyBtn.disabled = true;
    resetBtn.disabled = false;
  });

  resetBtn?.addEventListener("click", () => {
    problems.forEach((problem) => {
      const card = $(`card-${problem.id}`);
      const feedback = $(`feedback-${problem.id}`);
      card?.classList.remove("match-correct", "match-incorrect");
      if (feedback) feedback.hidden = true;
      document.querySelectorAll(`[data-problem="${problem.id}"]`).forEach((node) => {
        node.classList.remove("is-selected");
      });
    });

    Object.keys(selections).forEach((key) => delete selections[key]);
    verifyBtn.disabled = true;
    resetBtn.disabled = true;
    setText("match-status", "Asigna un método a cada problema para continuar.");
    setText("match-seeing", "Seis problemas reales del mundo actual. Tu tarea es asignar la familia de IA más apropiada a cada uno.");
    setText("match-meaning", "El objetivo no es memorizar nombres, sino aprender a reconocer qué tipo de problema pide qué tipo de solución.");
  });
}

function initAutoPlayDemos() {
  const autoPlayWrappers = document.querySelectorAll(".demo-wrap[data-autoplay]");
  if (!autoPlayWrappers.length || typeof IntersectionObserver === "undefined") return;

  const playObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const startBtn = entry.target.querySelector(".demo-btn-primary:not([disabled])");
        if (startBtn) startBtn.click();
        playObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.32 }
  );

  autoPlayWrappers.forEach((wrap) => playObserver.observe(wrap));
}

document.addEventListener("DOMContentLoaded", () => {
  initKMeansDemo();
  initRLDemo();
  initMatchDemo();
  initAutoPlayDemos();
});
