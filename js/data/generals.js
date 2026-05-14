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

// ── 武將生平故事 ──────────────────────────────────────────────
GameData.generalStories = {
  liu_bei:
    '劉備，字玄德，漢景帝之後，幼時家道中落，以販履織席為生。黃巾之亂起，與關羽、張飛桃園結義，共謀匡扶漢室。三顧茅廬請得諸葛亮出山，取荊州、入益州，終於公元221年稱帝，建立蜀漢，年號章武。夷陵之戰大敗，憂憤而逝，臨終將幼主劉禪託付諸葛亮，遺言「勿以惡小而為之，勿以善小而不為」，仁德之名流芳千古。',
  guan_yu:
    '關羽，字雲長，河東解良人，少年犯事出逃，後遇劉備共謀大業。以義薄雲天著稱，過五關斬六將、千里走單騎護送嫂嫂歸蜀，忠義精神震動天地。溫酒斬華雄、斬顏良文醜，威震華夏。攻樊城時水淹七軍，迫曹操幾欲遷都。然荊州失守，呂蒙白衣渡江，關羽父子被擒於麥城，從容就義，身後被尊奉為「武聖」，萬世香火不絕。',
  zhang_fei:
    '張飛，字益德，涿郡人，以屠宰為業，後與劉備、關羽桃園結義。性格豪烈，長坂坡一聲怒喝令曹軍膽寒，橋樑震動，數萬大軍望風而退。攻打蜀地時設計擒夏侯淵部將，屢建奇功。然性情暴躁，常鞭笞士卒，終為部下范強、張達所殺，首級被送往東吳，令蜀漢痛失一員虎將。',
  zhuge_liang:
    '諸葛亮，字孔明，號臥龍，琅琊陽都人。隱居隆中，自比管仲樂毅，劉備三顧茅廬方才出山輔佐。赤壁之戰借東風助周瑜火燒曹軍，奠定三分天下格局。繼劉備薨逝後，以丞相身分六出祁山北伐中原，事必躬親，鞠躬盡瘁，終積勞成疾，病逝五丈原，享年五十四歲。臨終囑託錦囊妙計，後世尊為智慧化身，《出師表》千古傳誦。',
  zhao_yun:
    '趙雲，字子龍，常山真定人，初投公孫瓚，後歸劉備麾下。長坂坡之戰，單騎七進七出曹軍陣中，救出幼主阿斗，身中數槍而面不改色，令曹操嘖嘖稱奇不忍加害。一生忠勇，晚年仍主動請纓北伐，年近七旬依然英勇，被後世譽為「常勝將軍」。去世後追諡順平侯，千餘年來始終是民間心目中忠勇無雙的完美武將形象。',
  cao_cao:
    '曹操，字孟德，沛國譙縣人，出身宦官之家卻胸懷大志。黃巾亂後趁機崛起，迎漢獻帝至許都，以「挾天子以令諸侯」掌握政治主導權。官渡之戰以少勝多大敗袁紹，統一北方。赤壁之戰敗於孫劉聯軍，退回北方後改以文治為重，唯才是用，廣納人才。晚年封魏王，加九錫，卻始終未正式稱帝，去世後由其子曹丕稱帝，追諡武皇帝。其詩文慷慨激昂，為建安文學之代表。',
  sima_yi:
    '司馬懿，字仲達，河內溫縣人，初不願仕曹，後被強徵入仕。以深謀遠慮著稱，多次識破諸葛亮北伐之計，堅守不出令蜀軍糧盡而退，最終以「拖」字訣耗死對手。高平陵之變乘機奪取曹魏大權，盡誅曹爽一黨，將政權納入司馬氏之手。雖終生以魏臣自居，但其孫司馬炎最終篡魏建晉，奠定了司馬家族三百年帝業的基礎。',
  zhang_liao:
    '張遼，字文遠，雁門馬邑人，早年為呂布部將，呂布死後歸降曹操。逍遙津之戰以八百精兵突擊孫權十萬大軍，令江東聞「張遼」之名而膽寒，吳人甚至以「張遼來了」嚇止小兒夜啼。屢立奇功，被曹操封為前將軍，與樂進、于禁、張郃、徐晃並稱「五子良將」。晚年帶病出征，仍力斬孫盛，威名不墜，最終病卒於江都。',
  dian_wei:
    '典韋，陳留己吾人，力大無窮，好持雙鐵戟，人稱「古之惡來」。初為張邈部曲，後被曹操收入麾下，成為其最忠實的護衛。宛城之戰，張繡夜間叛亂，典韋以身護主，於帳前獨擋叛軍。雙戟被盜後徒手拎人作武器，身中數十矛而猶站立不倒，口中大罵不止，直至斷氣方才落地。曹操後來痛哭「吾失子脩（長子）、典韋，深為痛惜」，以英雄之禮厚葬之。',
  xiahou_dun:
    '夏侯惇，字元讓，沛國譙縣人，與曹操為同族，是曹操最早的忠實部將之一。征戰多年，眼部中箭後拔矢啖睛，高呼「父精母血，不可棄也！」，英雄氣概震撼三軍。雖戰績不如五子良將顯赫，但始終是曹操身側最信任的屏障。被封為大將軍，是曹魏陣營中絕對的核心將領，去世後諡號「忠侯」。',
  sun_ce:
    '孫策，字伯符，孫堅長子，人稱「小霸王」。父孫堅戰死後，孫策以父親留下的傳國玉璽向袁術換取兵馬，渡江征討江東，以少勝多，短短數年間掃平江東六郡八十一州，建立東吳基業。勇冠三軍，所向披靡，然因輕敵獨出而遭刺客射傷，傷重不治，年僅二十六歲便英年早逝，臨終將江東大業託付弟弟孫權。',
  zhou_yu:
    '周瑜，字公瑾，廬江舒縣人，出身名門，儀表堂堂，精通音律，有「曲有誤，周郎顧」之美談。與孫策相交甚篤，孫策死後輔佐孫權。赤壁之戰聯合劉備，以火攻之計大破曹操八十三萬大軍，奠定三國鼎立格局，此役被後世視為中國歷史上最著名的以少勝多戰役之一。後天妒英才，周瑜年僅三十六歲便病逝於出征途中，蘇軾有詞「羽扇綸巾，談笑間，檣櫓灰飛煙滅」以頌其風采。',
  taishi_ci:
    '太史慈，字子義，東萊黃縣人，少有大志，弓馬超群。初為劉繇效力，後投孫策，深得重用。北海之圍時，單騎衝出重圍求援，往返七百里而毫髮無傷，義膽忠心天下傳頌。與孫策一對一單挑，兩人打得難分難解，孫策奪其短戟，太史慈奪孫策頭盔，並非敗北，此後引以為傳奇佳話。晚年率軍守衛合肥，病逝前仍感嘆「大丈夫生於亂世，應以七尺之軀立功於疆場，我生未竟，奈何死乎！」',
  gan_ning:
    '甘寧，字興霸，巴郡臨江人，早年為錦帆盜，橫行長江，所到之處無不聞風喪膽。後歸東吳，屢立奇功，尤以百騎劫魏營最為傳奇——夜率百名騎兵衝入曹操大營，鳴鼓呼喊，縱橫馳騁，安然返回，無一傷亡，令曹操大驚。孫權讚曰「孟德有張遼，孤有甘興霸，足相敵也。」凌統與其有殺父之仇，二人恩怨一生，最終化解於沙場並肩作戰。',
  lu_xun:
    '陸遜，字伯言，吳郡吳縣人，出身名門，文武兼備。以儒生形象示人，其實深藏韜略。呂蒙去世後接任大都督，面對劉備傾全國之力的夷陵復仇之戰，陸遜堅壁清野、以逸待勞，趁蜀軍連營七百里立足未穩之際火燒連營，令蜀軍全線崩潰，蜀漢精銳幾乎喪盡。此後陸遜繼續輔佐孫權，成為東吳最重要的軍政支柱，晚年遭孫權猜忌，在憂憤中去世，令後人惋嘆。',
  han_xin:
    '韓信，淮陰人，早年忍受胯下之辱，一身本事無處施展，幾近潦倒。後得蕭何月下追韓信，拜為大將軍，方才一展所長。明修棧道暗渡陳倉奇襲關中，背水一戰以三萬敗趙軍二十萬，多多益善用兵如神，滅魏、取代、破趙、降燕、定齊，為劉邦奠定天下。然兔死狗烹，功高震主，被呂后設計誅殺，夷三族，臨死仍悔恨「恨不用蒯通之計」，一代兵仙就此殞落。',
  huo_qubing:
    '霍去病，河東平陽人，衛青之甥，天資奇才，十七歲初次出征便以八百騎斬獲匈奴兩千餘人。兩次河西之戰奪取河西走廊，使匈奴哀歌「失我祁連山，使我六畜不蕃息；失我焉支山，使我嫁婦無顏色」。封狼居胥，飲馬瀚海，將漢朝版圖推向前所未有的廣度。生活奢靡，不拘小節，漢武帝為其建造豪宅，他卻說「匈奴未滅，何以家為」。二十四歲即英年早逝，令天下同悲。',
  wei_qing:
    '衛青，字仲卿，平陽人，出身奴僕，因姐姐衛子夫得漢武帝寵愛而入仕。首戰奇襲龍城，打破漢朝對匈奴「只守不攻」的百年慣例，一戰成名。七次出征匈奴，無一敗績，收復河南地（今河套地區），解除匈奴對漢朝心腹之患。為人謙遜低調，不結黨營私，廣受士卒愛戴，去世後與霍去病同葬茂陵，彪炳千秋。',
  bai_qi:
    '白起，眉縣人，秦昭王時期最重要的將領，因戰功卓著被封為武安君。一生大小七十餘戰，從無敗績，消滅六國有生力量逾百萬，人稱「殺神」。長平之戰坑殺趙軍降卒四十萬，此舉雖引天下震恐，卻大大削弱趙國國力。晚年因不願出兵攻趙，與丞相范雎結怨，遭秦昭王賜劍自刎。臨死嘆曰「我固當死。長平之戰，趙卒降者數十萬人，我詐而盡阬之，是足以死。」一代戰神就此隕落。',
  meng_tian:
    '蒙恬，齊國人，秦始皇統一六國的得力大將。率三十萬大軍北擊匈奴，將其驅逐出河套地區，並築萬里長城以固邊防，十餘年鎮守邊疆使匈奴不敢南下。傳說蒙恬以兔毛改良毛筆，促進文字書寫藝術發展，後世奉為筆祖。秦始皇病逝後，趙高與胡亥矯詔賜死蒙恬，其含冤仰天長嘆：「我何罪於天，竟無過而死乎？」遂服毒自盡，忠烈千古。',
  xiang_yu:
    '項羽，字羽，楚國名將項燕之孫，力能扛鼎，勇冠三軍。鉅鹿之戰破釜沉舟，以數萬楚軍大破秦軍四十萬，威震天下，被諸侯奉為霸王。分封天下後與劉邦展開楚漢相爭，初期屢戰屢勝，然剛愎自用，不納謀士之言，鴻門宴放走劉邦成為一大遺憾。垓下之圍四面楚歌，虞姬自刎，項羽率八百騎突圍，最終在烏江邊拒絕渡江，說「縱江東父兄憐而王我，我何面目見之」，自刎於烏江，年三十一歲，留下「力拔山兮氣蓋世」的千古悲歌。',
  lu_bu:
    '呂布，字奉先，五原郡人，武藝天下第一，人稱「人中呂布，馬中赤兔」。初事丁原，後受董卓唆使殺丁原歸董卓，又因王允美人計貂蟬而弒董卓，天下人皆以「三姓家奴」諷之。武藝超群，但謀略不足，不聽謀士之言，先後依附袁術、袁紹，最終佔據徐州。曹操圍下邳，部將侯成、宋憲、魏續相繼叛變，呂布被縛，請曹操饒命，然劉備一言「公不見丁建陽、董卓之事乎？」，呂布隨即被縊殺，含恨而終。',
  li_jing:
    '李靖，字藥師，雍州三原人，唐初最傑出的軍事家。年輕時拜見隋朝名將韓擒虎，韓稱其「可與論孫吳之術者，惟此人耳」。助李淵起兵後屢建奇功，滅東突厥之戰輕騎急進，於夜間奇襲頡利可汗牙帳，一戰俘獲可汗，解除北方威脅。後又平定吐谷渾，威名震懾四方。精研《六花陣》兵法，著有《李衛公兵法》，被後世奉為兵學聖典，民間傳說其為托塔天王李靖的原型。',
  xue_rengui:
    '薛仁貴，名禮，字仁貴，絳州龍門人，出身貧寒卻胸懷大志。從軍後憑本事一路晉升，身著白袍衝鋒陷陣，在戰場上格外醒目。三箭定天山，喝令鐵勒九姓俯首請降，萬人部族感嘆「將軍三箭定天山，壯士長歌入漢關」。征遼東、討吐蕃，屢立戰功，晚年雖曾遭貶，仍在天山再次大敗突厥，威名震懾邊疆，成為大唐軍威的象徵。',
  qin_qiong:
    '秦瓊，字叔寶，齊州歷城人，隋末唐初名將，瓦崗軍中的核心戰將之一。武藝精湛，尤擅馬上功夫，所用兵器為熟銅鐧，人稱「賽專諸、似孟嘗，神拳太保、雙鐧大將」。曾在萬軍之中陣前挑戰，單騎敗敵，威震隋唐。後輔佐李世民，參與多次征討，玄武門之變時也在場。晚年身體虛弱，對人說「吾少長戎馬，所經二百餘陣，屢中重傷，計吾前後出血亦數斛矣，安得不病乎？」去世後被列入凌煙閣二十四功臣，並與尉遲恭同被後世奉為門神。',
  yue_fei:
    '岳飛，字鵬舉，相州湯陰人，精忠報國四字由其母親刺於背上。南宋時率岳家軍抗擊金兵，百戰百勝，將金兀朮打得節節敗退，金人哀嘆「撼山易，撼岳家軍難」。眼看收復失地指日可待，卻被秦檜以十二道金牌召回，以「莫須有」之罪下獄，與子岳雲及部將張憲同遭殺害，年僅三十九歲。千古奇冤引天下同憤，後昭雪平反，追諡武穆王。西湖岳廟至今香火鼎盛，秦檜夫婦跪像千年受世人唾棄。',
  di_qing:
    '狄青，字漢臣，汾州西河人，出身低微，因犯事被刺字於臉，以配軍身份從軍。憑藉勇敢善戰，在對西夏作戰中屢立戰功，每逢出陣必披散頭髮、戴銅面具，令敵人望而生畏，軍中稱「面涅將軍」。平定儂智高叛亂後官至樞密使，成為北宋最高軍事長官。然而身為武人，始終受文官集團壓制，歐陽修等人多次上書要求貶謫，狄青遭罷黜後鬱鬱而終，令人扼腕。',
  qi_jiguang:
    '戚繼光，字元敬，定遠人，明朝抗倭名將。年輕時立志「封侯非我意，但願海波平」。親自訓練戚家軍，發明鴛鴦陣陣法，以十一人為一組，長短兵器相互配合，克制倭寇慣用打法，多次大敗倭寇，殲滅萬計。後調守薊鎮，加固長城防禦，整飭北方邊防，使蒙古不敢輕易南侵。晚年遭政敵打壓，晚景淒涼，在貧病交加中去世，是中華民族抵抗外侮的重要象徵。',
  zheng_chenggong:
    '鄭成功，本名森，字明儼，號大木，福建南安人，父鄭芝龍為海上霸主。明亡後以「抗清復明」為志，聚兵金廈抵抗清軍。1661年率艦隊二萬五千人，從荷蘭殖民者手中收復台灣，結束荷蘭在台灣三十八年的統治，是中華民族歷史上重要的海上英雄。次年因病去世，年僅三十九歲，骨氣凜然，後世尊為「開台聖王」，台灣至今仍有眾多廟宇祭祀紀念。',
  sun_wu:
    '孫武，字長卿，齊國人，中國古代最偉大的軍事家。其著作《孫子兵法》共十三篇，五千餘言，涵蓋用兵、謀略、外交、情報等方方面面，被譽為「兵學聖典」，至今仍是全球軍校必讀教材。曾以吳王宮女示範操練以明軍紀，斬殺兩名妃嬪以樹威信，令吳王大驚。輔助吳王闔閭破楚，攻入楚都郢城。後功成身退，隱居不知所終，其傳世著作影響中外兩千餘年，迄今長盛不衰。',
  ma_chao:
    '馬超，字孟起，扶風茂陵人，西涼馬騰之子，武勇冠絕西涼。父兄因曹操誅殺後，率兵起兵復仇，潼關之戰殺得曹操割須棄袍、狼狽而逃，令曹操感嘆「馬兒不死，吾無葬地也」。後因謀士楊阜等人奔走搬救兵，馬超失去根基，輾轉歸依劉備，五虎將之一。一生顛沛，父兄妻兒幾乎盡喪於亂世，晚年孤寂憂傷，三十七歲病逝，留遺書哀嘆「惟有從弟馬岱，以承微嗣，深可憐憫」。',
  huang_zhong:
    '黃忠，字漢升，南陽人，以箭術著稱，百步穿楊從不落空。初事荊州劉表、長沙太守韓玄，年近六旬仍與關羽大戰數百回合不落下風，韓玄欲以怯戰殺之，黃忠得魏延相救後歸順劉備。定軍山之戰，親斬夏侯淵，一戰扭轉西線戰局，立下蜀漢奇功，因此被封為後將軍，與關羽、張飛、趙雲、馬超並列五虎上將。老驥伏櫪，志在千里，是老當益壯的最佳典範。',
  guo_jia:
    '郭嘉，字奉孝，潁川陽翟人，世之奇士，曹操最得力的謀士之一。年輕時曾投袁紹，見袁紹多謀少決而離去，後歸曹操，相見恨晚，曹操感嘆「使孤成大業者，必此人也」。多次出奇謀，官渡之戰前判斷袁紹必敗、預言劉表不足為慮、遠征烏桓前獨排眾議支持出兵，無一不中。然英年早逝，三十八歲病逝於遼西征途中，曹操哭曰「哀哉奉孝！痛哉奉孝！惜哉奉孝！」赤壁大敗後更嘆「若奉孝在，不使孤至此」。',
  zhang_liang:
    '張良，字子房，韓國貴族之後，為報韓國亡國之仇曾刺殺秦始皇而失敗，被迫亡命。後在下邳圯橋得黃石公授《太公兵法》，學成後輔佐劉邦，成為漢朝建立最重要的謀臣。鴻門宴上力救劉邦、謀略對抗項羽、出謀劃策韓信北伐，均有張良運籌帷幄之功。天下既定後，深知「狡兔死，走狗烹」的道理，主動辭爵歸隱，隨道士學辟穀養生，是少數得以善終的開國功臣，被後世奉為謀聖。',
  yuchi_gong:
    '尉遲恭，字敬德，朔州善陽人，初為劉武周部將，後歸唐。每逢陣前單騎直入敵陣奪槊，從無失手，是唐初一等一的勇將。玄武門之變時力助李世民奪取皇位，事後護送秦王前往東宮，立下大功。晚年好服丹藥、治宅開池，深居簡出，去世後諡號「忠武」，被列入凌煙閣二十四功臣，並與秦瓊同被奉為門神，鎮守千家萬戶。',
  cheng_yaojin:
    '程咬金，字知節，濟州東阿人，隋末好漢，初為瓦崗軍大將，人稱「混世魔王」。以三板斧著稱，開局氣勢如虹，後勁不足，卻每每能以此破敵；民間以「程咬金的三板斧」形容虛張聲勢。歸唐後跟隨李世民南征北討，是凌煙閣二十四功臣之一。晚年性格豁達，安享太平，是少數在隋唐亂世中始終豪放不羈並得以善終的英雄人物。',
  wang_yangming:
    '王陽明，名守仁，字伯安，號陽明，浙江餘姚人，明朝最重要的思想家與軍事家。龍場悟道後創立心學，提出「知行合一」與「致良知」，影響後世數百年。平定江西盜賊、廣西叛亂，贛州平藩之役更以書生之身指揮平定寧王之亂，五十天內擒獲叛王，展現過人的軍事謀略。立德、立功、立言三不朽，是中國歷史上極少數能以「完人」稱之的人物，日本近代維新志士亦深受其影響。',
  yang_ye:
    '楊業，小字重貴，麟州新秦人，初事北漢，以悍勇聞名，外號「楊無敵」。北漢滅亡後歸宋，鎮守雁門關，多次擊退遼軍進犯，威震北疆。雍熙北伐時主將潘美不聽楊業之計，強令出兵，孤軍陷入包圍。援軍不至，楊業力戰至陳家谷，被俘後絕食三日而死，以身殉國。其子楊延昭（楊六郎）繼承父志，抗遼三十年，楊家將故事從此在民間廣為流傳，成為忠烈報國的永恆象徵。',
  xu_da:
    '徐達，字天德，濠州鐘離人，朱元璋的同鄉好友，明朝開國第一功臣。少從朱元璋起兵，歷次征戰皆為先鋒，以智勇著稱，治軍嚴整，秋毫無犯，百姓親之。攻陷大都（今北京），推翻元朝統治，功勞蓋世。一生謙遜謹慎，從不居功自傲，與朱元璋共同出身微賤，卻始終保持君臣分際，是少數善終的明朝開國元勳。去世後追封中山王，諡號武寧。',
  diao_chan:
    '貂蟬，三國時期天下第一美女，「閉月」之說由此而來——相傳月亮見其容顏羞愧而躲入雲中。她是司徒王允的義女，在王允的連環計中，同時成為丁原義子呂布與太師董卓的愛慕對象。以美色挑撥呂布與董卓關係，最終使呂布弒殺董卓，替漢室除去一大禍患。歷史正史中並無貂蟬其人，是後世文學與民間傳說中添加的人物，卻成為美麗、智慧與忠義的化身，永遠活在歷史故事裡。',
  li_shimin:
    '李世民，字世民，唐高祖李淵次子，大唐最重要的締造者之一。少年從軍，精於騎射，晉陽起兵、攻取長安均是其主導。即位前發動玄武門之變，殺兄弟、逼父退位，手段冷酷；登基後卻成為千古一帝，廣開言路、從諫如流，名臣魏徵等人敢於直言。對外滅東突厥、征高句麗、降吐蕃，四夷俯首稱「天可汗」。其在位期間政治清明、百姓富足，史稱「貞觀之治」，是中國封建社會的黃金時代。',
  zhu_yuanzhang:
    '朱元璋，字國瑞，濠州鐘離人，出身赤貧，幼年父母兄長相繼餓死，曾入皇覺寺為僧、四處化緣乞討。紅巾軍起事後投軍，憑著超凡的軍事才能與政治手腕，逐步消滅陳友諒、張士誠等群雄，1368年建立大明王朝，年號洪武。建國後雷厲風行肅貪，「貪污六十兩者剝皮實草」，大殺功臣，誅殺勛貴逾三萬人。從乞丐到皇帝的傳奇人生，在中國歷史上絕無僅有。',
  zhao_kuangyin:
    '趙匡胤，字元朗，涿州人，後周大將，在陳橋驛被眾將黃袍加身，兵不血刃取代後周，建立宋朝，定都開封，是為宋太祖。「杯酒釋兵權」是其最著名的政治手段，以宴請之名讓諸將交出兵權，兵不見血地解除武將威脅。重文輕武奠定宋朝基調，對外採取保守政策，卻使北宋始終積弱。趙匡胤本人武藝精湛，創「太祖長拳」與「盤龍棍法」，相傳其死因至今仍是「燭影斧聲」的千古謎案。',
  hua_mulan:
    '花木蘭，北魏民間傳說人物，河南虞城人氏。父親年邁，弟弟尚幼，邊關告急朝廷徵兵，木蘭毅然女扮男裝，代父從軍，在戰場上奮戰十二年，多次立下戰功。凱旋歸來，皇帝欲封以重職，木蘭婉拒，只求賜駿馬一匹返鄉探親，脫下戎裝換女兒裝，令昔日袍澤大吃一驚。《木蘭辭》以質樸的語言記錄這段傳奇，成為中國最著名的敘事詩之一，木蘭也成為巾幗英雄的永恆代表。',
  sun_quan:
    '孫權，字仲謀，富春人，孫堅次子、孫策之弟，十八歲繼承兄長之業，掌管江東。赤壁之戰力排主降派意見，聯劉抗曹，以弱勝強；夷陵之戰命陸遜迎擊，大敗劉備，鞏固東吳版圖。在位期間積極開發江東，派衛溫赴夷洲（今台灣），是中國歷史上最早有記載的航海遠征台灣之舉。曹操曾慨嘆「生子當如孫仲謀」，然晚年昏庸偏信，廢長立幼，釀成二宮之爭，埋下東吳衰落的根源。',
  hua_tuo:
    '華佗，字元化，沛國譙縣人，東漢末年神醫，精通內、外、婦、兒、針灸諸科，尤以外科手術著稱。發明「麻沸散」（世界上最早的麻醉藥），為患者剖腹手術，領先世界近千年。還創「五禽戲」強身健體，傳授給弟子吳普，後者活至九十餘歲、耳聰目明。曹操頭痛病發，召華佗診治，華佗言需開顱去瘤，曹操疑其謀害，下獄殺之。華佗臨死前曾欲將青囊書傳予獄吏，獄吏不敢接受，致使醫書付諸一炬，千古之憾。',
  pang_tong:
    '龐統，字士元，號鳳雛，荊州人，與諸葛亮齊名，世稱「臥龍鳳雛，得一可安天下」。外貌不揚，初次拜見孫權、劉備均遭冷落。後劉備慧眼識才，拜為軍師中郎將，與諸葛亮分掌兵權。勸說劉備入蜀，設計殺楊懷高沛奪取關隘，展現過人謀略。然在攻打雒城時，中伏落馬，死於流矢，年僅三十六歲，正所謂「天妒英才」。劉備聞訊痛哭流涕，追諡靖侯，鳳雛隕落令天下同嘆。',
  jia_xu:
    '賈詡，字文和，武威姑臧人，三國時期最危險的謀士，以算無遺策、善保己身著稱。張繡投降曹操又反叛，賈詡獻計重挫曹操，使其長子曹昂、猛將典韋均戰死，令曹操痛徹心扉。後力勸張繡再投曹操，兩人反受厚待。赤壁之戰前勸阻曹操倉促南征不聽，結果大敗；曹操繼承人之爭中，以晉文公、漢高祖故事暗示曹操立嫡長子，曹丕繼位後拜其為太尉。一生謀算精到而深藏不露，低調明哲，在亂世中得以善終。',
  dong_zhuo:
    '董卓，字仲穎，隴西臨洮人，以武力起家，擅長騎射，逐步掌握西涼軍事大權。靈帝死後趁機進京，廢少帝立獻帝，獨掌朝政，強行遷都長安，並縱兵燒殺洛陽，致使東漢名都化為廢墟，百姓流離失所。倒行逆施，嗜殺成性，引起各地諸侯聯合討伐。後在義女貂蟬與司徒王允的連環計下，被義子呂布所殺。據說其肥胖多油脂，死後被人點燃，屍油如燈，燃燒經日不滅，可謂遺臭萬年的亂世禍首。',
  yuan_shao:
    '袁紹，字本初，汝南汝陽人，出身「四世三公」名門，聲望極高。反董卓聯盟事實上的盟主，然而優柔寡斷，缺乏決斷力，坐擁冀、幽、並、青四州，帶甲百萬，雄踞北方，卻在官渡之戰中因不聽田豐、沮授之計，輕敵冒進，被曹操用奇計烏巢劫糧，百萬大軍一戰崩潰，元氣大傷，此後迅速衰落。官渡之戰失敗後袁紹憂憤而死，是「謀多而斷少、名大而實虛」的典型歷史人物。'
};

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
