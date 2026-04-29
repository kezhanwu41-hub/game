/**
 * gameState.js v3 — 前後排 + 雙陣法狀態管理
 */
window.GameState = (function() {
  'use strict';

  const PHASES = {
    LOBBY: 'lobby', 
    BP_STAGE_0: 'bp_lord',      // 主公
    BP_STAGE_1: 'bp_advisor',   // 軍師
    BP_STAGE_2: 'bp_minister',  // 臣相
    BP_STAGE_3: 'bp_marshal',   // 大司馬
    BP_STAGE_4: 'bp_agri',      // 大司農
    BP_STAGE_5: 'bp_chief',     // 大將軍
    BP_STAGE_6: 'bp_marching',  // 行軍總管
    BP_STAGE_7: 'bp_vanguard',  // 破陣先鋒
    DEPLOY: 'deploy', BATTLE: 'battle', RESULTS: 'results'
  };

  const ROLES = [
    '主公', '軍師', '臣相', '大司馬', '大司農', '大將軍', '行軍總管', '破陣先鋒'
  ];

  let state = null;

  function createInitialState(difficulty) {
    return {
      phase: PHASES.LOBBY,
      difficulty: difficulty || 'medium',
      bpStage: 0, // 0 to 7
      
      banPhase: { banned: [] },
      
      pickPhase: {
        playerPicks: [], // Array of { id, role, penalty }
        enemyPicks: [],
        pickIndex: 0
      },

      field: {
        playerReady: false, enemyReady: false,
        player: { front: [null, null, null], back: [null, null] },
        enemy:  { front: [null, null, null], back: [null, null] }
      },

      battle: {
        turn: 1,
        playerMorale: 50, enemyMorale: 50,
        playerCmdStreak: { count: 0, cmd: null },   // For trap combos
        enemyCmdStreak: { count: 0, cmd: null },
        log: []
      }
    };
  }

  function init(difficulty) { state = createInitialState(difficulty); return state; }
  function getState() { return state; }
  function getPhase() { return state ? state.phase : null; }
  function setPhase(p) { if (state) state.phase = p; }

  function addBan(side, id) {
    if (!state || state.banPhase.banned.includes(id)) return false;
    state.banPhase.banned.push(id);
    return true;
  }

  function addPick(side, id) {
    if (!state) return false;
    const card = GameData.getCardById(id);
    if (!card) return false;

    const role = ROLES[state.bpStage];
    const hasRole = card.roles && card.roles.includes(role);
    const penalty = hasRole ? 0 : -30;

    const pickData = { id, role, penalty, name: card.name };

    if (side === 'player') state.pickPhase.playerPicks.push(pickData);
    else state.pickPhase.enemyPicks.push(pickData);
    
    state.pickPhase.pickIndex++;
    return true;
  }

  function getBPStage() { return state ? state.bpStage : 0; }
  function setBPStage(idx) { if (state) state.bpStage = idx; }
  function getCurrentRole() { return ROLES[state ? state.bpStage : 0]; }
  function isFinalBPStage() { return state && state.bpStage === 7; }

  function placeCard(side, row, col, cardId) {
    const s = state.field[side];
    const card = GameData.cloneCard(cardId);
    if (!card) return { ok: false, reason: '無效卡牌' };
    
    // Check constraints
    if (row === 'front' && card.cardType !== 'general') return { ok: false, reason: '只有武將能進入前排' };
    
    // Check uniqueness (cards can only be placed once)
    const allPlaced = [...s.front, ...s.back].filter(Boolean).map(c => c.id);
    if (allPlaced.includes(cardId)) return { ok: false, reason: '已在場上' };

    s[row][col] = card;
    return { ok: true };
  }

  function removeCardFromField(side, cardId) {
    const s = state.field[side];
    for (let i = 0; i < 3; i++) { if (s.front[i] && s.front[i].id === cardId) s.front[i] = null; }
    for (let i = 0; i < 2; i++) { if (s.back[i] && s.back[i].id === cardId) s.back[i] = null; }
  }

  function getPlacedCardIds(side) {
    const s = state.field[side];
    return [...s.front, ...s.back].filter(Boolean).map(c => c.id);
  }

  function initBattle() {
    // any starting buffs
    state.battle.turn = 1;
    state.battle.log = [];
  }

  function addLog(entry) {
    state.battle.log.unshift({ ...entry, turn: state.battle.turn });
    if (state.battle.log.length > 50) state.battle.log.pop();
  }

  function getActiveGeneral(side) {
    const front = state.field[side].front;
    return front[0] || front[1] || front[2] || null;
  }

  function getAllFrontAlive(side) {
    return state.field[side].front.filter(c => c && c.currentHp > 0);
  }

  function getBackCards(side) {
    return state.field[side].back.filter(Boolean);
  }

  function cleanupField() {
    ['player', 'enemy'].forEach(side => {
      const f = state.field[side];
      f.front = f.front.map(c => (c && c.currentHp > 0) ? c : null);
      f.back = f.back.map(c => (c && c.cardType === 'general' && c.currentHp <= 0) ? null : c);
    });
  }

  function moveBackToFront(side) {
    const f = state.field[side];
    // For every empty front slot, if there's a general in back row, move it up
    for (let i = 0; i < 3; i++) {
      if (!f.front[i]) {
        for (let j = 0; j < 2; j++) {
          const backC = f.back[j];
          if (backC && backC.cardType === 'general') {
            f.front[i] = backC;
            f.back[j] = null;
            addLog({ text: `🔄 ${backC.name} 從後排補上陣線！`, type: 'system' });
            break;
          }
        }
      }
    }
  }

  function updateCmdStreak(side, cmd) {
    const s = side === 'player' ? state.battle.playerCmdStreak : state.battle.enemyCmdStreak;
    if (s.cmd === cmd) s.count++;
    else { s.cmd = cmd; s.count = 1; }
  }

  function checkWinCondition() {
    const b = state.battle;
    if (b.playerMorale <= 0) return { winner: 'enemy', reason: '玩家士氣崩潰！' };
    if (b.enemyMorale <= 0) return { winner: 'player', reason: '敵方士氣崩潰！' };

    const pAlive = GameState.getAllFrontAlive('player').length + GameState.getBackCards('player').filter(c=>c.cardType==='general').length;
    const eAlive = GameState.getAllFrontAlive('enemy').length + GameState.getBackCards('enemy').filter(c=>c.cardType==='general').length;
    
    if (pAlive === 0 && eAlive === 0) return { winner: 'draw', reason: '雙方武將全數陣亡，平局！' };
    if (pAlive === 0) return { winner: 'enemy', reason: '我方武將全數陣亡！' };
    if (eAlive === 0) return { winner: 'player', reason: '敵方武將全數陣亡，大獲全勝！' };
    return null;
  }

  return {
    PHASES, init, getState, getPhase, setPhase,
    addBan, addPick, placeCard, removeCardFromField, getPlacedCardIds,
    initBattle, addLog, getActiveGeneral, getAllFrontAlive, getBackCards,
    cleanupField, moveBackToFront, checkWinCondition, updateCmdStreak
  };
})();
