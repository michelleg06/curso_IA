/* ================================================
   SESIÓN 05 — Ética y Problemas Reales de la IA
================================================ */

// ── Inference reveal: scroll-triggered stagger ────────────────────────────
(function () {
  'use strict';
  var el = document.getElementById('inference-reveal');
  if (!el) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.classList.add('is-visible');
    return;
  }

  var obs = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) {
      el.classList.add('is-visible');
      obs.disconnect();
    }
  }, { threshold: 0.2 });

  obs.observe(el);
})();

// ── Facial recognition robot peek animation ────────────────────────────────
(function () {
  'use strict';
  var col = document.getElementById('facial-robot-col');
  if (!col) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    col.classList.add('is-watching');
    return;
  }

  var obs = new IntersectionObserver(function (entries) {
    entries[0].isIntersecting
      ? col.classList.add('is-watching')
      : col.classList.remove('is-watching');
  }, { threshold: 0.3 });

  obs.observe(col);
})();

// ── CV Scanner intro animation ─────────────────────────────────────────────
(function () {
  'use strict';
  var scanner = document.getElementById('cv-scanner');
  if (!scanner) return;

  var cards = Array.prototype.slice.call(scanner.querySelectorAll('.cvs-card'));
  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var started = false;
  var intervalId = null;
  var activeIndex = 1;

  if (!cards.length) return;

  function updateDeck() {
    var total = cards.length;
    var leftIndex     = (activeIndex - 1 + total) % total;
    var rightIndex    = (activeIndex + 1) % total;
    var offRightIndex = (activeIndex + 2) % total;
    var offLeftIndex  = (activeIndex - 2 + total) % total;

    cards.forEach(function (card, index) {
      ['is-front', 'is-left', 'is-right', 'is-off-left', 'is-off-right'].forEach(function (pos) {
        card.classList.remove(pos);
      });

      if (index === activeIndex) {
        card.classList.add('is-front');
      } else if (index === leftIndex) {
        card.classList.add('is-left');
      } else if (index === rightIndex) {
        card.classList.add('is-right');
      } else if (index === offRightIndex) {
        card.classList.add('is-off-right');
      } else if (index === offLeftIndex) {
        card.classList.add('is-off-left');
      } else {
        card.classList.add('is-off-left');
      }

      var isFront = index === activeIndex;
      var isFlagged = isFront && card.dataset.gender === 'female';
      card.classList.toggle('is-flagged', isFlagged);
      card.setAttribute('aria-hidden', isFront ? 'false' : 'true');
    });

    var front = cards[activeIndex];
    if (!front) return;
  }

  function stepDeck() {
    activeIndex = (activeIndex + 1) % cards.length;
    updateDeck();
  }

  function startDeck() {
    if (started) return;
    started = true;
    scanner.classList.add('is-playing');
    updateDeck();

    if (!motionQuery.matches) {
      intervalId = window.setInterval(stepDeck, 1700);
    }
  }

  function stopDeck() {
    if (intervalId) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  }

  updateDeck();

  var obs = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) {
      startDeck();
      obs.disconnect();
    }
  }, { threshold: 0.35 });

  obs.observe(scanner);
  window.addEventListener('beforeunload', stopDeck);
})();
