/**
 * main.js v4 — 華夏風雲錄 主控制器（全bug修正版）
 */
window.Game = (function() {
  'use strict';

  // ── STATE ───────────────────────────────────────────────────
  let difficulty       = 'medium';
  let currentFilter    = 'all';
  let currentSearch    = '';
  let currentPickTab   = 'general';
  let subPhase         = 'ban'; // 'ban' | 'pick'

  // Timers
  let banTimerInterval    = null;
  let deployTimerInterval = null;
  let cmdTimerInterval    = null;
  let banTimerVal   = 30;
  let deployTimerVal= 60;
  let cmdTimerVal   = 30;

  // Battle selection
  let selectedAttackerIdx = 0;
  let selectedTargetIdx   = 0;
  let dragCardId = null;

  // Multiplayer
  let playerCmds = { phase1: null, phase2: null };
  let enemyCmds  = null;
  let waitingForOpponent = false;
  let opponentDeployed   = false;
  let opponentField      = null;

  // ── HELPERS ─────────────────────────────────────────────────
  /** pick-object or raw-id → string id */
  function pickId(p) { return (p && typeof p === 'object') ? p.id : p; }

  function isDraftScreenActive() {
    const s = document.getElementById('screen-draft');
    return s && s.classList.contains('active');
  }

  // ── INIT ────────────────────────────────────────────────────
  function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const colors = ['#c9a84c','#4caf50','#ef5350','#ff9800','#ffd600','#42a5f5'];
    const pts = Array.from({length: 55}, () => ({
      x: Math.random()*canvas.width, y: Math.random()*canvas.height,
      r: Math.random()*1.8+0.4, vx: (Math.random()-0.5)*0.3, vy: -Math.random()*0.4-0.1,
      a: Math.random()*0.4+0.1, c: colors[Math.floor(Math.random()*colors.length)]
    }));
    function draw() {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      pts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy;
        if(p.y<-10){p.y=canvas.height+10;p.x=Math.random()*canvas.width;}
        if(p.x<-10||p.x>canvas.width+10) p.x=Math.random()*canvas.width;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=p.c+Math.round(p.a*255).toString(16).padStart(2,'0'); ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
    window.addEventListener('resize',()=>{canvas.width=window.innerWidth;canvas.height=window.innerHeight;});
  }

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(el=>el.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
    const modal = document.getElementById('modal-tutorial');
    if(modal) modal.style.display = 'none';
  }

  let toastTimer = null;
  function showToast(msg, duration=2500) {
    const t=document.getElementById('toast');
    if(!t) return;
    t.textContent=msg; t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>t.classList.remove('show'), duration);
  }

  function updateTimerDisplay(numId, barId, val, max) {
    const n=document.getElementById(numId), b=document.getElementById(barId);
    if(n) n.textContent=val;
    if(b){ b.style.width=(val/max*100)+'%'; b.style.background=val>10?'var(--gold)':'#ef5350'; }
  }

  function setDifficulty(d) {
    difficulty=d;
    ['easy','medium','hard'].forEach(x=>document.getElementById('diff-'+x)?.classList.toggle('active',x===d));
  }

  function clearAllTimers() {
    clearInterval(banTimerInterval);
    clearInterval(deployTimerInterval);
    clearInterval(cmdTimerInterval);
  }

  // ── FALLBACK AI ─────────────────────────────────────────────
  function autoFallbackBan(side) {
    const s = GameState.getState();
    const avail = GameData.generals.filter(g => !s.banPhase.banned.includes(g.id));
    if (avail.length) performBan(avail[0].id, side === 'player');
  }

  function autoFallbackPick(side) {
    const s = GameState.getState();
    const taken = [...s.pickPhase.playerPicks, ...s.pickPhase.enemyPicks].map(pickId);
    const avail = GameData.generals.filter(g => !taken.includes(g.id) && !s.banPhase.banned.includes(g.id));
    if (avail.length) performPick(avail[0].id, side === 'player');
  }

  // ── STARTING GAMES ──────────────────────────────────────────
  function startGame() {
    GameState.init(difficulty);
    currentFilter='all'; currentSearch=''; currentPickTab='general';
    window.NetworkEngine?.disconnect();
    startDraftPhase();
  }

  function startDraftPhase() {
    subPhase = 'ban';
    GameState.setBPStage(0);      // also sets phase to 'bp_lord'
    showScreen('screen-draft');
    updateDraftUI();
    startDraftTimer();
  }

  function updateDraftUI() {
    const s = GameState.getState();
    const stage = s.bpStage;
    const role = GameState.getCurrentRole();

    // Header title
    const titleEl = document.getElementById('draft-phase-title');
    if (titleEl) titleEl.textContent = `第 ${stage+1} 階段：【${role}】${subPhase === 'ban' ? '禁用武將' : '選取武將'}`;

    // Hint text
    const hintEl = document.getElementById('draft-hint-text');
    if (hintEl) hintEl.textContent = subPhase === 'ban'
      ? `禁止一名你不想讓對方使用的武將`
      : `選擇擔任【${role}】的武將（職位匹配獲得加成）`;

    // Ban grids (split even/odd indices)
    const pBans = s.banPhase.banned.filter((_,i) => i%2===0);
    const eBans = s.banPhase.banned.filter((_,i) => i%2!==0);
    const buildBanMini = (id, cls) => {
      const c = GameData.getGeneral(id);
      return `<div class="ban-card-mini ${cls}" title="${c?c.name:id}">
        <img src="img/generals/${id}.webp" onerror="this.style.display='none'"/>
        ${c?`<div style="font-size:9px;text-align:center;">${c.name}</div>`:''}
      </div>`;
    };
    const pgEl = document.getElementById('player-ban-grid');
    const egEl = document.getElementById('enemy-ban-grid');
    if (pgEl) pgEl.innerHTML = pBans.map(id=>buildBanMini(id,'player')).join('');
    if (egEl) egEl.innerHTML = eBans.map(id=>buildBanMini(id,'enemy')).join('');

    // Role slots
    const roleMap = {
      '主公':'lord','軍師':'advisor','臣相':'minister','大司馬':'marshal',
      '大司農':'agri','大將軍':'chief','行軍總管':'marching','破陣先鋒':'vanguard'
    };

    // Clear all slots first
    ['p','e'].forEach(prefix => {
      Object.values(roleMap).forEach(key => {
        const slot = document.getElementById(`${prefix}-role-${key}`);
        if (!slot) return;
        slot.classList.remove('filled','penalty','active');
        const rc = slot.querySelector('.role-content');
        if (rc) rc.textContent = '空';
      });
    });

    ['player','enemy'].forEach(side => {
      const picks = side==='player' ? s.pickPhase.playerPicks : s.pickPhase.enemyPicks;
      const prefix = side==='player' ? 'p' : 'e';
      picks.forEach(p => {
        const slotKey = roleMap[p.role];
        if (!slotKey) return;
        const slot = document.getElementById(`${prefix}-role-${slotKey}`);
        if (!slot) return;
        slot.classList.add('filled');
        if (p.penalty < 0) slot.classList.add('penalty');
        const rc = slot.querySelector('.role-content');
        if (rc) rc.textContent = p.name + (p.penalty < 0 ? ' ⚠️' : '');
      });
      // Highlight current active slot for player side only
      if (side === 'player' && subPhase === 'pick') {
        const activeKey = roleMap[role];
        if (activeKey) {
          const activeSlot = document.getElementById(`p-role-${activeKey}`);
          if (activeSlot && !activeSlot.classList.contains('filled')) activeSlot.classList.add('active');
        }
      }
    });

    renderCardGrid('draft-card-grid', subPhase === 'ban' ? 'ban' : 'pick');
  }

  function startMultiplayer() {
    if (!window.NetworkEngine) { showToast('⚠️ 網路模組未載入'); return; }
    const code = prompt('輸入4位房間代碼（加入指定房間）\n或直接按確定進行隨機配對：');
    NetworkEngine.init();
    if (code && code.trim().length > 0) {
      showToast(`🔗 嘗試加入房間 ${code.trim()}...`, 5000);
      NetworkEngine.joinRoom(code.trim());
    } else {
      showToast('🌐 隨機配對中（10秒後若無對手自動配對）...', 10000);
      NetworkEngine.joinMatchmaking();
    }
  }

  function isMultiplayerGame() {
    return !!(window.NetworkEngine && window.NetworkEngine.isConnected && window.NetworkEngine.isConnected());
  }

  function onMatchmakingTimeout() {
    showToast('⏱️ 未找到對手，已為您配對對手');
    startGame();
  }

  function onMultiplayerMatchStarted() {
    startGame();
  }

  function returnLobby() {
    clearAllTimers();
    window.NetworkEngine?.disconnect();
    showScreen('screen-lobby');
  }

  // ── CAMPAIGN ────────────────────────────────────────────────
  function startCampaign() {
    window.NetworkEngine?.disconnect();
    showScreen('screen-campaign');
    renderCampaignList();
  }

  function renderCampaignList() {
    const list = document.getElementById('campaign-list');
    if (!list) return;
    const p = CampaignEngine.loadProgress();
    let html = '';
    CampaignEngine.levels.forEach((lvl, i) => {
      const isCleared = p.cleared.includes(lvl.id);
      const isLocked  = i > 0 && !p.cleared.includes(CampaignEngine.levels[i-1].id);
      html += `<div class="campaign-level-item ${isLocked?'locked':''}" id="camp-item-${lvl.id}"
        onclick="${isLocked?'':'Game.selectCampaignLevel(\''+lvl.id+'\')'}">
        <div class="c-level-name">${lvl.name}</div>
        <div class="c-level-status ${isCleared?'cleared':''}">${isLocked?'🔒 未解鎖':isCleared?'⭐ 已通關':'▶ 挑戰'}</div>
      </div>`;
    });
    list.innerHTML = html;
    const first = CampaignEngine.levels.find((l,i)=>i===0||p.cleared.includes(CampaignEngine.levels[i-1].id));
    if (first) selectCampaignLevel(first.id);
  }

  let selectedCampaignLevel = null;
  function selectCampaignLevel(id) {
    selectedCampaignLevel = id;
    document.querySelectorAll('.campaign-level-item').forEach(el=>el.classList.remove('active'));
    const item = document.getElementById(`camp-item-${id}`);
    if (item) item.classList.add('active');

    const lvl = CampaignEngine.getLevel(id);
    if (!lvl) return;
    const detail = document.getElementById('campaign-detail');
    if (!detail) return;

    const enemyAvatars = lvl.enemyPicks.map(cid => {
      const card = GameData.getCardById(cid);
      if (!card) return '';
      const eColor = GameData.ELEMENTS && card.element ? GameData.ELEMENTS[card.element]?.color : '#ccc';
      return `<div class="c-enemy-avatar" title="${card.name}">
        <img src="img/generals/${card.id}.webp" onerror="this.style.display='none';this.nextElementSibling.style.display='block';"/>
        <div style="display:none;color:${eColor}">${card.name.charAt(0)}</div>
      </div>`;
    }).join('');

    detail.innerHTML = `<div class="c-detail-card">
      <div class="c-detail-header">
        <div class="c-detail-subtitle">幻陣試煉</div>
        <div class="c-detail-title">${lvl.name}</div>
        <div class="c-detail-buffs">
          <div class="c-buff-badge">敵方生命 ×${lvl.enemyBuffs?.hp||1}</div>
          <div class="c-buff-badge">敵方攻擊 ×${lvl.enemyBuffs?.atk||1}</div>
        </div>
      </div>
      <div style="font-size:13px;color:var(--text-muted);text-align:center;">${lvl.desc}</div>
      <div class="c-detail-enemy">
        <div class="c-enemy-label">【 鎮守陣容預覽 】</div>
        <div class="c-enemy-grid">${enemyAvatars}</div>
      </div>
      <button class="btn-primary" style="margin-top:20px;font-size:18px;padding:16px;" onclick="Game.startCampaignLevel()">開始挑戰</button>
    </div>`;
  }

  function startCampaignLevel() {
    if (!selectedCampaignLevel) return;
    CampaignEngine.currentLevelId = selectedCampaignLevel;
    GameState.init(difficulty);
    const s = GameState.getState();
    const lvl = CampaignEngine.getLevel(selectedCampaignLevel);
    if (!lvl) return;

    // Convert raw IDs → pick-objects so enemy picks are consistent
    s.phase = GameState.PHASES.BP_STAGE_0;
    s.pickPhase.enemyPicks = lvl.enemyPicks.map((id, i) => {
      const card = GameData.getCardById(id);
      const role = (GameState.ROLES || ['主公','軍師','臣相','大司馬','大司農','大將軍','行軍總管','破陣先鋒'])[i] || '大將軍';
      return { id, role, penalty: 0, name: card ? card.name : id };
    });
    // Skip ban phase, give player 8 free picks (one per role)
    s.pickPhase.pickOrder = new Array(8).fill('player');
    s.pickPhase.pickIndex = 0;

    currentFilter='all'; currentSearch=''; currentPickTab='general';
    subPhase = 'pick';
    showScreen('screen-draft');
    updateDraftUI();
    startDraftTimer();
  }

  // ── CARD RENDERING ──────────────────────────────────────────
  function getElemBadgeClass(elem) {
    return {'木':'wood','火':'fire','土':'earth','金':'metal','水':'water'}[elem]||'';
  }
  function getElemColor(elem) {
    return (window.GameData?.ELEMENTS && GameData.ELEMENTS[elem]?.color) || '#888';
  }

  function buildGeneralCard(gen, mode) {
    const s = GameState.getState();
    const isBanned  = s.banPhase.banned.includes(gen.id);
    // FIX: picks are objects {id,...}, not raw strings
    const isPlayer  = s.pickPhase.playerPicks.some(p => pickId(p) === gen.id);
    const isEnemy   = s.pickPhase.enemyPicks.some(p => pickId(p) === gen.id);
    let cls = 'gen-card';
    if (isBanned) cls+=' banned'; else if (isPlayer) cls+=' picked-player'; else if (isEnemy) cls+=' picked-enemy';
    const eColor = getElemColor(gen.element);
    const cleanDesc = (gen.description||'').replace(/'/g,"&#39;");
    return `<div class="${cls}" id="gcard-${gen.id}"
      style="border-color:${isBanned?'#333':isPlayer?'var(--blue)':isEnemy?'var(--red)':'rgba(255,255,255,0.1)'};"
      onclick="Game.onCardClick('${gen.id}','${mode}')" title="${gen.name}&#10;${cleanDesc}">
      ${isBanned?'<div class="ban-overlay">🚫</div>':''}
      ${isPlayer?'<div class="ban-overlay" style="font-size:18px;color:var(--blue)">⚔️</div>':''}
      ${isEnemy ?'<div class="ban-overlay" style="font-size:18px;color:var(--red)">🔴</div>':''}
      <div class="elem-corner ${getElemBadgeClass(gen.element)}" style="border-color:${eColor};color:${eColor}">${gen.element||'?'}</div>
      <div class="gen-image-wrap">
        <img class="gen-portrait" src="img/generals/${gen.id}.webp" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
        <div class="gen-kanji" style="display:none;color:${gen.color||eColor}">${gen.name.charAt(0)}</div>
      </div>
      <div class="gen-name">${gen.name}</div>
      ${gen.signatureItem?`<div class="gen-signature">${gen.signatureItem}</div>`:''}
    </div>`;
  }

  function buildHealCard(card, mode) {
    return `<div class="heal-card" onclick="Game.onCardClick('${card.id}','${mode}')">
      <div class="card-type-tag">💊</div>
      <div class="card-icon">${card.icon||'💊'}</div>
      <div class="card-name">${card.name}</div>
      <div style="font-size:10px;color:var(--text-muted);padding:4px;">${card.desc||''}</div>
    </div>`;
  }

  function buildTrapCard(card, mode) {
    return `<div class="trap-card" onclick="Game.onCardClick('${card.id}','${mode}')">
      <div class="card-type-tag">🪤</div>
      <div class="card-icon">${card.icon||'🪤'}</div>
      <div class="card-name">${card.name}</div>
      <div style="font-size:10px;color:var(--text-muted);padding:4px;">${card.desc||''}</div>
    </div>`;
  }

  function renderCardGrid(containerId, mode) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (currentPickTab === 'general' || mode === 'ban') {
      let gens = [...GameData.generals];
      if (currentFilter !== 'all') gens = gens.filter(g=>g.dynasty===currentFilter||g.faction===currentFilter);
      if (currentSearch.trim()) { const q=currentSearch.trim().toLowerCase(); gens=gens.filter(g=>g.name.includes(q)); }
      container.innerHTML = gens.map(g=>buildGeneralCard(g, mode)).join('');
    } else if (currentPickTab === 'heal') {
      container.innerHTML = GameData.healCards.map(h=>buildHealCard(h, mode)).join('');
    } else if (currentPickTab === 'trap') {
      container.innerHTML = GameData.trapCards.map(t=>buildTrapCard(t, mode)).join('');
    }
  }

  // FIX: all three use 'draft-card-grid' (the actual DOM id)
  function filterDraft(f, mode) {
    currentFilter = f;
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    // try to find and activate the clicked button
    const active = [...document.querySelectorAll('.filter-btn')].find(b=>b.textContent===f||b.textContent==='全部'&&f==='all');
    if (active) active.classList.add('active');
    renderCardGrid('draft-card-grid', subPhase === 'ban' ? 'ban' : 'pick');
  }

  function searchDraft(v, mode) {
    currentSearch = v;
    renderCardGrid('draft-card-grid', subPhase === 'ban' ? 'ban' : 'pick');
  }

  function switchPickTab(t) {
    currentPickTab = t;
    document.querySelectorAll('.pick-tab').forEach(el=>el.classList.toggle('active', el.id==='ptab-'+t));
    renderCardGrid('draft-card-grid', 'pick');
  }

  // ── CLICK HANDLER ────────────────────────────────────────────
  function onCardClick(cardId, mode) {
    // FIX: check screen visibility rather than phase string
    if (!isDraftScreenActive()) return;

    const s = GameState.getState();

    // Determine whose turn
    const isPlayerTurn = (subPhase === 'ban')
      ? (s.banPhase.banned.length % 2 === 0)
      : (s.pickPhase.playerPicks.length === s.pickPhase.enemyPicks.length);

    if (!isPlayerTurn) { showToast('❌ 等待對手行動'); return; }

    if (subPhase === 'ban') {
      if (s.banPhase.banned.includes(cardId)) { showToast('⚠️ 已被禁用'); return; }
      performBan(cardId, true);
    } else {
      const taken = [...s.pickPhase.playerPicks, ...s.pickPhase.enemyPicks].map(pickId);
      if (taken.includes(cardId) || s.banPhase.banned.includes(cardId)) { showToast('⚠️ 已被選取或禁用'); return; }
      performPick(cardId, true);
    }
  }

  // ── BAN / PICK ───────────────────────────────────────────────
  function performBan(genId, isLocalAction=false) {
    if (isLocalAction && isMultiplayerGame()) NetworkEngine.sendAction('ban', { cardId: genId });

    const s = GameState.getState();
    GameState.addBan('', genId); // side param ignored by addBan internally

    // FIX: each stage has exactly 2 bans (1 each side) → compare with stage*2
    const bansThisStage = s.banPhase.banned.length - (s.bpStage * 2);
    if (bansThisStage >= 2) subPhase = 'pick';

    updateDraftUI();
    startDraftTimer();
  }

  function performPick(cardId, isLocalAction=false) {
    if (isLocalAction && isMultiplayerGame()) NetworkEngine.sendAction('pick', { cardId });

    const s = GameState.getState();
    const side = (s.pickPhase.playerPicks.length === s.pickPhase.enemyPicks.length) ? 'player' : 'enemy';
    GameState.addPick(side, cardId);

    // Both sides have picked for this stage → advance or end
    if (s.pickPhase.playerPicks.length > s.bpStage && s.pickPhase.enemyPicks.length > s.bpStage) {
      if (GameState.isFinalBPStage()) {
        clearInterval(banTimerInterval);
        showToast('✅ 選將完成！即將進入部署階段…', 1800);
        setTimeout(() => startDeployPhase(), 1800);
        return;
      } else {
        GameState.setBPStage(s.bpStage + 1); // also updates phase
        subPhase = 'ban';
      }
    }

    updateDraftUI();
    startDraftTimer();
  }

  // ── NETWORK HOOKS ────────────────────────────────────────────
  function applyOpponentBan(cardId)     { performBan(cardId, false); }
  function applyOpponentPick(cardId)    { performPick(cardId, false); }

  // ── DRAFT TIMER ──────────────────────────────────────────────
  function startDraftTimer() {
    clearInterval(banTimerInterval);
    banTimerVal = 30;
    updateTimerDisplay('draft-timer', 'draft-timer-bar', banTimerVal, 30);

    const s = GameState.getState();
    const isPlayerTurn = (subPhase === 'ban')
      ? (s.banPhase.banned.length % 2 === 0)
      : (s.pickPhase.playerPicks.length === s.pickPhase.enemyPicks.length);

    const indicator = document.getElementById('draft-side-indicator');
    if (indicator) indicator.textContent = `輪到：${isPlayerTurn ? '⚔️ 我方' : '🔴 敵方'}`;

    // AI plays automatically if not multiplayer and not player's turn
    if (!isMultiplayerGame() && !isPlayerTurn) {
      setTimeout(() => {
        if (!isDraftScreenActive()) return;
        if (subPhase === 'ban') {
          const playerIds = s.pickPhase.playerPicks.map(pickId);
          const id = AIEngine.chooseBanWithBond(s.banPhase.banned, playerIds, difficulty);
          if (id) performBan(id, false);
        } else {
          const id = AIEngine.choosePickWithBond(s.banPhase.banned, s.pickPhase.playerPicks, s.pickPhase.enemyPicks, difficulty, s.bpStage);
          if (id) performPick(id, false);
        }
      }, 1200);
    }

    banTimerInterval = setInterval(() => {
      banTimerVal--;
      updateTimerDisplay('draft-timer', 'draft-timer-bar', banTimerVal, 30);
      if (banTimerVal <= 0) {
        clearInterval(banTimerInterval);
        if (isPlayerTurn) {
          if (subPhase === 'ban') autoFallbackBan('player');
          else autoFallbackPick('player');
        }
      }
    }, 1000);
  }

  // ── DEPLOY PHASE ─────────────────────────────────────────────
  function startDeployPhase() {
    clearInterval(banTimerInterval);
    GameState.setPhase(GameState.PHASES.DEPLOY);
    showScreen('screen-deploy');

    opponentDeployed = false;
    opponentField    = null;

    if (!isMultiplayerGame()) {
      const s = GameState.getState();
      const aiDeploy = AIEngine.deployField(s.pickPhase.enemyPicks, s.field.player, difficulty);
      if (aiDeploy.front) aiDeploy.front.forEach((c,i)=>{ if(c) s.field.enemy.front[i]=GameData.cloneCard(c.id); });
      if (aiDeploy.back)  aiDeploy.back.forEach((c,i)=>{ if(c) s.field.enemy.back[i]=GameData.cloneCard(c.id); });
      s.field.enemyReady = true;
      opponentDeployed   = true;
    }

    renderDeployHand();
    renderDeployField();
    startDeployTimer();
  }

  function renderDeployHand() {
    const s = GameState.getState();
    const placed = GameState.getPlacedCardIds('player');
    // FIX: playerPicks are objects {id,...} — extract id first
    document.getElementById('deploy-hand-cards').innerHTML = s.pickPhase.playerPicks.map(pick => {
      const id = pickId(pick);
      const c  = GameData.getCardById(id);
      if (!c) return '';
      const isPlaced = placed.includes(id);
      return `<div class="hand-card ${isPlaced?'placed':''}" draggable="true"
        ondragstart="Game.onDragStart(event,'${id}')"
        onclick="Game.onHandCardClick('${id}')">
        <div class="hand-card-info">${c.name}</div>
        ${c.element?`<div style="font-size:10px;color:${getElemColor(c.element)}">${c.element}</div>`:''}
        ${isPlaced?'<div style="font-size:9px;color:#aaa;">已部署</div>':''}
      </div>`;
    }).join('');
  }

  function renderDeployField() {
    const f = GameState.getState().field.player;
    function buildCellHTML(card) {
      if (!card) return '';
      const eq = card.equipped || {};
      const slotIcon = (slot) => {
        const inst = eq[slot];
        if (!inst) return `<div class="eq-slot empty" title="${slot}">·</div>`;
        const def = GameData.getEquipment ? GameData.getEquipment(inst.equipId) : null;
        if (!def) return `<div class="eq-slot" title="${slot}">⚙</div>`;
        return `<div class="eq-slot" title="${def.name}" style="color:${GameData.RARITY?.[def.rarity]?.color||'#fff'}">${def.icon}</div>`;
      };
      return `<div class="deploy-card-wrap">
        <div class="deploy-card-name">${card.name}</div>
        ${card.element?`<div style="font-size:10px;color:${getElemColor(card.element)}">${card.element}</div>`:''}
        <div class="deploy-eq-row">${slotIcon('weapon')}${slotIcon('armor')}${slotIcon('mount')}${card.isKing?slotIcon('artifact'):''}</div>
        <button class="btn-mini" onclick="event.stopPropagation();Game.openEquipModal('player','${card.id}','${card.name}')">⚙ 裝備</button>
      </div>`;
    }
    [0,1,2].forEach(i=>{const el=document.getElementById(`deploy-front-${i}-content`);if(el)el.innerHTML=buildCellHTML(f.front[i]);});
    [0,1].forEach(i=>{const el=document.getElementById(`deploy-back-${i}-content`); if(el)el.innerHTML=buildCellHTML(f.back[i]);});
  }

  function onDragStart(e, cardId) { dragCardId=cardId; e.dataTransfer.setData('text/plain',cardId); }

  function dropCard(e, row, idx) {
    const cardId = dragCardId || e.dataTransfer.getData('text/plain');
    if (!cardId) return;
    const r = GameState.placeCard('player', row, idx, cardId);
    if (r.ok) { dragCardId=null; renderDeployField(); renderDeployHand(); }
    else showToast(r.reason);
  }

  function onHandCardClick(cardId) {
    if (GameState.getPlacedCardIds('player').includes(cardId)) {
      GameState.removeCardFromField('player', cardId);
      renderDeployField(); renderDeployHand(); return;
    }
    const s  = GameState.getState();
    const c  = GameData.getCardById(cardId);
    if (!c) return;
    if (c.cardType === 'general') {
      for (let i=0;i<3;i++) { if (!s.field.player.front[i]) { GameState.placeCard('player','front',i,cardId); break; } }
    } else {
      for (let i=0;i<2;i++) { if (!s.field.player.back[i])  { GameState.placeCard('player','back',i,cardId); break; } }
    }
    renderDeployField(); renderDeployHand();
  }

  function autoDeployPlayer() {
    // FIX: picks are objects, extract id
    const picks = GameState.getState().pickPhase.playerPicks;
    picks.forEach(p => onHandCardClick(pickId(p)));
  }

  function confirmDeploy() {
    const s = GameState.getState();
    if (s.field.player.front.filter(Boolean).length === 0) { showToast('❌ 前排至少要有1名武將！'); return; }
    clearInterval(deployTimerInterval);
    s.field.playerReady = true;

    if (isMultiplayerGame()) {
      showToast('等待對手部署...');
      NetworkEngine.sendAction('deploy', {
        field: { front: s.field.player.front.map(c=>c?c.id:null), back: s.field.player.back.map(c=>c?c.id:null) }
      });
      checkBattleStart();
    } else {
      startBattle();
    }
  }

  function applyOpponentDeploy(netField) {
    opponentDeployed = true;
    opponentField    = netField;
    const s = GameState.getState();
    netField.front.forEach((id,i)=>{ if(id) s.field.enemy.front[i]=GameData.cloneCard(id); });
    netField.back.forEach((id,i)=>{ if(id) s.field.enemy.back[i]=GameData.cloneCard(id); });
    s.field.enemyReady = true;
    checkBattleStart();
  }

  function checkBattleStart() {
    if (GameState.getState().field.playerReady && opponentDeployed) setTimeout(startBattle, 500);
  }

  function startDeployTimer() {
    clearInterval(deployTimerInterval); deployTimerVal=60;
    deployTimerInterval = setInterval(()=>{
      deployTimerVal--;
      updateTimerDisplay('deploy-timer','deploy-timer-bar',deployTimerVal,60);
      if (deployTimerVal<=0) { autoDeployPlayer(); confirmDeploy(); }
    }, 1000);
  }

  // ── BATTLE PHASE ─────────────────────────────────────────────
  function startBattle() {
    GameState.setPhase(GameState.PHASES.BATTLE);
    GameState.initBattle();
    window.BalanceEngine?.setMode(isMultiplayerGame() ? BalanceEngine.MODE?.PVP : BalanceEngine.MODE?.PVE);

    // Apply equip bonuses
    const sb = GameState.getState();
    ['player','enemy'].forEach(side => {
      ['front','back'].forEach(row => {
        sb.field[side][row].forEach(c=>{ if(c && window.BalanceEngine) BalanceEngine.normalizedEquipBonus?.(c); });
      });
    });

    // Campaign buffs
    if (window.CampaignEngine && CampaignEngine.currentLevelId) {
      const lvl = CampaignEngine.getLevel(CampaignEngine.currentLevelId);
      if (lvl?.enemyBuffs) {
        const buff = (c) => {
          if (c && c.cardType==='general') {
            c.maxHp    = Math.round(c.maxHp * (lvl.enemyBuffs.hp||1));
            c.currentHp= c.maxHp;
            c.atk      = Math.round(c.atk  * (lvl.enemyBuffs.atk||1));
          }
        };
        sb.field.enemy.front.forEach(buff);
        sb.field.enemy.back.forEach(buff);
      }
    }

    showScreen('screen-battle');
    playerCmds = { phase1:null, phase2:null };
    enemyCmds  = null;
    waitingForOpponent = false;
    selectedAttackerIdx = 0;
    selectedTargetIdx   = 0;
    renderBattleField();
    renderMorale();
    startCmdTimer();
  }

  function renderBattleField() {
    const s = GameState.getState();
    [0,1,2].forEach(i=>renderBattleCell(document.getElementById(`player-front-cell-${i}`), s.field.player.front[i], i===selectedAttackerIdx, false));
    [0,1].forEach(i=>renderBattleBackCell(document.getElementById(`player-back-cell-${i}`), s.field.player.back[i], 'player'));
    [0,1,2].forEach(i=>renderBattleCell(document.getElementById(`enemy-front-cell-${i}`), s.field.enemy.front[i], false, i===selectedTargetIdx));
    [0,1].forEach(i=>renderBattleBackCell(document.getElementById(`enemy-back-cell-${i}`), s.field.enemy.back[i], 'enemy'));
    const tn = document.getElementById('battle-turn-num'); if(tn) tn.textContent = s.battle.turn;
  }

  function renderMorale() {
    const s = GameState.getState();
    const pm = s.battle.playerMorale, em = s.battle.enemyMorale;
    const pf=document.getElementById('player-morale-fill'), ef=document.getElementById('enemy-morale-fill');
    const pv=document.getElementById('player-morale-val'),  ev=document.getElementById('enemy-morale-val');
    if(pf) pf.style.width = Math.max(0,Math.min(100,pm))+'%';
    if(ef) ef.style.width = Math.max(0,Math.min(100,em))+'%';
    if(pv) pv.textContent = pm;
    if(ev) ev.textContent = em;
  }

  function renderBattleCell(cell, card, isAtk, isTgt) {
    if (!cell) return;
    cell.className = 'battle-cell front ' + (isAtk?'selected-attacker':'') + (isTgt?'selected-target':'');
    if (!card || card.currentHp<=0) { cell.innerHTML=''; cell.classList.add('empty'); return; }
    cell.classList.remove('empty');
    const eColor = getElemColor(card.element);
    const hpPct  = Math.round(card.currentHp/card.maxHp*100);
    cell.innerHTML = `<div class="battle-gen-card">
      <div style="font-size:10px;color:${eColor}">${card.element||'?'}</div>
      <div class="battle-gen-portrait-wrap">
        <img class="battle-gen-portrait" src="img/generals/${card.id}.webp" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"/>
        <div class="battle-gen-kanji" style="display:none;color:${card.color||'#ccc'}">${card.name.charAt(0)}</div>
      </div>
      ${card.signatureItem?`<div class="battle-signature">${card.signatureItem.split(' ')[0]}</div>`:''}
      <div class="battle-hp-bar"><div style="width:${hpPct}%;background:${hpPct>50?'#4caf50':hpPct>25?'#ff9800':'#ef5350'};height:100%;border-radius:3px;transition:width 0.3s;"></div></div>
      <div style="font-size:9px;color:var(--text-muted)">${card.currentHp}/${card.maxHp}</div>
      <div style="font-size:10px">${card.name}</div>
    </div>`;
  }

  function renderBattleBackCell(cell, card, side) {
    if (!cell) return;
    cell.className = 'battle-cell back';
    if (!card) { cell.innerHTML=''; return; }
    const isHidden = side==='enemy' && !card.revealed;
    cell.innerHTML = `<div style="font-size:10px;text-align:center;padding:4px;">
      ${isHidden ? '🂠 伏牌' : (card.cardType==='heal'?'💊':'🪤')+' '+card.name}
    </div>`;
  }

  function selectAttacker(row, idx) { selectedAttackerIdx=idx; renderBattleField(); }
  function selectTarget(row, idx)   { selectedTargetIdx=idx;   renderBattleField(); }

  function clickBackCard(side, idx) {
    const s    = GameState.getState();
    const card = s.field[side].back[idx];
    if (!card) return;
    if (side === 'enemy') { showToast(card.revealed ? `敵方後排：${card.name}` : '🪤 敵方伏牌，無法直接看穿'); return; }
    if (card.cardType === 'trap') {
      if (card.revealed) { showToast('陷阱已揭示'); return; }
      card.revealed = true;
      GameState.addLog({ text:`🪤 我方發動陷阱：${card.name}`, type:'system' });
      sendToCemetery('player', card);
      s.field.player.back[idx] = null;
      renderBattleField(); renderBattleLog();
    } else if (card.cardType === 'heal') {
      const target = GameState.getActiveGeneral('player');
      if (!target) { showToast('無可治療的目標'); return; }
      const healAmt = card.healAmount || 25;
      target.currentHp = Math.min(target.maxHp, target.currentHp + healAmt);
      GameState.addLog({ text:`💊 ${card.name}：${target.name} 回復 ${healAmt} HP`, type:'heal' });
      sendToCemetery('player', card);
      s.field.player.back[idx] = null;
      renderBattleField(); renderBattleLog();
    } else {
      showToast(card.name);
    }
  }

  function sendToCemetery(side, card) {
    const s = GameState.getState();
    if (!s.battle.cemetery) s.battle.cemetery = { player:[], enemy:[] };
    s.battle.cemetery[side].push({ id:card.id, name:card.name, cardType:card.cardType, turn:s.battle.turn });
    refreshCemeteryUI();
  }

  function showCemetery(side) {
    const s    = GameState.getState();
    const list = (s.battle.cemetery && s.battle.cemetery[side]) || [];
    const grid = document.getElementById('cemetery-grid');
    const title= document.getElementById('cemetery-title');
    if (title) title.textContent = (side==='player'?'我方':'敵方') + '墓地';
    if (grid)  grid.innerHTML = list.length===0
      ? `<div class="smithy-empty">空無一物</div>`
      : list.map(c=>`<div class="cemetery-item ${c.cardType}"><div class="cem-name">${c.name}</div><div class="cem-meta">第 ${c.turn} 回合</div></div>`).join('');
    const modal = document.getElementById('modal-cemetery');
    if (modal) modal.style.display='flex';
  }

  function hideCemetery() {
    const modal = document.getElementById('modal-cemetery');
    if (modal) modal.style.display='none';
  }

  function refreshCemeteryUI() {
    const s   = GameState.getState();
    const cem = (s.battle && s.battle.cemetery) || { player:[], enemy:[] };
    const pb  = document.getElementById('cem-count-player');
    const eb  = document.getElementById('cem-count-enemy');
    if (pb) pb.textContent = cem.player.length;
    if (eb) eb.textContent = cem.enemy.length;
  }

  // ── COMMAND PHASE ────────────────────────────────────────────
  function playerChooseCmd(phase, tacticTag) {
    if (waitingForOpponent) { showToast('正在等待對手行動'); return; }
    if (phase===1) {
      playerCmds.phase1 = tacticTag;
      document.querySelectorAll('#cmd1-btns .cmd-btn').forEach(b=>b.classList.remove('selected'));
      const b1=document.getElementById('cmd1-'+tacticTag); if(b1) b1.classList.add('selected');
    } else {
      playerCmds.phase2 = tacticTag;
      document.querySelectorAll('#cmd2-btns .cmd-btn').forEach(b=>b.classList.remove('selected'));
      const b2=document.getElementById('cmd2-'+tacticTag); if(b2) b2.classList.add('selected');
    }

    if (playerCmds.phase1 && playerCmds.phase2) {
      waitingForOpponent = true;
      clearInterval(cmdTimerInterval);
      document.querySelectorAll('.cmd-btn').forEach(b=>b.disabled=true);

      if (isMultiplayerGame()) {
        NetworkEngine.sendAction('cmd', { cmd: playerCmds });
        showToast('已鎖定陣法，等待對手...');
        checkResolveTurn();
      } else {
        enemyCmds = AIEngine.chooseCmd(GameState.getState(), difficulty);
        setTimeout(resolveBattleTurn, 800);
      }
    }
  }

  function applyOpponentCommand(cmdObj) { enemyCmds=cmdObj; checkResolveTurn(); }
  function checkResolveTurn() { if (waitingForOpponent && enemyCmds) resolveBattleTurn(); }

  function setBattlePhase(name) {
    ['draw','standby','main','battle','end'].forEach(p=>{
      const el=document.getElementById('phase-'+p); if(el) el.classList.toggle('active',p===name);
    });
  }

  function startCmdTimer() {
    clearInterval(cmdTimerInterval);
    cmdTimerVal = 30;
    playerCmds = { phase1:null, phase2:null };
    enemyCmds  = null;
    waitingForOpponent = false;
    setBattlePhase('main');
    document.querySelectorAll('.cmd-btn').forEach(b=>{b.disabled=false;});
    updateTimerDisplay('cmd-timer','cmd-timer-bar',cmdTimerVal,30);

    cmdTimerInterval = setInterval(()=>{
      cmdTimerVal--;
      updateTimerDisplay('cmd-timer','cmd-timer-bar',cmdTimerVal,30);
      if (cmdTimerVal<=0) {
        if (!playerCmds.phase1) playerChooseCmd(1,'jianbi');
        if (!playerCmds.phase2) playerChooseCmd(2,'dilie');
      }
    }, 1000);
  }

  function resolveBattleTurn() {
    const s    = GameState.getState();
    const pAtk = s.field.player.front[selectedAttackerIdx] || GameState.getActiveGeneral('player');
    const pTgt = s.field.enemy.front[selectedTargetIdx]   || GameState.getActiveGeneral('enemy');
    const eAtk = GameState.getActiveGeneral('enemy');

    setBattlePhase('battle');
    const beforeAlive = collectAliveSnapshot();

    CombatEngine.resolveTurn(s, playerCmds, enemyCmds, pAtk, pTgt, eAtk, pAtk);

    pushDeadToCemetery(beforeAlive);
    renderBattleField();
    renderBattleLog();
    renderMorale();
    refreshCemeteryUI();

    const win = GameState.checkWinCondition();
    if (win) { showResults(win); return; }

    setBattlePhase('end');
    setTimeout(()=>{
      setBattlePhase('draw');
      setTimeout(()=>{setBattlePhase('standby'); setTimeout(startCmdTimer, 600);}, 600);
    }, 800);
  }

  function collectAliveSnapshot() {
    const s = GameState.getState(), out={player:[],enemy:[]};
    ['player','enemy'].forEach(side=>{
      ['front','back'].forEach(row=>{
        s.field[side][row].forEach(c=>{ if(c&&c.currentHp>0) out[side].push({id:c.id,name:c.name,cardType:c.cardType}); });
      });
    });
    return out;
  }

  function pushDeadToCemetery(before) {
    const s = GameState.getState();
    if (!s.battle.cemetery) s.battle.cemetery={player:[],enemy:[]};
    ['player','enemy'].forEach(side=>{
      const aliveAfter=new Set();
      ['front','back'].forEach(row=>s.field[side][row].forEach(c=>{if(c&&c.currentHp>0)aliveAfter.add(c.id);}));
      before[side].forEach(prev=>{
        if (!aliveAfter.has(prev.id))
          s.battle.cemetery[side].push({id:prev.id,name:prev.name,cardType:prev.cardType,turn:s.battle.turn});
      });
    });
  }

  function renderBattleLog() {
    const el = document.getElementById('battle-log');
    if (!el) return;
    el.innerHTML = GameState.getState().battle.log.slice(0,25).map(l=>
      `<div class="log-line ${l.type||'normal'}">${l.text}</div>`
    ).join('');
  }

  // ── RESULTS ──────────────────────────────────────────────────
  function showResults(winObj) {
    clearAllTimers();
    showScreen('screen-results');
    const title  = document.getElementById('results-title');
    const reason = document.getElementById('results-reason');
    if (title)  title.textContent  = winObj.winner==='player' ? '✨ 勝利' : winObj.winner==='draw' ? '⚖️ 平局' : '💀 敗北';
    if (reason) reason.textContent = winObj.reason;

    if (!isMultiplayerGame()) {
      const s = GameState.getState();
      const playerWon = winObj.winner === 'player';
      const allCards  = s.field.player.front.concat(s.field.player.back).filter(Boolean);
      const totalHp   = allCards.reduce((a,c)=>a+(c.maxHp||0),0)||1;
      const lostHp    = allCards.reduce((a,c)=>a+((c.maxHp||0)-(c.currentHp||0)),0);
      const ratio     = Math.min(1, lostHp/totalHp);
      const rewards   = window.SmithyEngine ? SmithyEngine.settleBattle(playerWon, ratio) : {yintie:0,pige:0,matiehe:0,qianghua:0};
      const statBox   = document.getElementById('results-stats');
      if (statBox) {
        const mats = window.GameData?.MATERIALS || {};
        statBox.innerHTML = `<div class="reward-row">
          <div class="reward-pill">${mats.yintie?.icon||'🔩'} 隕鐵 +${rewards.yintie||0}</div>
          <div class="reward-pill">${mats.pige?.icon||'📦'} 皮革 +${rewards.pige||0}</div>
          <div class="reward-pill">${mats.matiehe?.icon||'🪙'} 馬鈴銀 +${rewards.matiehe||0}</div>
          <div class="reward-pill">${mats.qianghua?.icon||'💎'} 強化石 +${rewards.qianghua||0}</div>
          <div class="reward-pill jade">玉帛 +${playerWon?200:40}</div>
        </div>`;
      }
    }

    if (window.CampaignEngine && CampaignEngine.currentLevelId && winObj.winner==='player') {
      CampaignEngine.saveProgress(CampaignEngine.currentLevelId);
      showToast('🎉 千古幻陣 挑戰成功！解鎖新關卡！', 5000);
      CampaignEngine.currentLevelId = null;
    }
  }

  // ══ GACHA ════════════════════════════════════════════════════
  let currentGachaPool = 'weapon';

  function showGacha() {
    if (!window.GachaEngine) { showToast('⚠️ 抽卡模組未載入'); return; }
    showScreen('screen-gacha');
    switchGachaPool(currentGachaPool);
  }

  function switchGachaPool(pool) {
    currentGachaPool = pool;
    document.getElementById('gtab-weapon')?.classList.toggle('active', pool==='weapon');
    document.getElementById('gtab-armor')?.classList.toggle('active', pool==='armor');
    const featured = GachaEngine.getFeatured()[pool];
    const fdef = featured && GameData.getEquipment ? GameData.getEquipment(featured) : null;
    const titleEl = document.getElementById('gacha-banner-title');
    const featEl  = document.getElementById('gacha-banner-featured');
    if (titleEl) titleEl.textContent = pool==='weapon' ? '神兵降世·限時池' : '玄甲護國·限時池';
    if (featEl && fdef) {
      const r = GameData.RARITY?.[fdef.rarity];
      featEl.textContent = `【機率提升】${'★'.repeat(r?.stars||3)} ${fdef.icon} ${fdef.name}`;
    }
    updateGachaUI();
  }

  function updateGachaUI() {
    if (!window.Inventory) return;
    const jadeEl = document.getElementById('gacha-jade-count');
    if (jadeEl) jadeEl.textContent = Inventory.getJade();
    const pity = Inventory.getPity ? Inventory.getPity(currentGachaPool) : {srCount:0,legendCount:0};
    const srEl = document.getElementById('pity-sr');
    const lgEl = document.getElementById('pity-legend');
    if (srEl) srEl.textContent = `SR 保底：${pity.srCount}/${GachaEngine.PITY_SR_AT}`;
    if (lgEl) lgEl.textContent = `傳說保底：${pity.legendCount}/${GachaEngine.PITY_LEGEND_AT}`;
  }

  function performSummon(count) {
    if (!window.GachaEngine) { showToast('⚠️ 抽卡模組未載入'); return; }
    const fn = count===10 ? GachaEngine.pullTen : GachaEngine.pullSingle;
    const result = fn(currentGachaPool);
    if (!result.ok) { showToast(result.msg); return; }
    const list = document.getElementById('summon-results');
    if (!list) return;
    list.innerHTML = '';
    result.results.forEach((item,idx)=>{ setTimeout(()=>list.appendChild(renderSummonItem(item)), idx*100); });
    const modal = document.getElementById('modal-summon');
    if (modal) modal.style.display='flex';
    updateGachaUI();
  }

  function renderSummonItem(item) {
    const def    = item.def;
    const rarity = GameData.RARITY?.[def.rarity] || { stars:3, color:'#ccc' };
    const stars  = '★'.repeat(rarity.stars);
    const div    = document.createElement('div');
    div.className = 'gacha-result-item ' + def.rarity.toLowerCase();
    div.innerHTML = `<div class="item-card ${def.rarity.toLowerCase()}" style="border-color:${rarity.color}">
      <div class="item-rarity-stars" style="color:${rarity.color}">${stars}</div>
      <div class="item-icon">${def.icon}</div>
      <div class="item-name">${def.name}</div>
      ${item.viaPity?`<div class="item-pity">${item.viaPity==='legend'?'傳說保底':'SR 保底'}</div>`:''}
      ${item.asFragment?`<div class="item-frag">↳ 已轉為碎片</div>`:''}
    </div>`;
    return div;
  }

  function hideSummonResults() {
    const modal = document.getElementById('modal-summon');
    if (modal) modal.style.display='none';
  }

  // ══ ARMORY ═══════════════════════════════════════════════════
  let armoryFilter = 'weapon';

  function showArmory() {
    if (!window.Inventory) { showToast('⚠️ 倉庫模組未載入'); return; }
    armoryFilter = 'weapon';
    document.querySelectorAll('.armory-tab').forEach(b=>b.classList.toggle('active',b.dataset.armoryTab===armoryFilter));
    showScreen('screen-armory');
    renderArmoryGrid();
  }

  function filterArmory(tab) {
    armoryFilter = tab;
    document.querySelectorAll('.armory-tab').forEach(b=>b.classList.toggle('active',b.dataset.armoryTab===tab));
    renderArmoryGrid();
  }

  function renderArmoryGrid() {
    const grid  = document.getElementById('armory-grid');
    const empty = document.getElementById('armory-empty');
    if (!grid || !window.Inventory) return;
    let html = '';

    if (armoryFilter === 'fragment') {
      const frags = Inventory._data().fragments;
      const ids   = Object.keys(frags).filter(k=>frags[k]>0);
      if (!ids.length) { grid.innerHTML=''; if(empty) empty.style.display='block'; return; }
      html = ids.map(id=>{
        const def = GameData.getEquipment?.(id); if(!def) return '';
        const r   = GameData.RARITY?.[def.rarity]||{color:'#ccc'};
        const cnt = frags[id]; const ready = cnt >= (SmithyEngine?.FRAGMENT_REQ||10);
        return `<div class="armory-item fragment" style="border-color:${r.color}">
          <div class="armory-item-icon">${def.icon}</div>
          <div class="armory-item-name" style="color:${r.color}">${def.name}</div>
          <div class="armory-item-frag-count">碎片：${cnt} / ${SmithyEngine?.FRAGMENT_REQ||10}</div>
          <button class="btn-tiny ${ready?'':'disabled'}" ${ready?'':'disabled'} onclick="Game.mergeFragment('${id}')">合成</button>
        </div>`;
      }).join('');
    } else {
      const insts = Inventory.getEquipmentInstances().filter(i=>{
        const d=GameData.getEquipment?.(i.equipId); if(!d) return false;
        return GameData.getEquipmentSlotType?.(d)===armoryFilter;
      });
      if (!insts.length) { grid.innerHTML=''; if(empty) empty.style.display='block'; return; }
      html = insts.map(inst=>{
        const def=GameData.getEquipment?.(inst.equipId); if(!def) return '';
        const r=GameData.RARITY?.[def.rarity]||{color:'#ccc'};
        return `<div class="armory-item" style="border-color:${r.color}">
          <div class="armory-item-icon">${def.icon}</div>
          <div class="armory-item-name" style="color:${r.color}">${def.name}</div>
          <div class="armory-item-stats">${def.atk?'ATK +'+def.atk:''}${def.def?' DEF +'+def.def:''}${def.spd?' SPD +'+def.spd:''}</div>
          <div class="armory-item-meta">Lv.${inst.level} ／ 耐久 ${inst.durability}/${def.durability}</div>
          <div class="armory-item-desc">${def.desc||''}</div>
          <div class="armory-item-actions">
            <button class="btn-tiny" onclick="Game.dismantleEquipment('${inst.instanceId}')">分解</button>
          </div>
        </div>`;
      }).join('');
    }
    grid.innerHTML = html;
    if (empty) empty.style.display='none';
  }

  function dismantleEquipment(instanceId) {
    if (!confirm('確認分解此裝備？將獲得強化石。')) return;
    const r = Inventory.dismantleEquipment?.(instanceId);
    if (r) showToast(`✅ 分解成功：+${r.stones} 強化石`);
    renderArmoryGrid();
  }

  function mergeFragment(equipId) {
    if (!window.SmithyEngine) return;
    const r = SmithyEngine.mergeFragment(equipId);
    if (!r.ok) { showToast(r.reason); return; }
    showToast('🎉 碎片合成成功！');
    renderArmoryGrid();
  }

  // ══ SMITHY ═══════════════════════════════════════════════════
  let smithyTab = 'upgrade';

  function showSmithy() {
    if (!window.SmithyEngine) { showToast('⚠️ 鐵匠鋪模組未載入'); return; }
    smithyTab = 'upgrade';
    document.querySelectorAll('.smithy-tab').forEach(b=>b.classList.toggle('active',b.dataset.smithyTab===smithyTab));
    showScreen('screen-smithy');
    renderSmithyMaterials();
    renderSmithyContent();
  }

  function switchSmithyTab(tab) {
    smithyTab = tab;
    document.querySelectorAll('.smithy-tab').forEach(b=>b.classList.toggle('active',b.dataset.smithyTab===tab));
    renderSmithyContent();
  }

  function renderSmithyMaterials() {
    const m   = Inventory?.getAllMaterials() || {};
    const mat = window.GameData?.MATERIALS   || {};
    const el  = document.getElementById('smithy-materials');
    if (!el) return;
    el.innerHTML = `
      <div class="mat-pill">${mat.yintie?.icon||'🔩'} 隕鐵 ${m.yintie||0}</div>
      <div class="mat-pill">${mat.pige?.icon||'📦'} 皮革 ${m.pige||0}</div>
      <div class="mat-pill">${mat.matiehe?.icon||'🪙'} 馬鈴銀 ${m.matiehe||0}</div>
      <div class="mat-pill">${mat.qianghua?.icon||'💎'} 強化石 ${m.qianghua||0}</div>
      <div class="mat-pill jade">玉帛 ${Inventory?.getJade()||0}</div>`;
  }

  function renderSmithyContent() {
    const wrap = document.getElementById('smithy-content');
    if (!wrap || !window.SmithyEngine) return;
    if (smithyTab === 'upgrade') {
      const insts = Inventory?.getEquipmentInstances() || [];
      if (!insts.length) { wrap.innerHTML=`<div class="smithy-empty">尚無裝備可升級</div>`; return; }
      wrap.innerHTML = insts.map(inst=>{
        const def=GameData.getEquipment?.(inst.equipId); if(!def) return '';
        const r=GameData.RARITY?.[def.rarity]||{color:'#ccc'};
        const cost=SmithyEngine.upgradeCost(inst);
        const can =SmithyEngine.canUpgrade(inst);
        const mname=GameData.MATERIALS?.[cost.mat]?.name||'';
        return `<div class="smithy-row" style="border-color:${r.color}">
          <div class="smithy-row-icon">${def.icon}</div>
          <div class="smithy-row-info">
            <div class="smithy-row-name" style="color:${r.color}">${def.name} <span class="smithy-row-lv">Lv.${inst.level}</span></div>
            <div class="smithy-row-cost">需 ${mname} ${cost.matAmount} ／ 強化石 ${cost.stones} ／ 玉帛 ${cost.jade}</div>
          </div>
          <button class="btn-tiny ${can.ok?'':'disabled'}" ${can.ok?'':'disabled'} onclick="Game.upgradeEquipment('${inst.instanceId}')">升級</button>
        </div>`;
      }).join('');
    } else {
      const frags = Inventory?._data().fragments || {};
      const ids   = Object.keys(frags).filter(k=>frags[k]>0);
      if (!ids.length) { wrap.innerHTML=`<div class="smithy-empty">尚無碎片可合成</div>`; return; }
      wrap.innerHTML = ids.map(id=>{
        const def=GameData.getEquipment?.(id); if(!def) return '';
        const r=GameData.RARITY?.[def.rarity]||{color:'#ccc'};
        const cnt=frags[id]; const ready=cnt>=(SmithyEngine.FRAGMENT_REQ||10);
        return `<div class="smithy-row" style="border-color:${r.color}">
          <div class="smithy-row-icon">${def.icon}</div>
          <div class="smithy-row-info">
            <div class="smithy-row-name" style="color:${r.color}">${def.name}</div>
            <div class="smithy-row-cost">碎片：${cnt} / ${SmithyEngine.FRAGMENT_REQ||10}</div>
          </div>
          <button class="btn-tiny ${ready?'':'disabled'}" ${ready?'':'disabled'} onclick="Game.mergeFragment('${id}')">合成</button>
        </div>`;
      }).join('');
    }
  }

  function upgradeEquipment(instanceId) {
    if (!window.SmithyEngine) return;
    const r = SmithyEngine.upgrade(instanceId);
    if (!r.ok) { showToast(r.reason); return; }
    showToast(`🔨 升級成功！等級 ${r.level}`);
    renderSmithyMaterials();
    renderSmithyContent();
  }

  // ══ EQUIP MODAL ══════════════════════════════════════════════
  let equipModalTargetCardId = null;
  let equipModalTargetSide   = null;

  function openEquipModal(side, cardId, cardName) {
    if (!window.Inventory) { showToast('⚠️ 倉庫模組未載入'); return; }
    equipModalTargetCardId = cardId;
    equipModalTargetSide   = side;
    const targetEl = document.getElementById('equip-modal-target');
    if (targetEl) targetEl.textContent = `為「${cardName}」掛載裝備`;
    const grid  = document.getElementById('equip-modal-grid');
    const insts = Inventory.getEquipmentInstances();
    if (!grid) return;
    if (!insts.length) {
      grid.innerHTML = `<div class="smithy-empty">尚無裝備，請先去抽卡或鐵匠鋪</div>`;
    } else {
      grid.innerHTML = insts.map(inst=>{
        const def=GameData.getEquipment?.(inst.equipId); if(!def) return '';
        const r=GameData.RARITY?.[def.rarity]||{color:'#ccc'};
        return `<div class="equip-pickable" style="border-color:${r.color}" onclick="Game.equipToCard('${inst.instanceId}')">
          <div class="armory-item-icon">${def.icon}</div>
          <div class="armory-item-name" style="color:${r.color}">${def.name}</div>
          <div class="armory-item-meta">Lv.${inst.level}</div>
        </div>`;
      }).join('');
    }
    const modal = document.getElementById('modal-equip');
    if (modal) modal.style.display='flex';
  }

  function equipToCard(instanceId) {
    if (!equipModalTargetCardId) return;
    const s = GameState.getState();
    let card = null;
    for (const row of ['front','back']) {
      for (const c of s.field[equipModalTargetSide][row]) {
        if (c && c.id===equipModalTargetCardId) { card=c; break; }
      }
      if (card) break;
    }
    if (!card) { showToast('找不到目標武將'); return; }
    if (!window.EquipmentEngine) { showToast('⚠️ 裝備引擎未載入'); return; }
    const r = EquipmentEngine.equip(card, instanceId);
    if (!r.ok) { showToast(r.reason); return; }
    EquipmentEngine.applyEquipBonus(card);
    showToast('✅ 掛載成功');
    const modal = document.getElementById('modal-equip');
    if (modal) modal.style.display='none';
    renderDeployField();
  }

  // ── BOOT ─────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    // Give new player some starting jade
    if (window.Inventory && Inventory.getJade() === 0) Inventory.addJade?.(800);
  });

  // ── PUBLIC API ───────────────────────────────────────────────
  return {
    setDifficulty, startGame, startMultiplayer, returnLobby, isMultiplayerGame,
    startCampaign, selectCampaignLevel, startCampaignLevel,
    filterDraft, searchDraft, switchPickTab, onCardClick,
    dropCard, onDragStart, onHandCardClick, autoDeployPlayer, confirmDeploy,
    selectAttacker, selectTarget, playerChooseCmd, clickBackCard,
    showCemetery, hideCemetery,
    showGacha, switchGachaPool, performSummon, hideSummonResults,
    showArmory, filterArmory, dismantleEquipment, mergeFragment,
    showSmithy, switchSmithyTab, upgradeEquipment,
    openEquipModal, equipToCard,
    onMultiplayerMatchStarted, onMatchmakingTimeout,
    applyOpponentBan, applyOpponentPick, applyOpponentDeploy, applyOpponentCommand
  };
})();
