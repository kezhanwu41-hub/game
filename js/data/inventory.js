/**
 * inventory.js v2 — 玉帛 / 武將 / 裝備 / 素材 / 碎片 統一倉儲
 * 支援裝備等級 (level)、碎片 (fragments)、武將魂 (junhun by hero id)
 *
 * 儲存結構：
 * {
 *   jade: number,
 *   heroes: [heroId],
 *   equipment: [{ instanceId, equipId, level, durability }],
 *   fragments: { equipId: count },
 *   materials: { yintie, pige, matiehe, qianghua },
 *   junhun: { heroId: count },
 *   pity: { weapon: { srCount, legendCount }, armor: { srCount, legendCount } }
 * }
 */
window.Inventory = (function() {
  'use strict';

  const STORAGE_KEY = 'heroes_inventory_v2';
  const DEFAULT = () => ({
    jade: 16000,
    heroes: [],
    equipment: [],
    fragments: {},
    materials: { yintie: 0, pige: 0, matiehe: 0, qianghua: 0 },
    junhun: {},
    pity: {
      weapon: { srCount: 0, legendCount: 0 },
      armor:  { srCount: 0, legendCount: 0 }
    }
  });

  let data = DEFAULT();

  function load() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      data = { ...DEFAULT(), ...parsed };
      data.materials = { ...DEFAULT().materials, ...(parsed.materials || {}) };
      data.pity = {
        weapon: { ...DEFAULT().pity.weapon, ...(parsed.pity?.weapon || {}) },
        armor:  { ...DEFAULT().pity.armor,  ...(parsed.pity?.armor  || {}) }
      };
      data.fragments = parsed.fragments || {};
      data.junhun = parsed.junhun || {};
    } catch (e) { console.error('[Inventory] parse failed', e); }
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
    catch (e) { console.error('[Inventory] save failed', e); }
  }

  function getJade() { return data.jade; }
  function addJade(n) { data.jade += n; save(); return data.jade; }
  function spendJade(n) { if (data.jade < n) return false; data.jade -= n; save(); return true; }

  function addHero(id) { if (!data.heroes.includes(id)) { data.heroes.push(id); save(); } }
  function hasHero(id) { return data.heroes.includes(id); }
  function getHeroes() { return [...data.heroes]; }

  function _newInstanceId() { return 'eq_' + Date.now() + '_' + Math.floor(Math.random() * 1e6); }

  function addEquipment(equipId) {
    const def = GameData.getEquipment(equipId);
    if (!def) return null;
    const inst = {
      instanceId: _newInstanceId(),
      equipId,
      level: 0,
      durability: def.durability
    };
    data.equipment.push(inst);
    save();
    return inst;
  }

  function getEquipmentInstances() { return [...data.equipment]; }
  function getEquipmentInstance(instanceId) { return data.equipment.find(e => e.instanceId === instanceId) || null; }

  function removeEquipmentInstance(instanceId) {
    const idx = data.equipment.findIndex(e => e.instanceId === instanceId);
    if (idx < 0) return false;
    data.equipment.splice(idx, 1);
    save();
    return true;
  }

  function dismantleEquipment(instanceId) {
    const inst = getEquipmentInstance(instanceId);
    if (!inst) return false;
    const def = GameData.getEquipment(inst.equipId);
    const stones = (GameData.RARITY[def.rarity]?.stars || 1) * 2 + inst.level;
    addMaterial('qianghua', stones);
    removeEquipmentInstance(instanceId);
    return { stones };
  }

  function addFragment(equipId, count = 1) { data.fragments[equipId] = (data.fragments[equipId] || 0) + count; save(); }
  function getFragments(equipId) { return data.fragments[equipId] || 0; }
  function spendFragments(equipId, count) {
    if ((data.fragments[equipId] || 0) < count) return false;
    data.fragments[equipId] -= count;
    save();
    return true;
  }

  function getMaterial(key) { return data.materials[key] || 0; }
  function getAllMaterials() { return { ...data.materials }; }
  function addMaterial(key, n) { data.materials[key] = (data.materials[key] || 0) + n; save(); }
  function spendMaterial(key, n) {
    if ((data.materials[key] || 0) < n) return false;
    data.materials[key] -= n;
    save();
    return true;
  }
  function addBatchMaterials(rewards) {
    for (const [k, v] of Object.entries(rewards)) {
      if (v > 0) data.materials[k] = (data.materials[k] || 0) + v;
    }
    save();
  }

  function addJunhun(heroId, n) { data.junhun[heroId] = (data.junhun[heroId] || 0) + n; save(); }
  function getJunhun(heroId) { return data.junhun[heroId] || 0; }
  function spendJunhun(heroId, n) {
    if ((data.junhun[heroId] || 0) < n) return false;
    data.junhun[heroId] -= n;
    save();
    return true;
  }

  function getPity(pool) { return data.pity[pool] || { srCount: 0, legendCount: 0 }; }
  function setPity(pool, p) { data.pity[pool] = p; save(); }

  load();

  return {
    getJade, addJade, spendJade,
    addHero, hasHero, getHeroes,
    addEquipment, getEquipmentInstances, getEquipmentInstance,
    removeEquipmentInstance, dismantleEquipment,
    addFragment, getFragments, spendFragments,
    getMaterial, getAllMaterials, addMaterial, spendMaterial, addBatchMaterials,
    addJunhun, getJunhun, spendJunhun,
    getPity, setPity,
    _data: () => data,
    _reset: () => { data = DEFAULT(); save(); }
  };
})();
