/**
 * ai.js v2 — 前後排場地 + 五行AI
 */
window.AIEngine = (function() {
  'use strict';

  // ── 禁選策略 ──────────────────────────────────────────────────
  function chooseBan(banned, playerPicks, difficulty) {
    const available = GameData.generals.filter(g =>
      !banned.includes(g.id) && !playerPicks.includes(g.id)
    );
    const topPower = [...available].sort((a, b) =>
      (b.atk + b.def + b.spd) - (a.atk + a.def + a.spd)
    );
    if (difficulty === 'easy') return topPower[Math.floor(Math.random() * 4)]?.id || null;
    if (difficulty === 'medium') return topPower[Math.floor(Math.random() * 2)]?.id || null;
    // Hard: ban strongest general that counters player's picks elementally
    const playerElems = playerPicks.map(id => {
      const g = GameData.getGeneral(id);
      return g ? g.element : null;
    }).filter(Boolean);

    if (playerElems.length > 0) {
      // Find generals whose element is克 by our potential generals
      const dangerous = topPower.find(g =>
        playerElems.some(pe => GameData.KE[g.element] === pe)
      );
      if (dangerous) return dangerous.id;
    }
    return topPower[0]?.id || null;
  }

  // ── 選牌策略（將+療+陷阱）──────────────────────────────────────
  function choosePick(banned, playerPicks, enemyPicks, difficulty, pickIndex) {
    const taken = [...banned, ...playerPicks, ...enemyPicks];

    const availableGenerals = GameData.generals.filter(g => !taken.includes(g.id));
    const availableHeals    = GameData.healCards.filter(h => !enemyPicks.includes(h.id) && !playerPicks.includes(h.id));
    const availableTraps    = GameData.trapCards.filter(t => !enemyPicks.includes(t.id) && !playerPicks.includes(t.id));

    const totalPicked = enemyPicks.length;

    // Strategy: 3 generals + 1 heal + 1 trap
    const genCount  = enemyPicks.filter(id => GameData.getGeneral(id)).length;
    const healCount = enemyPicks.filter(id => GameData.healCards.find(h => h.id === id)).length;
    const trapCount = enemyPicks.filter(id => GameData.trapCards.find(t => t.id === id)).length;

    // Determine what to pick
    let pickFrom = 'general';
    if (totalPicked === 3 && healCount === 0 && availableHeals.length > 0) pickFrom = 'heal';
    else if (totalPicked === 4 && trapCount === 0 && availableTraps.length > 0) pickFrom = 'trap';
    else if (totalPicked >= 3 && genCount >= 3) {
      if (healCount === 0) pickFrom = 'heal';
      else if (trapCount === 0) pickFrom = 'trap';
    }

    if (difficulty === 'easy') {
      // Random
      if (pickFrom === 'general') return availableGenerals[Math.floor(Math.random() * Math.min(5, availableGenerals.length))]?.id || null;
      if (pickFrom === 'heal') return availableHeals[Math.floor(Math.random() * availableHeals.length)]?.id || null;
      if (pickFrom === 'trap') return availableTraps[Math.floor(Math.random() * availableTraps.length)]?.id || null;
    }

    if (pickFrom === 'general') {
      // Try to pick element that counters player's picks
      const playerElems = playerPicks.map(id => {
        const g = GameData.getGeneral(id);
        return g ? g.element : null;
      }).filter(Boolean);

      // Score each available general
      const scored = availableGenerals.map(g => {
        let score = g.atk + g.def + g.spd;
        if (difficulty === 'hard') {
          // Bonus for element that克 player
          if (playerElems.some(pe => GameData.KE[g.element] === pe)) score += 50;
          // Penalty if player's element克 us
          if (playerElems.some(pe => GameData.KE[pe] === g.element)) score -= 30;
        }
        return { g, score };
      }).sort((a, b) => b.score - a.score);

      return scored[0]?.g.id || null;
    }

    if (pickFrom === 'heal') {
      // Prefer passive regen heal for hard
      if (difficulty === 'hard') {
        return availableHeals.find(h => h.effect.type === 'passive_regen')?.id || availableHeals[0]?.id || null;
      }
      return availableHeals[0]?.id || null;
    }

    if (pickFrom === 'trap') {
      if (difficulty === 'hard') {
        // 離間計 is great vs common moves
        return availableTraps.find(t => t.id === 'trap_luanjian')?.id || availableTraps[0]?.id || null;
      }
      return availableTraps[0]?.id || null;
    }
    return null;
  }

  // ── 場地部署策略 ──────────────────────────────────────────────
  function deployField(enemyPicks, playerField, difficulty) {
    // enemyPicks may be array of ids OR pick-objects {id,...}
    const getCardSafe = (p) => {
      const id = (p && typeof p === 'object') ? p.id : p;
      return id ? (GameData.getGeneral(id) || GameData.getCardById(id)) : null;
    };
    const generals = enemyPicks
      .map(getCardSafe)
      .filter(c => c && c.cardType === 'general')
      .sort((a, b) => (b.atk + b.def) - (a.atk + a.def));

    const others = enemyPicks
      .map(getCardSafe)
      .filter(c => c && c.cardType !== 'general');

    // Front: top 3 generals
    const front = [generals[0] || null, generals[1] || null, generals[2] || null];
    // Back: remaining general (reserve) + heal/trap
    const backItems = [];
    if (generals[3]) backItems.push(generals[3]);
    others.forEach(o => backItems.push(o));
    const back = [backItems[0] || null, backItems[1] || null];

    if (difficulty === 'hard' && playerField) {
      // Try to place element-advantaged generals against player front
      const pFront = playerField.front.filter(Boolean);
      const sortedByCountering = [...generals].sort((a, b) => {
        const aCounters = pFront.filter(p => GameData.KE[a.element] === p.element).length;
        const bCounters = pFront.filter(p => GameData.KE[b.element] === p.element).length;
        return bCounters - aCounters;
      });
      return {
        front: [sortedByCountering[0] || null, sortedByCountering[1] || null, sortedByCountering[2] || null],
        back
      };
    }

    return { front, back };
  }

  // ── 戰鬥指令決策 ─────────────────────────────────────────────
  function chooseCmd(attacker, target, state, difficulty) {
    if (!attacker || !target) return 'hold';

    const hpRatio = attacker.currentHp / attacker.maxHp;
    const tgtHpRatio = target.currentHp / target.maxHp;

    // Get element advantage
    if (!attacker.element || !target.element) {
      return hpRatio < 0.3 ? 'hold' : 'heavy';
    }
    const inter = GameData.getElementInteraction(attacker.element, target.element);

    if (difficulty === 'easy') {
      return ['heavy', 'defend', 'feint', 'hold', 'rear'][Math.floor(Math.random() * 5)];
    }

    if (difficulty === 'medium') {
      if (hpRatio < 0.25) return 'hold';
      if (inter.type === 'ke') return 'heavy';   // Element advantage → attack
      if (inter.type === 'sheng') return 'defend'; // Feeding enemy → be cautious
      return Math.random() > 0.4 ? 'heavy' : 'feint';
    }

    // Hard AI
    if (hpRatio < 0.20) return 'hold';

    // Five element strategy
    if (inter.type === 'ke') {
      // We克 them → aggressive
      if (tgtHpRatio < 0.4) {
        // Try execute if available
        if (attacker.specialCmd && attacker.specialCmd.type === 'execute' && attacker.specialCmd.usesLeft > 0) {
          return 'special';
        }
      }
      return Math.random() > 0.3 ? 'heavy' : 'feint';
    }

    if (inter.type === 'sheng') {
      // We生 them → use rear attack or feint to minimize damage penalty
      return Math.random() > 0.5 ? 'rear' : 'defend';
    }

    if (inter.type === 'same') {
      // Same element → aggressive, crit bonus
      return Math.random() > 0.4 ? 'heavy' : 'feint';
    }

    // Neutral
    if (hpRatio > 0.7) return Math.random() > 0.5 ? 'heavy' : 'feint';
    if (hpRatio > 0.4) return Math.random() > 0.6 ? 'feint' : 'defend';
    return Math.random() > 0.5 ? 'hold' : 'defend';
  }

  // ── AI選攻擊目標 ─────────────────────────────────────────────
  function chooseTarget(aiGenerals, playerField, difficulty) {
    const playerFront = playerField.front.filter(c => c && c.cardType === 'general' && c.currentHp > 0);
    if (playerFront.length === 0) return null;

    if (difficulty === 'easy') return playerFront[Math.floor(Math.random() * playerFront.length)];

    // Score targets: prefer weak HP + element disadvantage
    const ai = aiGenerals[0]; // Use first AI attacker's element
    if (!ai) return playerFront[0];

    const scored = playerFront.map(p => {
      const hpFrac = p.currentHp / p.maxHp;
      let score = 1 - hpFrac;  // prefer low HP
      if (ai.element && p.element) {
        const inter = GameData.getElementInteraction(ai.element, p.element);
        if (inter.type === 'ke') score += 0.5;      // target we克
        if (inter.type === 'sheng') score -= 0.3;   // avoid target we生 (penalty)
      }
      return { p, score };
    }).sort((a, b) => b.score - a.score);

    return scored[0]?.p || playerFront[0];
  }

  // ── 主動療牌決策 ─────────────────────────────────────────────
  function shouldUseHealCard(state, difficulty) {
    const back = state.field.enemy.back;
    const healCards = back.filter(c => c && c.cardType === 'heal' && (c.usesLeft || 0) > 0 && !c.used);
    if (healCards.length === 0) return null;
    const front = GameState.getAllFrontAlive('enemy');
    if (front.length === 0) return null;
    const weakest = front.reduce((a, b) => a.currentHp / a.maxHp < b.currentHp / b.maxHp ? a : b);
    const weakRatio = weakest.currentHp / weakest.maxHp;
    if (difficulty === 'hard' && weakRatio < 0.35) return { target: weakest, healCard: healCards[0] };
    if (difficulty === 'medium' && weakRatio < 0.25) return { target: weakest, healCard: healCards[0] };
    return null;
  }

  // ── 戰術記憶（避免重複上回合）──────────────────────────────────
  let _lastPhase1 = null;
  let _lastPhase2 = null;

  // ── 雙陣戰術決策（返回 {phase1, phase2}）──────────────────────
  // Phase1 候選：征伐(金)、迂迴(木)、潰堤(水)、火攻(火)、堅壁(土)
  // Phase2 候選：驚雷(金)、蔓衍(木)、漩渦(水)、焚天(火)、地裂(土)
  const PHASE1_TACTICS = ['zhengfa', 'yuhui', 'kuidi', 'huogong', 'jianbi'];
  const PHASE2_TACTICS = ['jinglei', 'manyan', 'xuanwo', 'fentian', 'dilie'];
  const TACTIC_ELEM = {
    zhengfa:'金', yuhui:'木', kuidi:'水', huogong:'火', jianbi:'土',
    jinglei:'金', manyan:'木', xuanwo:'水', fentian:'火', dilie:'土'
  };
  const _KE = { '木':'土', '火':'金', '土':'水', '金':'木', '水':'火' };
  const _ELEM_TO_P1 = { '金':'zhengfa', '木':'yuhui', '水':'kuidi', '火':'huogong', '土':'jianbi' };
  const _ELEM_TO_P2 = { '金':'jinglei', '木':'manyan', '水':'xuanwo', '火':'fentian', '土':'dilie' };

  function chooseCmdDual(state, difficulty) {
    const target = GameState.getActiveGeneral('player');
    const attacker = GameState.getActiveGeneral('enemy');

    if (difficulty === 'easy') {
      // 隨機，但不重複上回合
      let p1 = PHASE1_TACTICS[Math.floor(Math.random() * 5)];
      let p2 = PHASE2_TACTICS[Math.floor(Math.random() * 5)];
      if (p1 === _lastPhase1) p1 = PHASE1_TACTICS[(PHASE1_TACTICS.indexOf(p1) + 1) % 5];
      if (p2 === _lastPhase2) p2 = PHASE2_TACTICS[(PHASE2_TACTICS.indexOf(p2) + 1) % 5];
      _lastPhase1 = p1; _lastPhase2 = p2;
      return { phase1: p1, phase2: p2 };
    }

    // 優先使用克制對手武將屬性的戰術
    let bestElem = null;
    if (target && target.element) {
      // 找哪個五行元素克制 target.element
      for (const [e, ke] of Object.entries(_KE)) {
        if (ke === target.element) { bestElem = e; break; }
      }
    }

    let p1 = bestElem ? _ELEM_TO_P1[bestElem] : PHASE1_TACTICS[Math.floor(Math.random() * 5)];
    let p2 = bestElem ? _ELEM_TO_P2[bestElem] : PHASE2_TACTICS[Math.floor(Math.random() * 5)];

    // 不重複上回合（避免規律）
    if (p1 === _lastPhase1) p1 = PHASE1_TACTICS[(PHASE1_TACTICS.indexOf(p1) + 2) % 5];
    if (p2 === _lastPhase2) p2 = PHASE2_TACTICS[(PHASE2_TACTICS.indexOf(p2) + 2) % 5];

    _lastPhase1 = p1; _lastPhase2 = p2;
    return { phase1: p1, phase2: p2 };
  }

  // ── 禁將：優先考慮羈絆加成 ────────────────────────────────────
  function chooseBanWithBond(banned, playerPickIds, difficulty) {
    const available = GameData.generals.filter(g =>
      !banned.includes(g.id) && !playerPickIds.includes(g.id)
    );

    // 找出與玩家已選角色有羈絆的高威脅角色
    if (playerPickIds.length > 0 && typeof GameData.checkBonds === 'function') {
      const dangerWithBond = available.filter(g => {
        const combined = [...playerPickIds, g.id];
        const bonds = GameData.checkBonds(combined);
        return bonds.length > 0;
      });
      if (dangerWithBond.length > 0) {
        const sorted = [...dangerWithBond].sort((a, b) =>
          (b.atk + b.def + b.spd) - (a.atk + a.def + a.spd)
        );
        return sorted[0].id;
      }
    }

    // 無羈絆威脅則禁分數最高
    return chooseBan(banned, playerPickIds, difficulty);
  }

  // ── 選將：優先考慮羈絆加成 ────────────────────────────────────
  function choosePickWithBond(banned, playerPicks, enemyPicks, difficulty, bpStage) {
    const taken = [...banned, ...playerPicks.map(p => p.id || p), ...enemyPicks.map(p => p.id || p)];
    const role = ['主公','軍師','臣相','大司馬','大司農','大將軍','行軍總管','破陣先鋒'][bpStage] || '';
    const enemyPickIds = enemyPicks.map(p => p.id || p);

    const available = GameData.generals.filter(g =>
      !taken.includes(g.id) &&
      (!role || !g.roles || g.roles.includes(role) || true) // 允許選擇，但有懲罰
    );

    // 優先選能觸發羈絆的角色
    if (enemyPickIds.length > 0 && typeof GameData.checkBonds === 'function') {
      const withBond = available.filter(g => {
        const combined = [...enemyPickIds, g.id];
        const bonds = GameData.checkBonds(combined);
        return bonds.length > 0;
      });
      if (withBond.length > 0) {
        const sorted = [...withBond].sort((a, b) =>
          (b.atk + b.def + b.spd) - (a.atk + a.def + a.spd)
        );
        return sorted[0].id;
      }
    }

    // 無羈絆則選分數最高
    return choosePick(banned, playerPicks.map(p => p.id || p), enemyPicks.map(p => p.id || p), difficulty, bpStage);
  }

  return {
    chooseBan, choosePick, chooseBanWithBond, choosePickWithBond,
    deployField, chooseCmd: chooseCmdDual, chooseTarget, shouldUseHealCard
  };
})();
