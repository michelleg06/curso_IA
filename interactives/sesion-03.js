(function () {
  const problems = [
    {
      id: 'p1', emoji: '🚗',
      scenario: '¿Cuánto tarda tu DiDi en llegar?',
      context: 'Tienes el historial de miles de viajes: distancia, hora del día, tráfico y tiempo real de llegada.',
      correct: 'regression',
      limit: 'Solo funciona bien cuando la relación entre las variables es aproximadamente lineal o cuasi-lineal.'
    },
    {
      id: 'p2', emoji: '📧',
      scenario: '¿Es spam este mensaje?',
      context: 'Tienes millones de mensajes ya etiquetados como "spam" o "no spam".',
      correct: 'tree',
      limit: 'Se confunde con mensajes muy distintos a los que vio durante el entrenamiento (datos fuera de distribución).'
    },
    {
      id: 'p3', emoji: '🎵',
      scenario: '¿Qué tipo de oyente eres en Spotify?',
      context: 'Solo tienes el historial de reproducción de miles de usuarios, sin categorías predefinidas.',
      correct: 'kmeans',
      limit: 'Tú debes decidir cuántos grupos quieres — el algoritmo no elige ese número por sí solo.'
    },
    {
      id: 'p4', emoji: '📸',
      scenario: '¿Este video tiene contenido inapropiado?',
      context: 'Tienes millones de frames de video etiquetados como "apropiado" o "inapropiado".',
      correct: 'cnn',
      limit: 'Necesita enormes cantidades de imágenes etiquetadas y puede ser engañada por ataques adversariales.'
    },
    {
      id: 'p5', emoji: '🌐',
      scenario: '¿Cómo traduzco este tuit al inglés?',
      context: 'Tienes pares de oraciones en español e inglés como datos de entrenamiento.',
      correct: 'transformer',
      limit: 'Extremadamente costoso de entrenar desde cero. Puede alucinar y captura sesgos del texto de entrenamiento.'
    },
    {
      id: 'p6', emoji: '🎮',
      scenario: '¿Cómo aprende un bot a jugar Free Fire?',
      context: 'No hay datos etiquetados. El bot solo puede probar acciones y recibir puntos si le va bien en partida.',
      correct: 'rl',
      limit: 'Necesita un simulador y millones de intentos. Transferirlo al mundo real (sim-to-real gap) es difícil.'
    }
  ];

  const algorithms = [
    { id: 'regression', label: 'Regresión', emoji: '📈' },
    { id: 'tree',       label: 'Árbol decis.', emoji: '🌳' },
    { id: 'kmeans',     label: 'K-Means', emoji: '🔵' },
    { id: 'cnn',        label: 'CNN', emoji: '👁' },
    { id: 'transformer',label: 'Transformer', emoji: '💬' },
    { id: 'rl',         label: 'Refuerzo', emoji: '🎮' }
  ];

  const selections = {};

  // Activar el shell inmediatamente (sin botón de inicio)
  document.getElementById('match-shell').classList.add('is-active');

  // Build cards
  const container = document.getElementById('match-cards');
  problems.forEach(function (p) {
    const card = document.createElement('div');
    card.className = 'match-card';
    card.id = 'card-' + p.id;
    card.innerHTML =
      '<div class="match-card-header">' +
        '<span class="match-card-emoji">' + p.emoji + '</span>' +
        '<h5 class="match-card-title">' + p.scenario + '</h5>' +
      '</div>' +
      '<p class="match-card-context">' + p.context + '</p>' +
      '<div class="match-algo-grid" id="algo-grid-' + p.id + '">' +
        algorithms.map(function (a) {
          return '<button class="match-algo-btn" data-problem="' + p.id + '" data-algo="' + a.id + '">' +
            a.emoji + ' ' + a.label + '</button>';
        }).join('') +
      '</div>' +
      '<div class="match-feedback" id="feedback-' + p.id + '" hidden></div>';
    container.appendChild(card);
  });

  // Selection handler
  container.addEventListener('click', function (e) {
    const btn = e.target.closest('.match-algo-btn');
    if (!btn) return;
    const prob = btn.dataset.problem;
    const algo = btn.dataset.algo;

    document.querySelectorAll('[data-problem="' + prob + '"]').forEach(function (b) {
      b.classList.remove('is-selected');
    });
    btn.classList.add('is-selected');
    selections[prob] = algo;

    const remaining = problems.filter(function (p) { return !selections[p.id]; }).length;
    const verifyBtn = document.getElementById('match-verify');
    verifyBtn.disabled = remaining > 0;
    document.getElementById('match-status').textContent = remaining > 0
      ? 'Falta asignar ' + remaining + ' problema' + (remaining > 1 ? 's' : '') + '.'
      : '¡Todos asignados! Verifica tus respuestas cuando estés listo.';
  });

  // Verify
  document.getElementById('match-verify').addEventListener('click', function () {
    let correct = 0;
    problems.forEach(function (p) {
      const card = document.getElementById('card-' + p.id);
      const feedback = document.getElementById('feedback-' + p.id);
      const isCorrect = selections[p.id] === p.correct;
      if (isCorrect) correct++;

      card.classList.remove('match-correct', 'match-incorrect');
      card.classList.add(isCorrect ? 'match-correct' : 'match-incorrect');

      const correctAlgo = algorithms.find(function (a) { return a.id === p.correct; });
      feedback.hidden = false;
      feedback.innerHTML = isCorrect
        ? '<span class="match-feedback-ok">✅ Correcto — ' + correctAlgo.emoji + ' ' + correctAlgo.label + '</span>' +
          '<span class="match-feedback-limit">⚠️ Su límite: ' + p.limit + '</span>'
        : '<span class="match-feedback-err">❌ Era: ' + correctAlgo.emoji + ' ' + correctAlgo.label + '</span>' +
          '<span class="match-feedback-limit">⚠️ Su límite: ' + p.limit + '</span>';
    });

    const pct = Math.round((correct / problems.length) * 100);
    document.getElementById('match-seeing').textContent =
      'Respondiste correctamente ' + correct + ' de ' + problems.length + ' problemas (' + pct + '%).';
    document.getElementById('match-meaning').textContent = correct >= 5
      ? 'Excelente — ya tienes el mapa de métodos muy claro. Recuerda los límites de cada familia.'
      : correct >= 3
      ? 'Buen intento. Revisa los problemas incorrectos y vuelve al diagrama de las dos preguntas.'
      : 'Regresa al mapa de métodos y practica las dos preguntas desde arriba. La clasificación se vuelve intuitiva con práctica.';

    document.getElementById('match-verify').disabled = true;
    document.getElementById('match-reset').disabled = false;
  });

  // Reset
  document.getElementById('match-reset').addEventListener('click', function () {
    problems.forEach(function (p) {
      const card = document.getElementById('card-' + p.id);
      card.classList.remove('match-correct', 'match-incorrect');
      const feedback = document.getElementById('feedback-' + p.id);
      feedback.hidden = true;
      document.querySelectorAll('[data-problem="' + p.id + '"]').forEach(function (b) {
        b.classList.remove('is-selected');
      });
    });
    Object.keys(selections).forEach(function (k) { delete selections[k]; });
    document.getElementById('match-verify').disabled = true;
    document.getElementById('match-reset').disabled = true;
    document.getElementById('match-status').textContent = 'Asigna un método a cada problema para continuar.';
    document.getElementById('match-seeing').textContent = '6 problemas reales del mundo actual. Tu tarea es asignar la familia de IA más apropiada a cada uno.';
    document.getElementById('match-meaning').textContent = 'El objetivo no es memorizar nombres — es aprender a reconocer qué tipo de problema pide qué tipo de solución.';
  });
})();
