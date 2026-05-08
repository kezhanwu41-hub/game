/**
 * bingfa-main.js — 兵法推演 UI 控制器
 * Complete rewrite: Canvas 2D battlefield, clean BP loop, stepProgress API
 */
(function() {
  'use strict';

  const D = window.BingFaData;
  const E = window.BingFaEngine;

  let state = null;
  let timerInterval = null;   // player turn countdown (setInterval)
  let aiTimerHandle = null;   // enemy AI delay (setTimeout)
  let pickedTactics = [null, null];
  let battleRafHandle = null;
  let elemFilter = '';
  let jobFilter = '';

  // ── Colour helpers ──────────────────────────────────────────────
  const ELEM_COLOR = { 木:'#81c784', 火:'#ef5350', 土:'#ffca28', 金:'#b0bec5', 水:'#42a5f5' };
  const ELEM_GLOW  = { 木:'rgba(129,199,132,', 火:'rgba(239,83,80,', 土:'rgba(255,202,40,', 金:'rgba(176,190,197,', 水:'rgba(66,165,245,' };

  // ── Screen switching ────────────────────────────────────────────
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  }

  // ── Toast ───────────────────────────────────────────────────────
  function showToast(msg) {
    let t = document.getElementById('bf-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'bf-toast';
      t.style.cssText = [
        'position:fixed;bottom:80px;left:50%;transform:translateX(-50%)',
        'background:rgba(20,10,40,0.95);border:1px solid rgba(201,168,76,0.6)',
        'color:#ffe8a8;font-family:inherit;font-size:14px;letter-spacing:3px',
        'padding:10px 24px;border-radius:8px;z-index:5000',
        'pointer-events:none;transition:opacity 0.4s ease;opacity:0'
      ].join(';');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._hide);
    t._hide = setTimeout(() => { t.style.opacity = '0'; }, 2000);
  }

  // ── Navigation ──────────────────────────────────────────────────
  function goHome() {
    window.location.href = 'index.html';
  }

  function toLobby() {
    stopTimer();
    stopBattleRaf();
    state = null;
    pickedTactics = [null, null];
    showScreen('screen-lobby');
    // refresh stats
    const pts = parseInt(localStorage.getItem('bingfa_points') || '1000');
    const rank = pts >= 2000 ? '王者' : pts >= 1500 ? '宗師' : pts >= 1200 ? '謀將' : '見習';
    setEl('rank-pill', '段位：' + rank);
    setEl('point-pill', '積分：' + pts);
    const wins = parseInt(localStorage.getItem('bingfa_wins') || '0');
    const total = parseInt(localStorage.getItem('bingfa_total') || '0');
    setEl('winrate-pill', '勝率：' + (total > 0 ? Math.round(wins / total * 100) : 50) + '%');
  }

  // ── Start game ──────────────────────────────────────────────────
  function startGame(mode) {
    stopTimer();
    stopBattleRaf();
    state = E.makeState();
    state.mode = mode || 'ai';
    pickedTactics = [null, null];
    elemFilter = '';
    jobFilter = '';
    const titles = { ai: '兵法推演 — AI推演', rank: '兵法推演 — 排位天梯', match: '兵法推演 — 全球匹配' };
    setEl('top-title', titles[mode] || '兵法推演');
    showScreen('screen-bp');
    renderBP();
    runBPLoop();
  }

  // ── Helper: set text content ────────────────────────────────────
  function setEl(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }
  function setHtml(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  // ── Stop timer: handles both setInterval and setTimeout ────────
  function stopTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    if (aiTimerHandle) { clearTimeout(aiTimerHandle); aiTimerHandle = null; }
  }

  // ── BP rendering ────────────────────────────────────────────────
  function renderBP() {
    renderPhaseBar();
    renderPanels();
    renderPool();
    renderBPInfo();
  }

  function renderPhaseBar() {
    const bar = document.getElementById('bp-phase-bar');
    if (!bar) return;
    bar.innerHTML = '';
    E.BP_STEPS.forEach((s, i) => {
      const pip = document.createElement('div');
      pip.className = 'bp-pip';
      if (i === state.stepIdx) pip.classList.add('active');
      else if (i < state.stepIdx) pip.classList.add('done');
      const icon = s.phase === 'ban' ? '✕' : '✓';
      const side = s.side === 'player' ? '我' : '敵';
      pip.title = `${side}方${s.phase === 'ban' ? '禁' : '選'}`;
      pip.textContent = icon;
      bar.appendChild(pip);
    });
  }

  function renderPanels() {
    renderSidePanel('enemy-panel-slots', 'enemy-bond-line', 'enemy');
    renderSidePanel('our-panel-slots', 'our-bond-line', 'player');
  }

  function renderSidePanel(slotsId, bondId, side) {
    const el = document.getElementById(slotsId);
    if (!el) return;
    el.innerHTML = '';

    const picks = state.picks[side].map(id => D.HEROES_BY_ID[id]);
    const bans  = state.bans[side].map(id => D.HEROES_BY_ID[id]);

    const kingPick   = picks.find(p => p.job === 'king');
    const stratPick  = picks.find(p => p.job === 'strategist');
    const specials   = picks.filter(p => p.job !== 'king' && p.job !== 'strategist');

    const slots = [
      { label: '主公', hero: kingPick },
      { label: '軍師', hero: stratPick },
      ...Array.from({ length: 6 }, (_, i) => ({ label: `特殊${i + 1}`, hero: specials[i] || null }))
    ];

    slots.forEach(slot => {
      const div = document.createElement('div');
      div.className = 'bp-slot';
      if (slot.hero) {
        div.classList.add('filled');
        const col = ELEM_COLOR[slot.hero.elem] || '#e8d8ff';
        div.style.borderColor = col;
        div.style.boxShadow = `0 0 8px ${(ELEM_GLOW[slot.hero.elem] || 'rgba(200,200,200,')}0.3)`;
        div.innerHTML = `
          <div class="bp-slot-job">${D.JOB_NAMES[slot.hero.job]}</div>
          <div class="bp-slot-name">${slot.hero.name}</div>
          <div class="bp-slot-elem" style="color:${col}">${slot.hero.elem} · ${slot.hero.faction}</div>
        `;
      } else {
        div.innerHTML = `<div class="bp-slot-job">${slot.label}</div><div class="bp-slot-empty">未派</div>`;
      }
      el.appendChild(div);
    });

    // 禁用行
    if (bans.length > 0) {
      const banLine = document.createElement('div');
      banLine.className = 'ban-line';
      banLine.textContent = '禁：' + bans.map(b => b.name).join('、');
      el.appendChild(banLine);
    }

    // 羈絆
    const bonds = E.activeBonds(state.picks[side]);
    const bondEl = document.getElementById(bondId);
    if (bondEl) {
      bondEl.textContent = '羈絆：' + (bonds.length > 0 ? bonds.map(b => b.name).join('、') : '—');
    }
  }

  function renderPool() {
    const el = document.getElementById('bp-pool');
    const titleEl = document.getElementById('pool-title');
    if (!el) return;
    el.innerHTML = '';
    const step = E.currentStep(state);
    if (!step) {
      if (titleEl) titleEl.textContent = 'BP 完成 — 進入戰場';
      return;
    }
    const isMine = step.side === 'player';
    const jobLabel = step.jobFilter ? (D.JOB_NAMES[step.jobFilter] || '特殊職位') : '任意';
    if (titleEl) titleEl.textContent = `候選武將 — ${step.phase === 'ban' ? '🚫 禁用' : '✅ 選派'}（${jobLabel}）`;

    let pool = E.candidates(state, step.jobFilter);
    // Apply filters
    if (elemFilter) pool = pool.filter(h => h.elem === elemFilter);
    if (jobFilter)  pool = pool.filter(h => h.job === jobFilter);

    const advice = E.aiAdvice(state);
    setEl('ai-advice-text', advice);

    pool.forEach(h => {
      const card = document.createElement('div');
      card.className = 'hero-card';
      const col = ELEM_COLOR[h.elem] || '#e8d8ff';
      card.style.borderColor = col;
      card.style.setProperty('--elem-col', col);
      const powerPct = Math.min(100, Math.max(0, ((h.power - 60) / 40) * 100));
      card.innerHTML = `
        <div class="hc-job">${D.JOB_NAMES[h.job]}</div>
        <div class="hc-name">${h.name}</div>
        <div class="hc-elem" style="color:${col}">${h.elem} · ${h.faction}</div>
        <div class="hc-desc">${h.desc}</div>
        <div class="hc-power-bar"><div class="hc-power-fill" style="width:${powerPct}%;background:${col}"></div></div>
        <div class="hc-power-label">戰力 ${h.power}</div>
      `;
      if (isMine) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => onHeroPick(h.id));
      } else {
        card.classList.add('not-mine');
      }
      el.appendChild(card);
    });
  }

  function renderBPInfo() {
    const infoEl = document.getElementById('bp-step-info');
    if (!infoEl) return;
    const step = E.currentStep(state);
    if (!step) {
      infoEl.innerHTML = '<strong>BP 完成！</strong> 正在進入戰場…';
      return;
    }
    const stepNum = state.stepIdx + 1;
    const total = E.BP_STEPS.length;
    const sideText = step.side === 'player' ? '🟢 你方' : '🔴 敵方';
    const actionText = step.phase === 'ban' ? '禁用' : '選派';
    const jobLabel = step.jobFilter ? (D.JOB_NAMES[step.jobFilter] || '特殊職位') : '';
    infoEl.innerHTML = `<strong>第 ${stepNum}/${total} 步</strong> — ${sideText} ${actionText}${jobLabel ? ' · ' + jobLabel : ''}`;
  }

  // ── Hero pick ───────────────────────────────────────────────────
  function onHeroPick(heroId) {
    if (!state) return;
    const r = E.performStep(state, 'player', heroId);
    if (!r.ok) { showToast(r.error); return; }
    stopTimer();
    renderBP();
    if (state.phase === 'battle') {
      setTimeout(toBattle, 600);
      return;
    }
    runBPLoop();
  }

  // ── BP Loop: timer + AI ─────────────────────────────────────────
  function runBPLoop() {
    stopTimer();
    const step = E.currentStep(state);
    if (!step) return;

    if (step.side === 'enemy') {
      // AI turn: delay then pick
      const delay = 900 + Math.random() * 700;
      aiTimerHandle = setTimeout(() => {
        if (!state) return;
        const id = E.aiPick(state);
        if (id) {
          E.performStep(state, 'enemy', id);
          renderBP();
          if (state.phase === 'battle') {
            setTimeout(toBattle, 600);
          } else {
            runBPLoop();
          }
        }
      }, delay);
    } else {
      // Player turn: countdown 30s
      let t = 30;
      const timerEl = document.getElementById('bp-timer');
      if (timerEl) { timerEl.textContent = t; timerEl.classList.remove('warn'); }
      timerInterval = setInterval(() => {
        t--;
        if (timerEl) {
          timerEl.textContent = t;
          if (t <= 5) timerEl.classList.add('warn');
        }
        if (t <= 0) {
          clearInterval(timerInterval);
          timerInterval = null;
          // Auto-pick random
          const s = E.currentStep(state);
          if (s && s.side === 'player') {
            const pool = E.candidates(state, s.jobFilter);
            if (pool.length > 0) {
              onHeroPick(pool[Math.floor(Math.random() * pool.length)].id);
            }
          }
        }
      }, 1000);
    }
  }

  // ── Filters ─────────────────────────────────────────────────────
  function setElemFilter(v) {
    elemFilter = (elemFilter === v) ? '' : v;
    // update buttons
    document.querySelectorAll('.filter-elem-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.val === elemFilter);
    });
    renderPool();
  }

  function setJobFilter(v) {
    jobFilter = (jobFilter === v) ? '' : v;
    document.querySelectorAll('.filter-job-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.val === jobFilter);
    });
    renderPool();
  }

  // ── Battle ──────────────────────────────────────────────────────
  function toBattle() {
    stopTimer();
    state.phase = 'battle';
    pickedTactics = [null, null];
    showScreen('screen-battle');

    // Set king names
    const pKingId = state.picks.player.find(id => D.HEROES_BY_ID[id].job === 'king');
    const eKingId = state.picks.enemy.find(id => D.HEROES_BY_ID[id].job === 'king');
    if (pKingId) setEl('player-king-name', D.HEROES_BY_ID[pKingId].name);
    if (eKingId) setEl('enemy-king-name', D.HEROES_BY_ID[eKingId].name);

    initBattleCanvas();
    renderBattleUI();
  }

  // ── Canvas 2D Battlefield ───────────────────────────────────────
  function stopBattleRaf() {
    if (battleRafHandle) { cancelAnimationFrame(battleRafHandle); battleRafHandle = null; }
  }

  function initBattleCanvas() {
    stopBattleRaf();
    const canvas = document.getElementById('battle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frame = 0;

    function resize() {
      canvas.width = canvas.offsetWidth || 600;
      canvas.height = canvas.offsetHeight || 220;
    }
    resize();
    window.addEventListener('resize', resize);

    function drawBattleScene() {
      if (!state) return;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#0a0612');
      bg.addColorStop(1, '#1a0f2e');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Divider line
      ctx.strokeStyle = 'rgba(201,168,76,0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw tiles
      const drawRow = (ids, yBase, flip) => {
        const n = ids.length;
        const tileW = Math.min(60, (W - 40) / Math.max(n, 1));
        const tileH = 40;
        const totalW = n * tileW + (n - 1) * 6;
        let x = (W - totalW) / 2;
        ids.forEach((id, i) => {
          const h = D.HEROES_BY_ID[id];
          if (!h) return;
          const col = ELEM_COLOR[h.elem] || '#e8d8ff';
          const glow = ELEM_GLOW[h.elem] || 'rgba(200,200,200,';
          const t = frame * 0.03 + i * 0.5;
          const yOff = Math.sin(t) * 3;
          const rx = x + i * (tileW + 6);
          const ry = yBase + yOff;

          // Glow
          const g = ctx.createRadialGradient(rx + tileW / 2, ry + tileH / 2, 2, rx + tileW / 2, ry + tileH / 2, tileW);
          g.addColorStop(0, glow + '0.35)');
          g.addColorStop(1, glow + '0)');
          ctx.fillStyle = g;
          ctx.fillRect(rx - 8, ry - 8, tileW + 16, tileH + 16);

          // Tile bg
          ctx.fillStyle = 'rgba(30,15,55,0.85)';
          ctx.strokeStyle = col;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(rx, ry, tileW, tileH, 4);
          ctx.fill();
          ctx.stroke();

          // Elem dot
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.arc(rx + tileW - 8, ry + 8, 4, 0, Math.PI * 2);
          ctx.fill();

          // Name
          ctx.fillStyle = '#ffe8cc';
          ctx.font = `bold ${tileW > 50 ? 12 : 10}px "Noto Serif TC", serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(h.name.length > 3 ? h.name.slice(0, 3) : h.name, rx + tileW / 2, ry + tileH / 2);
        });
      };

      // Enemy row (top half)
      drawRow(state.picks.enemy, H / 2 - 58, true);
      // Player row (bottom half)
      drawRow(state.picks.player, H / 2 + 16, false);

      frame++;
      battleRafHandle = requestAnimationFrame(drawBattleScene);
    }

    drawBattleScene();
  }

  // ── Battle UI ───────────────────────────────────────────────────
  function renderBattleUI() {
    if (!state) return;
    setEl('battle-round-label', `第 ${state.round} 回合`);
    updateHpBars();
    pickedTactics = [null, null];
    const confirmBtn = document.getElementById('confirm-tactics');
    if (confirmBtn) confirmBtn.disabled = true;
    setEl('enemy-tactic-reveal', '');
    renderTacticGrid('tactic-grid-1', 0);
    renderTacticGrid('tactic-grid-2', 1);
    renderBattleLog();
  }

  function updateHpBars() {
    const pPct = Math.max(0, state.hp.player / state.maxHp * 100);
    const ePct = Math.max(0, state.hp.enemy / state.maxHp * 100);
    const pBar = document.getElementById('player-hp-fill');
    const eBar = document.getElementById('enemy-hp-fill');
    if (pBar) pBar.style.width = pPct + '%';
    if (eBar) eBar.style.width = ePct + '%';
    setEl('player-hp-text', state.hp.player);
    setEl('enemy-hp-text', state.hp.enemy);
  }

  function renderTacticGrid(gridId, idx) {
    const el = document.getElementById(gridId);
    if (!el) return;
    el.innerHTML = '';
    D.TACTICS.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'tactic-btn';
      if (pickedTactics[idx] && pickedTactics[idx].id === t.id) btn.classList.add('selected');
      const col = ELEM_COLOR[t.elem] || '#e8d8ff';
      btn.innerHTML = `<div class="tactic-name" style="color:${col}">${t.name}</div><div class="tactic-elem">${t.elem}</div>`;
      btn.title = t.desc;
      btn.addEventListener('click', () => {
        pickedTactics[idx] = t;
        renderTacticGrid(gridId, idx);
        const confirmBtn = document.getElementById('confirm-tactics');
        if (confirmBtn) confirmBtn.disabled = !(pickedTactics[0] && pickedTactics[1]);
      });
      el.appendChild(btn);
    });
  }

  function renderBattleLog() {
    const el = document.getElementById('battle-log-content');
    if (!el) return;
    el.innerHTML = '';
    const lines = state.log.slice(-30).reverse();
    lines.forEach(line => {
      const div = document.createElement('div');
      div.className = 'log-line';
      if (typeof line === 'string') {
        div.classList.add('system');
        div.textContent = line;
      } else {
        div.classList.add(line.type || 'system');
        div.textContent = line.text;
      }
      el.appendChild(div);
    });
  }

  function confirmTactics() {
    if (!state || !pickedTactics[0] || !pickedTactics[1]) return;
    const confirmBtn = document.getElementById('confirm-tactics');
    if (confirmBtn) confirmBtn.disabled = true;
    const r = E.applyRound(state, pickedTactics);
    // Show enemy tactics
    const eT = r.enemyTactics;
    setEl('enemy-tactic-reveal', `敵方出陣：${eT[0].name}(${eT[0].elem}) + ${eT[1].name}(${eT[1].elem})`);
    setTimeout(() => {
      updateHpBars();
      renderBattleLog();
      if (r.ended) {
        setTimeout(() => endBattle(r.ended), 700);
      } else {
        setTimeout(() => renderBattleUI(), 400);
      }
    }, 500);
  }

  // ── End battle ──────────────────────────────────────────────────
  function endBattle(result) {
    stopBattleRaf();
    showScreen('screen-result');
    const titleEl = document.getElementById('result-title');
    const narrEl = document.getElementById('result-narration');
    if (result === 'win') {
      titleEl.textContent = '勝'; titleEl.className = 'result-title win';
      if (narrEl) narrEl.textContent = generateNarration(true);
    } else if (result === 'lose') {
      titleEl.textContent = '敗'; titleEl.className = 'result-title lose';
      if (narrEl) narrEl.textContent = generateNarration(false);
    } else {
      titleEl.textContent = '和'; titleEl.className = 'result-title draw';
      if (narrEl) narrEl.textContent = '雙方主帥皆血盡，烽火連綿無分勝負。';
    }
    setEl('result-rounds', `回合：${state.round - 1}`);
    const bonds = E.activeBonds(state.picks.player);
    setEl('result-bond', '羈絆：' + (bonds.length > 0 ? bonds.map(b => b.name).join('、') : '無'));

    let delta = 0;
    if (state.mode === 'rank') {
      delta = result === 'win' ? 25 : result === 'lose' ? -20 : 0;
      const pts = parseInt(localStorage.getItem('bingfa_points') || '1000') + delta;
      localStorage.setItem('bingfa_points', String(pts));
      if (result === 'win') {
        const w = parseInt(localStorage.getItem('bingfa_wins') || '0') + 1;
        localStorage.setItem('bingfa_wins', String(w));
      }
      const tot = parseInt(localStorage.getItem('bingfa_total') || '0') + 1;
      localStorage.setItem('bingfa_total', String(tot));
    }
    setEl('result-rank', state.mode === 'rank'
      ? (delta >= 0 ? `積分 +${delta}` : `積分 ${delta}`)
      : 'AI 推演（不計分）');
  }

  function generateNarration(win) {
    const pKingId = state.picks.player.find(id => D.HEROES_BY_ID[id].job === 'king');
    const eKingId = state.picks.enemy.find(id => D.HEROES_BY_ID[id].job === 'king');
    const ourKing = pKingId ? D.HEROES_BY_ID[pKingId] : { name: '我方主公' };
    const enemyKing = eKingId ? D.HEROES_BY_ID[eKingId] : { name: '敵方主公' };
    const bonds = E.activeBonds(state.picks.player);
    const bondText = bonds.length > 0 ? `「${bonds[0].name}」之力威震八方，` : '';
    if (win) {
      return `${state.round - 1} 回合鏖戰，${bondText}${ourKing.name} 麾下八位英雄運籌帷幄、佈下雙陣，終以五行相剋之勢擊潰 ${enemyKing.name}。塵埃落定，山河重歸吾手。`;
    }
    return `${state.round - 1} 回合終盡，${ourKing.name} 雖有英雄相隨，然 ${enemyKing.name} 兵法縝密，雙陣相生，終致主帥兵力歸零。雖敗猶榮，待來日捲土重來。`;
  }

  // ── Help modal ──────────────────────────────────────────────────
  function showHelp() {
    const m = document.getElementById('modal-help');
    if (m) m.classList.add('show');
  }
  function hideHelp() {
    const m = document.getElementById('modal-help');
    if (m) m.classList.remove('show');
  }

  // ── Init ────────────────────────────────────────────────────────
  function init() {
    const pts = parseInt(localStorage.getItem('bingfa_points') || '1000');
    const rank = pts >= 2000 ? '王者' : pts >= 1500 ? '宗師' : pts >= 1200 ? '謀將' : '見習';
    setEl('rank-pill', '段位：' + rank);
    setEl('point-pill', '積分：' + pts);
    const wins = parseInt(localStorage.getItem('bingfa_wins') || '0');
    const total = parseInt(localStorage.getItem('bingfa_total') || '0');
    setEl('winrate-pill', '勝率：' + (total > 0 ? Math.round(wins / total * 100) : 50) + '%');
  }

  document.addEventListener('DOMContentLoaded', init);

  // ── Public API ──────────────────────────────────────────────────
  window.BingFa = {
    startGame,
    toLobby,
    goHome,
    confirmTactics,
    showHelp,
    hideHelp,
    setElemFilter,
    setJobFilter,
    showToast
  };
})();
