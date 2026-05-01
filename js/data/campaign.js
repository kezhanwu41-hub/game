window.CampaignEngine = (function() {
  const levels = [
    {
      id: 'lvl1', name: '木之試煉：蜀漢仁義',
      desc: '蜀漢軍隊堅若磐石。敵人屬性：木',
      enemyBuffs: { hp: 1.1, atk: 1.0 }, // +10% HP
      enemyPicks: ['liu_bei', 'guan_yu', 'zhang_fei', 'heal_jungi', 'trap_maifu']
    },
    {
      id: 'lvl2', name: '水之試煉：東吳智謀',
      desc: '江東才俊，智計百出。敵人屬性：水',
      enemyBuffs: { hp: 1.2, atk: 1.1 }, // +20% HP, +10% ATK
      enemyPicks: ['sun_ce', 'zhou_yu', 'lu_xun', 'heal_ganlu', 'trap_yibing']
    },
    {
      id: 'lvl3', name: '金之試煉：曹魏雄風',
      desc: '魏軍鐵騎橫掃千軍。敵人屬性：金',
      enemyBuffs: { hp: 1.3, atk: 1.2 },
      enemyPicks: ['cao_cao', 'sima_yi', 'zhang_liao', 'heal_jinchuang', 'trap_luanjian']
    },
    {
      id: 'lvl4', name: '火之試煉：霸王降世',
      desc: '西楚霸王勢不可擋，破釜沉舟。敵人屬性：火',
      enemyBuffs: { hp: 1.4, atk: 1.4 },
      enemyPicks: ['xiang_yu', 'lu_bu', 'han_xin', 'heal_hupo', 'trap_lijian']
    },
    {
      id: 'lvl5', name: '土之試煉：千古始皇',
      desc: '大秦鐵甲，萬世不拔之基。敵人屬性：土',
      enemyBuffs: { hp: 1.6, atk: 1.5 },
      enemyPicks: ['bai_qi', 'meng_tian', 'xu_da', 'heal_zhiya', 'trap_lianhuo']
    }
  ];

  let currentLevelId = null;

  function loadProgress() {
    const p = localStorage.getItem('heroes_campaign');
    return p ? JSON.parse(p) : { cleared: [] };
  }

  function saveProgress(levelId) {
    const p = loadProgress();
    if (!p.cleared.includes(levelId)) {
      p.cleared.push(levelId);
      localStorage.setItem('heroes_campaign', JSON.stringify(p));
    }
  }

  function getLevel(id) {
    return levels.find(l => l.id === id);
  }

  return { levels, loadProgress, saveProgress, getLevel, currentLevelId };
})();
