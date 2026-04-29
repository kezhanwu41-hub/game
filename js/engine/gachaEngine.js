/**
 * gachaEngine.js v2 — 武器/防具池分離 + 雙保底 + 十連
 *
 * 池：
 *   weapon   — 攻擊類（武器 + 坐騎）
 *   armor    — 防禦類（防具）
 *
 * 機率：
 *   LEGEND  2% / SSR 10% / SR 30% / R 40% / N 18%
 *
 * 保底：
 *   每 10 抽必出 SR 以上裝備
 *   每 80 抽必出當期 LEGEND
 *
 * 重複 SSR/LEGEND 自動轉為「碎片」，集 5 碎合成。
 */
window.GachaEngine = (function() {
  'use strict';

  const COST_SINGLE = 160;
  const COST_TEN    = 1440;   // 十連 9 折

  const PITY_SR_AT     = 10;
  const PITY_LEGEND_AT = 80;

  const RATE = [
    { rarity: 'LEGEND', p: 0.02 },
    { rarity: 'SSR',    p: 0.10 },
    { rarity: 'SR',     p: 0.30 },
    { rarity: 'R',      p: 0.40 },
    { rarity: 'N',      p: 0.18 }
  ];

  let featured = {
    weapon: 'w_qinglong',
    armor:  'a_jinjia'
  };

  function setFeatured(weapon, armor) {
    if (weapon) featured.weapon = weapon;
    if (armor)  featured.armor = armor;
  }
  function getFeatured() { return { ...featured }; }

  function _poolByType(type) {
    if (type === 'weapon') return [...GameData.WEAPONS, ...GameData.MOUNTS].filter(e => !e.kingOnly);
    if (type === 'armor')  return GameData.ARMORS;
    return GameData.ALL_EQUIPMENT.filter(e => !e.kingOnly);
  }

  function _filterByRarity(pool, rarity) { return pool.filter(e => e.rarity === rarity); }

  function _rollRarity() {
    const r = Math.random();
    let acc = 0;
    for (const tier of RATE) {
      acc += tier.p;
      if (r < acc) return tier.rarity;
    }
    return 'N';
  }

  function _pickFromPool(pool) {
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function _drawOnce(type) {
    const pity = Inventory.getPity(type);
    pity.srCount     = (pity.srCount || 0) + 1;
    pity.legendCount = (pity.legendCount || 0) + 1;

    let rarity = _rollRarity();
    let viaPity = null;

    if (pity.legendCount >= PITY_LEGEND_AT) {
      rarity = 'LEGEND';
      viaPity = 'legend';
    } else if (pity.srCount >= PITY_SR_AT && ['N','R'].includes(rarity)) {
      rarity = 'SR';
      viaPity = 'sr';
    }

    let chosen = null;
    if (rarity === 'LEGEND') {
      const featuredId = featured[type];
      const featuredDef = featuredId ? GameData.getEquipment(featuredId) : null;
      if (featuredDef && featuredDef.rarity === 'LEGEND' && Math.random() < 0.7) {
        chosen = featuredDef;
      } else {
        chosen = _pickFromPool(_filterByRarity(_poolByType(type), 'LEGEND')) || featuredDef;
      }
    } else {
      chosen = _pickFromPool(_filterByRarity(_poolByType(type), rarity));
      if (!chosen) chosen = _pickFromPool(_poolByType(type));
    }

    if (!chosen) return null;

    if (rarity === 'LEGEND') { pity.legendCount = 0; pity.srCount = 0; }
    else if (['SR', 'SSR'].includes(rarity)) { pity.srCount = 0; }

    Inventory.setPity(type, pity);

    return { equipId: chosen.id, rarity, def: chosen, viaPity };
  }

  function _grantResult(res) {
    if (!res) return null;
    const def = res.def;
    if (['SSR', 'LEGEND'].includes(def.rarity)) {
      const owned = Inventory.getEquipmentInstances().filter(i => i.equipId === def.id);
      if (owned.length >= 1) {
        Inventory.addFragment(def.id, 1);
        return { ...res, asFragment: true };
      }
    }
    Inventory.addEquipment(def.id);
    return { ...res, asFragment: false };
  }

  function pullSingle(type = 'weapon') {
    if (!Inventory.spendJade(COST_SINGLE)) return { ok: false, msg: '玉帛不足！' };
    const res = _grantResult(_drawOnce(type));
    if (!res) return { ok: false, msg: '召喚失敗（牌池空）' };
    return { ok: true, type, results: [res] };
  }

  function pullTen(type = 'weapon') {
    if (!Inventory.spendJade(COST_TEN)) return { ok: false, msg: '玉帛不足！' };
    const results = [];
    for (let i = 0; i < 10; i++) {
      const r = _drawOnce(type);
      if (r) results.push(_grantResult(r));
    }
    return { ok: true, type, results };
  }

  return {
    pullSingle, pullTen,
    setFeatured, getFeatured,
    COST_SINGLE, COST_TEN,
    PITY_SR_AT, PITY_LEGEND_AT
  };
})();
