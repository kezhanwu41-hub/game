window.GameData = window.GameData || {};

GameData.advisors = [
  {
    id: 'zhang_liang', name: '張良', faction: '西漢', dynasty: '漢',
    color: '#3498db', bgColor: 'rgba(52,152,219,0.25)',
    description: '漢初三傑之謀聖，運籌帷幄決勝千里，深諳黃老道術，謙遜睿智。',
    passive: {
      name: '謀聖之智',
      desc: '我方所有武將速度+8，每回合有10%機率預見敵方指令'
    },
    activeCmds: [
      {
        id: 'qimou', name: '奇謀', uses: 2, cooldown: 3, currentCooldown: 0,
        desc: '本回合我方武將免疫一切傷害，並反傷25%攻擊力',
        effect: { type: 'shield_turn', reflect: 0.25 }
      },
      {
        id: 'yunzhou', name: '運籌', uses: 1, cooldown: 5, currentCooldown: 0,
        desc: '洞察敵方下回合指令，並為我方選擇最優應對',
        effect: { type: 'predict_next' }
      }
    ],
    ultimateCmd: {
      name: '帷幄決勝',
      desc: '重置我方一名最強武將的所有技能冷卻，並使其立即行動一次',
      effect: { type: 'reset_cooldown_and_act' }
    },
    affinityFactions: ['西漢'],
    affinityBonus: '西漢武將攻擊力額外+10%',
    passiveEffect: { atkMult: 1.0, spdBonus: 8 }
  },
  {
    id: 'jia_xu', name: '賈詡', faction: '曹魏', dynasty: '三國',
    color: '#8e44ad', bgColor: 'rgba(142,68,173,0.25)',
    description: '毒士賈詡，智謀深沉，每計必中，算盡人心，三國最危險的謀士。',
    passive: {
      name: '毒士之謀',
      desc: '敵方軍師技能冷卻+1回合，且敵方每回合有10%機率指令失效'
    },
    activeCmds: [
      {
        id: 'dushi', name: '毒計', uses: 2, cooldown: 3, currentCooldown: 0,
        desc: '對敵方當前武將施加「毒謀」：攻擊力-25%，持續3回合',
        effect: { type: 'atk_debuff', value: 0.25, duration: 3 }
      },
      {
        id: 'lixian', name: '離間', uses: 1, cooldown: 4, currentCooldown: 0,
        desc: '敵方下一名替補武將上場時，其攻擊力-30%（持續2回合）',
        effect: { type: 'debuff_next_general', stat: 'atk', value: 0.30, duration: 2 }
      }
    ],
    ultimateCmd: {
      name: '絕命毒師',
      desc: '對敵方所有武將造成20%最大生命值純粹傷害（無視防禦）',
      effect: { type: 'true_dmg_all', pct: 0.20 }
    },
    affinityFactions: ['曹魏'],
    affinityBonus: '曹魏武將防禦額外+10%',
    passiveEffect: { enemyCooldownPenalty: 1 }
  },
  {
    id: 'pang_tong', name: '龐統', faction: '蜀漢', dynasty: '三國',
    color: '#e74c3c', bgColor: 'rgba(231,76,60,0.25)',
    description: '鳳雛龐統，才識與臥龍齊名，連環計燒赤壁，惜英年早逝。',
    passive: {
      name: '鳳雛謀略',
      desc: '我方佯攻防禦削減效果+10%，我方陣容羈絆效果增強'
    },
    activeCmds: [
      {
        id: 'fengchu', name: '鳳雛之謀', uses: 2, cooldown: 3, currentCooldown: 0,
        desc: '全隊攻擊力+20%，持續2回合',
        effect: { type: 'team_atk_buff', value: 0.20, duration: 2 }
      },
      {
        id: 'lianhuan', name: '連環', uses: 1, cooldown: 4, currentCooldown: 0,
        desc: '鎖定敵方當前武將，使其本回合只能使用「防禦」指令',
        effect: { type: 'force_defend' }
      }
    ],
    ultimateCmd: {
      name: '火攻破敵',
      desc: '對敵方當前武將造成40%最大生命值的火焰傷害，並延燃（每回合10%，持續2回合）',
      effect: { type: 'fire', initDmg: 0.40, dotDmg: 0.10, dotDuration: 2 }
    },
    affinityFactions: ['蜀漢'],
    affinityBonus: '蜀漢武將佯攻效果翻倍',
    passiveEffect: { feintDefDebuffBonus: 0.10 }
  },
  {
    id: 'guo_jia', name: '郭嘉', faction: '曹魏', dynasty: '三國',
    color: '#2ecc71', bgColor: 'rgba(46,204,113,0.25)',
    description: '鬼才郭嘉，才智超群卻英年早逝，曹操痛失右臂，十勝十敗論傳世。',
    passive: {
      name: '鬼才洞察',
      desc: '每3回合自動洞察一次敵方指令，且全隊暴擊傷害+15%'
    },
    activeCmds: [
      {
        id: 'tiance', name: '天策', uses: 2, cooldown: 3, currentCooldown: 0,
        desc: '立即洞察敵方本回合指令，我方自動選擇克制應對',
        effect: { type: 'reveal_and_counter' }
      },
      {
        id: 'tianduying', name: '天妒英才', uses: 1, cooldown: 5, currentCooldown: 0,
        desc: '全隊回復25%最大生命值',
        effect: { type: 'team_heal', pct: 0.25 }
      }
    ],
    ultimateCmd: {
      name: '遺計定乾坤',
      desc: '預先設置：下3回合內，每次敵方使用指令均觸發反制效果',
      effect: { type: 'trap_3turns' }
    },
    affinityFactions: ['曹魏'],
    affinityBonus: '曹魏武將暴擊率+15%',
    passiveEffect: { critDmgBonus: 0.15 }
  },
  {
    id: 'lu_su', name: '魯肅', faction: '東吳', dynasty: '三國',
    color: '#1abc9c', bgColor: 'rgba(26,188,156,0.25)',
    description: '東吳重臣魯肅，聯劉抗曹之策出自其手，寬厚篤實外交第一。',
    passive: {
      name: '孫劉聯盟',
      desc: '每擊敗敵方一名武將，額外回復我方當前武將10%生命；士氣增益閾值降低（65→60）'
    },
    activeCmds: [
      {
        id: 'lianmeng', name: '結盟', uses: 2, cooldown: 3, currentCooldown: 0,
        desc: '我方全隊防禦+20%，持續2回合',
        effect: { type: 'team_def_buff', value: 0.20, duration: 2 }
      },
      {
        id: 'zhongshu', name: '重術', uses: 1, cooldown: 4, currentCooldown: 0,
        desc: '回復我方最低生命武將40%最大生命值，並清除其所有負面效果',
        effect: { type: 'heal_lowest', pct: 0.40, cleanse: true }
      }
    ],
    ultimateCmd: {
      name: '社稷大計',
      desc: '瞬間回復全隊20%生命，士氣+15，且下2回合我方所有傷害減免+20%',
      effect: { type: 'full_team_restore', healPct: 0.20, morale: 15, damageReduct: 0.20, duration: 2 }
    },
    affinityFactions: ['東吳'],
    affinityBonus: '東吳武將每次受傷後回復5%最大生命',
    passiveEffect: { killHealBonus: 0.10 }
  },
  {
    id: 'xun_yu', name: '荀彧', faction: '曹魏', dynasty: '三國',
    color: '#f39c12', bgColor: 'rgba(243,156,18,0.25)',
    description: '王佐之才荀彧，為曹操定天下之策，後因反對稱王而遭冷落，飲藥而死。',
    passive: {
      name: '王佐之才',
      desc: '固守回血效果+10%，且我方武將在場每多存活1回合，全隊屬性+1%（最高+15%）'
    },
    activeCmds: [
      {
        id: 'jinguo', name: '謹固', uses: 3, cooldown: 2, currentCooldown: 0,
        desc: '我方當前武將本回合傷害減免+50%，並回復15%生命',
        effect: { type: 'damage_reduce_heal', damageReduct: 0.50, healPct: 0.15 }
      },
      {
        id: 'wangzuo', name: '王佐', uses: 1, cooldown: 5, currentCooldown: 0,
        desc: '復活我方最近一名戰敗武將，以30%生命重新上場（加入替補序列末位）',
        effect: { type: 'revive', hpPct: 0.30 }
      }
    ],
    ultimateCmd: {
      name: '定策社稷',
      desc: '為我方所有武將提供護盾（抵擋下次50%最大生命傷害），持續至護盾消耗',
      effect: { type: 'shield_all', shieldPct: 0.50 }
    },
    affinityFactions: ['曹魏'],
    affinityBonus: '曹魏武將固守回復效果+20%',
    passiveEffect: { holdHealBonus: 0.10 }
  },
  {
    id: 'fan_zeng', name: '范增', faction: '楚', dynasty: '楚漢',
    color: '#c0392b', bgColor: 'rgba(192,57,43,0.25)',
    description: '亞父范增，項羽首席謀士，七十老翁智謀超群，鴻門宴之計幾乎改寫歷史。',
    passive: {
      name: '亞父之謀',
      desc: '我方強攻傷害+10%，若敵方士氣>70，我方每回合有20%機率降低敵方士氣5點'
    },
    activeCmds: [
      {
        id: 'yafu', name: '亞父之怒', uses: 2, cooldown: 3, currentCooldown: 0,
        desc: '下一次我方強攻必定暴擊（200%傷害），且無視防禦克制',
        effect: { type: 'next_guaranteed_crit', atkMult: 2.0, ignoreCounter: true }
      },
      {
        id: 'hongmen', name: '鴻門計', uses: 1, cooldown: 4, currentCooldown: 0,
        desc: '迫使敵方下回合必須使用強攻，我方預先選擇最優應對',
        effect: { type: 'force_enemy_attack' }
      }
    ],
    ultimateCmd: {
      name: '破陣決殺',
      desc: '對敵方當前武將造成其當前生命值30%的純粹傷害，同時降低其防禦20%（持續3回合）',
      effect: { type: 'true_dmg_pct_current', pct: 0.30, defDebuff: 0.20, duration: 3 }
    },
    affinityFactions: ['楚'],
    affinityBonus: '楚陣武將攻擊力額外+15%',
    passiveEffect: { atkBuff: 0.10 }
  },
  {
    id: 'tian_feng', name: '田豐', faction: '冀', dynasty: '東漢',
    color: '#27ae60', bgColor: 'rgba(39,174,96,0.25)',
    description: '袁紹謀士田豐，剛直不阿，多次進言卻不被採用，可惜報國無門。',
    passive: {
      name: '直諫良策',
      desc: '若我方陣容存在羈絆，所有羈絆效果增強50%；每回合有15%機率預判敵方行動'
    },
    activeCmds: [
      {
        id: 'liangce', name: '良策', uses: 2, cooldown: 3, currentCooldown: 0,
        desc: '立即激活我方所有羈絆效果一次（無視激活條件），並恢復完整激活效果',
        effect: { type: 'force_bond_trigger' }
      },
      {
        id: 'zhongjian', name: '忠諫', uses: 2, cooldown: 2, currentCooldown: 0,
        desc: '清除我方當前武將所有負面狀態，並回復20%生命',
        effect: { type: 'cleanse_heal', healPct: 0.20 }
      }
    ],
    ultimateCmd: {
      name: '決勝千里',
      desc: '分析戰場形勢：若我方士氣>50，全隊攻擊+30%（2回合）；若士氣≤50，全隊防禦+30%（2回合）',
      effect: { type: 'adaptive_buff', atkBuff: 0.30, defBuff: 0.30, duration: 2 }
    },
    affinityFactions: ['冀', '東漢'],
    affinityBonus: '相關陣容防禦額外+12%',
    passiveEffect: { bondAmplify: 0.50 }
  },
  {
    id: 'ju_shou', name: '沮授', faction: '冀', dynasty: '東漢',
    color: '#2c3e50', bgColor: 'rgba(44,62,80,0.25)',
    description: '袁紹謀士沮授，持重明智，官渡之戰前多次勸阻袁紹卻遭忽視，最終被曹操俘虜寧死不降。',
    passive: {
      name: '持重之謀',
      desc: '我方士氣損失效果-50%（所有導致士氣下降的效果減半）；防禦時，每次減免傷害士氣+3'
    },
    activeCmds: [
      {
        id: 'chizhong', name: '持重', uses: 3, cooldown: 2, currentCooldown: 0,
        desc: '我方全隊防禦+25%，持續1回合，且本回合士氣不會下降',
        effect: { type: 'team_def_buff', value: 0.25, duration: 1, moraleShield: true }
      },
      {
        id: 'wenjun', name: '穩軍', uses: 1, cooldown: 5, currentCooldown: 0,
        desc: '士氣+20，並恢復我方全隊20%最大生命值',
        effect: { type: 'morale_and_heal', morale: 20, healPct: 0.20 }
      }
    ],
    ultimateCmd: {
      name: '守如磐石',
      desc: '我方全隊進入「磐石之陣」（2回合）：免疫所有暴擊效果，每回合回復5%生命',
      effect: { type: 'fortify', duration: 2, immuneCrit: true, healPerTurn: 0.05 }
    },
    affinityFactions: ['冀', '東漢'],
    affinityBonus: '相關武將防禦+10%，士氣不下降',
    passiveEffect: { moraleLossReduction: 0.50 }
  },
  {
    id: 'fa_zheng', name: '法正', faction: '蜀漢', dynasty: '三國',
    color: '#d35400', bgColor: 'rgba(211,84,0,0.25)',
    description: '蜀漢謀主法正，奇謀百出，幫助劉備奪取益州，定軍山之役力助黃忠斬殺夏侯淵。',
    passive: {
      name: '謀主奇策',
      desc: '我方暴擊傷害+20%，且我方每次暴擊後下一指令選擇時間+5秒（更多思考時間）'
    },
    activeCmds: [
      {
        id: 'dingzheng', name: '定正', uses: 2, cooldown: 3, currentCooldown: 0,
        desc: '指定敵方一個負面效果，使其立即爆發（翻倍效果，持續時間重置）',
        effect: { type: 'amplify_enemy_debuff', mult: 2.0 }
      },
      {
        id: 'qisu', name: '奇策', uses: 2, cooldown: 3, currentCooldown: 0,
        desc: '我方當前武將本回合攻擊力+40%，且必獲先手',
        effect: { type: 'atk_buff_first', atkBoost: 0.40, forceFirst: true }
      }
    ],
    ultimateCmd: {
      name: '奇謀破陣',
      desc: '分析敵方陣容，對其最薄弱的防禦環節造成260%攻擊力傷害',
      effect: { type: 'exploit_weakness', atkMult: 2.60 }
    },
    affinityFactions: ['蜀漢'],
    affinityBonus: '蜀漢武將被動覺醒效果增強',
    passiveEffect: { critDmgBonus: 0.20 }
  }
];

GameData.getAdvisor = function(id) {
  return GameData.advisors.find(a => a.id === id) || null;
};

GameData.cloneAdvisor = function(id) {
  const a = GameData.getAdvisor(id);
  if (!a) return null;
  const clone = JSON.parse(JSON.stringify(a));
  clone.activeCmds.forEach(cmd => {
    cmd.currentCooldown = 0;
    cmd.usesLeft = cmd.uses;
  });
  clone.ultimateUsed = false;
  return clone;
};
