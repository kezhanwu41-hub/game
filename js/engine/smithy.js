/**
 * smithy.js — 鐵匠鋪：升級裝備 / 碎片合成
 *
 * 升級成本（每級）：
 *   weapon → 隕鐵 + 強化石
 *   armor  → 皮革 + 強化石
 *   mount  → 馬鈴銀 + 強化石
 *
 * 碎片合成：5 碎片 → 1 件對應裝備
 */
window.SmithyEngine = (function() {
  'use strict';

  const MAX_LEVEL = 10;
  const FRAGMENT_REQ = 5;

  function _matKey(slot) {
    return slot === 'weapon' ? 'yintie'
         : slot === 'armor'  ? 'pige'
         : slot === 'mount'  ? 'matiehe'
         : 'qianghua';
  }

  function upgradeCost(instance) {
    if (!instance) return null;
    const def = GameData.getEquipment(instance.equipId);
    if (!def) return null;
    const slot = GameData.getEquipmentSlotType(def);
    const next = (instance.level || 0) + 1;
    const rStars = GameData.RARITY[def.rarity]?.stars || 1;
    return {
      mat: _matKey(slot),
      matAmount: next * 4 * rStars,
      stones: next * 2,
      jade: next * 50 * rStars
    };
  }

  function canUpgrade(instance) {
    if (!instance) return { ok: false, reason: '裝備不存在' };
    if ((instance.level || 0) >= MAX_LEVEL) return { ok: false, reason: '已達滿級' };
    const cost = upgradeCost(instance);
    if (Inventory.getMaterial(cost.mat) < cost.matAmount) return { ok: false, reason: `${GameData.MATERIALS[cost.mat].name} 不足` };
    if (Inventory.getMaterial('qianghua') < cost.stones) return { ok: false, reason: '強化石不足' };
    if (Inventory.getJade() < cost.jade) return { ok: false, reason: '玉帛不足' };
    return { ok: true, cost };
  }

  function upgrade(instanceId) {
    const inst = Inventory.getEquipmentInstance(instanceId);
    if (!inst) return { ok: false, reason: '裝備不存在' };
    const check = canUpgrade(inst);
    if (!check.ok) return check;

    const { cost } = check;
    Inventory.spendMaterial(cost.mat, cost.matAmount);
    Inventory.spendMaterial('qianghua', cost.stones);
    Inventory.spendJade(cost.jade);

    inst.level = (inst.level || 0) + 1;
    // 修復耐久至滿
    const def = GameData.getEquipment(inst.equipId);
    inst.durability = def.durability;
    Inventory._data().equipment.find(e => e.instanceId === instanceId).level = inst.level;
    Inventory._data().equipment.find(e => e.instanceId === instanceId).durability = inst.durability;
    // 觸發儲存
    Inventory.addJade(0);

    return { ok: true, level: inst.level };
  }

  function canMergeFragment(equipId) {
    const def = GameData.getEquipment(equipId);
    if (!def) return { ok: false, reason: '無此裝備' };
    if (!['SSR', 'LEGEND'].includes(def.rarity)) return { ok: false, reason: '僅 SSR 以上可碎片合成' };
    if (Inventory.getFragments(equipId) < FRAGMENT_REQ) return { ok: false, reason: `碎片不足（需 ${FRAGMENT_REQ}）` };
    return { ok: true };
  }

  function mergeFragment(equipId) {
    const check = canMergeFragment(equipId);
    if (!check.ok) return check;
    if (!Inventory.spendFragments(equipId, FRAGMENT_REQ)) return { ok: false, reason: '碎片不足' };
    const inst = Inventory.addEquipment(equipId);
    return { ok: true, instance: inst };
  }

  /** 戰後素材結算 */
  function settleBattle(playerWon, lostHpRatio) {
    const rewards = GameData.rollBattleMaterials(playerWon, lostHpRatio);
    Inventory.addBatchMaterials(rewards);
    if (playerWon) Inventory.addJade(200);
    else Inventory.addJade(40);
    return rewards;
  }

  return {
    MAX_LEVEL, FRAGMENT_REQ,
    upgradeCost, canUpgrade, upgrade,
    canMergeFragment, mergeFragment,
    settleBattle
  };
})();
