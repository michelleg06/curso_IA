/* ================================================
   sesion-13.js — Robótica e IA en el Mundo Físico
   Interactive: Case Flipper
================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Case Flipper ----
  // Each .caso-tabs contains buttons with data-target="<panel-id>".
  // The parent .caso-flipper holds the matching .caso-panel elements.

  document.querySelectorAll('.caso-tabs').forEach(tabsEl => {
    const flipper = tabsEl.closest('.caso-flipper');
    if (!flipper) return;

    const tabs   = tabsEl.querySelectorAll('.caso-tab');
    const panels = flipper.querySelectorAll('.caso-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.dataset.target;

        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

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

  // ---- Robot Grid Simulator ----
  // 6×6 grid. Robot starts at (0,0), goal at (5,5).
  // Sensor panel shows free steps in each direction (0 = blocked).
  // Battery decreases 12% per move; game ends at 0%.

  (function () {
    const ROWS = 6, COLS = 6, MAX_SENSOR = 5, BATTERY_PER_MOVE = 12;
    const OBSTACLES = [[1,2],[2,2],[2,3],[3,5],[4,1],[4,4],[5,2]];
    const GOAL = [5,5], START = [0,0];

    const gridEl   = document.getElementById('sim-grid');
    if (!gridEl) return;

    const statusEl = document.getElementById('sim-status');
    const fillEl   = document.getElementById('sim-battery-fill');
    const pctEl    = document.getElementById('sim-battery-pct');
    const movesEl  = document.getElementById('sim-moves-count');

    let robot, battery, moves, won, over;

    function isObs(r, c) {
      return OBSTACLES.some(o => o[0] === r && o[1] === c);
    }

    // Returns number of free steps in direction (dr,dc) before hitting wall/obstacle.
    function sensorDist(r, c, dr, dc) {
      for (let d = 0; d <= MAX_SENSOR; d++) {
        const nr = r + dr * (d + 1), nc = c + dc * (d + 1);
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return d;
        if (isObs(nr, nc)) return d;
      }
      return MAX_SENSOR;
    }

    function updateSensors() {
      const [r, c] = robot;
      const dirs = { n: [-1,0], s: [1,0], e: [0,1], o: [0,-1] };
      for (const [id, [dr, dc]] of Object.entries(dirs)) {
        const val = sensorDist(r, c, dr, dc);
        const bar = document.getElementById('sim-s-' + id);
        const txt = document.getElementById('sim-v-' + id);
        if (!bar || !txt) continue;
        bar.style.width      = Math.round(val / MAX_SENSOR * 100) + '%';
        bar.style.background = val === 0 ? '#ef4444' : val <= 2 ? '#f59e0b' : '#22c55e';
        txt.textContent      = val;
      }
    }

    function updateBattery() {
      const p = Math.max(0, battery);
      if (fillEl) {
        fillEl.style.width   = p + '%';
        fillEl.className     = 'sim-battery-fill' +
                               (p <= 25 ? ' critical' : p <= 50 ? ' low' : '');
      }
      if (pctEl) pctEl.textContent = p + '%';
    }

    function renderGrid() {
      gridEl.innerHTML = '';
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cell = document.createElement('div');
          cell.className = 'sim-cell';
          if (robot[0] === r && robot[1] === c) {
            cell.classList.add(won ? 'sim-cell-won' : 'sim-cell-robot');
            cell.textContent = won ? '🎉' : '🤖';
          } else if (GOAL[0] === r && GOAL[1] === c) {
            cell.classList.add('sim-cell-goal');
            cell.textContent = '⭐';
          } else if (isObs(r, c)) {
            cell.classList.add('sim-cell-obstacle');
            cell.textContent = '▪';
          }
          gridEl.appendChild(cell);
        }
      }
    }

    function setStatus(msg) { if (statusEl) statusEl.textContent = msg; }

    function setControls(enabled) {
      ['sim-up','sim-down','sim-left','sim-right'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = !enabled;
      });
    }

    function tryMove(dr, dc) {
      if (over || won) return;
      const [r, c] = robot;
      const nr = r + dr, nc = c + dc;

      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || isObs(nr, nc)) {
        setStatus('⚠ No puedo avanzar — hay un obstáculo o el límite del mapa.');
        // bump animation
        const cells = gridEl.querySelectorAll('.sim-cell');
        const idx   = r * COLS + c;
        if (cells[idx]) {
          cells[idx].classList.remove('bump');
          void cells[idx].offsetWidth; // reflow
          cells[idx].classList.add('bump');
        }
        return;
      }

      robot = [nr, nc];
      battery -= BATTERY_PER_MOVE;
      moves++;
      if (movesEl) movesEl.textContent = moves;
      updateBattery();

      if (nr === GOAL[0] && nc === GOAL[1]) {
        won = true;
        renderGrid();
        setStatus('🎉 ¡Meta alcanzada en ' + moves + ' pasos! Analiza si fue el camino más eficiente.');
        setControls(false);
        return;
      }

      if (battery <= 0) {
        over = true; battery = 0;
        updateBattery(); renderGrid();
        setStatus('🔋 Sin batería. El robot se detuvo. ¿Qué ruta hubiera sido más corta?');
        setControls(false);
        return;
      }

      renderGrid();
      updateSensors();

      if      (battery <= 25) setStatus('⚡ Batería crítica — pocos movimientos restantes.');
      else if (battery <= 50) setStatus('🔋 Batería al ' + battery + '%. Elige bien.');
      else                    setStatus('Sensor activo · Batería: ' + battery + '%');
    }

    function init() {
      robot = [...START]; battery = 100; moves = 0; won = false; over = false;
      if (movesEl) movesEl.textContent = '0';
      setStatus('Usa los botones para guiar al robot 🤖 hasta la meta ⭐');
      setControls(true);
      updateBattery();
      renderGrid();
      updateSensors();
    }

    document.getElementById('sim-up')?.addEventListener('click',    () => tryMove(-1,  0));
    document.getElementById('sim-down')?.addEventListener('click',  () => tryMove( 1,  0));
    document.getElementById('sim-left')?.addEventListener('click',  () => tryMove( 0, -1));
    document.getElementById('sim-right')?.addEventListener('click', () => tryMove( 0,  1));
    document.getElementById('sim-reset')?.addEventListener('click', init);

    init();
  })();

  // ---- RL Grid Animation ----
  // 5×5 grid world. Agent (purple circle) tries to reach the goal (★)
  // past a vertical wall (col 2, rows 1–3). Episodes 1–3 hit the wall
  // from different angles; episode 4 finds the bottom route around it.
  (function () {
    const canvas = document.getElementById('rl-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const W = 190, H = 222;
    canvas.width = W;
    canvas.height = H;

    const ROWS = 5, COLS = 5, CELL = 34, GAP = 2;
    const GW = COLS * CELL + (COLS - 1) * GAP;   // 178
    const GX = Math.round((W - GW) / 2);          // 6
    const GY = 22;

    const WALLS = [[1,2],[2,2],[3,2]];
    const GOAL  = [4, 4];

    const STEP_MS = 320, FAIL_MS = 700, WIN_MS = 1000, GAP_MS = 350;

    const C = {
      bg:        '#0f172a',
      cell:      '#1e293b',
      cellBdr:   '#2e3f52',
      wall:      '#3d4f61',
      wallBdr:   '#506070',
      goal:      '#1c1200',
      goalBdr:   '#f59e0b',
      agent:     '#a78bfa',
      trailFail: 'rgba(239,68,68,0.25)',
      trailOk:   'rgba(34,197,94,0.28)',
      dim:       'rgba(255,255,255,0.32)',
      bright:    'rgba(255,255,255,0.82)',
      fail:      '#f87171',
      ok:        '#4ade80',
    };

    // path = cells visited (incl. start); hit = obstacle cell attempted; win = reached goal
    const EPS = [
      { path: [[0,0],[1,0],[1,1]],               hit: [1,2], win: false },
      { path: [[0,0],[0,1],[1,1],[2,1]],          hit: [2,2], win: false },
      { path: [[0,0],[1,0],[2,0],[2,1],[3,1]],    hit: [3,2], win: false },
      { path: [[0,0],[1,0],[2,0],[3,0],[4,0],[4,1],[4,2],[4,3],[4,4]], hit: null, win: true },
    ];

    let ep = 0, step = 0, phase = 'step', timer = 0, prev = null;

    function rr(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
    }

    function cx(c) { return GX + c * (CELL + GAP) + CELL / 2; }
    function cy(r) { return GY + r * (CELL + GAP) + CELL / 2; }

    function drawGrid(trail, trailCol) {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const x = GX + c * (CELL + GAP);
          const y = GY + r * (CELL + GAP);
          const isWall = WALLS.some(w => w[0] === r && w[1] === c);
          const isGoal = GOAL[0] === r && GOAL[1] === c;

          rr(x, y, CELL, CELL, 4);
          ctx.fillStyle = isWall ? C.wall : isGoal ? C.goal : C.cell;
          ctx.fill();

          if (!isWall && trail.some(t => t[0] === r && t[1] === c)) {
            rr(x, y, CELL, CELL, 4);
            ctx.fillStyle = trailCol;
            ctx.fill();
          }

          rr(x, y, CELL, CELL, 4);
          ctx.strokeStyle = isWall ? C.wallBdr : isGoal ? C.goalBdr : C.cellBdr;
          ctx.lineWidth = 1;
          ctx.stroke();

          if (isGoal) {
            ctx.fillStyle = '#fbbf24';
            ctx.font = Math.round(CELL * 0.52) + 'px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('★', cx(c), cy(r) + 1);
          }

          if (isWall) {
            ctx.fillStyle = '#8896a8';
            ctx.font = 'bold ' + Math.round(CELL * 0.46) + 'px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('▪', cx(c), cy(r));
          }
        }
      }
    }

    function drawAgent(r, c) {
      const x = cx(c), y = cy(r), R = 8;
      const g = ctx.createRadialGradient(x, y, 0, x, y, R + 5);
      g.addColorStop(0, 'rgba(167,139,250,0.35)');
      g.addColorStop(1, 'rgba(167,139,250,0)');
      ctx.beginPath();
      ctx.arc(x, y, R + 5, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, R, 0, Math.PI * 2);
      ctx.fillStyle = C.agent;
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x - 3, y - 2, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 3, y - 2, 1.5, 0, Math.PI * 2); ctx.fill();
    }

    function drawFlash(r, c, alpha) {
      const x = GX + c * (CELL + GAP);
      const y = GY + r * (CELL + GAP);
      rr(x, y, CELL, CELL, 4);
      ctx.fillStyle = 'rgba(239,68,68,' + alpha + ')';
      ctx.fill();
      rr(x, y, CELL, CELL, 4);
      ctx.strokeStyle = 'rgba(239,68,68,' + Math.min(1, alpha * 1.5) + ')';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    function drawLabel(epNum, total) {
      ctx.fillStyle = C.dim;
      ctx.font = '700 8.5px system-ui,sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('EPISODIO', 7, 11);
      ctx.fillStyle = C.bright;
      ctx.textAlign = 'right';
      ctx.fillText(epNum + ' / ' + total, W - 7, 11);
    }

    function drawStatus(txt, col) {
      ctx.fillStyle = col;
      ctx.font = '700 9.5px system-ui,sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(txt, W / 2, H - 9);
    }

    function frame(ts) {
      if (!prev) prev = ts;
      const dt = Math.min(ts - prev, 80);
      prev = ts;
      timer += dt;

      const e = EPS[ep];
      const trail    = e.path.slice(0, step + 1);
      const agentPos = e.path[step];
      const trailCol = e.win ? C.trailOk : C.trailFail;

      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, W, H);

      drawLabel(ep + 1, EPS.length);
      drawGrid(trail, trailCol);

      if (phase === 'step') {
        drawAgent(agentPos[0], agentPos[1]);
        drawStatus('explorando...', C.dim);
        if (timer >= STEP_MS) {
          timer -= STEP_MS;
          step++;
          if (step >= e.path.length) {
            step = e.path.length - 1;
            phase = e.win ? 'win' : 'fail';
            timer = 0;
          }
        }

      } else if (phase === 'fail') {
        drawAgent(agentPos[0], agentPos[1]);
        if (e.hit) {
          const alpha = Math.max(0, Math.sin(timer / FAIL_MS * Math.PI) * 0.75);
          drawFlash(e.hit[0], e.hit[1], alpha);
        }
        drawStatus('✗  FALLO', C.fail);
        if (timer >= FAIL_MS) { phase = 'gap'; timer = 0; }

      } else if (phase === 'win') {
        drawAgent(agentPos[0], agentPos[1]);
        drawStatus('✓  META', C.ok);
        if (timer >= WIN_MS) { phase = 'gap'; timer = 0; }

      } else if (phase === 'gap') {
        drawStatus('', C.dim);
        if (timer >= GAP_MS) {
          ep    = (ep + 1) % EPS.length;
          step  = 0;
          phase = 'step';
          timer = 0;
        }
      }

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  })();

});
