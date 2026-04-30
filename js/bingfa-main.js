/**
 * bingfa-main.js — 兵法推演 UI 控制器
 */
(function() {
  'use strict';

  const D = window.BingFaData;
  const E = window.BingFaEngine;

  let state = null;
  let timerHandle = null;
  let pickedTactics = [null, null]; // [t1, t2]

  // ── 階段顯示文字 ─────────────────────────
  const PHASE_LABELS = ['禁1', '禁2', '選主公', '選軍師', '禁3', '禁4', '選×2', '選×2', '禁5', '禁6', '選×4', '選×4'];

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  // ── 啟動遊戲 ─────────────────────────────
  function startGame(mode) {
    state = E.makeState();
    state.mode = mode;
    state.phase = 'bp';
    pickedTactics = [null, null];
    showScreen('screen-bp');
    document.getElementById('top-title').textContent =
      mode === 'rank' ? '兵法推演 — 排位天梯' : mode === 'match' ? '兵法推演 — 全球匹配' : '兵法推演 — AI推演';
    renderBP();
    runBPLoop();
  }

  function toLobby() {
    if (timerHandle) clearInterval(timerHandle);
    state = null;
    showScreen('screen-lobby');
  }

  // ── BP 渲染 ───────────────────────────────
  function renderPhaseBar() {
    // 收合 BP_STEPS 重複的步驟，每 step 顯示 1 個格
    const bar = document.getElementById('bp-phase-bar');
    bar.innerHTML = '';
    E.BP_STEPS.forEach((s, i) => {
      const div = document.createElement('div');
      div.className = 'bp-phase-step';
      if (i === state.stepIdx) div.classList.add('active');
      else if (i < state.stepIdx) div.classList.add('done');
      const sideIcon = s.side === 'player' ? '👤' : '🤖';
      const phaseIcon = s.phase === 'ban' ? '🚫' : '✓';
      div.textContent = `${sideIcon}${phaseIcon}${s.jobFilter ? D.JOB_NAMES[s.jobFilter] || '特殊' : ''}`;
      bar.appendChild(div);
    });
  }

  function renderSide(sideId, side) {
    const el = document.getElementById(sideId);
    el.innerHTML = '';
    // 主公 + 軍師 + 6 特殊
    const slots = [
      { type: 'job', value: 'king', label: '主公' },
      { type: 'job', value: 'strategist', label: '軍師' },
      { type: 'special', label: '特殊1' },
      { type: 'special', label: '特殊2' },
      { type: 'special', label: '特殊3' },
      { type: 'special', label: '特殊4' },
      { type: 'special', label: '特殊5' },
      { type: 'special', label: '特殊6' }
    ];
    const picks = state.picks[side].map(id => D.HEROES_BY_ID[id]);
    const bans = state.bans[side].map(id => D.HEROES_BY_ID[id]);

    // 將 picks 對應到 slot：king/strategist 各一，其餘給 special
    const kingPick = picks.find(p => p.job === 'king');
    const stratPick = picks.find(p => p.job === 'strategist');
    const specials = picks.filter(p => p.job !== 'king' && p.job !== 'strategist');

    slots.forEach((slot, i) => {
      const div = document.createElement('div');
      div.className = 'bp-slot';
      let pick = null;
      if (slot.type === 'job' && slot.value === 'king') pick = kingPick;
      else if (slot.type === 'job' && slot.value === 'strategist') pick = stratPick;
      else if (slot.type === 'special') pick = specials[i - 2];
      if (pick) {
        div.classList.add('filled');
        div.innerHTML = `
          <div class="bp-slot-job">${D.JOB_NAMES[pick.job]}</div>
          <div class="bp-slot-name">${pick.name}</div>
          <div class="bp-slot-elem elem-${pick.elem}">${pick.elem} · ${pick.faction}</div>
        `;
      } else {
        div.innerHTML = `<div class="bp-slot-job">${slot.label}</div><div style="opacity:0.4;">未派</div>`;
      }
      el.appendChild(div);
    });
    // 顯示 ban 列
    if (bans.length > 0) {
      const banRow = document.createElement('div');
      banRow.style.cssText = 'grid-column:1/-1; font-size:11px; color:rgba(239,83,80,0.7); margin-top:6px;';
      banRow.textContent = '禁用：' + bans.map(b => b.name).join('、');
      el.appendChild(banRow);
    }
    // 羈絆
    const bondId = side === 'player' ? 'bp-our-bond' : 'bp-enemy-bond';
    const bonds = E.activeBonds(state.picks[side]);
    document.getElementById(bondId).textContent =
      '羈絆：' + (bonds.length > 0 ? bonds.map(b => b.name).join('、') : '—');
  }

  function renderRoster() {
    const el = document.getElementById('bp-roster');
    el.innerHTML = '';
    const step = E.currentStep(state);
    if (!step) {
      document.getElementById('bp-pool-title').textContent = 'BP 結束 — 進入戰場';
      return;
    }
    const isMine = step.side === 'player';
    document.getElementById('bp-pool-title').textContent =
      `候選武將 — ${step.phase === 'ban' ? '🚫 禁用' : '✓ 選派'} ${step.jobFilter ? `(${D.JOB_NAMES[step.jobFilter] || '特殊職位'})` : ''}`;
    const pool = E.candidates(state, step.jobFilter);
    pool.forEach(h => {
      const c = document.createElement('div');
      c.className = 'bp-card';
      c.innerHTML = `
        <div class="bp-card-job">${D.JOB_NAMES[h.job]}</div>
        <div class="bp-card-name">${h.name}</div>
        <div class="bp-card-elem elem-${h.elem}">${h.elem} · ${h.faction}</div>
        <div style="font-size:10px;color:rgba(201,168,76,0.7);margin-top:3px;">戰力 ${h.power}</div>
      `;
      if (isMine) {
        c.onclick = () => onPlayerStep(h.id);
      } else {
        c.style.opacity = '0.5';
        c.style.cursor = 'wait';
      }
      el.appendChild(c);
    });
    document.getElementById('ai-advice-text').textContent = E.aiAdvice(state);
  }

  function renderBP() {
    renderPhaseBar();
    renderSide('bp-our-side', 'player');
    renderSide('bp-enemy-side', 'enemy');
    renderRoster();
    const step = E.currentStep(state);
    const info = document.getElementById('bp-info');
    if (!step) {
      info.innerHTML = '<strong>BP 完成！</strong> 點擊任意處進入戰場…';
    } else {
      info.innerHTML = `<strong>第 ${state.stepIdx + 1} 步</strong> — ${step.side === 'player' ? '🟢 你方' : '🔴 敵方'} ${step.phase === 'ban' ? '禁用' : '選派'}${step.jobFilter ? D.JOB_NAMES[step.jobFilter] || '特殊職位' : ''}`;
    }
  }

  function onPlayerStep(heroId) {
    const r = E.performStep(state, 'player', heroId);
    if (!r.ok) { alert(r.error); return; }
    renderBP();
    if (state.phase === 'battle') {
      setTimeout(toBattle, 500);
      return;
    }
    runBPLoop();
  }

  function runBPLoop() {
    if (timerHandle) clearInterval(timerHandle);
    let t = 30;
    document.getElementById('bp-timer').textContent = t;
    document.getElementById('bp-timer').classList.remove('warn');
    timerHandle = setInterval(() => {
      t--;
      const tEl = document.getElementById('bp-timer');
      tEl.textContent = t;
      if (t <= 5) tEl.classList.add('warn');
      if (t <= 0) {
        clearInterval(timerHandle);
        // 超時自動隨機
        const step = E.currentStep(state);
        if (step && step.side === 'player') {
          const pool = E.candidates(state, step.jobFilter);
          if (pool.length > 0) onPlayerStep(pool[Math.floor(Math.random() * pool.length)].id);
        }
      }
    }, 1000);
    // AI 行動
    const step = E.currentStep(state);
    if (step && step.side === 'enemy') {
      setTimeout(() => {
        const id = E.aiPick(state);
        if (id) {
          E.performStep(state, 'enemy', id);
          renderBP();
          if (state.phase === 'battle') setTimeout(toBattle, 500);
          else runBPLoop();
        }
      }, 1200 + Math.random() * 800);
    }
  }

  // ── BATTLE ─────────────────────────────────
  let three = null;
  function initThree() {
    const stage = document.getElementById('three-stage');
    stage.innerHTML = '';
    if (typeof THREE === 'undefined') return;
    const w = stage.clientWidth, h = stage.clientHeight;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0612, 4, 14);
    const camera = new THREE.PerspectiveCamera(50, w/h, 0.1, 100);
    camera.position.set(0, 4, 8);
    camera.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    renderer.setSize(w, h);
    stage.appendChild(renderer.domElement);
    // 地面
    const groundGeo = new THREE.PlaneGeometry(12, 8);
    const groundMat = new THREE.MeshBasicMaterial({ color: 0x2a1d4a, transparent:true, opacity:0.6 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    // 我方 8 柱
    const meshes = { player: [], enemy: [] };
    state.picks.player.forEach((id, i) => {
      const h = D.HEROES_BY_ID[id];
      const elemColor = { 木:0x66bb6a, 火:0xef5350, 土:0xffca28, 金:0xb0bec5, 水:0x42a5f5 }[h.elem];
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 1, 0.4),
        new THREE.MeshBasicMaterial({ color: elemColor })
      );
      cube.position.set((i - 3.5) * 0.7, 0.5, 2);
      scene.add(cube);
      meshes.player.push(cube);
    });
    state.picks.enemy.forEach((id, i) => {
      const h = D.HEROES_BY_ID[id];
      const elemColor = { 木:0x66bb6a, 火:0xef5350, 土:0xffca28, 金:0xb0bec5, 水:0x42a5f5 }[h.elem];
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 1, 0.4),
        new THREE.MeshBasicMaterial({ color: elemColor, opacity:0.85, transparent:true })
      );
      cube.position.set((i - 3.5) * 0.7, 0.5, -2);
      scene.add(cube);
      meshes.enemy.push(cube);
    });
    let f = 0;
    function loop() {
      f++;
      meshes.player.forEach((m, i) => { m.rotation.y = f * 0.01 + i * 0.3; });
      meshes.enemy.forEach((m, i) => { m.rotation.y = -f * 0.01 - i * 0.3; });
      renderer.render(scene, camera);
      three._raf = requestAnimationFrame(loop);
    }
    three = { scene, camera, renderer, meshes, _raf: null };
    loop();
    window.addEventListener('resize', onResize);
    function onResize() {
      if (!three) return;
      const w = stage.clientWidth, h = stage.clientHeight;
      three.camera.aspect = w / h;
      three.camera.updateProjectionMatrix();
      three.renderer.setSize(w, h);
    }
  }

  function chargeAnim(side) {
    if (!three) return;
    const meshes = side === 'player' ? three.meshes.player : three.meshes.enemy;
    const dir = side === 'player' ? -1 : 1;
    meshes.forEach((m, i) => {
      const start = m.position.z;
      const target = start + dir * 1.5;
      const t0 = performance.now();
      function step() {
        const t = (performance.now() - t0) / 400;
        if (t >= 1) { m.position.z = start; return; }
        m.position.z = start + (target - start) * Math.sin(t * Math.PI);
        requestAnimationFrame(step);
      }
      step();
    });
  }

  function toBattle() {
    if (timerHandle) clearInterval(timerHandle);
    state.phase = 'battle';
    showScreen('screen-battle');
    document.getElementById('player-name').textContent =
      D.HEROES_BY_ID[state.picks.player.find(id => D.HEROES_BY_ID[id].job === 'king')].name;
    document.getElementById('enemy-name').textContent =
      D.HEROES_BY_ID[state.picks.enemy.find(id => D.HEROES_BY_ID[id].job === 'king')].name;
    initThree();
    renderBattle();
  }

  function renderTacticGrid(gridId, idx) {
    const el = document.getElementById(gridId);
    el.innerHTML = '';
    D.TACTICS.forEach(t => {
      const btn = document.createElement('div');
      btn.className = 'tactic-btn';
      if (pickedTactics[idx] && pickedTactics[idx].id === t.id) btn.classList.add('selected');
      btn.innerHTML = `
        <div class="tactic-btn-name elem-${t.elem}">${t.name}</div>
        <div class="tactic-btn-elem">${t.elem}</div>
      `;
      btn.title = t.desc;
      btn.onclick = () => {
        pickedTactics[idx] = t;
        renderTacticGrid(gridId, idx);
        document.getElementById('confirm-tactics').disabled =
          !(pickedTactics[0] && pickedTactics[1]);
      };
      el.appendChild(btn);
    });
  }

  function renderBattle() {
    document.getElementById('battle-round-info').innerHTML =
      `<strong>第 ${state.round} 回合</strong> — 請佈下第一陣 + 第二陣（10 種五行戰術可選）`;
    document.getElementById('player-hp').style.width = (state.hp.player / state.maxHp * 100) + '%';
    document.getElementById('enemy-hp').style.width = (state.hp.enemy / state.maxHp * 100) + '%';
    document.getElementById('player-hp-text').textContent = state.hp.player;
    document.getElementById('enemy-hp-text').textContent = state.hp.enemy;
    pickedTactics = [null, null];
    document.getElementById('confirm-tactics').disabled = true;
    renderTacticGrid('tactic-grid-1', 0);
    renderTacticGrid('tactic-grid-2', 1);
    renderLog();
  }

  function renderLog() {
    const log = document.getElementById('battle-log-content');
    log.innerHTML = '';
    state.log.slice(-30).reverse().forEach(line => {
      const div = document.createElement('div');
      div.className = 'log-line';
      if (typeof line === 'string') {
        div.classList.add('system');
        div.textContent = line;
      } else {
        div.classList.add(line.type || 'system');
        div.textContent = line.text;
      }
      log.appendChild(div);
    });
  }

  function confirmTactics() {
    if (!pickedTactics[0] || !pickedTactics[1]) return;
    chargeAnim('player');
    setTimeout(() => chargeAnim('enemy'), 250);
    const r = E.applyRound(state, pickedTactics);
    setTimeout(() => {
      if (r.ended) {
        endBattle(r.ended);
      } else {
        renderBattle();
      }
    }, 600);
  }

  function endBattle(result) {
    showScreen('screen-result');
    const t = document.getElementById('result-title');
    const n = document.getElementById('result-narration');
    if (result === 'win') {
      t.textContent = '勝'; t.className = 'result-title win';
      n.textContent = generateNarration(true);
    } else if (result === 'lose') {
      t.textContent = '敗'; t.className = 'result-title lose';
      n.textContent = generateNarration(false);
    } else {
      t.textContent = '和'; t.className = 'result-title';
      n.textContent = '雙方主帥皆血盡，烽火連綿無分勝負。';
    }
    document.getElementById('result-rounds').textContent = `回合：${state.round - 1}`;
    const bonds = E.activeBonds(state.picks.player);
    document.getElementById('result-bond').textContent = '羈絆：' + (bonds.length > 0 ? bonds.map(b=>b.name).join('、') : '無');
    // 段位積分（若 rank 模式）
    let delta = 0;
    if (state.mode === 'rank') {
      delta = result === 'win' ? 25 : result === 'lose' ? -20 : 0;
      const pts = parseInt(localStorage.getItem('bingfa_points') || '1000') + delta;
      localStorage.setItem('bingfa_points', pts);
    }
    document.getElementById('result-rank').textContent =
      state.mode === 'rank'
        ? (delta >= 0 ? `段位 +${delta}` : `段位 ${delta}`)
        : 'AI 推演（不計分）';
  }

  function generateNarration(win) {
    const ourKing = D.HEROES_BY_ID[state.picks.player.find(id => D.HEROES_BY_ID[id].job === 'king')];
    const enemyKing = D.HEROES_BY_ID[state.picks.enemy.find(id => D.HEROES_BY_ID[id].job === 'king')];
    const bonds = E.activeBonds(state.picks.player);
    const bondText = bonds.length > 0 ? `「${bonds[0].name}」之力威震八方，` : '';
    if (win) {
      return `${state.round - 1} 回合鏖戰，${bondText}${ourKing.name} 麾下八位英雄推演兵法、佈下雙陣，終以五行相剋之勢擊潰 ${enemyKing.name}。塵埃落定，山河重歸吾手。`;
    }
    return `${state.round - 1} 回合終盡，${ourKing.name} 雖有八位英雄相隨，然 ${enemyKing.name} 兵法縝密，雙陣相生，終致主帥兵力歸零。雖敗猶榮，待來日捲土重來。`;
  }

  // ── 初始化 ─────────────────────────────
  function init() {
    // 顯示段位
    const pts = parseInt(localStorage.getItem('bingfa_points') || '1000');
    const rank = pts >= 2000 ? '王者' : pts >= 1500 ? '宗師' : pts >= 1200 ? '謀將' : '見習';
    document.getElementById('rank-pill').textContent = '段位：' + rank;
    document.getElementById('point-pill').textContent = '積分：' + pts;
    const wins = parseInt(localStorage.getItem('bingfa_wins') || '0');
    const total = parseInt(localStorage.getItem('bingfa_total') || '0');
    document.getElementById('winrate-pill').textContent = '勝率：' + (total > 0 ? Math.round(wins/total*100) : 50) + '%';
  }

  document.addEventListener('DOMContentLoaded', init);

  window.BingFa = {
    startGame, toLobby, confirmTactics
  };
})();
