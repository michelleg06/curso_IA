/* ================================================
   sesion-14.js — IA en Salud, Ciencia y Sociedad
   Interactive: Case Flipper
================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Case Flipper ----
  // Each .caso-tabs contains buttons with data-target="<panel-id>".
  // The parent .caso-flipper holds the matching .caso-panel elements.
  // On tab click: deactivate all tabs, activate clicked one,
  // then show only the panel whose id matches data-target.

  document.querySelectorAll('.caso-tabs').forEach(tabsEl => {
    const flipper = tabsEl.closest('.caso-flipper');
    if (!flipper) return;

    const tabs   = tabsEl.querySelectorAll('.caso-tab');
    const panels = flipper.querySelectorAll('.caso-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.dataset.target;

        // Deactivate all tabs
        tabs.forEach(t => t.classList.remove('active'));

        // Activate clicked tab
        tab.classList.add('active');

        // Show matching panel, hide others
        panels.forEach(panel => {
          if (panel.id === targetId) {
            panel.removeAttribute('hidden');
          } else {
            panel.setAttribute('hidden', '');
          }
        });
      });
    });
  });

});
