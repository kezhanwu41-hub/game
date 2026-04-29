window.GameData = window.GameData || {};

// 五行元素配置由 cards.js 定義
// ─── 元素指派說明 ───
// 木: 蜀漢（仁德生長）
// 火: 西漢英雄 + 楚/呂布（熱烈進攻）
// 土: 秦朝 + 春秋孫武（穩固沉著）
// 金: 曹魏 + 唐（鋒利剛硬）
// 水: 東吳 + 宋 + 明（智謀流動）

GameData.generals = [
  // ═══════════ 蜀漢（木）═══════════
  {
    id: 'liu_bei', name: '劉備', nameEn: 'Liu Bei', dynasty: '三國', faction: '蜀漢',
    element: '木', cardType: 'general', preferredRow: 'back',
    roles: ['主公', '大司農'], hp: 950, maxHp: 950, atk: 78, def: 82, spd: 58,
    rarity: 'epic', color: '#4caf50', bgColor: 'rgba(76,175,80,0.25)',
    description: '蜀漢昭烈帝，仁德寬厚，知人善任。',
    signatureItem: '⚔️ 雙股劍',
    troop: 'infantry',
    weakness: { name: '仁心所累', trigger: 'consecutive_loss',
      effect: { type: 'atk_down', value: 0.15 }, desc: '連失武將時，攻擊力-15%' },
    awakenEffect: { atkBonus: 0.15, defBonus: 0.20, spdBonus: 0, healOnAwaken: 0.20,
      desc: '仁主覺醒：防禦+20%，回復20%生命' },
    specialCmd: null
  },
  {
    id: 'guan_yu', name: '關羽', nameEn: 'Guan Yu', dynasty: '三國', faction: '蜀漢',
    element: '木', cardType: 'general', preferredRow: 'front',
    roles: ['大將軍', '破陣先鋒'], hp: 1100, maxHp: 1100, atk: 112, def: 76, spd: 68,
    rarity: 'epic', color: '#8B0000', bgColor: 'rgba(76,175,80,0.22)',
    description: '武聖關羽，義薄雲天，青龍偃月刀橫掃千軍。',
    signatureItem: '🐉 青龍偃月刀',
    troop: 'cavalry',
    weakness: { name: '傲上輕敵', trigger: 'enemy_feint_twice',
      effect: { type: 'atk_down', value: 0.20 }, desc: '連續被佯攻後，攻擊力-20%' },
    awakenEffect: { atkBonus: 0.25, defBonus: 0.15, spdBonus: 0, healOnAwaken: 0,
      desc: '武聖覺醒：攻擊力+25%，防禦+15%' },
    specialCmd: null
  },
  {
    id: 'zhang_fei', name: '張飛', nameEn: 'Zhang Fei', dynasty: '三國', faction: '蜀漢',
    element: '木', cardType: 'general', preferredRow: 'front',
    roles: ['大將軍', '破陣先鋒'], hp: 1080, maxHp: 1080, atk: 108, def: 72, spd: 62,
    rarity: 'epic', color: '#5c3317', bgColor: 'rgba(76,175,80,0.20)',
    description: '燕人張飛，丈八蛇矛，當陽橋頭一聲喝退曹軍。',
    signatureItem: '🐍 丈八蛇矛',
    troop: 'infantry',
    weakness: { name: '暴躁衝動', trigger: 'own_hp_below_50',
      effect: { type: 'def_down', value: 0.15 }, desc: '血量低於50%時，防禦-15%' },
    awakenEffect: { atkBonus: 0.30, defBonus: 0, spdBonus: 10, healOnAwaken: 0,
      desc: '猛將覺醒：攻擊力+30%，速度+10' },
    specialCmd: null
  },
  {
    id: 'zhuge_liang', name: '諸葛亮', nameEn: 'Zhuge Liang', dynasty: '三國', faction: '蜀漢',
    element: '木', cardType: 'general', preferredRow: 'back',
    roles: ['軍師', '臣相', '大司馬'], hp: 800, maxHp: 800, atk: 88, def: 62, spd: 86,
    rarity: 'legendary', color: '#2c6e8a', bgColor: 'rgba(76,175,80,0.18)',
    description: '臥龍諸葛亮，神機妙算，運籌帷幄決勝千里。',
    signatureItem: '🪶 白羽扇',
    troop: 'strategist',
    weakness: { name: '謹慎多慮', trigger: 'sudden_strike',
      effect: { type: 'cmd_time_reduce', value: 5 }, desc: '遭受奇襲時，決策時間縮短' },
    awakenEffect: { atkBonus: 0.20, defBonus: 0.10, spdBonus: 5, healOnAwaken: 0.15,
      desc: '臥龍覺醒：全屬性提升' },
    specialCmd: {
      id: 'bagua', name: '八陣圖',
      desc: '對敵前排所有武將造成80%攻擊力傷害',
      cooldown: 4, currentCooldown: 0, uses: 2, usesLeft: 2,
      type: 'aoe', atkMult: 0.80, secondaryMult: 0.40
    }
  },
  {
    id: 'zhao_yun', name: '趙雲', nameEn: 'Zhao Yun', dynasty: '三國', faction: '蜀漢',
    element: '木', cardType: 'general', preferredRow: 'front',
    roles: ['大將軍', '行軍總管', '破陣先鋒'], hp: 1020, maxHp: 1020, atk: 102, def: 80, spd: 88,
    rarity: 'epic', color: '#1a5276', bgColor: 'rgba(76,175,80,0.22)',
    description: '常山趙子龍，七進七出，白馬銀槍。',
    signatureItem: '🐉 龍膽亮銀槍',
    troop: 'cavalry',
    weakness: null,
    awakenEffect: { atkBonus: 0.20, defBonus: 0.20, spdBonus: 8, healOnAwaken: 0.10,
      desc: '龍膽覺醒：全屬性+20%，回復10%生命' },
    specialCmd: null
  },

  // ═══════════ 曹魏（金）═══════════
  {
    id: 'cao_cao', name: '曹操', nameEn: 'Cao Cao', dynasty: '三國', faction: '曹魏',
    element: '金', cardType: 'general', preferredRow: 'back',
    roles: ['主公', '軍師', '大司馬'], hp: 920, maxHp: 920, atk: 86, def: 78, spd: 78,
    rarity: 'epic', color: '#7d3c98', bgColor: 'rgba(255,214,0,0.20)',
    description: '魏武帝曹操，挾天子以令諸侯，亂世奸雄。',
    signatureItem: '🗡️ 倚天劍',
    troop: 'cavalry',
    weakness: { name: '多疑陰狠', trigger: 'advisor_skill_used',
      effect: { type: 'def_down', value: 0.10 }, desc: '敵方施技後，防禦-10%' },
    awakenEffect: { atkBonus: 0.18, defBonus: 0.12, spdBonus: 10, healOnAwaken: 0,
      desc: '奸雄覺醒：下一回合必先手' },
    specialCmd: null
  },
  {
    id: 'sima_yi', name: '司馬懿', nameEn: 'Sima Yi', dynasty: '三國', faction: '曹魏',
    element: '金', cardType: 'general', preferredRow: 'back',
    roles: ['軍師', '臣相', '大司馬'], hp: 840, maxHp: 840, atk: 90, def: 68, spd: 80,
    rarity: 'epic', color: '#616161', bgColor: 'rgba(255,214,0,0.18)',
    description: '冢虎司馬懿，深謀遠慮，忍辱負重。',
    signatureItem: '📖 宣王卷軸',
    troop: 'strategist',
    weakness: null,
    awakenEffect: { atkBonus: 0.15, defBonus: 0.15, spdBonus: 0, healOnAwaken: 0,
      desc: '冢虎覺醒：複製敵方30%屬性加成' },
    specialCmd: null
  },
  {
    id: 'zhang_liao', name: '張遼', nameEn: 'Zhang Liao', dynasty: '三國', faction: '曹魏',
    element: '金', cardType: 'general', preferredRow: 'front',
    roles: ['大將軍', '破陣先鋒'], hp: 1040, maxHp: 1040, atk: 106, def: 74, spd: 84,
    rarity: 'rare', color: '#1e8bc3', bgColor: 'rgba(255,214,0,0.18)',
    description: '威震逍遙津，八百破十萬，吳人止小兒夜啼。',
    signatureItem: '🪓 雙鉞',
    troop: 'cavalry',
    weakness: null,
    awakenEffect: { atkBonus: 0.22, defBonus: 0.08, spdBonus: 12, healOnAwaken: 0,
      desc: '逍遙覺醒：速度+12，攻擊力+22%' },
    specialCmd: null
  },
  {
    id: 'dian_wei', name: '典韋', nameEn: 'Dian Wei', dynasty: '三國', faction: '曹魏',
    element: '金', cardType: 'general', preferredRow: 'front',
    roles: ['破陣先鋒'], hp: 1120, maxHp: 1120, atk: 102, def: 92, spd: 52,
    rarity: 'epic', color: '#784212', bgColor: 'rgba(255,214,0,0.20)',
    description: '古之惡來，持雙戟護衛曹操，以一當十。',
    signatureItem: '⚔️ 雙鐵戟',
    troop: 'infantry',
    weakness: null,
    awakenEffect: { atkBonus: 0.15, defBonus: 0.30, spdBonus: 0, healOnAwaken: 0.15,
      desc: '惡來覺醒：防禦+30%，本回合減傷50%' },
    specialCmd: null
  },
  {
    id: 'xiahou_dun', name: '夏侯惇', nameEn: 'Xiahou Dun', dynasty: '三國', faction: '曹魏',
    element: '金', cardType: 'general', preferredRow: 'front',
    roles: ['大將軍', '行軍總管'], hp: 1060, maxHp: 1060, atk: 100, def: 86, spd: 62,
    rarity: 'rare', color: '#6e2f0a', bgColor: 'rgba(255,214,0,0.18)',
    description: '獨眼夏侯惇，拔矢啖睛，百戰餘生。',
    signatureItem: '🏹 麒麟弓',
    troop: 'infantry',
    weakness: null,
    awakenEffect: { atkBonus: 0.20, defBonus: 0.15, spdBonus: 0, healOnAwaken: 0,
      desc: '覺醒：攻擊力+20%，受傷減免+10%' },
    specialCmd: null
  },

  // ═══════════ 東吳（水）═══════════
  {
    id: 'sun_ce', name: '孫策', nameEn: 'Sun Ce', dynasty: '三國', faction: '東吳',
    element: '水', cardType: 'general', preferredRow: 'front',
    roles: ['主公', '大將軍', '破陣先鋒'], hp: 1020, maxHp: 1020, atk: 102, def: 76, spd: 80,
    rarity: 'epic', color: '#117a65', bgColor: 'rgba(66,165,245,0.22)',
    description: '小霸王孫策，勇冠江東，一統揚州。',
    signatureItem: '🔱 霸王槍',
    troop: 'cavalry',
    weakness: null,
    awakenEffect: { atkBonus: 0.25, defBonus: 0.10, spdBonus: 5, healOnAwaken: 0.10,
      desc: '霸王覺醒：攻擊力暴增，全隊士氣+15' },
    specialCmd: null
  },
  {
    id: 'zhou_yu', name: '周瑜', nameEn: 'Zhou Yu', dynasty: '三國', faction: '東吳',
    element: '水', cardType: 'general', preferredRow: 'back',
    roles: ['軍師', '大司馬'], hp: 820, maxHp: 820, atk: 92, def: 64, spd: 86,
    rarity: 'epic', color: '#0e6655', bgColor: 'rgba(66,165,245,0.20)',
    description: '江東都督周公瑾，火燒赤壁破百萬曹軍。',
    signatureItem: '🎸 焦尾琴',
    troop: 'strategist',
    weakness: null,
    awakenEffect: { atkBonus: 0.20, defBonus: 0.10, spdBonus: 10, healOnAwaken: 0,
      desc: '火鳳覺醒：佯攻削防效果翻倍' },
    specialCmd: null
  },
  {
    id: 'taishi_ci', name: '太史慈', nameEn: 'Taishi Ci', dynasty: '三國', faction: '東吳',
    element: '水', cardType: 'general', preferredRow: 'front',
    roles: ['大將軍', '破陣先鋒'], hp: 1000, maxHp: 1000, atk: 104, def: 72, spd: 84,
    rarity: 'rare', color: '#1abc9c', bgColor: 'rgba(66,165,245,0.22)',
    description: '義烈太史慈，弓馬超群江東名將。',
    signatureItem: '🪃 狂歌戟',
    troop: 'archer',
    weakness: null,
    awakenEffect: { atkBonus: 0.22, defBonus: 0.05, spdBonus: 10, healOnAwaken: 0,
      desc: '烈弓覺醒：強攻必暴擊，速度+10' },
    specialCmd: null
  },
  {
    id: 'gan_ning', name: '甘寧', nameEn: 'Gan Ning', dynasty: '三國', faction: '東吳',
    element: '水', cardType: 'general', preferredRow: 'front',
    roles: ['大將軍'], hp: 1040, maxHp: 1040, atk: 110, def: 66, spd: 86,
    rarity: 'rare', color: '#f39c12', bgColor: 'rgba(66,165,245,0.20)',
    description: '錦帆甘寧，百騎劫魏營，勇名震天下。',
    signatureItem: '🔔 錦帆鈴',
    troop: 'cavalry',
    weakness: null,
    awakenEffect: { atkBonus: 0.28, defBonus: 0, spdBonus: 8, healOnAwaken: 0,
      desc: '錦帆覺醒：攻擊力+28%，強攻連擊2次' },
    specialCmd: null
  },
  {
    id: 'lu_xun', name: '陸遜', nameEn: 'Lu Xun', dynasty: '三國', faction: '東吳',
    element: '水', cardType: 'general', preferredRow: 'back',
    roles: ['軍師', '臣相', '大將軍'], hp: 880, maxHp: 880, atk: 88, def: 74, spd: 82,
    rarity: 'epic', color: '#2ecc71', bgColor: 'rgba(66,165,245,0.18)',
    description: '火燒連營陸伯言，夷陵之戰令蜀軍橫屍百里。',
    signatureItem: '📜 儒將劍',
    troop: 'strategist',
    weakness: null,
    awakenEffect: { atkBonus: 0.18, defBonus: 0.12, spdBonus: 0, healOnAwaken: 0,
      desc: '覺醒：佯攻附帶火焰傷害' },
    specialCmd: null
  },

  // ═══════════ 西漢（火）═══════════
  {
    id: 'han_xin', name: '韓信', nameEn: 'Han Xin', dynasty: '漢', faction: '西漢',
    element: '火', cardType: 'general', preferredRow: 'front',
    roles: ['大將軍', '大司馬'], hp: 1000, maxHp: 1000, atk: 106, def: 70, spd: 86,
    rarity: 'epic', color: '#e74c3c', bgColor: 'rgba(239,83,80,0.22)',
    description: '兵仙韓信，明修棧道暗渡陳倉，統兵無雙。',
    signatureItem: '♟️ 兵仙令',
    troop: 'cavalry',
    weakness: null,
    awakenEffect: { atkBonus: 0.20, defBonus: 0.05, spdBonus: 12, healOnAwaken: 0,
      desc: '兵仙覺醒：速度爆發，下回合強攻無視克制' },
    specialCmd: null
  },
  {
    id: 'huo_qubing', name: '霍去病', nameEn: 'Huo Qubing', dynasty: '漢', faction: '西漢',
    element: '火', cardType: 'general', preferredRow: 'front',
    roles: ['大將軍', '行軍總管'], hp: 1020, maxHp: 1020, atk: 114, def: 66, spd: 92,
    rarity: 'legendary', color: '#e67e22', bgColor: 'rgba(239,83,80,0.25)',
    description: '驃騎將軍霍去病，封狼居胥，天縱英才。',
    signatureItem: '🐎 驃騎槍',
    troop: 'cavalry',
    weakness: null,
    awakenEffect: { atkBonus: 0.30, defBonus: 0, spdBonus: 15, healOnAwaken: 0,
      desc: '封狼覺醒：速攻雙重爆發，必先手' },
    specialCmd: {
      id: 'feng_lang', name: '封狼居胥',
      desc: '造成200%攻擊力傷害，下回合跳過行動',
      cooldown: 4, currentCooldown: 0, uses: 2, usesLeft: 2,
      type: 'heavy', atkMult: 2.0, skipNextTurn: true
    }
  },
  {
    id: 'wei_qing', name: '衛青', nameEn: 'Wei Qing', dynasty: '漢', faction: '西漢',
    element: '火', cardType: 'general', preferredRow: 'front',
    roles: ['大將軍', '大司農', '行軍總管'], hp: 980, maxHp: 980, atk: 98, def: 76, spd: 80,
    rarity: 'rare', color: '#c0392b', bgColor: 'rgba(239,83,80,0.20)',
    description: '大將軍衛青，七戰七勝深入漠北，愛護士卒。',
    signatureItem: '🚩 大將軍印',
    troop: 'cavalry',
    weakness: null,
    awakenEffect: { atkBonus: 0.18, defBonus: 0.18, spdBonus: 5, healOnAwaken: 0.10,
      desc: '漠北覺醒：攻防均衡提升，回復10%生命' },
    specialCmd: null
  },

  // ═══════════ 秦朝（土）═══════════
  {
    id: 'bai_qi', name: '白起', nameEn: 'Bai Qi', dynasty: '秦', faction: '秦',
    element: '土', cardType: 'general', preferredRow: 'front',
    roles: ['大將軍', '大司馬', '破陣先鋒'], hp: 1060, maxHp: 1060, atk: 120, def: 76, spd: 76,
    rarity: 'legendary', color: '#2c3e50', bgColor: 'rgba(255,152,0,0.25)',
    description: '殺神白起，長平坑殺四十萬，百戰百勝。',
    signatureItem: '🩸 殺神劍',
    troop: 'infantry',
    weakness: { name: '優勢輕敵', trigger: 'own_hp_above_70',
      effect: { type: 'def_down', value: 0.20 }, desc: '優勢時防禦-20%' },
    awakenEffect: { atkBonus: 0.35, defBonus: 0.10, spdBonus: 0, healOnAwaken: 0,
      desc: '殺神覺醒：攻擊力+35%' },
    specialCmd: {
      id: 'changping', name: '長平決殺',
      desc: '敵血量<40%直接擊殺，否則造成150%傷害',
      cooldown: 5, currentCooldown: 0, uses: 1, usesLeft: 1,
      type: 'execute', threshold: 0.40, atkMult: 1.50
    }
  },
  {
    id: 'meng_tian', name: '蒙恬', nameEn: 'Meng Tian', dynasty: '秦', faction: '秦',
    element: '土', cardType: 'general', preferredRow: 'front',
    roles: ['大將軍', '破陣先鋒'], hp: 1040, maxHp: 1040, atk: 102, def: 86, spd: 68,
    rarity: 'rare', color: '#1a252f', bgColor: 'rgba(255,152,0,0.20)',
    description: '名將蒙恬，率三十萬大軍北擊匈奴，修築萬里長城。',
    signatureItem: '🖌️ 蒙恬筆',
    troop: 'infantry',
    weakness: null,
    awakenEffect: { atkBonus: 0.15, defBonus: 0.25, spdBonus: 0, healOnAwaken: 0.15,
      desc: '長城覺醒：防禦大幅提升' },
    specialCmd: null
  },

  // ═══════════ 楚/獨立（火）═══════════
  {
    id: 'xiang_yu', name: '項羽', nameEn: 'Xiang Yu', dynasty: '楚漢', faction: '楚',
    element: '火', cardType: 'general', preferredRow: 'front',
    roles: ['主公', '大將軍', '破陣先鋒'], hp: 1260, maxHp: 1260, atk: 130, def: 74, spd: 78,
    rarity: 'legendary', color: '#641e16', bgColor: 'rgba(239,83,80,0.28)',
    description: '西楚霸王項羽，力拔山兮氣蓋世，萬夫莫敵。',
    signatureItem: '🔱 霸王戟',
    troop: 'infantry',
    weakness: null,
    awakenEffect: { atkBonus: 0.40, defBonus: 0.20, spdBonus: 5, healOnAwaken: 0.20,
      desc: '霸王覺醒：爆發態，免疫1回合' },
    specialCmd: {
      id: 'pofuchencheng', name: '破釜沉舟',
      desc: '消耗30%HP，攻擊+100%，免疫負效果2回合',
      cooldown: 0, currentCooldown: 0, uses: 1, usesLeft: 1,
      type: 'berserk', hpCost: 0.30, atkBoost: 1.00, immunityTurns: 2
    }
  },
  {
    id: 'lu_bu', name: '呂布', nameEn: 'Lu Bu', dynasty: '三國', faction: '獨立',
    element: '火', cardType: 'general', preferredRow: 'front',
    roles: ['大將軍', '破陣先鋒'], hp: 1220, maxHp: 1220, atk: 132, def: 72, spd: 94,
    rarity: 'legendary', color: '#922b21', bgColor: 'rgba(239,83,80,0.28)',
    description: '人中呂布，馬中赤兔，三國第一猛將。',
    signatureItem: '🔱 方天畫戟',
    troop: 'cavalry',
    weakness: null,
    awakenEffect: { atkBonus: 0.35, defBonus: 0.15, spdBonus: 10, healOnAwaken: 0,
      desc: '戰神覺醒：無視防禦克制' },
    specialCmd: {
      id: 'fang_tian', name: '方天畫戟',
      desc: '無視防禦加成，造成160%穿透傷害',
      cooldown: 3, currentCooldown: 0, uses: 3, usesLeft: 3,
      type: 'pierce', atkMult: 1.60, ignoreDefense: true
    }
  },

  // ═══════════ 唐朝（金）═══════════
  {
    id: 'li_jing', name: '李靖', nameEn: 'Li Jing', dynasty: '唐', faction: '唐',
    element: '金', cardType: 'general', preferredRow: 'front',
    roles: ['軍師', '大將軍', '行軍總管'], hp: 960, maxHp: 960, atk: 98, def: 76, spd: 80,
    rarity: 'epic', color: '#d4ac0d', bgColor: 'rgba(255,214,0,0.22)',
    description: '唐朝軍神李靖，破突厥，六花陣法名垂千古。',
    signatureItem: '🏯 玲瓏塔',
    troop: 'cavalry',
    weakness: null,
    awakenEffect: { atkBonus: 0.20, defBonus: 0.15, spdBonus: 8, healOnAwaken: 0,
      desc: '六花覺醒：後攻傷害+50%' },
    specialCmd: null
  },
  {
    id: 'xue_rengui', name: '薛仁貴', nameEn: 'Xue Rengui', dynasty: '唐', faction: '唐',
    element: '金', cardType: 'general', preferredRow: 'front',
    roles: ['大將軍', '破陣先鋒'], hp: 1040, maxHp: 1040, atk: 110, def: 72, spd: 84,
    rarity: 'rare', color: '#f1c40f', bgColor: 'rgba(255,214,0,0.22)',
    description: '白袍薛仁貴，三箭定天山，萬里壯士橫天下。',
    signatureItem: '🏹 震天弓',
    troop: 'archer',
    weakness: null,
    awakenEffect: { atkBonus: 0.25, defBonus: 0.05, spdBonus: 10, healOnAwaken: 0,
      desc: '白袍覺醒：三箭連射（各60%傷害）' },
    specialCmd: null
  },
  {
    id: 'qin_qiong', name: '秦瓊', nameEn: 'Qin Qiong', dynasty: '唐', faction: '唐',
    element: '金', cardType: 'general', preferredRow: 'front',
    roles: ['大將軍', '行軍總管', '破陣先鋒'], hp: 1060, maxHp: 1060, atk: 106, def: 82, spd: 70,
    rarity: 'rare', color: '#e67e22', bgColor: 'rgba(255,214,0,0.20)',
    description: '門神秦瓊，義氣深重，天下馳名瓦崗好漢。',
    signatureItem: '⚔️ 熟銅鐧',
    troop: 'infantry',
    weakness: null,
    awakenEffect: { atkBonus: 0.18, defBonus: 0.22, spdBonus: 0, healOnAwaken: 0.15,
      desc: '門神覺醒：下回合減傷90%' },
    specialCmd: null
  },

  // ═══════════ 宋（水）═══════════
  {
    id: 'yue_fei', name: '岳飛', nameEn: 'Yue Fei', dynasty: '宋', faction: '宋',
    element: '水', cardType: 'general', preferredRow: 'front',
    roles: ['大將軍', '大司馬', '破陣先鋒'], hp: 1100, maxHp: 1100, atk: 116, def: 80, spd: 78,
    rarity: 'legendary', color: '#1f618d', bgColor: 'rgba(66,165,245,0.25)',
    description: '精忠岳飛，岳家軍所向無敵，精忠報國。',
    signatureItem: '🔱 瀝泉槍',
    troop: 'cavalry',
    weakness: null,
    awakenEffect: { atkBonus: 0.28, defBonus: 0.18, spdBonus: 5, healOnAwaken: 0.25,
      desc: '精忠覺醒：全屬性暴增，士氣+20' },
    specialCmd: {
      id: 'jingzhong', name: '精忠報國',
      desc: '回復30%生命，全隊士氣+20，下一攻必暴擊',
      cooldown: 4, currentCooldown: 0, uses: 2, usesLeft: 2,
      type: 'inspire', healPct: 0.30, moraleBonus: 20
    }
  },
  {
    id: 'di_qing', name: '狄青', nameEn: 'Di Qing', dynasty: '宋', faction: '宋',
    element: '水', cardType: 'general', preferredRow: 'front',
    roles: ['大將軍', '破陣先鋒'], hp: 1040, maxHp: 1040, atk: 104, def: 84, spd: 72,
    rarity: 'rare', color: '#2980b9', bgColor: 'rgba(66,165,245,0.22)',
    description: '面涅將軍狄青，西夏聞名膽寒，身先士卒。',
    signatureItem: '🎭 鬼面具',
    troop: 'infantry',
    weakness: null,
    awakenEffect: { atkBonus: 0.20, defBonus: 0.20, spdBonus: 5, healOnAwaken: 0.10,
      desc: '銅面覺醒：攻防提升，士氣+10' },
    specialCmd: null
  },

  // ═══════════ 明（水）═══════════
  {
    id: 'qi_jiguang', name: '戚繼光', nameEn: 'Qi Jiguang', dynasty: '明', faction: '明',
    element: '水', cardType: 'general', preferredRow: 'front',
    roles: ['大將軍', '破陣先鋒'], hp: 1020, maxHp: 1020, atk: 106, def: 82, spd: 76,
    rarity: 'rare', color: '#7f8c8d', bgColor: 'rgba(66,165,245,0.20)',
    description: '民族英雄戚繼光，戚家軍鴛鴦陣大破倭寇。',
    signatureItem: '🌿 狼筅',
    troop: 'infantry',
    weakness: null,
    awakenEffect: { atkBonus: 0.20, defBonus: 0.20, spdBonus: 5, healOnAwaken: 0,
      desc: '鴛鴦覺醒：連擊效果倍增' },
    specialCmd: null
  },
  {
    id: 'zheng_chenggong', name: '鄭成功', nameEn: 'Zheng Chenggong', dynasty: '明', faction: '明',
    element: '水', cardType: 'general', preferredRow: 'front',
    roles: ['主公', '大將軍', '破陣先鋒'], hp: 980, maxHp: 980, atk: 100, def: 80, spd: 74,
    rarity: 'rare', color: '#16a085', bgColor: 'rgba(66,165,245,0.20)',
    description: '國姓爺鄭成功，驅荷復台，忠義精神萬古流芳。',
    signatureItem: '🗡️ 尚方劍',
    troop: 'navy',
    weakness: null,
    awakenEffect: { atkBonus: 0.18, defBonus: 0.18, spdBonus: 8, healOnAwaken: 0.12,
      desc: '復台覺醒：全屬性提升，必先手' },
    specialCmd: null
  },

  // ═══════════ 春秋/孫武（土）═══════════
  {
    id: 'sun_wu', name: '孫武', nameEn: 'Sun Wu', dynasty: '春秋', faction: '春秋',
    element: '土', cardType: 'general', preferredRow: 'back',
    roles: ['軍師', '大將軍', '大司馬'], hp: 800, maxHp: 800, atk: 86, def: 66, spd: 88,
    rarity: 'legendary', color: '#8e44ad', bgColor: 'rgba(255,152,0,0.22)',
    description: '兵聖孫武，著《孫子兵法》，知己知彼百戰不殆。',
    signatureItem: '📜 孫子兵法',
    troop: 'strategist',
    weakness: null,
    awakenEffect: { atkBonus: 0.15, defBonus: 0.10, spdBonus: 10, healOnAwaken: 0,
      desc: '兵聖覺醒：複製敵方最高屬性' },
    specialCmd: {
      id: 'bingfa', name: '兵法奇謀',
      desc: '洞察敵方本回合指令，自動選擇克制應對',
      cooldown: 3, currentCooldown: 0, uses: 3, usesLeft: 3,
      type: 'counter', auto: true
    }
  },
  // ═══════════ 新增補武將 (v4.0 Expansion) ═══════════
  {
    id: 'ma_chao', name: '馬超', nameEn: 'Ma Chao', dynasty: '蜀漢', faction: '蜀漢',
    element: '金', cardType: 'general', preferredRow: 'front',
    roles: ['大將軍', '行軍總管', '破陣先鋒'], hp: 980, maxHp: 980, atk: 120, def: 75, spd: 95,
    rarity: 'epic', color: '#f1c40f', bgColor: 'rgba(255,214,0,0.25)',
    description: '西涼錦馬超，神威天將軍。',
    signatureItem: '🐎 龍騎尖',
    troop: 'cavalry', weakness: 'infantry',
    awakenEffect: { atkBonus: 0.25, defBonus: -0.10, spdBonus: 15, healOnAwaken: 0, desc: '神威覺醒：攻速狂暴，防禦下降' },
    specialCmd: null
  },
  {
    id: 'huang_zhong', name: '黃忠', nameEn: 'Huang Zhong', dynasty: '蜀漢', faction: '蜀漢',
    element: '木', cardType: 'general', preferredRow: 'back',
    roles: ['破陣先鋒', '大將軍'], hp: 850, maxHp: 850, atk: 125, def: 70, spd: 85,
    rarity: 'rare', color: '#27ae60', bgColor: 'rgba(76,175,80,0.25)',
    description: '百步穿楊，老當益壯。',
    signatureItem: '🏹 寶雕弓',
    troop: 'archer', weakness: 'cavalry',
    awakenEffect: { atkBonus: 0.30, defBonus: 0, spdBonus: 0, healOnAwaken: 0, desc: '烈弓覺醒：攻擊力大幅提升' },
    specialCmd: null
  },
  {
    id: 'guo_jia', name: '郭嘉', nameEn: 'Guo Jia', dynasty: '曹魏', faction: '曹魏',
    element: '水', cardType: 'general', preferredRow: 'back',
    roles: ['軍師', '臣相'], hp: 700, maxHp: 700, atk: 80, def: 60, spd: 80,
    rarity: 'epic', color: '#2980b9', bgColor: 'rgba(66,165,245,0.25)',
    description: '才策謀略，世之奇士。',
    signatureItem: '🍶 鬼謀樽',
    troop: 'infantry', weakness: 'cavalry',
    awakenEffect: { atkBonus: 0, defBonus: 0, spdBonus: 0, healOnAwaken: 0.30, desc: '遺計：回復全隊生命值' },
    specialCmd: null
  },
  {
    id: 'zhang_liang', name: '張良', nameEn: 'Zhang Liang', dynasty: '西漢', faction: '西漢',
    element: '水', cardType: 'general', preferredRow: 'back',
    roles: ['軍師', '臣相'], hp: 750, maxHp: 750, atk: 85, def: 65, spd: 90,
    rarity: 'legendary', color: '#42a5f5', bgColor: 'rgba(66,165,245,0.25)',
    description: '運籌帷幄之中，決勝千里之外。',
    signatureItem: '📜 太公兵法',
    troop: 'infantry', weakness: 'cavalry',
    awakenEffect: { atkBonus: 0.15, defBonus: 0.15, spdBonus: 10, healOnAwaken: 0, desc: '運籌覺醒：強化友軍全體' },
    specialCmd: null
  },
  {
    id: 'yuchi_gong', name: '尉遲恭', nameEn: 'Yuchi Gong', dynasty: '唐', faction: '唐',
    element: '金', cardType: 'general', preferredRow: 'front',
    roles: ['大將軍', '破陣先鋒'], hp: 1100, maxHp: 1100, atk: 105, def: 95, spd: 70,
    rarity: 'epic', color: '#f39c12', bgColor: 'rgba(255,214,0,0.25)',
    description: '凌煙閣功臣，門神之威。',
    signatureItem: '⚔️ 雌雄雙鞭',
    troop: 'infantry', weakness: 'archer',
    awakenEffect: { atkBonus: 0.10, defBonus: 0.30, spdBonus: -5, healOnAwaken: 0.1, desc: '門神：防禦力巨幅提升' },
    specialCmd: null
  },
  {
    id: 'cheng_yaojin', name: '程咬金', nameEn: 'Cheng Yaojin', dynasty: '唐', faction: '唐',
    element: '土', cardType: 'general', preferredRow: 'front',
    roles: ['破陣先鋒'], hp: 1050, maxHp: 1050, atk: 110, def: 80, spd: 65,
    rarity: 'rare', color: '#e67e22', bgColor: 'rgba(255,152,0,0.25)',
    description: '混世魔王，三板斧。',
    signatureItem: '🪓 八卦宣花斧',
    troop: 'infantry', weakness: 'archer',
    awakenEffect: { atkBonus: 0.20, defBonus: -0.10, spdBonus: 0, healOnAwaken: 0, desc: '三板斧：攻擊爆發' },
    specialCmd: null
  },
  {
    id: 'wang_yangming', name: '王陽明', nameEn: 'Wang Yangming', dynasty: '明', faction: '明',
    element: '火', cardType: 'general', preferredRow: 'back',
    roles: ['軍師', '大司農'], hp: 800, maxHp: 800, atk: 95, def: 75, spd: 85,
    rarity: 'legendary', color: '#e74c3c', bgColor: 'rgba(239,83,80,0.25)',
    description: '知行合一，立德立功立言。',
    signatureItem: '🏮 心學典',
    troop: 'infantry', weakness: 'cavalry',
    awakenEffect: { atkBonus: 0.20, defBonus: 0.20, spdBonus: 0, healOnAwaken: 0.15, desc: '知行合一：全屬性提升並回血' },
    specialCmd: null
  },
  {
    id: 'yang_ye', name: '楊業', nameEn: 'Yang Ye', dynasty: '宋', faction: '宋',
    element: '火', cardType: 'general', preferredRow: 'front',
    roles: ['大將軍', '行軍總管'], hp: 1000, maxHp: 1000, atk: 115, def: 85, spd: 75,
    rarity: 'epic', color: '#c0392b', bgColor: 'rgba(239,83,80,0.25)',
    description: '楊老令公，威名震遼。',
    signatureItem: '🗡️ 金刀',
    troop: 'infantry', weakness: 'cavalry',
    awakenEffect: { atkBonus: 0.15, defBonus: 0.15, spdBonus: 5, healOnAwaken: 0, desc: '無敵將軍：攻防一體' },
    specialCmd: null
  },
  {
    id: 'xu_da', name: '徐達', nameEn: 'Xu Da', dynasty: '明', faction: '明',
    element: '土', cardType: 'general', preferredRow: 'front',
    roles: ['大將軍', '臣相'], hp: 1080, maxHp: 1080, atk: 110, def: 90, spd: 70,
    rarity: 'epic', color: '#d35400', bgColor: 'rgba(255,152,0,0.25)',
    description: '明朝開國第一功臣。',
    signatureItem: '🛡️ 魏國公印',
    troop: 'infantry', weakness: 'archer',
    awakenEffect: { atkBonus: 0.10, defBonus: 0.20, spdBonus: 0, healOnAwaken: 0.10, desc: '萬里長城：防禦大幅提升' },
    specialCmd: null
  },
  {
    id: 'diao_chan', name: '貂蟬', nameEn: 'Diao Chan', dynasty: '群雄', faction: '群雄',
    element: '水', cardType: 'general', preferredRow: 'back',
    roles: ['大司農'], hp: 650, maxHp: 650, atk: 70, def: 55, spd: 90,
    rarity: 'epic', color: '#9b59b6', bgColor: 'rgba(66,165,245,0.25)',
    description: '閉月羞花，連環計。',
    signatureItem: '🌸 閉月花',
    troop: 'infantry', weakness: 'cavalry',
    awakenEffect: { atkBonus: 0.10, defBonus: 0, spdBonus: 20, healOnAwaken: 0, desc: '連環計：閃避敵方致命一擊' },
    specialCmd: null
  },
  {
    id: 'li_shimin', name: '李世民', nameEn: 'Li Shimin', dynasty: '唐', faction: '唐',
    element: '火', cardType: 'general', preferredRow: 'back',
    roles: ['主公', '大將軍', '大司馬'], hp: 1000, maxHp: 1000, atk: 110, def: 85, spd: 90,
    rarity: 'legendary', color: '#e74c3c', bgColor: 'rgba(239,83,80,0.25)',
    description: '天可汗，貞觀之治。',
    signatureItem: '🏹 彤弓',
    troop: 'cavalry', weakness: 'infantry',
    awakenEffect: { atkBonus: 0.15, defBonus: 0.15, spdBonus: 10, healOnAwaken: 0.2, desc: '天可汗：全軍大振，恢復生命' },
    specialCmd: null
  },
  {
    id: 'zhu_yuanzhang', name: '朱元璋', nameEn: 'Zhu Yuanzhang', dynasty: '明', faction: '明',
    element: '土', cardType: 'general', preferredRow: 'back',
    roles: ['主公', '破陣先鋒'], hp: 1150, maxHp: 1150, atk: 95, def: 100, spd: 70,
    rarity: 'legendary', color: '#d35400', bgColor: 'rgba(255,152,0,0.25)',
    description: '開局一個碗，洪武大帝。',
    signatureItem: '🏮 洪武大鐘',
    troop: 'infantry', weakness: 'cavalry',
    awakenEffect: { atkBonus: 0, defBonus: 0.3, spdBonus: 0, healOnAwaken: 0.3, desc: '驅除韃虜：獲得超強護盾效應' },
    specialCmd: null
  },
  {
    id: 'zhao_kuangyin', name: '趙匡胤', nameEn: 'Zhao Kuangyin', dynasty: '宋', faction: '宋',
    element: '木', cardType: 'general', preferredRow: 'front',
    roles: ['主公', '破陣先鋒'], hp: 950, maxHp: 950, atk: 105, def: 85, spd: 80,
    rarity: 'legendary', color: '#27ae60', bgColor: 'rgba(76,175,80,0.25)',
    description: '杯酒釋兵權，太祖長拳。',
    signatureItem: '👊 盤龍棍',
    troop: 'infantry', weakness: 'cavalry',
    awakenEffect: { atkBonus: 0.2, defBonus: 0.1, spdBonus: 5, healOnAwaken: 0, desc: '黃袍加身：大幅強化戰鬥力' },
    specialCmd: null
  },
  {
    id: 'hua_mulan', name: '花木蘭', nameEn: 'Hua Mulan', dynasty: '北魏', faction: '北魏',
    element: '水', cardType: 'general', preferredRow: 'front',
    roles: ['行軍總管', '破陣先鋒'], hp: 900, maxHp: 900, atk: 115, def: 80, spd: 95,
    rarity: 'epic', color: '#8e44ad', bgColor: 'rgba(66,165,245,0.25)',
    description: '代父從軍，巾幗不讓鬚眉。',
    signatureItem: '🗡️ 繡花劍',
    troop: 'cavalry', weakness: 'infantry',
    awakenEffect: { atkBonus: 0.2, defBonus: 0.2, spdBonus: 20, healOnAwaken: 0, desc: '木蘭辭：如風馳電掣的攻防' },
    specialCmd: null
  },
  {
    id: 'sun_quan', name: '孫權', nameEn: 'Sun Quan', dynasty: '東吳', faction: '東吳',
    element: '木', cardType: 'general', preferredRow: 'back',
    roles: ['主公', '臣相'], hp: 850, maxHp: 850, atk: 85, def: 75, spd: 85,
    rarity: 'epic', color: '#2ecc71', bgColor: 'rgba(76,175,80,0.25)',
    description: '生子當如孫仲謀，江東之虎子。',
    signatureItem: '🐯 紫髯',
    troop: 'navy', weakness: 'archer',
    awakenEffect: { atkBonus: 0.1, defBonus: 0.1, spdBonus: 10, healOnAwaken: 0.1, desc: '制霸江東：水戰無敵' },
    specialCmd: null
  },
  {
    id: 'hua_tuo', name: '華佗', nameEn: 'Hua Tuo', dynasty: '東漢', faction: '群雄',
    element: '木', cardType: 'general', preferredRow: 'back',
    roles: ['大司農'], hp: 600, maxHp: 600, atk: 50, def: 50, spd: 100,
    rarity: 'epic', color: '#1abc9c', bgColor: 'rgba(76,175,80,0.25)',
    description: '神醫再世，刮骨療毒。',
    signatureItem: '⚕️ 青囊書',
    troop: 'infantry', weakness: 'cavalry',
    awakenEffect: { atkBonus: 0, defBonus: 0, spdBonus: 0, healOnAwaken: 0.8, desc: '懸壺濟世：極大幅度恢復' },
    specialCmd: null
  },
  {
    id: 'pang_tong', name: '龐統', nameEn: 'Pang Tong', dynasty: '蜀漢', faction: '蜀漢',
    element: '火', cardType: 'general', preferredRow: 'back',
    roles: ['軍師'], hp: 700, maxHp: 700, atk: 85, def: 55, spd: 80,
    rarity: 'epic', color: '#e67e22', bgColor: 'rgba(239,83,80,0.25)',
    description: '鳳雛一出，誰與爭鋒。',
    signatureItem: '🦅 鳳凰羽',
    troop: 'infantry', weakness: 'cavalry',
    awakenEffect: { atkBonus: 0.25, defBonus: -0.2, spdBonus: 10, healOnAwaken: 0, desc: '連環火刃：絕命的極限輸出' },
    specialCmd: null
  },
  {
    id: 'jia_xu', name: '賈詡', nameEn: 'Jia Xu', dynasty: '曹魏', faction: '曹魏',
    element: '水', cardType: 'general', preferredRow: 'back',
    roles: ['軍師', '臣相'], hp: 680, maxHp: 680, atk: 75, def: 60, spd: 85,
    rarity: 'epic', color: '#34495e', bgColor: 'rgba(66,165,245,0.25)',
    description: '亂武毒士，算無遺策。',
    signatureItem: '🕷️ 毒士簡',
    troop: 'infantry', weakness: 'cavalry',
    awakenEffect: { atkBonus: 0.1, defBonus: 0, spdBonus: 15, healOnAwaken: 0, desc: '算無遺策：大幅提升我軍閃避速度' },
    specialCmd: null
  },
  {
    id: 'dong_zhuo', name: '董卓', nameEn: 'Dong Zhuo', dynasty: '群雄', faction: '群雄',
    element: '土', cardType: 'general', preferredRow: 'front',
    roles: ['大將軍', '破陣先鋒'], hp: 1200, maxHp: 1200, atk: 90, def: 85, spd: 50,
    rarity: 'epic', color: '#7f8c8d', bgColor: 'rgba(255,152,0,0.25)',
    description: '魔王亂世，權傾朝野。',
    signatureItem: '👹 郿塢金',
    troop: 'cavalry', weakness: 'archer',
    awakenEffect: { atkBonus: 0.2, defBonus: -0.1, spdBonus: -10, healOnAwaken: 0.2, desc: '魔王降臨：殘暴吸血' },
    specialCmd: null
  },
  {
    id: 'yuan_shao', name: '袁紹', nameEn: 'Yuan Shao', dynasty: '群雄', faction: '群雄',
    element: '金', cardType: 'general', preferredRow: 'back',
    roles: ['主公', '大將軍'], hp: 950, maxHp: 950, atk: 100, def: 80, spd: 75,
    rarity: 'epic', color: '#f1c40f', bgColor: 'rgba(255,214,0,0.25)',
    description: '四世三公，河北霸主。',
    signatureItem: '👑 思召劍',
    troop: 'infantry', weakness: 'cavalry',
    awakenEffect: { atkBonus: 0.1, defBonus: 0.1, spdBonus: 0, healOnAwaken: 0.1, desc: '霸主號令：全軍穩紮穩打' },
    specialCmd: null
  }
];

GameData.getGeneral = function(id) {
  return GameData.generals.find(g => g.id === id) || null;
};

GameData.cloneGeneral = function(id) {
  const g = GameData.getGeneral(id);
  if (!g) return null;
  const clone = JSON.parse(JSON.stringify(g));
  clone.currentHp = clone.maxHp;
  clone.effects = [];
  clone.awakened = false;
  clone.turnsSurvived = 0;
  clone.immuneThisTurn = false;
  if (clone.specialCmd) {
    clone.specialCmd.usesLeft = clone.specialCmd.uses;
    clone.specialCmd.currentCooldown = 0;
  }
  return clone;
};
