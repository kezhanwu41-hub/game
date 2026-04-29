/**
 * combat.js v3 — Multiplayer + 五行陣法雙重選擇戰鬥引擎
 */
window.CombatEngine = (function() {
  'use strict';

  // 五行相生相剋
  const SHENG = { '木':'火', '火':'土', '土':'金', '金':'水', '水':'木' };
  const KE    = { '木':'土', '火':'金', '土':'水', '金':'木', '水':'火' };

  // 戰術名稱 → 五行元素
  const TACTIC_ELEM = {
    zhengfa:'金', yuhui:'木', kuidi:'水', huogong:'火', jianbi:'土',
    jinglei:'金', manyan:'木', xuanwo:'水', fentian:'火', dilie:'土'
  };

  function getElem(cmd) { return TACTIC_ELEM[cmd] || cmd; }

  function getRelation(c1, c2) {
    const e1 = getElem(c1), e2 = getElem(c2);
    if (e1 === e2) return 'same';
    if (SHENG[e1] === e2) return 'sheng_forward'; // e1 生 e2
    if (SHENG[e2] === e1) return 'sheng_backward'; // e2 生 e1
    if (KE[e1] === e2) return 'ke_forward';        // e1 克 e2
    if (KE[e2] === e1) return 'ke_backward';       // e2 克 e1
    return 'none';
  }

  const CMD_NAMES = {
    zhengfa:'征伐', yuhui:'迂迴', kuidi:'潰堤', huogong:'火攻', jianbi:'堅壁',
    jinglei:'驚雷', manyan:'蔓衍', xuanwo:'漩渦', fentian:'焚天', dilie:'地裂',
    // 兼容舊元素名稱
    metal: '金', wood: '木', water: '水', fire: '火', earth: '土'
  };

  // ── 主回合結算 ───────────────────────────────────────────────
  function resolveTurn(state, playerCmds, enemyCmds, playerAtk, playerTgt, enemyAtk, enemyTgt) {
    const logs = [];
    const pushLog = (text, type = 'normal') => { logs.push({ text, type }); GameState.addLog({ text, type }); };

    if (!playerAtk || playerAtk.currentHp <= 0 || !enemyAtk || enemyAtk.currentHp <= 0) {
      return { logs }; // Invalid state
    }

    pushLog(`--- 第 ${state.battle.turn} 回合 ---`, 'system');

    // ==========================================
    // 1. 個人方選擇階段 (Individual Choice Phase)
    // ==========================================
    function applyIndividualPhase(sideName, cmds, selfGen, oppGen) {
      if (!cmds.phase1 || !cmds.phase2) return;
      const rel = getRelation(cmds.phase1, cmds.phase2);
      
      pushLog(`[${sideName}] 自組陣法：${CMD_NAMES[cmds.phase1]}陣 + ${CMD_NAMES[cmds.phase2]}陣`, 'system');
      
      if (rel.includes('sheng')) {
        // 己方兩陣相生 → 自身回血
        selfGen.currentHp = Math.min(selfGen.maxHp, selfGen.currentHp + 10);
        pushLog(`✨ ${sideName}陣法相生！${selfGen.name} 回復 10 HP`, 'heal');
      } else if (rel.includes('ke')) {
        // 己方兩陣相剋（陣法內耗）→ 對手扣血
        oppGen.currentHp = Math.max(0, oppGen.currentHp - 30);
        pushLog(`⚡ ${sideName}陣法相剋！${oppGen.name} 扣 30 HP`, 'element-ke');
      } else if (rel === 'same') {
        // 己方兩陣相同 → 雙方各扣 15
        selfGen.currentHp = Math.max(0, selfGen.currentHp - 15);
        oppGen.currentHp = Math.max(0, oppGen.currentHp - 15);
        pushLog(`💥 ${sideName}陣法相同共鳴！雙方各扣 15 HP`, 'element-sheng');
      }
    }

    applyIndividualPhase('玩家', playerCmds, playerAtk, enemyAtk);
    applyIndividualPhase('敵方', enemyCmds, enemyAtk, playerAtk);

    // ==========================================
    // 2. 雙方戰鬥階段 (Combat Clash Phase)
    // ==========================================
    function applyCombatClash(phaseNum, pCmd, eCmd) {
      if (!pCmd || !eCmd) return;
      if (playerAtk.currentHp <= 0 || enemyAtk.currentHp <= 0) return; // 提前死亡

      const rel = getRelation(pCmd, eCmd);
      pushLog(`⚔️ [第${phaseNum}陣對決] 玩家(${CMD_NAMES[pCmd]}) vs 敵方(${CMD_NAMES[eCmd]})`, 'system');

      if (rel === 'same') {
        // 相同五行：雙方各扣 15 HP
        playerAtk.currentHp = Math.max(0, playerAtk.currentHp - 15);
        enemyAtk.currentHp = Math.max(0, enemyAtk.currentHp - 15);
        pushLog(`💥 五行相同！雙方各扣 15 HP`, 'attack');
      } else if (rel === 'sheng_forward') {
        // 玩家生敵方 → 玩家回 10 HP
        playerAtk.currentHp = Math.min(playerAtk.maxHp, playerAtk.currentHp + 10);
        pushLog(`🌿 玩家陣法相生！${playerAtk.name} 回復 10 HP`, 'heal');
      } else if (rel === 'sheng_backward') {
        // 敵方生玩家 → 敵方回 10 HP
        enemyAtk.currentHp = Math.min(enemyAtk.maxHp, enemyAtk.currentHp + 10);
        pushLog(`🌿 敵方陣法相生！${enemyAtk.name} 回復 10 HP`, 'heal');
      } else if (rel === 'ke_forward') {
        // 玩家克敵方 → 敵方扣 30 HP
        enemyAtk.currentHp = Math.max(0, enemyAtk.currentHp - 30);
        pushLog(`🔥 玩家陣法相剋！${enemyAtk.name} 扣 30 HP`, 'element-ke');
      } else if (rel === 'ke_backward') {
        // 敵方克玩家 → 玩家扣 30 HP
        playerAtk.currentHp = Math.max(0, playerAtk.currentHp - 30);
        pushLog(`🔥 敵方陣法相剋！${playerAtk.name} 扣 30 HP`, 'element-ke');
      } else {
        // 無關五行：我方（玩家）扣 10 HP
        playerAtk.currentHp = Math.max(0, playerAtk.currentHp - 10);
        pushLog(`💨 五行無關，攻勢受阻！${playerAtk.name} 扣 10 HP`, 'attack');
      }
      
      // 附加武將基礎攻防傷害互相攻擊
      // 假設每陣都會附帶 50% 基礎攻擊力的傷害！
      const pDmg = Math.max(1, Math.round(playerAtk.atk * 0.5 * (1 - (enemyAtk.def / (enemyAtk.def + 60)) * 0.5)));
      const eDmg = Math.max(1, Math.round(enemyAtk.atk * 0.5 * (1 - (playerAtk.def / (playerAtk.def + 60)) * 0.5)));
      
      enemyAtk.currentHp = Math.max(0, enemyAtk.currentHp - pDmg);
      playerAtk.currentHp = Math.max(0, playerAtk.currentHp - eDmg);
      pushLog(`⚔️ 基礎對拼：玩家對敵造成 ${pDmg} 傷害，敵方對玩家造成 ${eDmg} 傷害`, 'attack');
    }

    applyCombatClash(1, playerCmds.phase1, enemyCmds.phase1);
    applyCombatClash(2, playerCmds.phase2, enemyCmds.phase2);


    // ── 3. 清除死亡卡 + 後排提前上場 ─────────────────────────────
    GameState.cleanupField();
    GameState.moveBackToFront('player');
    GameState.moveBackToFront('enemy');

    // Advance turn
    state.battle.turn++;

    return { logs, playerFirst: true };
  }

  return { resolveTurn, CMD_NAMES };
})();
