/**
 * equipment.js — 武器庫資料層
 * 三類裝備：weapon（攻）/ armor（防）/ mount（坐騎機制）
 * 稀有度：N / R / SR / SSR / LEGEND
 * 含五行屬性、耐久度、戰力分、共鳴目標武將、君王神器標記
 * v2.1: 加入「職業限定」(jobs) — 8 大職位限定可用
 */
window.GameData = window.GameData || {};

(function() {
  'use strict';

  // ── 8 大職業（與兵法推演共用）────────────────────────────────
  const JOBS = {
    king:      { id: 'king',      name: '主公',     icon: '👑', desc: '一國之君，神器專屬' },
    strategist:{ id: 'strategist',name: '軍師',     icon: '🪶', desc: '羽扇綸巾，運籌帷幄' },
    chancellor:{ id: 'chancellor',name: '臣相',     icon: '📜', desc: '文官執政，化解災厄' },
    marshal:   { id: 'marshal',   name: '大司馬',   icon: '🛡️', desc: '主管軍事，揭露敵情' },
    minister:  { id: 'minister',  name: '大司農',   icon: '🌾', desc: '主管糧政，每3回合回血' },
    general:   { id: 'general',   name: '大將軍',   icon: '⚔️', desc: '征伐沙場，全軍+5%攻' },
    commandant:{ id: 'commandant',name: '行軍總管', icon: '🏹', desc: '行軍布陣，木陣減傷' },
    vanguard:  { id: 'vanguard',  name: '破陣先鋒', icon: '🔱', desc: '金陣優先結算，破敵先鋒' }
  };
  const JOB_LIST = Object.values(JOBS);

  const RARITY = {
    N:      { label: '凡', stars: 1, color: '#9aa0a6', powerMul: 1.0,  shardCost: 0  },
    R:      { label: '良', stars: 2, color: '#4caf50', powerMul: 1.15, shardCost: 0  },
    SR:     { label: '精', stars: 3, color: '#42a5f5', powerMul: 1.35, shardCost: 0  },
    SSR:    { label: '神', stars: 4, color: '#ab47bc', powerMul: 1.65, shardCost: 5  },
    LEGEND: { label: '傳說', stars: 5, color: '#ffb300', powerMul: 2.10, shardCost: 5  }
  };

  // ── 武器（偏重攻擊/特效）含 jobs 限定 ────────────────────────
  const WEAPONS = [
    { id: 'w_qinglong',  name: '青龍偃月刀', icon: '🗡️', rarity: 'LEGEND', element: '金', atk: 35, durability: 8, jobs: ['general','vanguard'],         resonance: ['gen_guanyu'],     desc: '武聖斬將：對血量低於 30% 的目標造成 1.5x 傷害' },
    { id: 'w_fangtian',  name: '方天畫戟',   icon: '🗡️', rarity: 'LEGEND', element: '火', atk: 40, durability: 7, jobs: ['general','vanguard'],         resonance: ['gen_lvbu'],       desc: '人中呂布：每回合首次攻擊額外 +20 真實傷害' },
    { id: 'w_zhangba',   name: '丈八蛇矛',   icon: '🗡️', rarity: 'SSR',    element: '木', atk: 28, durability: 9, jobs: ['vanguard','general'],         resonance: ['gen_zhangfei'],   desc: '燕人怒吼：擊敗目標時對相鄰敵人造成 50% 濺射' },
    { id: 'w_yueya',     name: '月牙戟',     icon: '🗡️', rarity: 'SSR',    element: '金', atk: 26, durability: 8, jobs: ['vanguard','general'],         resonance: ['gen_zhaoyun'],    desc: '七進七出：閃避一次致命攻擊（每場 1 次）' },
    { id: 'w_zixin',     name: '紫薇神劍',   icon: '🗡️', rarity: 'SSR',    element: '金', atk: 24, durability: 8, jobs: ['king','strategist'],          resonance: ['gen_li_shimin'],  desc: '天策上將：受擊後對攻擊者反彈 30% 傷害' },
    { id: 'w_yangjia',   name: '楊家槍',     icon: '🗡️', rarity: 'SSR',    element: '木', atk: 25, durability: 9, jobs: ['vanguard','commandant'],      resonance: ['gen_yueyfei'],    desc: '精忠報國：HP 低於 50% 時 ATK +25%' },
    { id: 'w_changjian', name: '長劍',       icon: '🗡️', rarity: 'SR',     element: '金', atk: 18, durability: 6, jobs: ['strategist','chancellor','minister'],  desc: '基礎武器：攻擊 +18' },
    { id: 'w_pudao',     name: '朴刀',       icon: '🗡️', rarity: 'R',      element: '金', atk: 12, durability: 5, jobs: ['marshal','general'],          desc: '攻擊 +12' },
    { id: 'w_gongnu',    name: '弓弩',       icon: '🏹', rarity: 'SR',     element: '木', atk: 16, durability: 6, jobs: ['commandant','vanguard'],      desc: '射程：可從後排攻擊前排' },
    { id: 'w_baidao',    name: '柴刀',       icon: '🪓', rarity: 'N',      element: '金', atk: 6,  durability: 4, jobs: ['minister','marshal'],         desc: '基礎攻擊 +6' },
    { id: 'w_yushan',    name: '羽扇',       icon: '🪶', rarity: 'SR',     element: '木', atk: 10, durability: 8, jobs: ['strategist'],                desc: '智策：施展計策時效果 +20%' },
    { id: 'w_chunqiu',   name: '春秋筆',     icon: '📜', rarity: 'SR',     element: '土', atk: 8,  durability: 8, jobs: ['chancellor','strategist'],    desc: '文官：化解雙陣相剋 +15%' },
    { id: 'w_changgou',  name: '糧倉鉤',     icon: '🌾', rarity: 'R',      element: '土', atk: 10, durability: 7, jobs: ['minister'],                  desc: '糧政：每3回合回血量 +3' },
    // 君王神器（artifact: true）
    { id: 'w_yuxi',      name: '傳國玉璽',   icon: '👑', rarity: 'LEGEND', element: '土', atk: 0,  durability: 99, artifact: true, kingOnly: true, jobs: ['king'], desc: '禦駕親徵：君王受到致命傷害時，反擊源頭 50% 該攻擊的傷害（每場 1 次）' }
  ];

  // ── 防具（偏重生存/格擋）──────────────────────────────────────
  const ARMORS = [
    { id: 'a_jinjia',    name: '黃金鎧',     icon: '🛡️', rarity: 'LEGEND', element: '土', def: 32, durability: 10, jobs: ['king','general','marshal'],   resonance: ['gen_caocao'],    desc: '魏武揮鞭：每回合首次受擊減免 50%' },
    { id: 'a_qilinjia',  name: '麒麟甲',     icon: '🛡️', rarity: 'SSR',    element: '土', def: 26, durability: 10, jobs: ['general','vanguard','marshal'], resonance: ['gen_zhaoyun'],   desc: '長坂雄姿：承受傷害低於 ATK 30% 時無視' },
    { id: 'a_xuantie',   name: '玄鐵戰甲',   icon: '🛡️', rarity: 'SSR',    element: '金', def: 24, durability: 10, jobs: ['general','marshal','vanguard'], desc: '受到火屬性傷害 -25%' },
    { id: 'a_long_pao',  name: '蟠龍戰袍',   icon: '🛡️', rarity: 'SSR',    element: '水', def: 22, durability: 9,  jobs: ['king','chancellor'],          resonance: ['gen_li_shimin'],  desc: '帝王氣度：擔任主公時陣營 +5% HP' },
    { id: 'a_pijia',     name: '皮甲',       icon: '🛡️', rarity: 'SR',     element: '土', def: 14, durability: 7,  jobs: ['general','vanguard','commandant','marshal'], desc: '防禦 +14' },
    { id: 'a_busha',     name: '布衫',       icon: '🛡️', rarity: 'R',      element: '木', def: 8,  durability: 5,  jobs: ['strategist','chancellor','minister'], desc: '防禦 +8，閃避率 +5%' },
    { id: 'a_bujia',     name: '布甲',       icon: '👕', rarity: 'N',      element: '土', def: 5,  durability: 4,  jobs: ['minister','strategist','chancellor'], desc: '基礎防禦 +5' }
  ];

  // ── 坐騎（偏重機制/閃避）──────────────────────────────────────
  const MOUNTS = [
    { id: 'm_chitu',     name: '赤兔馬',     icon: '🐎', rarity: 'LEGEND', element: '火', spd: 30, durability: 8, jobs: ['general','vanguard','king'],     resonance: ['gen_lvbu', 'gen_guanyu'], desc: '日行千里：先手攻擊 +1，每回合 30% 機率閃避' },
    { id: 'm_dilu',      name: '的盧馬',     icon: '🐎', rarity: 'SSR',    element: '木', spd: 22, durability: 8, jobs: ['king','general'],                 resonance: ['gen_liubei'],     desc: '檀溪一躍：HP < 30% 時自動閃避一次（每場 1 次）' },
    { id: 'm_zhuayun',   name: '爪黃飛電',   icon: '🐎', rarity: 'SSR',    element: '金', spd: 20, durability: 8, jobs: ['king','marshal'],                 resonance: ['gen_caocao'],     desc: '受擊後下回合先手' },
    { id: 'm_zhanma',    name: '戰馬',       icon: '🐴', rarity: 'SR',     element: '土', spd: 12, durability: 7, jobs: ['general','vanguard','commandant','marshal'], desc: '速度 +12，閃避率 +8%' },
    { id: 'm_juanma',    name: '駱馬',       icon: '🐴', rarity: 'R',      element: '土', spd: 6,  durability: 5, jobs: ['minister','chancellor','strategist'], desc: '速度 +6' }
  ];

  const ALL_EQUIPMENT = [...WEAPONS, ...ARMORS, ...MOUNTS];
  const EQUIPMENT_BY_ID = ALL_EQUIPMENT.reduce((m, e) => { m[e.id] = e; return m; }, {});

  function getEquipment(id) { return EQUIPMENT_BY_ID[id] || null; }
  function getSlotType(equip) {
    if (!equip) return null;
    if (WEAPONS.includes(equip)) return 'weapon';
    if (ARMORS.includes(equip))  return 'armor';
    if (MOUNTS.includes(equip))  return 'mount';
    return null;
  }
  function cloneEquipment(id) {
    const e = getEquipment(id);
    if (!e) return null;
    return JSON.parse(JSON.stringify(e));
  }
  /** 判斷某職業能否裝備此武器 */
  function jobCanEquip(jobId, equip) {
    if (!equip) return false;
    if (!equip.jobs || equip.jobs.length === 0) return true; // 未限定 = 全職可用
    return equip.jobs.includes(jobId);
  }
  /** 取得職業可用的所有裝備 */
  function listEquipmentsForJob(jobId, slotType) {
    const pool = slotType === 'weapon' ? WEAPONS
               : slotType === 'armor'  ? ARMORS
               : slotType === 'mount'  ? MOUNTS
               : ALL_EQUIPMENT;
    return pool.filter(e => jobCanEquip(jobId, e));
  }

  GameData.JOBS = JOBS;
  GameData.JOB_LIST = JOB_LIST;
  GameData.RARITY = RARITY;
  GameData.WEAPONS = WEAPONS;
  GameData.ARMORS = ARMORS;
  GameData.MOUNTS = MOUNTS;
  GameData.ALL_EQUIPMENT = ALL_EQUIPMENT;
  GameData.getEquipment = getEquipment;
  GameData.getEquipmentSlotType = getSlotType;
  GameData.cloneEquipment = cloneEquipment;
  GameData.jobCanEquip = jobCanEquip;
  GameData.listEquipmentsForJob = listEquipmentsForJob;
})();
