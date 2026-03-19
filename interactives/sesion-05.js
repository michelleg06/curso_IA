/* ================================================
   SESIÓN 05 — Bias Demo
   Simulador de contratación con sesgo algorítmico
================================================ */

(function () {
  'use strict';

  // ── Data ──────────────────────────────────────────────────────────────────
  // Grupo A: model score ≈ real quality (small noise, fair)
  const grupoA = [
    { name: 'Andrés',    real: 7.5, model: 7.3 },
    { name: 'Rodrigo',   real: 6.0, model: 6.2 },
    { name: 'Sebastián', real: 5.5, model: 5.4 },
    { name: 'Miguel',    real: 4.8, model: 5.0 },
    { name: 'Carlos',    real: 6.5, model: 6.7 },
    { name: 'Diego',     real: 8.0, model: 7.9 },
    { name: 'Fernando',  real: 7.2, model: 7.1 },
    { name: 'Emilio',    real: 5.8, model: 5.9 },
    { name: 'Alejandro', real: 8.5, model: 8.4 },
    { name: 'Pablo',     real: 6.8, model: 6.8 },
  ];

  // Grupo B: model score = real - ~2.0 (systematic bias)
  const grupoB = [
    { name: 'Valentina', real: 9.0, model: 7.0 },
    { name: 'Isabella',  real: 7.8, model: 5.8 },
    { name: 'Sofía',     real: 8.5, model: 6.5 },
    { name: 'Fernanda',  real: 7.2, model: 5.2 },
    { name: 'Kenia',     real: 7.5, model: 5.5 },
    { name: 'Daniela',   real: 8.2, model: 6.2 },
    { name: 'Marisol',   real: 5.5, model: 3.5 },
    { name: 'Citlali',   real: 6.0, model: 4.0 },
    { name: 'Lesly',     real: 7.8, model: 5.8 },
    { name: 'Jazmín',    real: 8.0, model: 6.0 },
  ];

  // ── Element refs ─────────────────────────────────────────────────────────
  const shell      = document.getElementById('bias-shell');
  if (!shell) return;

  const startBtn   = document.getElementById('bias-start');
  const resetBtn   = document.getElementById('bias-reset');
  const slider     = document.getElementById('bias-threshold');
  const threshDisp = document.getElementById('bias-threshold-display');
  const contA      = document.getElementById('bias-candidates-a');
  const contB      = document.getElementById('bias-candidates-b');
  const numA       = document.getElementById('bias-stat-num-a');
  const subA       = document.getElementById('bias-stat-sub-a');
  const numB       = document.getElementById('bias-stat-num-b');
  const subB       = document.getElementById('bias-stat-sub-b');
  const fnAlert    = document.getElementById('bias-fn-alert');
  const seeingEl   = document.getElementById('bias-seeing');
  const meaningEl  = document.getElementById('bias-meaning');
  const statusEl   = document.getElementById('bias-status');

  let active = false;

  // ── Render candidate chips ────────────────────────────────────────────────
  function renderGroup(container, data) {
    container.innerHTML = '';
    data.forEach(function (c) {
      var chip = document.createElement('div');
      chip.className = 'bias-chip';
      chip.dataset.real  = c.real;
      chip.dataset.model = c.model;
      chip.innerHTML =
        '<span class="bias-chip-name">' + c.name + '</span>' +
        '<span class="bias-chip-model">Algoritmo: <strong>' + c.model.toFixed(1) + '</strong></span>' +
        '<span class="bias-chip-real">Real: <strong>' + c.real.toFixed(1) + '</strong></span>' +
        '<span class="bias-fn-badge" hidden>perdida</span>';
      container.appendChild(chip);
    });
  }

  // ── Update state at threshold ─────────────────────────────────────────────
  function update(threshold) {
    if (!active) return;

    threshDisp.textContent = threshold.toFixed(1);

    var hiredA = 0, hiredB = 0, fnA = 0, fnB = 0;

    // Group A
    var chipsA = contA.querySelectorAll('.bias-chip');
    chipsA.forEach(function (chip, i) {
      var real  = grupoA[i].real;
      var model = grupoA[i].model;
      var hired = model >= threshold;
      var fn    = !hired && real >= threshold;
      chip.className = 'bias-chip' + (hired ? ' is-hired' : fn ? ' is-false-negative' : ' is-rejected');
      chip.querySelector('.bias-fn-badge').hidden = !fn;
      if (hired) hiredA++;
      if (fn)    fnA++;
    });

    // Group B
    var chipsB = contB.querySelectorAll('.bias-chip');
    chipsB.forEach(function (chip, i) {
      var real  = grupoB[i].real;
      var model = grupoB[i].model;
      var hired = model >= threshold;
      var fn    = !hired && real >= threshold;
      chip.className = 'bias-chip' + (hired ? ' is-hired' : fn ? ' is-false-negative' : ' is-rejected');
      chip.querySelector('.bias-fn-badge').hidden = !fn;
      if (hired) hiredB++;
      if (fn)    fnB++;
    });

    var pctA = Math.round(hiredA / grupoA.length * 100);
    var pctB = Math.round(hiredB / grupoB.length * 100);

    numA.textContent = pctA + '%';
    subA.textContent = hiredA + ' de ' + grupoA.length + ' contratados';
    numB.textContent = pctB + '%';
    subB.textContent = hiredB + ' de ' + grupoB.length + ' contratadas';

    var totalFn = fnA + fnB;
    if (totalFn > 0) {
      fnAlert.hidden = false;
      var pl = totalFn > 1;
      fnAlert.innerHTML =
        '⚠ <strong>' + totalFn + ' candidata' + (pl ? 's' : '') +
        ' calificada' + (pl ? 's' : '') + ' rechazada' + (pl ? 's' : '') +
        '</strong> — puntaje real ≥ ' + threshold.toFixed(1) +
        ' pero el modelo las descartó (fichas naranja)';
    } else {
      fnAlert.hidden = true;
    }

    // Insight text
    var diff = pctA - pctB;
    if (pctA === 0 && pctB === 0) {
      seeingEl.textContent  = 'Con umbral ' + threshold.toFixed(1) + ', ningún candidato de ningún grupo pasa el filtro.';
      meaningEl.textContent = 'Baja el umbral para ver cómo emerge la disparidad entre grupos.';
      statusEl.textContent  = 'Umbral demasiado alto — nadie pasa. Prueba con un umbral más bajo.';
    } else if (diff > 20) {
      seeingEl.textContent  = 'Umbral ' + threshold.toFixed(1) + ': Grupo A pasa ' + pctA + '%, Grupo B solo ' + pctB + '%. Una diferencia de ' + diff + ' puntos porcentuales.';
      meaningEl.textContent = 'Esa brecha no refleja diferencias reales de desempeño — ambos grupos tienen calidad similar. La brecha es el sesgo del modelo.';
      statusEl.textContent  = totalFn + ' candidata' + (totalFn !== 1 ? 's' : '') + ' calificada' + (totalFn !== 1 ? 's' : '') + ' del Grupo B rechazada' + (totalFn !== 1 ? 's' : '') + ' por el sesgo.';
    } else if (diff > 0) {
      seeingEl.textContent  = 'Umbral ' + threshold.toFixed(1) + ': Grupo A pasa ' + pctA + '%, Grupo B pasa ' + pctB + '%. La brecha es de ' + diff + ' puntos.';
      meaningEl.textContent = 'Hay disparidad, pero es menor aquí. Sube el umbral para ver dónde el sesgo se vuelve más evidente.';
      statusEl.textContent  = totalFn > 0 ? totalFn + ' candidata' + (totalFn !== 1 ? 's' : '') + ' del Grupo B rechazada' + (totalFn !== 1 ? 's' : '') + ' a pesar de su calidad real.' : 'Con este umbral el impacto es menor. Experimenta con otros valores.';
    } else {
      seeingEl.textContent  = 'Umbral ' + threshold.toFixed(1) + ': tasas similares (' + pctA + '% vs ' + pctB + '%). El sesgo no desaparece — el modelo sigue siendo injusto.';
      meaningEl.textContent = 'A umbrales bajos casi todos pasan. El sesgo se hace visible cuando el umbral sube y el modelo tiene que discriminar.';
      statusEl.textContent  = 'Sube el umbral para ver la disparidad en acción.';
    }
  }

  // ── Event listeners ───────────────────────────────────────────────────────
  startBtn.addEventListener('click', function () {
    active = true;
    shell.classList.add('is-active');
    startBtn.disabled  = true;
    resetBtn.disabled  = false;
    slider.disabled    = false;
    renderGroup(contA, grupoA);
    renderGroup(contB, grupoB);
    update(parseFloat(slider.value));
  });

  resetBtn.addEventListener('click', function () {
    active = false;
    shell.classList.remove('is-active');
    startBtn.disabled  = false;
    resetBtn.disabled  = true;
    slider.disabled    = true;
    slider.value       = '7.0';
    threshDisp.textContent = '7.0';
    contA.innerHTML    = '';
    contB.innerHTML    = '';
    numA.textContent   = '—';
    subA.textContent   = '';
    numB.textContent   = '—';
    subB.textContent   = '';
    fnAlert.hidden = true;
    seeingEl.textContent  = 'Inicia el simulador para ver cómo el sesgo del modelo afecta a cada grupo de forma distinta.';
    meaningEl.textContent = 'El mismo umbral, el mismo algoritmo — pero dos tasas de aceptación muy diferentes. Así funciona el sesgo algorítmico.';
    statusEl.textContent  = 'Inicia el simulador para explorar el sesgo en acción.';
  });

  slider.addEventListener('input', function () {
    update(parseFloat(this.value));
  });

  // ── Init state ────────────────────────────────────────────────────────────
  slider.disabled = true;
  fnAlert.hidden = true;

})();
