/**
 * materials.js — 鐵匠鋪素材定義
 * 戰鬥獎勵 → 素材；素材在鐵匠鋪用於升級 / 合成
 */
window.GameData = window.GameData || {};

(function() {
  'use strict';

  const MATERIALS = {
    yintie:    { id: 'yintie',    name: '隕鐵',   icon: '⛏️', desc: '武器升級主要素材' },
    pige:      { id: 'pige',      name: '皮革',   icon: '🪶', desc: '防具升級主要素材' },
    matiehe:   { id: 'matiehe',   name: '馬鈴銀', icon: '🔔', desc: '坐騎升級主要素材' },
    qianghua:  { id: 'qianghua',  name: '強化石', icon: '💎', desc: '裝備分解產物，可加速升級' },
    junhun:    { id: 'junhun',    name: '將魂',   icon: '👻', desc: '武將分解產物，用於升級武將基礎 HP/ATK' }
  };

  // 戰損比例（敗方損失 HP %）→ 素材獎勵
  // 勝方拿較多，敗方拿安慰
  function rollBattleMaterials(playerWon, damageRatio) {
    const mul = playerWon ? 1.0 : 0.4;
    const base = Math.max(0.2, damageRatio); // 戰況越激烈，素材越多
    return {
      yintie:   Math.round(8  * base * mul),
      pige:     Math.round(6  * base * mul),
      matiehe:  Math.round(2  * base * mul),
      qianghua: playerWon ? 1 : 0
    };
  }

  GameData.MATERIALS = MATERIALS;
  GameData.rollBattleMaterials = rollBattleMaterials;
})();
