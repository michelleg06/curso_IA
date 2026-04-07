(function () {
  /* ── Reto: Sé la neurona ── */
  document.addEventListener('DOMContentLoaded', function () {
    var niveles = ['nada', 'poco', 'medio', 'mucho'];
    var pesos = [0.0, 0.5, 1.0, 1.5];
    var inputs = [0.7, 1.0, 0.8];
    var sesgo = -0.8;
    var umbral = 1.0;
    var entries = [
      { slider: document.getElementById('r1'), label: document.getElementById('r1-val') },
      { slider: document.getElementById('r2'), label: document.getElementById('r2-val') },
      { slider: document.getElementById('r3'), label: document.getElementById('r3-val') },
    ].filter(function (e) { return e.slider; });

    if (!entries.length) {
      return;
    }

    var barra = document.getElementById('reto-barra');
    var concl = document.getElementById('reto-concl');
    var formulaBox = document.getElementById('neurona-formula-main');
    var zChip = document.getElementById('neurona-z-chip');

    function update() {
      var total = 0;
      entries.forEach(function (e, i) {
        var v = parseInt(e.slider.value, 10);
        total += inputs[i] * pesos[v];
        if (e.label) e.label.textContent = niveles[v] + ' · ' + pesos[v].toFixed(1);
      });
      var z = total + sesgo;
      var pct = Math.max(0, Math.min(100, Math.round(((z - sesgo) / 3.75) * 100)));
      if (barra) barra.style.width = pct + '%';
      if (concl) {
        if (z >= umbral) {
          concl.textContent = 'La neurona se activa.';
          concl.style.color = '#15803d';
          if (barra) barra.style.background = 'linear-gradient(90deg,#16a34a,#22c55e)';
        } else if (z >= 0.7) {
          concl.textContent = 'La neurona está cerca, pero todavía no cruza el umbral.';
          concl.style.color = '#d97706';
          if (barra) barra.style.background = 'linear-gradient(90deg,#d97706,#f59e0b)';
        } else {
          concl.textContent = 'La evidencia es baja: la neurona no se activa.';
          concl.style.color = '#64748b';
          if (barra) barra.style.background = 'linear-gradient(90deg,#2780e3,#0ea5e9)';
        }
      }

      if (formulaBox) {
        formulaBox.textContent =
          'z = '
          + '(' + inputs[0].toFixed(1) + ')(' + pesos[parseInt(entries[0].slider.value, 10)].toFixed(1) + ')'
          + ' + '
          + '(' + inputs[1].toFixed(1) + ')(' + pesos[parseInt(entries[1].slider.value, 10)].toFixed(1) + ')'
          + ' + '
          + '(' + inputs[2].toFixed(1) + ')(' + pesos[parseInt(entries[2].slider.value, 10)].toFixed(1) + ')'
          + ' - 0.8 = '
          + z.toFixed(2);
      }
      if (zChip) {
        zChip.textContent = 'z = ' + z.toFixed(2);
      }

      var seeing  = document.getElementById('neurona-seeing');
      var meaning = document.getElementById('neurona-meaning');
      if (seeing) {
        if (z >= umbral)
          seeing.textContent = 'Los pesos actuales hacen que la evidencia total supere el umbral. La neurona ahora sí se activa.';
        else if (z >= 0.7)
          seeing.textContent = 'La evidencia total está cerca del umbral. Un cambio pequeño en un peso puede cambiar la decisión.';
        else
          seeing.textContent = 'Con estos pesos, la evidencia acumulada sigue siendo baja y la neurona no se activa.';
      }
      if (meaning) {
        if (z >= umbral)
          meaning.textContent = 'Esto ilustra la idea central: la imagen aporta los valores, pero los pesos aprendidos determinan qué rasgos cuentan más para activar la neurona.';
        else if (z >= 0.7)
          meaning.textContent = 'El umbral funciona como punto de corte. La neurona puede tener evidencia, pero no necesariamente la suficiente como para activarse.';
        else
          meaning.textContent = 'Si los pesos son bajos, incluso rasgos visibles aportan poca evidencia. Durante el entrenamiento, la red aprende estos pesos automáticamente.';
      }
    }
    entries.forEach(function (e) { e.slider.addEventListener('input', update); });
    update();

    /* ── Entrenamiento animado ── */
    var trainRunning = false;
    var trainBtn = document.getElementById('train-play-btn');
    if (trainBtn) {
      trainBtn.addEventListener('click', function() {
        if (trainRunning) return;
        runTraining();
      });
    }

    function runTraining() {
      trainRunning = true;
      var btn      = document.getElementById('train-play-btn');
      var errorBar = document.getElementById('train-error-bar');
      var errorPct = document.getElementById('train-error-pct');
      var predEl   = document.getElementById('train-pred');
      var cicloEl  = document.getElementById('train-ciclo-num');
      if (btn) btn.disabled = true;
      if (errorBar) { errorBar.style.width = '85%'; errorBar.style.background = '#dc2626'; }
      if (errorPct) errorPct.textContent = '85%';
      if (predEl)   { predEl.textContent = '❌ no gato'; predEl.className = 'train-pred wrong'; }
      if (cicloEl)  cicloEl.textContent = '0';

      var step = 0, total = 80;
      var w = [0.30, 0.45, 0.25];
      var iv = setInterval(function() {
        step++;
        var p     = step / total;
        var error = Math.round(85 * Math.pow(1 - p, 2.2));
        var hue   = Math.round(p * 120);
        if (errorBar) { errorBar.style.width = error + '%'; errorBar.style.background = 'hsl(' + hue + ',70%,45%)'; }
        if (errorPct) errorPct.textContent = error + '%';
        if (cicloEl)  cicloEl.textContent  = Math.round(p * 10000).toLocaleString('es-MX');
        if (predEl) {
          if      (p < 0.4)  { predEl.textContent = '❌ no gato';    predEl.className = 'train-pred wrong'; }
          else if (p < 0.75) { predEl.textContent = '🤔 quizá gato'; predEl.className = 'train-pred maybe'; }
          else               { predEl.textContent = '✅ gato';       predEl.className = 'train-pred correct'; }
        }
        // Peso jiggle: cada ~6 pasos los pesos se ajustan un poco
        if (step % 6 === 0) {
          var adj = (1 - p) * 0.06;
          w = w.map(function(wi) { return Math.max(0, Math.min(1, wi + (Math.random()-0.5)*adj)); });
          ['tp1','tp2','tp3'].forEach(function(id, i) {
            var el = document.getElementById(id);
            if (!el) return;
            el.textContent = ['orejas = ','bigotes = ','ojos = '][i] + w[i].toFixed(2);
            el.classList.remove('jiggling');
            void el.offsetWidth;
            el.classList.add('jiggling');
            setTimeout(function(e){ e.classList.remove('jiggling'); }, 260, el);
          });
        }
        if (step >= total) {
          clearInterval(iv);
          trainRunning = false;
          if (btn) { btn.disabled = false; btn.textContent = '↺ Ver de nuevo'; }
        }
      }, 35);
    }
  });
})();
