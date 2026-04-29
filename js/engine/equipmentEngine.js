/**
 * equipmentEngine.js — 裝備掛載 / 耐久 / 共鳴 / 君王神器
 *
 * 規則：
 *  - 每位武將：至多 1 武器 + 1 防具 + 1 坐騎
 *  - 君王：除常規 3 槽外，可額外裝備 artifact 標記的神器
 *  - 裝備卡只能附加在「陣前區」武將或「君王」上（佈陣時 enforce）
 *  - 耐久度：每次發動攻擊或成功格擋 -1，歸零裝備損壞自動卸下
 *  - 專武共鳴：當裝備 def.resonance 含有此武將 id，解鎖 onResonance 被動
 *
 * 戰鬥內 API：
 *   EquipmentEngine.applyEquipBonus(card)            — 把已裝備效果加到 card.atk/def/spd
 *   EquipmentEngine.consumeDurability(card, slot)    — 攻擊或格擋觸發
 *   EquipmentEngine.fireResonance(card, ctx)         — 觸發專武共鳴
 *   EquipmentEngine.onKingHit(king, attacker, dmg)   — 君王神器反擊判定
 */
window.EquipmentEngine = (function() {
  'use strict';

  const SLOT_LIMITS = { weapon: 1, armor: 1, mount: 1 };

  function _ensureSlots(card) {
    if (!card.equipped) card.equipped = { weapon: null, armor: null, mount: null, artifact: null };
    return card.equipped;
  }

  function getEquippedDef(slotInst) {
    if (!slotInst) return null;
    return GameData.getEquipment(slotInst.equipId);
  }

  function canEquip(card, equipDef) {
    if (!card || !equipDef) return { ok: false, reason: '無效卡牌或裝備' };

    const slot = GameData.getEquipmentSlotType(equipDef);
    if (!slot) return { ok: false, reason: '未知裝備類型' };

    if (equipDef.kingOnly && !card.isKing) return { ok: false, reason: '此神器僅限君王使用' };
    if (equipDef.artifact && !card.isKing) return { ok: false, reason: '神器需君王持有' };

    return { ok: true, slot };
  }

  /**
   * 把背包中的 instance 裝備到卡上
   * @param {object} card    場上武將卡（複本）
   * @param {string} instanceId 來自 Inventory
   * @returns {{ok:boolean, reason?:string}}
   */
  function equip(card, instanceId) {
    const inst = Inventory.getEquipmentInstance(instanceId);
    if (!inst) return { ok: false, reason: '裝備不在背包' };

    const def = GameData.getEquipment(inst.equipId);
    const check = canEquip(card, def);
    if (!check.ok) return check;

    const slots = _ensureSlots(card);
    const targetSlot = def.artifact ? 'artifact' : check.slot;

    // 已有同槽位 → 先卸下
    if (slots[targetSlot]) unequip(card, targetSlot);

    slots[targetSlot] = {
      instanceId: inst.instanceId,
      equipId: inst.equipId,
      level: inst.level,
      durability: inst.durability
    };

    // 共鳴觸發旗標
    if (def.resonance && def.resonance.includes(card.id)) {
      slots[targetSlot].resonant = true;
    }

    return { ok: true };
  }

  function unequip(card, slot) {
    const slots = _ensureSlots(card);
    const removed = slots[slot];
    slots[slot] = null;
    return removed;
  }

  /**
   * 套用裝備加成到卡牌數值（每場戰鬥開始呼叫一次）
   */
  function applyEquipBonus(card) {
    if (!card) return;
    const slots = _ensureSlots(card);
    const baseAtk = card._baseAtk ?? card.atk ?? 0;
    const baseDef = card._baseDef ?? card.def ?? 0;
    const baseSpd = card._baseSpd ?? card.spd ?? 0;
    card._baseAtk = baseAtk; card._baseDef = baseDef; card._baseSpd = baseSpd;

    let atk = baseAtk, def = baseDef, spd = baseSpd;

    for (const slotName of ['weapon', 'armor', 'mount', 'artifact']) {
      const inst = slots[slotName]; if (!inst) continue;
      const ed = GameData.getEquipment(inst.equipId); if (!ed) continue;
      const mul = (GameData.RARITY[ed.rarity]?.powerMul || 1) * (1 + 0.1 * (inst.level || 0));
      atk += Math.round((ed.atk || 0) * mul);
      def += Math.round((ed.def || 0) * mul);
      spd += Math.round((ed.spd || 0) * mul);
      // 共鳴額外加成
      if (inst.resonant) {
        atk += Math.round((ed.atk || 0) * 0.25);
        def += Math.round((ed.def || 0) * 0.25);
      }
    }

    card.atk = atk;
    card.def = def;
    card.spd = spd;
  }

  /**
   * 一次攻擊（或成功格擋）後消耗一點耐久
   * @returns {{broken:boolean, removed?:object}}
   */
  function consumeDurability(card, slot) {
    if (!card) return { broken: false };
    const slots = _ensureSlots(card);
    const inst = slots[slot]; if (!inst) return { broken: false };

    inst.durability = Math.max(0, inst.durability - 1);
    // 同步背包
    const stored = Inventory.getEquipmentInstance(inst.instanceId);
    if (stored) { stored.durability = inst.durability; }

    if (inst.durability <= 0) {
      const removed = unequip(card, slot);
      if (removed) Inventory.removeEquipmentInstance(removed.instanceId);
      // 重新計算數值
      applyEquipBonus(card);
      return { broken: true, removed };
    }
    return { broken: false };
  }

  /**
   * 君王受擊：若裝備傳國玉璽（artifact）→ 反擊一次
   */
  function onKingHit(king, attacker, dmg) {
    if (!king?.isKing) return null;
    const slots = _ensureSlots(king);
    const art = slots.artifact; if (!art) return null;
    if (king._kingArtifactUsed) return null;

    const def = GameData.getEquipment(art.equipId); if (!def?.artifact) return null;

    // 玉璽觸發條件：致命傷害（HP 將歸零）
    if (king.currentHp - dmg > 0) return null;

    king._kingArtifactUsed = true;
    const reflect = Math.round(dmg * 0.5);
    if (attacker) attacker.currentHp = Math.max(0, attacker.currentHp - reflect);
    return { reflect, target: attacker?.name || '攻擊者' };
  }

  /**
   * 戰鬥開始 / 攻擊事件下，觸發專武共鳴 onResonance（如有）
   * 此處先回傳描述用以顯示 log；實際數值套用由 combat.js 呼叫對應分支
   */
  function listResonances(card) {
    if (!card) return [];
    const slots = _ensureSlots(card);
    const out = [];
    for (const [slot, inst] of Object.entries(slots)) {
      if (!inst || !inst.resonant) continue;
      const def = GameData.getEquipment(inst.equipId);
      if (def) out.push({ slot, def });
    }
    return out;
  }

  return {
    SLOT_LIMITS,
    canEquip, equip, unequip,
    applyEquipBonus, consumeDurability,
    onKingHit, listResonances,
    getEquippedDef
  };
})();
