/**
 * balance.js — PVE / PVP 數值切換
 *
 * P2P 即時對戰時，將裝備強制鎖定為「標準競技模板」：
 *   等級設為 0、共鳴保留、耐久不消耗（僅顯示）
 * 確保雙方公平起跑線。PVE/單機/挑戰 沿用玩家培養的數值。
 */
window.BalanceEngine = (function() {
  'use strict';

  const MODE = { PVE: 'pve', PVP: 'pvp' };
  let mode = MODE.PVE;

  function setMode(m) { mode = (m === MODE.PVP) ? MODE.PVP : MODE.PVE; }
  function getMode() { return mode; }
  function isPVP() { return mode === MODE.PVP; }

  /**
   * 用於 PVP：將卡上的裝備強制標準化
   * 不刪除裝備，只把等級在計算時當 0
   */
  function normalizedEquipBonus(card) {
    if (!card?.equipped) return;
    if (!isPVP()) {
      EquipmentEngine.applyEquipBonus(card);
      return;
    }
    // PVP：暫存 level 後改 0，套用後還原
    const slots = card.equipped;
    const backups = {};
    for (const k of Object.keys(slots)) {
      if (slots[k]) {
        backups[k] = slots[k].level;
        slots[k].level = 0;
      }
    }
    EquipmentEngine.applyEquipBonus(card);
    for (const k of Object.keys(backups)) {
      if (slots[k]) slots[k].level = backups[k];
    }
  }

  /** PVP 模式下耐久不消耗 */
  function consumeDurabilityIfAllowed(card, slot) {
    if (isPVP()) return { broken: false };
    return EquipmentEngine.consumeDurability(card, slot);
  }

  return { MODE, setMode, getMode, isPVP, normalizedEquipBonus, consumeDurabilityIfAllowed };
})();
