/**
 * bingfa-engine.js — 兵法推演核心引擎
 * BP 流程 / 雙陣結算 / 職位戰術加成 / 勝負判定
 * Fixed: stepProgress tracked in state, not on BP_STEPS elements
 */
window.BingFaEngine = window.BingFaEngine || {};

(function() {
  'use strict';

  const D = window.BingFaData;

  // ── BP 流程（5 階段：對方先禁。共 6 禁 8 選交錯）
  // 共 14 步：禁/選/禁/選/禁/選/禁/選/選×2/選×2/禁/禁/選×4/選×4
  const BP_STEPS = [
    { phase:'ban',  side:'enemy',  count:1 },            // 0
    { phase:'ban',  side:'player', count:1 },            // 1
    { phase:'pick', side:'enemy',  count:1, jobFilter:'king' },       // 2
    { phase:'pick', side:'player', count:1, jobFilter:'king' },       // 3
    { phase:'pick', side:'enemy',  count:1, jobFilter:'strategist' }, // 4
    { phase:'pick', side:'player', count:1, jobFilter:'strategist' }, // 5
    { phase:'ban',  side:'enemy',  count:1 },            // 6
    { phase:'ban',  side:'player', count:1 },            // 7
    { phase:'pick', side:'enemy',  count:2, jobFilter:'special' },    // 8
    { phase:'pick', side:'player', count:2, jobFilter:'special' },    // 9
    { phase:'ban',  side:'enemy',  count:1 },            // 10
    { phase:'ban',  side:'player', count:1 },            // 11
    { phase:'pick', side:'enemy',  count:4, jobFilter:'special' },    // 12
    { phase:'pick', side:'player', count:4, jobFilter:'special' }     // 13
  ];

  // ── 初始化狀態：stepProgress 追蹤每步進度，不污染 BP_STEPS
  function makeState() {
    return {
      bans: { player: [], enemy: [] },
      picks: { player: [], enemy: [] },
      stepIdx: 0,
      stepProgress: new Array(BP_STEPS.length).fill(0), // FIX: track in state
      phase: 'bp',
      mode: 'ai',
      round: 1,
      hp: { player: 100, enemy: 100 },
      maxHp: 100,
      log: [],
      lastTactics: null
    };
  }

  // ── 候選池：未禁、未選的武將
  function candidates(state, jobFilter) {
    const used = new Set([
      ...state.bans.player, ...state.bans.enemy,
      ...state.picks.player, ...state.picks.enemy
    ]);
    let pool = D.HEROES.filter(h => !used.has(h.id));
    if (jobFilter === 'special') {
      pool = pool.filter(h => h.job !== 'king' && h.job !== 'strategist');
    } else if (jobFilter && jobFilter !== 'any') {
      pool = pool.filter(h => h.job === jobFilter);
    }
    return pool;
  }

  function currentStep(state) {
    return BP_STEPS[state.stepIdx] || null;
  }

  /** 執行一步：禁 or 選 */
  function performStep(state, side, heroId) {
    const step = currentStep(state);
    if (!step) return { ok: false, error: 'BP 已結束' };
    if (step.side !== side) return { ok: false, error: '不是你方回合' };
    const hero = D.HEROES_BY_ID[heroId];
    if (!hero) return { ok: false, error: '找不到武將' };
    // 職位篩選
    if (step.jobFilter && step.jobFilter !== 'special' && hero.job !== step.jobFilter) {
      return { ok: false, error: `本步應選 ${D.JOB_NAMES[step.jobFilter]}` };
    }
    if (step.jobFilter === 'special' && (hero.job === 'king' || hero.job === 'strategist')) {
      return { ok: false, error: '本步應選特殊職位' };
    }
    // 禁/選
    if (step.phase === 'ban') {
      state.bans[side].push(heroId);
      state.log.push(`${side === 'player' ? '我方' : '敵方'}禁用 ${hero.name}`);
    } else {
      state.picks[side].push(heroId);
      state.log.push(`${side === 'player' ? '我方' : '敵方'}選派 ${hero.name}（${D.JOB_NAMES[hero.job]}）`);
    }
    // FIX: 進度追蹤存在 state.stepProgress，而非 step._done
    state.stepProgress[state.stepIdx]++;
    if (state.stepProgress[state.stepIdx] >= step.count) {
      state.stepIdx++;
    }
    if (state.stepIdx >= BP_STEPS.length) {
      state.phase = 'battle';
    }
    return { ok: true };
  }

  // ── AI 對手：啟發式選擇
  function aiPick(state) {
    const step = currentStep(state);
    if (!step || step.side !== 'enemy') return null;
    const pool = candidates(state, step.jobFilter);
    if (pool.length === 0) return null;
    if (step.phase === 'ban') {
      // 禁掉玩家尚未選、但戰力最高的武將
      const playerPicked = new Set(state.picks.player);
      const threat = pool
        .filter(h => !playerPicked.has(h.id))
        .sort((a, b) => b.power - a.power);
      return (threat[0] || pool[0]).id;
    } else {
      // 選擇剋制玩家最近選的屬性
      const myElems = state.picks.player.map(id => D.HEROES_BY_ID[id].elem);
      const target = myElems.length > 0 ? D.KE[myElems[myElems.length - 1]] || null : null;
      const matched = target ? pool.filter(h => h.elem === target) : [];
      const chosen = matched.length > 0 ? matched : pool;
      return chosen.sort((a, b) => b.power - a.power)[0].id;
    }
  }

  // ── 羈絆檢查
  function activeBonds(picks) {
    const set = new Set(picks);
    return D.BONDS.filter(b => b.ids.every(id => set.has(id)));
  }

  // ── 雙陣結算（核心）
  function resolveTactics(state, ourTactics, enemyTactics) {
    const log = [];
    let ourDmg = 0, enemyDmg = 0;
    const t1 = ourTactics[0], t2 = ourTactics[1];
    const e1 = enemyTactics[0], e2 = enemyTactics[1];

    // 我方雙陣內部結算
    const innerOur = D.relation(t1.elem, t2.elem);
    if (innerOur === 'sheng' || innerOur === 'sheng_in') {
      log.push({ type:'our', text:`雙陣相生（${t1.name}↔${t2.name}）：我方回血 +10` });
      enemyDmg -= 10;
    } else if (innerOur === 'ke' || innerOur === 'ke_by') {
      const hasChancellor = state.picks.player.some(id => D.HEROES_BY_ID[id].job === 'chancellor');
      const dispel = hasChancellor && Math.random() < 0.30;
      if (dispel) {
        log.push({ type:'our', text:`雙陣相剋（${t1.name}↔${t2.name}）— 臣相化解！` });
      } else {
        log.push({ type:'enemy', text:`雙陣相剋（${t1.name}↔${t2.name}）：自損 -30` });
        ourDmg += 30;
      }
    } else if (innerOur === 'same') {
      log.push({ type:'our', text:`雙陣同行（${t1.name}+${t2.name}）：傷敵 +15` });
      enemyDmg += 15;
    }

    // 敵我交鋒（第一陣 vs 敵第一陣，第二陣 vs 敵第二陣）
    const cross = (mine, theirs, idx) => {
      const r = D.relation(mine.elem, theirs.elem);
      if (r === 'ke') {
        log.push({ type:'our', text:`第${idx}陣 ${mine.name}(${mine.elem}) 剋 ${theirs.name}(${theirs.elem})：敵損 -30` });
        enemyDmg += 30;
      } else if (r === 'ke_by') {
        const hasCommandant = state.picks.player.some(id => D.HEROES_BY_ID[id].job === 'commandant');
        const reduce = hasCommandant && mine.elem === '木' ? 10 : 0;
        log.push({ type:'enemy', text:`第${idx}陣 ${mine.name}(${mine.elem}) 被 ${theirs.name}(${theirs.elem}) 剋：自損 -${30 - reduce}` });
        ourDmg += (30 - reduce);
      } else if (r === 'sheng' || r === 'sheng_in') {
        log.push({ type:'system', text:`第${idx}陣 ${mine.name}↔${theirs.name} 相生：敵回 +10` });
        enemyDmg -= 10;
      } else if (r === 'same') {
        log.push({ type:'system', text:`第${idx}陣 ${mine.name}+${theirs.name} 同行：互傷 -15` });
        ourDmg += 15;
        enemyDmg += 15;
      } else {
        log.push({ type:'system', text:`第${idx}陣 ${mine.name}↔${theirs.name} 無關：互傷 -10` });
        ourDmg += 10;
        enemyDmg += 10;
      }
    };
    cross(t1, e1, 1);
    cross(t2, e2, 2);

    // 職位戰術加成
    const myJobs = state.picks.player.map(id => D.HEROES_BY_ID[id].job);

    // 大將軍：全軍+5%攻 + 征伐額外+5傷
    if (myJobs.includes('general')) {
      const bonus = Math.round(Math.max(0, enemyDmg) * 0.05) + 5;
      enemyDmg += bonus;
      log.push({ type:'epic', text:`⚔️ 大將軍 — 全軍 +5% 攻 + 征伐 +5 傷（敵額外受 ${bonus}）` });
    }
    // 破陣先鋒：金陣優先 + 同五行敵-5血
    if (myJobs.includes('vanguard')) {
      const sameElem = (t1.elem === e1.elem) || (t2.elem === e2.elem);
      const jinPriority = (t1.elem === '金') || (t2.elem === '金');
      if (sameElem) {
        enemyDmg += 5;
        log.push({ type:'epic', text:`🔱 破陣先鋒 — 同五行：敵額外 -5 血` });
      }
      if (jinPriority) {
        enemyDmg += 8;
        log.push({ type:'epic', text:`🔱 破陣先鋒 — 金陣優先結算 +8` });
      }
    }
    // 大司農：每3回合回5血
    if (myJobs.includes('minister') && state.round % 3 === 0) {
      ourDmg = Math.max(0, ourDmg - 5);
      log.push({ type:'epic', text:`🌾 大司農 — 每3回合 +5 血` });
    }
    // 大司馬：揭露敵雙陣其中之一
    if (myJobs.includes('marshal')) {
      const reveal = Math.random() < 0.5 ? e1 : e2;
      log.push({ type:'epic', text:`🛡️ 大司馬 — 探得敵方暗伏 ${reveal.name}(${reveal.elem})` });
    }

    return { ourDmg, enemyDmg, log };
  }

  // ── AI 出戰術（敵方）：嘗試剋制玩家
  function aiTactics(state) {
    const t = D.TACTICS;
    const myPicks = state.picks.player.map(id => D.HEROES_BY_ID[id]);
    const myElems = myPicks.map(h => h.elem);
    // 找出能剋制玩家屬性的戰術
    const scored = t.map(tactic => {
      let score = Math.random() * 2;
      myElems.forEach(e => {
        if (D.KE[tactic.elem] === e) score += 3; // 剋制玩家
        if (D.KE[e] === tactic.elem) score -= 1; // 被玩家剋
      });
      return { tactic, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return [scored[0].tactic, scored[1].tactic];
  }

  /** 套用回合：返回結算結果 */
  function applyRound(state, ourTactics) {
    const enemyTactics = aiTactics(state);
    state.lastTactics = { our: ourTactics, enemy: enemyTactics };
    const result = resolveTactics(state, ourTactics, enemyTactics);
    state.hp.player = Math.max(0, state.hp.player - result.ourDmg);
    state.hp.enemy = Math.max(0, state.hp.enemy - result.enemyDmg);
    result.log.forEach(l => state.log.push(l));
    state.round++;
    let ended = null;
    if (state.hp.enemy <= 0 && state.hp.player <= 0) ended = 'draw';
    else if (state.hp.enemy <= 0) ended = 'win';
    else if (state.hp.player <= 0) ended = 'lose';
    return { result, ended, enemyTactics };
  }

  // ── AI 軍師建議（BP 階段）
  function aiAdvice(state) {
    const step = currentStep(state);
    if (!step) return '雙陣已成，請佈陣應戰。';
    if (step.side !== 'player') return '敵方思考中…耐心等待對手出招。';
    if (step.phase === 'ban') {
      const pool = candidates(state, step.jobFilter);
      if (pool.length === 0) return '可自由禁選。';
      // 找出對敵方最有威脅的武將建議禁掉
      const enElems = state.picks.enemy.map(id => D.HEROES_BY_ID[id].elem);
      const sorted = pool.slice().sort((a, b) => {
        let sa = b.power - a.power;
        // 能剋制己方的優先禁掉
        if (enElems.some(e => D.KE[a.elem] === e)) sa += 15;
        if (enElems.some(e => D.KE[b.elem] === e)) sa -= 15;
        return sa;
      });
      const top = sorted[0];
      return `建議禁掉「${top.name}（${top.elem}・戰力 ${top.power}）」— 此將威脅最大，入敵陣難以應對。`;
    } else {
      const myElems = state.picks.player.map(id => D.HEROES_BY_ID[id].elem);
      const enElems = state.picks.enemy.map(id => D.HEROES_BY_ID[id].elem);
      const pool = candidates(state, step.jobFilter);
      if (enElems.length === 0) {
        const top = pool.slice().sort((a, b) => b.power - a.power)[0];
        return top ? `優先考慮戰力，建議選「${top.name}（${top.elem}）」。` : '優先考慮戰力與職位定位。';
      }
      const lastEnElem = enElems[enElems.length - 1];
      const targetElem = D.KE[lastEnElem];
      const candidates2 = pool.filter(h => h.elem === targetElem);
      if (candidates2.length > 0) {
        const best = candidates2.sort((a, b) => b.power - a.power)[0];
        return `敵方偏重「${lastEnElem}」屬性，建議選「${best.name}（${targetElem}・戰力 ${best.power}）」形成五行壓制。`;
      }
      return `敵方偏重「${lastEnElem}」，建議選「${targetElem}」屬性武將剋制，或選高戰力武將穩固陣容。`;
    }
  }

  BingFaEngine.makeState = makeState;
  BingFaEngine.candidates = candidates;
  BingFaEngine.currentStep = currentStep;
  BingFaEngine.performStep = performStep;
  BingFaEngine.aiPick = aiPick;
  BingFaEngine.aiTactics = aiTactics;
  BingFaEngine.applyRound = applyRound;
  BingFaEngine.aiAdvice = aiAdvice;
  BingFaEngine.activeBonds = activeBonds;
  BingFaEngine.BP_STEPS = BP_STEPS;
})();
