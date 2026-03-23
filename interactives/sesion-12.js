/* ================================================
   sesion-12.js — Programación con IA: Python
   Interactive: Code Annotator + Bug Revealer
================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Code Annotator ----
  // Each .code-annotator has data-panel="<id>" pointing to its note panel.
  // Lines with data-note="..." become clickable.

  document.querySelectorAll('.code-annotator').forEach(annotator => {
    const panelId = annotator.dataset.panel;
    const panel = document.getElementById(panelId);
    if (!panel) return;

    const lines = annotator.querySelectorAll('.code-line[data-note]');

    lines.forEach(line => {
      line.addEventListener('click', () => {
        // Deactivate all lines in this annotator
        lines.forEach(l => l.classList.remove('is-active'));

        // Activate clicked line
        line.classList.add('is-active');

        // Build note content
        const note = line.dataset.note;
        const lineNum = line.dataset.line;

        panel.innerHTML = `
          <span class="ca-note-line-num">Línea ${lineNum}</span>
          <p>${note}</p>
        `;
        panel.classList.add('has-content');
      });
    });

    // Click outside to deactivate
    document.addEventListener('click', (e) => {
      if (!annotator.contains(e.target) && !panel.contains(e.target)) {
        lines.forEach(l => l.classList.remove('is-active'));
      }
    });
  });


  // ---- Bug Revealer ----
  // Buttons with id="reveal-bug-N" toggle display of id="bug-reveal-N"

  document.querySelectorAll('[id^="reveal-bug"]').forEach(btn => {
    const suffix = btn.id.replace('reveal-bug', '');
    const revealEl = document.getElementById('bug-reveal' + suffix);
    if (!revealEl) return;

    revealEl.style.display = 'none';

    btn.addEventListener('click', () => {
      const isVisible = revealEl.style.display !== 'none';
      revealEl.style.display = isVisible ? 'none' : 'block';
      btn.textContent = isVisible ? 'Ver pista' : 'Ocultar pista';
    });
  });


  // ---- Colab run button (cosmetic) ----
  // Gives a brief "running" state to .colab-run-btn on click

  document.querySelectorAll('.colab-run-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orig = btn.textContent;
      btn.style.background = '#FFD43B';
      btn.style.color = '#1e3a5f';
      btn.textContent = '■';
      setTimeout(() => {
        btn.style.background = '#3776AB';
        btn.style.color = '#fff';
        btn.textContent = orig;
      }, 800);
    });
  });

});
