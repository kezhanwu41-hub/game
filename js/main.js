/**
 * main.js v3 — 連線五行場地控制器
 */
window.Game = (function() {
  'use strict';

  // ── STATE ───────────────────────────────────────────────────
  let difficulty  = 'medium';
  let currentFilter    = 'all';
  let currentSearch    = '';
  let currentPickTab   = 'general';
  
  // Timer & Phases
  let banTimerInterval  = null;
  let pickTimerInterval = null;
  let deployTimerInterval = null;
  let cmdTimerInterval  = null;
  let banTimerVal   = 30;
  let pickTimerVal  = 45;
  let deployTimerVal= 60;
  let cmdTimerVal   = 30;
  
  // Battle selection
  let selectedAttackerIdx = null;
  let selectedTargetIdx   = null;
  let dragCardId = null;

  // Network State
  let playerCmds = { phase1: null, phase2: null };
  let enemyCmds  = null; // Waiting for opponent
  let waitingForOpponent = false;

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
    document.getElementById(id).classList.add('active');
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
    const n=document.getElementById(numId); const b=document.getElementById(barId);
    if(n) n.textContent=val;
    if(b) { b.style.width=(val/max*100)+'%';
      b.style.background = val>10 ? 'var(--gold)' : '#ef5350'; }
  }

  function setDifficulty(d) {
    difficulty=d;
    ['easy','medium','hard'].forEach(x=>document.getElementById('diff-'+x)?.classList.toggle('active',x===d));
  }

  function autoFallbackBan(side) {
    const s = GameState.getState();
    const banned = s.banPhase.banned;
    const avail = GameData.generals.filter(g => !banned.includes(g.id));
    if (avail.length) performBan(avail[0].id, side === 'player');
  }

  function autoFallbackPick(side) {
    const s = GameState.getState();
    const taken = [...s.pickPhase.playerPicks, ...s.pickPhase.enemyPicks].map(p => p.id);
    const avail = GameData.generals.filter(g => !taken.includes(g.id) && !s.banPhase.banned.includes(g.id));
    if (avail.length) performPick(avail[0].id, side === 'player');
  }

  // ── STARTING GAMES ──────────────────────────────────────────
  function startGame() {
    GameState.init(difficulty);
    currentFilter='all'; currentSearch='';
    NetworkEngine?.disconnect(); 
    startDraftPhase();
  }

  function startDraftPhase() {
    GameState.setBPStage(0);
    subPhase = 'ban';
    showScreen('screen-draft');
    updateDraftUI();
    startDraftTimer();
  }

  let subPhase = 'ban'; 
  function updateDraftUI() {
    const s = GameState.getState();
    const stage = s.bpStage;
    const role = GameState.getCurrentRole();
    
    // Header
    document.getElementById('draft-phase-title').textContent = `第 ${stage+1} 階段：【${role}】${subPhase === 'ban' ? '禁用武將' : '選取武將'}`;
    
    // Banned Grid
    const pBans = s.banPhase.banned.filter((_, i) => i % 2 === 0);
    const eBans = s.banPhase.banned.filter((_, i) => i % 2 === 1);
    
    document.getElementById('player-ban-grid').innerHTML = pBans.map(id => `<div class="ban-card-mini player"><img src="img/generals/${id}.webp" /></div>`).join('');
    document.getElementById('enemy-ban-grid').innerHTML = eBans.map(id => `<div class="ban-card-mini enemy"><img src="img/generals/${id}.webp" /></div>`).join('');

    // Role Slots
    const roleMap = { '主公':'lord', '軍師':'advisor', '臣相':'minister', '大司馬':'marshal', '大司農':'agri', '大將軍':'chief', '行軍總管':'marching', '破陣先鋒':'vanguard' };
    
    ['player', 'enemy'].forEach(side => {
      const picks = side === 'player' ? s.pickPhase.playerPicks : s.pickPhase.enemyPicks;
      picks.forEach(p => {
        const slot = document.getElementById(`${side === 'player' ? 'p' : 'e'}-role-${roleMap[p.role]}`);
        if (slot) {
          slot.classList.add('filled');
          if (p.penalty < 0) slot.classList.add('penalty');
          slot.querySelector('.role-content').textContent = p.name;
        }
      });
      
      // Highlight current active slot
      Object.keys(roleMap).forEach(rName => {
        const slotId = `${side === 'player' ? 'p' : 'e'}-role-${roleMap[rName]}`;
        const el = document.getElementById(slotId);
        if (el) el.classList.remove('active');
        if (subPhase === 'pick' && rName === role) {
           const elActive = document.getElementById(slotId);
           if (elActive) elActive.classList.add('active');
        }
      });
    });

    renderCardGrid('draft-card-grid', 'draft');
  }

  function startMultiplayer() {
    if (!window.NetworkEngine) {
      showToast('⚠️ 網路模組未載入'); return;
    }
    // 顯示配對選項彈窗
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

  function onMatchmakingTimeout() {
    showToast('⏱️ 未找到對手，已為您配對對手');
    GameState.init(difficulty);
    currentFilter = 'all'; currentSearch = '';
    startDraftPhase();
  }

  function isMultiplayerGame() {
    return window.NetworkEngine && window.NetworkEngine.isConnected();
  }

  function onMultiplayerMatchStarted(role) {
    GameState.init(difficulty);
    currentFilter='all'; currentSearch='';
    startDraftPhase();
  }

  function returnLobby() {
    clearAllTimers();
    NetworkEngine?.disconnect();
    showScreen('screen-lobby');
  }

  // ── CAMPAIGN ────────────────────────────────────────────────
  function startCampaign() {
    NetworkEngine?.disconnect(); // Ensure local play for campaign
    showScreen('screen-campaign');
    renderCampaignList();
  }

  function renderCampaignList() {
    const list = document.getElementById('campaign-list');
    const p = CampaignEngine.loadProgress();
    
    let html = '';
    CampaignEngine.levels.forEach((lvl, i) => {
      const isCleared = p.cleared.includes(lvl.id);
      const isLocked = i > 0 && !p.cleared.includes(CampaignEngine.levels[i-1].id);
      
      html += `
        <div class="campaign-level-item ${isLocked ? 'locked' : ''}" id="camp-item-${lvl.id}" onclick="Game.selectCampaignLevel('${lvl.id}')">
          <div class="c-level-name">${lvl.name}</div>
          <div class="c-level-status ${isCleared ? 'cleared' : ''}">${isLocked ? '🔒 未解鎖' : isCleared ? '⭐ 已通關' : '▶ 挑戰'}</div>
        </div>
      `;
    });
    list.innerHTML = html;
    
    // Auto select first unlocked or first level
    const firstUnlocked = CampaignEngine.levels.find((l,i) => i===0 || p.cleared.includes(CampaignEngine.levels[i-1].id));
    if (firstUnlocked) selectCampaignLevel(firstUnlocked.id);
  }

  let selectedCampaignLevel = null;
  function selectCampaignLevel(id) {
    selectedCampaignLevel = id;
    document.querySelectorAll('.campaign-level-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`camp-item-${id}`).classList.add('active');
    
    const lvl = CampaignEngine.getLevel(id);
    const detail = document.getElementById('campaign-detail');
    
    const enemyAvatars = lvl.enemyPicks.map(cid => {
      const card = GameData.getCardById(cid);
      if (!card) return '';
      return `<div class="c-enemy-avatar" title="${card.name}">
        <img src="img/generals/${card.id}.webp" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
        <div style="display:none; color:${GameData.ELEMENTS&&card.element?GameData.ELEMENTS[card.element].color:'#ccc'}">${card.name.charAt(0)}</div>
      </div>`;
    }).join('');

    detail.innerHTML = `
      <div class="c-detail-card">
        <div class="c-detail-header">
          <div class="c-detail-subtitle">幻陣試煉</div>
          <div class="c-detail-title">${lvl.name}</div>
          <div class="c-detail-buffs">
            <div class="c-buff-badge">敵方 生命 x${lvl.enemyBuffs?.hp||1}</div>
            <div class="c-buff-badge">敵方 攻擊 x${lvl.enemyBuffs?.atk||1}</div>
          </div>
        </div>
        <div style="font-size:13px; color:var(--text-muted); text-align:center;">${lvl.desc}</div>
        <div class="c-detail-enemy">
          <div class="c-enemy-label">【 鎮守陣容預覽 】</div>
          <div class="c-enemy-grid">${enemyAvatars}</div>
        </div>
        <button class="btn-primary" style="margin-top:20px; font-size:18px; padding:16px;" onclick="Game.startCampaignLevel()">開始挑戰</button>
      </div>
    `;
  }

  function startCampaignLevel() {
    if (!selectedCampaignLevel) return;
    CampaignEngine.currentLevelId = selectedCampaignLevel;
    
    GameState.init(difficulty);
    const s = GameState.getState();
    const lvl = CampaignEngine.getLevel(selectedCampaignLevel);
    
    // Lock into custom phase: skip ban, jump to pick but enemy already fully picked
    s.phase = GameState.PHASES.PICK;
    s.pickPhase.enemyPicks = [...lvl.enemyPicks];
    
    // Enforce player picks 5, enemy already 5
    // Adjust pickOrder to just `['player','player','player','player','player']`
    s.pickPhase.pickOrder = ['player','player','player','player','player'];
    s.pickPhase.pickIndex = 0;
    
    currentFilter='all'; currentSearch=''; currentPickTab='general';
    subPhase = 'pick';
    showScreen('screen-draft');
    updateDraftUI();
    startDraftTimer();
  }

  function clearAllTimers() {
    clearInterval(banTimerInterval); clearInterval(pickTimerInterval);
    clearInterval(deployTimerInterval); clearInterval(cmdTimerInterval);
  }

  // ── CARD RENDERING ──────────────────────────────────────────
  function getElemBadgeClass(elem) { const map={'木':'wood','火':'fire','土':'earth','金':'metal','水':'water'}; return map[elem]||''; }
  function getElemColor(elem) { return window.GameData?.ELEMENTS ? window.GameData.ELEMENTS[elem]?.color : '#888'; }

  function buildGeneralCard(gen, mode) {
    const s = GameState.getState();
    const isBanned = s.banPhase.banned.includes(gen.id);
    const isPlayer = s.pickPhase.playerPicks.includes(gen.id);
    const isEnemy  = s.pickPhase.enemyPicks.includes(gen.id);
    let cls='gen-card';
    if(isBanned) cls+=' banned'; else if(isPlayer) cls+=' picked-player'; else if(isEnemy) cls+=' picked-enemy';
    const eColor = getElemColor(gen.element);
    const cleanDesc = (gen.description || '').replace(/'/g, '&#39;');
    return `
    <div class="${cls}" id="gcard-${gen.id}" style="border-color:${isBanned?'#333':isPlayer?'var(--blue)':isEnemy?'var(--red)':'rgba(255,255,255,0.1)'};" onclick="Game.onCardClick('${gen.id}','${mode}')" title="${gen.name}&#10;${cleanDesc}">
      ${isBanned?'<div class="ban-overlay">🚫</div>':''}
      ${isPlayer?'<div class="ban-overlay" style="font-size:18px;color:var(--blue)">⚔️</div>':''}
      ${isEnemy ?'<div class="ban-overlay" style="font-size:18px;color:var(--red)">🔴</div>':''}
      <div class="elem-corner ${getElemBadgeClass(gen.element)}" style="border-color:${eColor};color:${eColor}">${gen.element||'?'}</div>
      <div class="gen-image-wrap">
        <img class="gen-portrait" src="img/generals/${gen.id}.webp" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
        <div class="gen-kanji" style="display: none; color:${gen.color||eColor}">${gen.name.charAt(0)}</div>
      </div>
      <div class="gen-name">${gen.name}</div>
      ${gen.signatureItem ? `<div class="gen-signature">${gen.signatureItem}</div>` : ''}
    </div>`;
  }
  function buildHealCard(card, mode) { return `<div class="heal-card" onclick="Game.onCardClick('${card.id}','${mode}')"><div class="card-type-tag">💊</div><div class="card-icon">${card.icon||'💊'}</div><div class="card-name">${card.name}</div></div>`; }
  function buildTrapCard(card, mode) { return `<div class="trap-card" onclick="Game.onCardClick('${card.id}','${mode}')"><div class="card-type-tag">🪤</div><div class="card-icon">${card.icon||'🪤'}</div><div class="card-name">${card.name}</div></div>`; }

  function renderCardGrid(containerId, mode) {
    const container=document.getElementById(containerId);
    if(!container) return;
    if(currentPickTab==='general'||mode==='ban') {
      let gens=[...GameData.generals];
      if(currentFilter!=='all') gens=gens.filter(g=>g.dynasty===currentFilter||g.faction===currentFilter);
      if(currentSearch.trim()) { const q=currentSearch.trim(); gens=gens.filter(g=>g.name.includes(q)); }
      container.innerHTML=gens.map(g=>buildGeneralCard(g,mode)).join('');
    } else if(currentPickTab==='heal') {
      container.innerHTML=GameData.healCards.map(h=>buildHealCard(h,mode)).join('');
    } else if(currentPickTab==='trap') {
      container.innerHTML=GameData.trapCards.map(t=>buildTrapCard(t,mode)).join('');
    }
  }

  function filterDraft(f, mode) { currentFilter=f; renderCardGrid(mode==='ban'?'draft-general-grid':'pick-card-grid', mode); }
  function searchDraft(v, mode) { currentSearch=v; renderCardGrid(mode==='ban'?'draft-general-grid':'pick-card-grid', mode); }
  function switchPickTab(t) { currentPickTab=t; document.querySelectorAll('.pick-tab').forEach(el=>el.classList.toggle('active', el.id==='ptab-'+t)); renderCardGrid('pick-card-grid','pick'); }

  // ── NETWORK SYNC ──────────────────────────────────────────
  function applyOpponentBan(cardId) { performBan(cardId, false); }
  function applyOpponentPick(cardId) { performPick(cardId, false); }

  function onCardClick(cardId) {
    const s = GameState.getState();
    // Only allow clicking in draft stages
    if (!s.phase || !s.phase.startsWith('bp_')) return;

    const isPlayerTurn = (subPhase === 'ban') 
      ? (s.banPhase.banned.length % 2 === 0) 
      : (s.pickPhase.playerPicks.length === s.pickPhase.enemyPicks.length);
      
    if (!isPlayerTurn) { showToast('❌ 等待對手行動'); return; }

    if (subPhase === 'ban') {
      if (s.banPhase.banned.includes(cardId)) { showToast('⚠️ 已被禁用'); return; }
      performBan(cardId, true);
    } else {
      const taken = [...s.pickPhase.playerPicks, ...s.pickPhase.enemyPicks].map(p => p.id);
      if (taken.includes(cardId) || s.banPhase.banned.includes(cardId)) { showToast('⚠️ 已被選取/禁用'); return; }
      performPick(cardId, true);
    }
  }

  function performBan(genId, isLocalAction=false) {
    if (isLocalAction && isMultiplayerGame()) NetworkEngine.sendAction('ban', { cardId: genId });
    
    const s = GameState.getState();
    const side = (s.banPhase.banned.length % 2 === 0) ? 'player' : 'enemy';
    GameState.addBan(side, genId);
    
    // Each stage has 4 total bans (2 each), Stage 7 has 2 total bans (1 each)
    const stage = s.bpStage;
    const maxBansThisStage = (stage === 7) ? 2 : 4; 
    const totalBansSoFar = s.banPhase.banned.length;
    const bansBeforeThisStage = stage * 4;
    const bansInCurrentStage = totalBansSoFar - bansBeforeThisStage;
    
    if (bansInCurrentStage === maxBansThisStage) {
      subPhase = 'pick';
    }
    
    updateDraftUI();
    startDraftTimer();
  }

  function performPick(cardId, isLocalAction=false) {
    if (isLocalAction && isMultiplayerGame()) NetworkEngine.sendAction('pick', { cardId });

    const s = GameState.getState();
    const side = (s.pickPhase.playerPicks.length === s.pickPhase.enemyPicks.length) ? 'player' : 'enemy';
    GameState.addPick(side, cardId);
    
    if (s.pickPhase.playerPicks.length === (s.bpStage + 1) && s.pickPhase.enemyPicks.length === (s.bpStage + 1)) {
      if (GameState.isFinalBPStage()) {
        setTimeout(() => startDeployPhase(), 800);
        return;
      } else {
        GameState.setBPStage(s.bpStage + 1);
        subPhase = 'ban';
      }
    }
    
    updateDraftUI();
    startDraftTimer();
  }

  function startDraftTimer() {
    clearInterval(banTimerInterval);
    banTimerVal = 30;
    updateTimerDisplay('draft-timer', 'draft-timer-bar', banTimerVal, 30);
    
    const s = GameState.getState();
    const isPlayerTurn = (subPhase === 'ban') 
      ? (s.banPhase.banned.length % 2 === 0) 
      : (s.pickPhase.playerPicks.length === s.pickPhase.enemyPicks.length);
    
    const indicator = document.getElementById('draft-side-indicator');
    if (indicator) indicator.textContent = `輪到：${isPlayerTurn ? '我方' : '敵方'}`;

    if (!isMultiplayerGame() && !isPlayerTurn) {
      setTimeout(() => {
        if (subPhase === 'ban') {
          const playerIds = s.pickPhase.playerPicks.map(p => p.id || p);
          const id = AIEngine.chooseBanWithBond(s.banPhase.banned, playerIds, difficulty);
          if (id) performBan(id, false);
        } else {
          const id = AIEngine.choosePickWithBond(s.banPhase.banned, s.pickPhase.playerPicks, s.pickPhase.enemyPicks, difficulty, s.bpStage);
          if (id) performPick(id, false);
        }
      }, 1500);
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
  let opponentDeployed = false;
  let opponentField = null;

  function startDeployPhase() {
    clearInterval(pickTimerInterval);
    GameState.setPhase(GameState.PHASES.DEPLOY);
    showScreen('screen-deploy');
    
    opponentDeployed = false;
    opponentField = null;

    if (!isMultiplayerGame()) {
      const s=GameState.getState();
      const aiDeploy=AIEngine.deployField(s.pickPhase.enemyPicks, s.field.player, difficulty);
      if(aiDeploy.front) aiDeploy.front.forEach((c,i)=>{ if(c) s.field.enemy.front[i]=GameData.cloneCard(c.id); });
      if(aiDeploy.back)  aiDeploy.back.forEach((c,i)=>{ if(c) s.field.enemy.back[i]=GameData.cloneCard(c.id); });
      s.field.enemyReady=true;
      opponentDeployed = true;
    }

    renderDeployHand();
    renderDeployField();
    startDeployTimer();
  }

  function renderDeployHand() {
    const s=GameState.getState();
    const placed=GameState.getPlacedCardIds('player');
    document.getElementById('deploy-hand-cards').innerHTML = s.pickPhase.playerPicks.map(id=>{
      const c = GameData.getCardById(id);
      return `<div class="hand-card ${placed.includes(id)?'placed':''}" draggable="true" ondragstart="Game.onDragStart(event,'${id}')" onclick="Game.onHandCardClick('${id}')"><div class="hand-card-info">${c.name}</div></div>`;
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
        const def = GameData.getEquipment(inst.equipId);
        return `<div class="eq-slot" title="${def.name}" style="color:${GameData.RARITY[def.rarity].color}">${def.icon}</div>`;
      };
      return `
        <div class="deploy-card-wrap">
          <div class="deploy-card-name">${card.name}</div>
          <div class="deploy-eq-row">${slotIcon('weapon')}${slotIcon('armor')}${slotIcon('mount')}${card.isKing ? slotIcon('artifact') : ''}</div>
          <button class="btn-mini" onclick="event.stopPropagation(); Game.openEquipModal('player','${card.id}','${card.name}')">⚙ 裝備</button>
        </div>`;
    }
    [0,1,2].forEach(i => { const cell = document.getElementById(`deploy-front-${i}-content`); if (cell) cell.innerHTML = buildCellHTML(f.front[i]); });
    [0,1].forEach(i => { const cell = document.getElementById(`deploy-back-${i}-content`); if (cell) cell.innerHTML = buildCellHTML(f.back[i]); });
  }

  function onDragStart(e, cardId) { dragCardId=cardId; e.dataTransfer.setData('text/plain',cardId); }
  function dropCard(e, row, idx) {
    const cardId=dragCardId||e.dataTransfer.getData('text/plain'); if(!cardId) return;
    const r=GameState.placeCard('player',row,idx,cardId);
    if(r.ok) { dragCardId=null; renderDeployField(); renderDeployHand(); } else { showToast(r.reason); }
  }
  function onHandCardClick(cardId) {
    if(GameState.getPlacedCardIds('player').includes(cardId)) { GameState.removeCardFromField('player',cardId); renderDeployField(); renderDeployHand(); return; }
    const s=GameState.getState(); const c=GameData.getCardById(cardId);
    if(c.cardType==='general') { for(let i=0;i<3;i++) { if(!s.field.player.front[i]) { GameState.placeCard('player','front',i,cardId); break; } } }
    else { for(let i=0;i<2;i++) { if(!s.field.player.back[i]) { GameState.placeCard('player','back',i,cardId); break; } } }
    renderDeployField(); renderDeployHand();
  }

  function autoDeployPlayer() {
    GameState.getState().pickPhase.playerPicks.forEach(id=>{ onHandCardClick(id); });
  }

  function confirmDeploy() {
    const s=GameState.getState();
    if(s.field.player.front.filter(Boolean).length===0) { showToast('❌ 前排至少要有1名武將！'); return; }
    clearInterval(deployTimerInterval);
    s.field.playerReady=true;

    if (isMultiplayerGame()) {
      showToast('等待對手部署...');
      // Convert to simplified structure
      const sendField = {
        front: s.field.player.front.map(c=>c?c.id:null),
        back: s.field.player.back.map(c=>c?c.id:null)
      };
      NetworkEngine.sendAction('deploy', { field: sendField });
      checkBattleStart();
    } else {
      startBattle();
    }
  }

  function applyOpponentDeploy(netField) {
    opponentDeployed = true;
    opponentField = netField;
    const s=GameState.getState();
    
    // Convert to clones
    netField.front.forEach((id,i)=>{ if(id) s.field.enemy.front[i]=GameData.cloneCard(id); });
    netField.back.forEach((id,i)=>{ if(id) s.field.enemy.back[i]=GameData.cloneCard(id); });
    s.field.enemyReady=true;

    checkBattleStart();
  }

  function checkBattleStart() {
    if (GameState.getState().field.playerReady && opponentDeployed) {
      setTimeout(startBattle, 500);
    }
  }

  function startDeployTimer() {
    clearInterval(deployTimerInterval); deployTimerVal=60;
    deployTimerInterval=setInterval(()=>{
      deployTimerVal--; updateTimerDisplay('deploy-timer','deploy-timer-bar',deployTimerVal,60);
      if(deployTimerVal<=0) { autoDeployPlayer(); confirmDeploy(); }
    },1000);
  }

  // ── BATTLE PHASE ─────────────────────────────────────────────
  function startBattle() {
    GameState.setPhase(GameState.PHASES.BATTLE);
    GameState.initBattle();

    // 設定 PVE/PVP 模式（PVP 強制標準競技模板）
    BalanceEngine.setMode(isMultiplayerGame() ? BalanceEngine.MODE.PVP : BalanceEngine.MODE.PVE);

    // 為所有上場卡套用裝備加成
    const sb = GameState.getState();
    ['player', 'enemy'].forEach(side => {
      ['front', 'back'].forEach(row => {
        sb.field[side][row].forEach(c => { if (c) BalanceEngine.normalizedEquipBonus(c); });
      });
    });
    
    // Apply Campaign Enemy Buffs
    if (window.CampaignEngine && CampaignEngine.currentLevelId) {
      const lvl = CampaignEngine.getLevel(CampaignEngine.currentLevelId);
      if (lvl && lvl.enemyBuffs) {
        const s = GameState.getState();
        const buffGen = (c) => {
          if (c && c.cardType === 'general') {
            c.maxHp = Math.round(c.maxHp * (lvl.enemyBuffs.hp || 1));
            c.currentHp = c.maxHp;
            c.atk = Math.round(c.atk * (lvl.enemyBuffs.atk || 1));
          }
        };
        s.field.enemy.front.forEach(buffGen);
        s.field.enemy.back.forEach(buffGen);
      }
    }

    showScreen('screen-battle');
    playerCmds = { phase1: null, phase2: null };
    enemyCmds  = null;
    waitingForOpponent = false;
    selectedAttackerIdx=0; selectedTargetIdx=0;
    renderBattleField();
    startCmdTimer();
  }

  function renderBattleField() {
    const s=GameState.getState();
    [0,1,2].forEach(i=>renderBattleCell(document.getElementById(`player-front-cell-${i}`), s.field.player.front[i], i===selectedAttackerIdx, false));
    [0,1].forEach(i=>renderBattleBackCell(document.getElementById(`player-back-cell-${i}`), s.field.player.back[i], 'player'));
    [0,1,2].forEach(i=>renderBattleCell(document.getElementById(`enemy-front-cell-${i}`), s.field.enemy.front[i], false, i===selectedTargetIdx));
    [0,1].forEach(i=>renderBattleBackCell(document.getElementById(`enemy-back-cell-${i}`), s.field.enemy.back[i], 'enemy'));
    document.getElementById('battle-turn-num').textContent=s.battle.turn;
  }

  function renderBattleCell(cell, card, isAtk, isTgt) {
    if(!cell) return;
    cell.className='battle-cell front '+(isAtk?'selected-attacker':'')+(isTgt?'selected-target':'');
    if(!card || card.currentHp<=0) { cell.innerHTML=''; cell.classList.add('empty'); return; }
    cell.classList.remove('empty');
    cell.innerHTML=`<div class="battle-gen-card">
      <div style="font-size:10px">${card.element||'?'}</div>
      <div class="battle-gen-portrait-wrap">
        <img class="battle-gen-portrait" src="img/generals/${card.id}.webp" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
        <div class="battle-gen-kanji" style="display:none; color:${card.color||'#ccc'}">${card.name.charAt(0)}</div>
      </div>
      ${card.signatureItem ? `<div class="battle-signature">${card.signatureItem.split(' ')[0]}</div>` : ''}
      <div style="font-size:10px">${card.currentHp}/${card.maxHp}</div>
    </div>`;
  }

  function renderBattleBackCell(cell, card, side) {
    if(!cell) return;
    cell.className='battle-cell back';
    if(!card) { cell.innerHTML=''; return; }
    cell.innerHTML=`<div style="font-size:10px">${side==='enemy'&&!card.revealed?'伏牌':card.name}</div>`;
  }

  function selectAttacker(row, idx) { selectedAttackerIdx=idx; renderBattleField(); }
  function selectTarget(row, idx) { selectedTargetIdx=idx; renderBattleField(); }

  // 戰鬥中點擊後排卡牌（己方：發動陷阱/療牌；敵方：揭示伏牌）
  function clickBackCard(side, idx) {
    const s = GameState.getState();
    const card = s.field[side].back[idx];
    if (!card) return;
    if (side === 'enemy') {
      if (!card.revealed) { showToast('🪤 敵方伏牌，無法直接看穿'); return; }
      showToast(`敵方後排：${card.name}`);
      return;
    }
    // 己方：根據牌種類觸發
    if (card.cardType === 'trap') {
      // 揭示陷阱（如果條件成立）
      if (card.revealed) { showToast('陷阱已揭示'); return; }
      card.revealed = true;
      GameState.addLog({ text: `🪤 我方發動陷阱：${card.name}`, type: 'system' });
      sendToCemetery('player', card);
      s.field.player.back[idx] = null;
      renderBattleField();
      renderBattleLog();
    } else if (card.cardType === 'heal') {
      // 主動回血到 active general
      const target = GameState.getActiveGeneral('player');
      if (!target) { showToast('無可治療的目標'); return; }
      const healAmt = card.healAmount || 25;
      target.currentHp = Math.min(target.maxHp, target.currentHp + healAmt);
      GameState.addLog({ text: `💊 ${card.name}：${target.name} 回復 ${healAmt} HP`, type: 'heal' });
      sendToCemetery('player', card);
      s.field.player.back[idx] = null;
      renderBattleField();
      renderBattleLog();
    } else {
      showToast(card.name);
    }
  }

  function sendToCemetery(side, card) {
    const s = GameState.getState();
    if (!s.battle.cemetery) s.battle.cemetery = { player: [], enemy: [] };
    s.battle.cemetery[side].push({ id: card.id, name: card.name, cardType: card.cardType, turn: s.battle.turn });
    refreshCemeteryUI();
  }

  function showCemetery(side) {
    const s = GameState.getState();
    const list = (s.battle.cemetery && s.battle.cemetery[side]) || [];
    const grid = document.getElementById('cemetery-grid');
    document.getElementById('cemetery-title').textContent = (side === 'player' ? '我方' : '敵方') + '墓地';
    grid.innerHTML = list.length === 0
      ? `<div class="smithy-empty">空無一物</div>`
      : list.map(c => `<div class="cemetery-item ${c.cardType}"><div class="cem-name">${c.name}</div><div class="cem-meta">第 ${c.turn} 回合</div></div>`).join('');
    document.getElementById('modal-cemetery').style.display = 'flex';
  }
  function hideCemetery() { document.getElementById('modal-cemetery').style.display = 'none'; }
  function refreshCemeteryUI() {
    const s = GameState.getState();
    const cem = (s.battle && s.battle.cemetery) || { player: [], enemy: [] };
    const pBtn = document.getElementById('cem-count-player');
    const eBtn = document.getElementById('cem-count-enemy');
    if (pBtn) pBtn.textContent = cem.player.length;
    if (eBtn) eBtn.textContent = cem.enemy.length;
  }

  // Phase 1 / Phase 2 Command Selection
  function playerChooseCmd(phase, tacticTag) {
    if (waitingForOpponent) { showToast('正在等待對手行動'); return; }
    
    if (phase === 1) {
      playerCmds.phase1 = tacticTag;
      document.querySelectorAll('#cmd1-btns .cmd-btn').forEach(b => b.classList.remove('selected'));
      document.getElementById('cmd1-' + tacticTag).classList.add('selected');
    } else {
      playerCmds.phase2 = tacticTag;
      document.querySelectorAll('#cmd2-btns .cmd-btn').forEach(b => b.classList.remove('selected'));
      document.getElementById('cmd2-' + tacticTag).classList.add('selected');
    }

    if (playerCmds.phase1 && playerCmds.phase2) {
      waitingForOpponent = true;
      clearInterval(cmdTimerInterval);
      document.querySelectorAll('.cmd-btn').forEach(b => b.disabled = true);

      if (isMultiplayerGame()) {
        NetworkEngine.sendAction('cmd', { cmd: playerCmds });
        showToast('已鎖定陣法，等待對手...');
        checkResolveTurn();
      } else {
        const pAtk = GameState.getAllFrontAlive('player')[selectedAttackerIdx];
        const eAtk = GameState.getAllFrontAlive('enemy')[0]; // Simple AI target for now
        
        enemyCmds = AIEngine.chooseCmd(GameState.getState(), difficulty);
        setTimeout(resolveBattleTurn, 800);
      }
    }
  }

  function applyOpponentCommand(cmdObj) {
    enemyCmds = cmdObj;
    checkResolveTurn();
  }

  function checkResolveTurn() {
    if (waitingForOpponent && enemyCmds) {
      resolveBattleTurn();
    }
  }

  function setBattlePhase(name) {
    ['draw','standby','main','battle','end'].forEach(p => {
      const el = document.getElementById('phase-' + p);
      if (el) el.classList.toggle('active', p === name);
    });
  }

  function startCmdTimer() {
    clearInterval(cmdTimerInterval);
    cmdTimerVal=30;
    playerCmds = { phase1: null, phase2: null };
    enemyCmds = null;
    waitingForOpponent = false;
    setBattlePhase('main');

    document.querySelectorAll('.cmd-btn').forEach(b=>{
      b.disabled=false; b.style.borderColor='rgba(255,255,255,0.1)';
    });

    updateTimerDisplay('cmd-timer','cmd-timer-bar',cmdTimerVal,30);

    cmdTimerInterval=setInterval(()=>{
      cmdTimerVal--; updateTimerDisplay('cmd-timer','cmd-timer-bar',cmdTimerVal,30);
      if(cmdTimerVal<=0) {
        if (!playerCmds.phase1) playerChooseCmd(1, 'jianbi');
        if (!playerCmds.phase2) playerChooseCmd(2, 'dilie');
      }
    },1000);
  }

  function resolveBattleTurn() {
    const s=GameState.getState();
    const pAtk = s.field.player.front[selectedAttackerIdx] || GameState.getActiveGeneral('player');
    const pTgt = s.field.enemy.front[selectedTargetIdx] || GameState.getActiveGeneral('enemy');
    const eAtk = GameState.getActiveGeneral('enemy');

    setBattlePhase('battle');

    // 戰鬥前：擊敗事件記入墓地
    const beforeAlive = collectAliveSnapshot();

    CombatEngine.resolveTurn(s, playerCmds, enemyCmds, pAtk, pTgt, eAtk, pAtk);

    pushDeadToCemetery(beforeAlive);

    renderBattleField();
    renderBattleLog();
    refreshCemeteryUI();

    const win = GameState.checkWinCondition();
    if(win) { showResults(win); return; }

    setBattlePhase('end');
    setTimeout(() => { setBattlePhase('draw'); setTimeout(() => { setBattlePhase('standby'); setTimeout(startCmdTimer, 600); }, 600); }, 800);
  }

  function collectAliveSnapshot() {
    const s = GameState.getState();
    const out = { player: [], enemy: [] };
    ['player','enemy'].forEach(side => {
      ['front','back'].forEach(row => {
        s.field[side][row].forEach(c => {
          if (c && c.currentHp > 0) out[side].push({ id: c.id, name: c.name, cardType: c.cardType });
        });
      });
    });
    return out;
  }

  function pushDeadToCemetery(before) {
    const s = GameState.getState();
    if (!s.battle.cemetery) s.battle.cemetery = { player: [], enemy: [] };
    ['player','enemy'].forEach(side => {
      const aliveAfter = new Set();
      ['front','back'].forEach(row => s.field[side][row].forEach(c => { if (c && c.currentHp > 0) aliveAfter.add(c.id); }));
      before[side].forEach(prev => {
        if (!aliveAfter.has(prev.id)) {
          s.battle.cemetery[side].push({ id: prev.id, name: prev.name, cardType: prev.cardType, turn: s.battle.turn });
        }
      });
    });
  }

  function renderBattleLog() {
    document.getElementById('battle-log').innerHTML = GameState.getState().battle.log.slice(0,25).map(l=>
      `<div class="log-line ${l.type||'normal'}">${l.text}</div>`
    ).join('');
  }

  function showResults(winObj) {
    clearAllTimers();
    showScreen('screen-results');
    document.getElementById('results-title').textContent = winObj.winner === 'player' ? '勝利' : '敗北';
    document.getElementById('results-reason').textContent = winObj.reason;

    // 戰後素材結算（僅 PVE / 單機）
    if (!isMultiplayerGame()) {
      const playerWon = winObj.winner === 'player';
      const s = GameState.getState();
      const totalHp = s.field.player.front.concat(s.field.player.back).filter(Boolean).reduce((a,c)=>a+(c.maxHp||0),0) || 1;
      const lostHp = s.field.player.front.concat(s.field.player.back).filter(Boolean).reduce((a,c)=>a+((c.maxHp||0)-(c.currentHp||0)),0);
      const ratio = Math.min(1, lostHp / totalHp);
      const rewards = SmithyEngine.settleBattle(playerWon, ratio);
      const statBox = document.getElementById('results-stats');
      if (statBox) {
        statBox.innerHTML = `
          <div class="reward-row">
            <div class="reward-pill">${GameData.MATERIALS.yintie.icon} 隕鐵 +${rewards.yintie}</div>
            <div class="reward-pill">${GameData.MATERIALS.pige.icon} 皮革 +${rewards.pige}</div>
            <div class="reward-pill">${GameData.MATERIALS.matiehe.icon} 馬鈴銀 +${rewards.matiehe}</div>
            <div class="reward-pill">${GameData.MATERIALS.qianghua.icon} 強化石 +${rewards.qianghua}</div>
            <div class="reward-pill jade">玉帛 +${playerWon ? 200 : 40}</div>
          </div>`;
      }
    }

    if (window.CampaignEngine && CampaignEngine.currentLevelId && winObj.winner === 'player') {
      CampaignEngine.saveProgress(CampaignEngine.currentLevelId);
      showToast('🎉 千古幻陣 挑戰成功！解鎖新關卡！', 5000);
      CampaignEngine.currentLevelId = null;
    }
  }

  // ══ GACHA v2 ════════════════════════════════════════════════
  let currentGachaPool = 'weapon';

  function showGacha() {
    showScreen('screen-gacha');
    switchGachaPool(currentGachaPool);
  }

  function switchGachaPool(pool) {
    currentGachaPool = pool;
    document.getElementById('gtab-weapon').classList.toggle('active', pool === 'weapon');
    document.getElementById('gtab-armor').classList.toggle('active', pool === 'armor');
    const featured = GachaEngine.getFeatured()[pool];
    const fdef = GameData.getEquipment(featured);
    const titleEl = document.getElementById('gacha-banner-title');
    const featEl = document.getElementById('gacha-banner-featured');
    if (titleEl) titleEl.textContent = pool === 'weapon' ? '神兵降世·限時池' : '玄甲護國·限時池';
    if (featEl && fdef) featEl.textContent = `【機率提升】${'★'.repeat(GameData.RARITY[fdef.rarity].stars)} ${fdef.icon} ${fdef.name}`;
    updateGachaUI();
  }

  function updateGachaUI() {
    document.getElementById('gacha-jade-count').textContent = Inventory.getJade();
    const pity = Inventory.getPity(currentGachaPool);
    document.getElementById('pity-sr').textContent     = `SR 保底：${pity.srCount}/${GachaEngine.PITY_SR_AT}`;
    document.getElementById('pity-legend').textContent = `傳說保底：${pity.legendCount}/${GachaEngine.PITY_LEGEND_AT}`;
  }

  function performSummon(count) {
    const fn = count === 10 ? GachaEngine.pullTen : GachaEngine.pullSingle;
    const result = fn(currentGachaPool);
    if (!result.ok) { showToast(result.msg); return; }

    const list = document.getElementById('summon-results');
    list.innerHTML = '';
    result.results.forEach((item, idx) => {
      setTimeout(() => list.appendChild(renderSummonItem(item)), idx * 100);
    });
    document.getElementById('modal-summon').style.display = 'flex';
    updateGachaUI();
  }

  function renderSummonItem(item) {
    const def = item.def;
    const rarity = GameData.RARITY[def.rarity];
    const stars = '★'.repeat(rarity.stars);
    const div = document.createElement('div');
    div.className = 'gacha-result-item ' + def.rarity.toLowerCase();
    div.innerHTML = `
      <div class="item-card ${def.rarity.toLowerCase()}" style="border-color:${rarity.color}">
        <div class="item-rarity-stars" style="color:${rarity.color}">${stars}</div>
        <div class="item-icon">${def.icon}</div>
        <div class="item-name">${def.name}</div>
        ${item.viaPity ? `<div class="item-pity">${item.viaPity === 'legend' ? '傳說保底' : 'SR 保底'}</div>` : ''}
        ${item.asFragment ? `<div class="item-frag">↳ 已轉為碎片</div>` : ''}
      </div>
    `;
    return div;
  }

  function hideSummonResults() {
    document.getElementById('modal-summon').style.display = 'none';
  }

  // ══ ARMORY ═══════════════════════════════════════════════════
  let armoryFilter = 'weapon';

  function showArmory() {
    armoryFilter = 'weapon';
    document.querySelectorAll('.armory-tab').forEach(b => b.classList.toggle('active', b.dataset.armoryTab === armoryFilter));
    showScreen('screen-armory');
    renderArmoryGrid();
  }

  function filterArmory(tab) {
    armoryFilter = tab;
    document.querySelectorAll('.armory-tab').forEach(b => b.classList.toggle('active', b.dataset.armoryTab === tab));
    renderArmoryGrid();
  }

  function renderArmoryGrid() {
    const grid = document.getElementById('armory-grid');
    const empty = document.getElementById('armory-empty');
    let html = '';

    if (armoryFilter === 'fragment') {
      const frags = Inventory._data().fragments;
      const ids = Object.keys(frags).filter(k => frags[k] > 0);
      if (!ids.length) { grid.innerHTML = ''; empty.style.display = 'block'; return; }
      html = ids.map(id => {
        const def = GameData.getEquipment(id); if (!def) return '';
        const r = GameData.RARITY[def.rarity];
        const count = frags[id];
        const ready = count >= SmithyEngine.FRAGMENT_REQ;
        return `
          <div class="armory-item fragment" style="border-color:${r.color}">
            <div class="armory-item-icon">${def.icon}</div>
            <div class="armory-item-name" style="color:${r.color}">${def.name}</div>
            <div class="armory-item-frag-count">碎片：${count} / ${SmithyEngine.FRAGMENT_REQ}</div>
            <button class="btn-tiny ${ready ? '' : 'disabled'}" ${ready ? '' : 'disabled'} onclick="Game.mergeFragment('${id}')">合成</button>
          </div>`;
      }).join('');
    } else {
      const insts = Inventory.getEquipmentInstances().filter(i => {
        const d = GameData.getEquipment(i.equipId); if (!d) return false;
        return GameData.getEquipmentSlotType(d) === armoryFilter;
      });
      if (!insts.length) { grid.innerHTML = ''; empty.style.display = 'block'; return; }
      html = insts.map(inst => {
        const def = GameData.getEquipment(inst.equipId);
        const r = GameData.RARITY[def.rarity];
        return `
          <div class="armory-item" style="border-color:${r.color}">
            <div class="armory-item-icon">${def.icon}</div>
            <div class="armory-item-name" style="color:${r.color}">${def.name}</div>
            <div class="armory-item-stats">${(def.atk?`ATK +${def.atk}`:'') + (def.def?`DEF +${def.def}`:'') + (def.spd?`SPD +${def.spd}`:'')}</div>
            <div class="armory-item-meta">Lv.${inst.level} ／ 耐久 ${inst.durability}/${def.durability}</div>
            <div class="armory-item-desc">${def.desc || ''}</div>
            <div class="armory-item-actions">
              <button class="btn-tiny" onclick="Game.dismantleEquipment('${inst.instanceId}')">分解</button>
            </div>
          </div>`;
      }).join('');
    }
    grid.innerHTML = html;
    empty.style.display = 'none';
  }

  function dismantleEquipment(instanceId) {
    if (!confirm('確認分解此裝備？將獲得強化石。')) return;
    const r = Inventory.dismantleEquipment(instanceId);
    if (r) showToast(`✅ 分解成功：+${r.stones} 強化石`);
    renderArmoryGrid();
  }

  function mergeFragment(equipId) {
    const r = SmithyEngine.mergeFragment(equipId);
    if (!r.ok) { showToast(r.reason); return; }
    showToast(`🎉 碎片合成成功！`);
    renderArmoryGrid();
  }

  // ══ SMITHY ═══════════════════════════════════════════════════
  let smithyTab = 'upgrade';

  function showSmithy() {
    smithyTab = 'upgrade';
    document.querySelectorAll('.smithy-tab').forEach(b => b.classList.toggle('active', b.dataset.smithyTab === smithyTab));
    showScreen('screen-smithy');
    renderSmithyMaterials();
    renderSmithyContent();
  }

  function switchSmithyTab(tab) {
    smithyTab = tab;
    document.querySelectorAll('.smithy-tab').forEach(b => b.classList.toggle('active', b.dataset.smithyTab === tab));
    renderSmithyContent();
  }

  function renderSmithyMaterials() {
    const m = Inventory.getAllMaterials();
    document.getElementById('smithy-materials').innerHTML = `
      <div class="mat-pill">${GameData.MATERIALS.yintie.icon} 隕鐵 ${m.yintie}</div>
      <div class="mat-pill">${GameData.MATERIALS.pige.icon} 皮革 ${m.pige}</div>
      <div class="mat-pill">${GameData.MATERIALS.matiehe.icon} 馬鈴銀 ${m.matiehe}</div>
      <div class="mat-pill">${GameData.MATERIALS.qianghua.icon} 強化石 ${m.qianghua}</div>
      <div class="mat-pill jade">玉帛 ${Inventory.getJade()}</div>
    `;
  }

  function renderSmithyContent() {
    const wrap = document.getElementById('smithy-content');
    if (smithyTab === 'upgrade') {
      const insts = Inventory.getEquipmentInstances();
      if (!insts.length) { wrap.innerHTML = `<div class="smithy-empty">尚無裝備可升級</div>`; return; }
      wrap.innerHTML = insts.map(inst => {
        const def = GameData.getEquipment(inst.equipId); if (!def) return '';
        const r = GameData.RARITY[def.rarity];
        const cost = SmithyEngine.upgradeCost(inst);
        const can = SmithyEngine.canUpgrade(inst);
        const matName = GameData.MATERIALS[cost.mat]?.name || '';
        return `
          <div class="smithy-row" style="border-color:${r.color}">
            <div class="smithy-row-icon">${def.icon}</div>
            <div class="smithy-row-info">
              <div class="smithy-row-name" style="color:${r.color}">${def.name} <span class="smithy-row-lv">Lv.${inst.level}</span></div>
              <div class="smithy-row-cost">需 ${matName} ${cost.matAmount} ／ 強化石 ${cost.stones} ／ 玉帛 ${cost.jade}</div>
            </div>
            <button class="btn-tiny ${can.ok?'':'disabled'}" ${can.ok?'':'disabled'} onclick="Game.upgradeEquipment('${inst.instanceId}')">升級</button>
          </div>`;
      }).join('');
    } else {
      const frags = Inventory._data().fragments;
      const ids = Object.keys(frags).filter(k => frags[k] > 0);
      if (!ids.length) { wrap.innerHTML = `<div class="smithy-empty">尚無碎片可合成</div>`; return; }
      wrap.innerHTML = ids.map(id => {
        const def = GameData.getEquipment(id); if (!def) return '';
        const r = GameData.RARITY[def.rarity];
        const count = frags[id];
        const ready = count >= SmithyEngine.FRAGMENT_REQ;
        return `
          <div class="smithy-row" style="border-color:${r.color}">
            <div class="smithy-row-icon">${def.icon}</div>
            <div class="smithy-row-info">
              <div class="smithy-row-name" style="color:${r.color}">${def.name}</div>
              <div class="smithy-row-cost">碎片：${count} / ${SmithyEngine.FRAGMENT_REQ}</div>
            </div>
            <button class="btn-tiny ${ready?'':'disabled'}" ${ready?'':'disabled'} onclick="Game.mergeFragment('${id}')">合成</button>
          </div>`;
      }).join('');
    }
  }

  function upgradeEquipment(instanceId) {
    const r = SmithyEngine.upgrade(instanceId);
    if (!r.ok) { showToast(r.reason); return; }
    showToast(`🔨 升級成功！等級 ${r.level}`);
    renderSmithyMaterials();
    renderSmithyContent();
  }

  // ══ EQUIP MODAL（部署階段點擊武將時開啟）═══════════════════
  let equipModalTargetCardId = null;
  let equipModalTargetSide = null;

  function openEquipModal(side, cardId, cardName) {
    equipModalTargetCardId = cardId;
    equipModalTargetSide = side;
    document.getElementById('equip-modal-target').textContent = `為「${cardName}」掛載裝備`;
    const grid = document.getElementById('equip-modal-grid');
    const insts = Inventory.getEquipmentInstances();
    if (!insts.length) {
      grid.innerHTML = `<div class="smithy-empty">尚無裝備，請先去抽卡或鐵匠鋪</div>`;
    } else {
      grid.innerHTML = insts.map(inst => {
        const def = GameData.getEquipment(inst.equipId); if (!def) return '';
        const r = GameData.RARITY[def.rarity];
        return `
          <div class="equip-pickable" style="border-color:${r.color}" onclick="Game.equipToCard('${inst.instanceId}')">
            <div class="armory-item-icon">${def.icon}</div>
            <div class="armory-item-name" style="color:${r.color}">${def.name}</div>
            <div class="armory-item-meta">Lv.${inst.level}</div>
          </div>`;
      }).join('');
    }
    document.getElementById('modal-equip').style.display = 'flex';
  }

  function equipToCard(instanceId) {
    if (!equipModalTargetCardId) return;
    const s = GameState.getState();
    let card = null;
    for (const row of ['front','back']) {
      for (const c of s.field[equipModalTargetSide][row]) {
        if (c && c.id === equipModalTargetCardId) { card = c; break; }
      }
      if (card) break;
    }
    if (!card) { showToast('找不到目標武將'); return; }
    const r = EquipmentEngine.equip(card, instanceId);
    if (!r.ok) { showToast(r.reason); return; }
    EquipmentEngine.applyEquipBonus(card);
    showToast(`✅ 掛載成功`);
    document.getElementById('modal-equip').style.display = 'none';
    renderDeployField();
  }

  document.addEventListener('DOMContentLoaded', initParticles);

  return {
    setDifficulty, startGame, startMultiplayer, returnLobby, isMultiplayerGame,
    startCampaign, selectCampaignLevel, startCampaignLevel,
    filterDraft, searchDraft, switchPickTab, onCardClick,
    dropCard, onDragStart, onHandCardClick, autoDeployPlayer, confirmDeploy,
    selectAttacker, selectTarget, playerChooseCmd, clickBackCard,
    // Cemetery / 墓地
    showCemetery, hideCemetery,
    // Gacha
    showGacha, switchGachaPool, performSummon, hideSummonResults,
    // Armory
    showArmory, filterArmory, dismantleEquipment, mergeFragment,
    // Smithy
    showSmithy, switchSmithyTab, upgradeEquipment,
    // Equipment modal
    openEquipModal, equipToCard,
    // Network Hooked actions
    onMultiplayerMatchStarted, onMatchmakingTimeout,
    applyOpponentBan, applyOpponentPick, applyOpponentDeploy, applyOpponentCommand
  };
})();
