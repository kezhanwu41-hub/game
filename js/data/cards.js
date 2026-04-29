/**
 * cards.js — 療牌 & 陷阱牌資料
 * cardType: 'heal' | 'trap'
 */
window.GameData = window.GameData || {};

// ── 五行常數 ──────────────────────────────────────────────────
GameData.ELEMENTS = {
  '木': { color: '#4caf50', bgColor: 'rgba(76,175,80,0.22)', emoji: '🌿', en: 'Wood' },
  '火': { color: '#ef5350', bgColor: 'rgba(239,83,80,0.22)', emoji: '🔥', en: 'Fire'  },
  '土': { color: '#ff9800', bgColor: 'rgba(255,152,0,0.22)',  emoji: '⛰️', en: 'Earth' },
  '金': { color: '#ffd600', bgColor: 'rgba(255,214,0,0.22)',  emoji: '⚙️', en: 'Metal' },
  '水': { color: '#42a5f5', bgColor: 'rgba(66,165,245,0.22)', emoji: '💧', en: 'Water' }
};

// 克制矩陣：ke[A] = B → A克B（A攻擊B傷害+40%）
GameData.KE = { '金':'木', '木':'土', '土':'水', '水':'火', '火':'金' };
// 相生矩陣：sheng[A] = B → A生B（A攻擊B傷害-15%，養肥了對方）
GameData.SHENG = { '木':'火', '火':'土', '土':'金', '金':'水', '水':'木' };

/**
 * 取得五行互動
 * @returns { type:'ke'|'sheng'|'same'|'neutral', modifier:number, label:string }
 */
GameData.getElementInteraction = function(atkElem, defElem) {
  if (!atkElem || !defElem) return { type: 'neutral', modifier: 1.0, label: '' };
  if (GameData.KE[atkElem] === defElem)
    return { type: 'ke',    modifier: 1.40, label: `${atkElem}克${defElem}！傷害+40%` };
  if (GameData.SHENG[atkElem] === defElem)
    return { type: 'sheng', modifier: 0.85, label: `${atkElem}生${defElem}，傷害-15%` };
  if (atkElem === defElem)
    return { type: 'same',  modifier: 1.00, label: `同屬性，暴擊率+10%`, critBonus: 0.10 };
  return { type: 'neutral', modifier: 1.00, label: '' };
};

// ── 療牌（5張）───────────────────────────────────────────────
GameData.healCards = [
  {
    id: 'heal_ganlu', name: '清源甘露', cardType: 'heal', element: '水',
    icon: '💧', color: '#42a5f5', bgColor: 'rgba(66,165,245,0.18)',
    desc: '每回合結束時，回復前排武將 8% 最大生命值（被動持續）',
    flavorText: '霑灑甘露，生機盎然',
    effect: { type: 'passive_regen', pct: 0.08, trigger: 'turn_end', target: 'front_ally_weakest' },
    uses: 99 // infinite passive
  },
  {
    id: 'heal_jinchuang', name: '金創藥', cardType: 'heal', element: '金',
    icon: '⚗️', color: '#ffd600', bgColor: 'rgba(255,214,0,0.18)',
    desc: '主動使用：立即回復己方指定武將 35% 最大生命值（每局限用1次）',
    flavorText: '金石良藥，起死回生',
    effect: { type: 'active_heal', pct: 0.35, trigger: 'manual', target: 'choose_front_ally' },
    uses: 1
  },
  {
    id: 'heal_jungi', name: '軍旗鼓舞', cardType: 'heal', element: '木',
    icon: '🚩', color: '#4caf50', bgColor: 'rgba(76,175,80,0.18)',
    desc: '主動使用：前排所有武將回復5%生命，士氣+15（每局限用2次）',
    flavorText: '旗鼓聲聲，士氣如虹',
    effect: { type: 'active_aoe_heal', pct: 0.05, moraleBonus: 15, trigger: 'manual', target: 'all_front_ally' },
    uses: 2
  },
  {
    id: 'heal_zhiya', name: '止血藥', cardType: 'heal', element: '土',
    icon: '🩹', color: '#ff9800', bgColor: 'rgba(255,152,0,0.18)',
    desc: '被動：每當己方武將在一回合內損失超過20%生命，立即回復15%（可觸發3次）',
    flavorText: '急救止血，縱死不退',
    effect: { type: 'passive_emergency_heal', threshold: 0.20, pct: 0.15, trigger: 'on_damage', maxCharges: 3 },
    uses: 3
  },
  {
    id: 'heal_hupo', name: '虎魄護符', cardType: 'heal', element: '火',
    icon: '🔮', color: '#ef5350', bgColor: 'rgba(239,83,80,0.18)',
    desc: '主動使用：指定己方武將本回合免疫所有傷害（每局限用1次）',
    flavorText: '護身虎魄，百邪不侵',
    effect: { type: 'active_immunity', trigger: 'manual', target: 'choose_front_ally', duration: 1 },
    uses: 1
  }
];

// ── 陷阱牌（5張）─────────────────────────────────────────────
GameData.trapCards = [
  {
    id: 'trap_luanjian', name: '亂箭齊發', cardType: 'trap', element: '金',
    icon: '🏹', color: '#ffd600', bgColor: 'rgba(255,214,0,0.18)',
    desc: '【觸發】敵方使用【強攻】時，反傷攻擊者 70% 攻擊力傷害',
    flavorText: '敵進我箭，萬矢齊發',
    trigger: { cmd: 'heavy', side: 'enemy' },
    effect: { type: 'reflect_damage', atkMult: 0.70 },
    revealed: false, used: false
  },
  {
    id: 'trap_maifu', name: '埋伏奇兵', cardType: 'trap', element: '木',
    icon: '⚡', color: '#4caf50', bgColor: 'rgba(76,175,80,0.18)',
    desc: '【觸發】敵方使用【後攻】時，伏兵反制，對攻擊者造成 100% 攻擊力傷害並跳過本次後攻效果',
    flavorText: '虛則實之，實則虛之',
    trigger: { cmd: 'rear', side: 'enemy' },
    effect: { type: 'counter_rear', atkMult: 1.00, cancelRear: true },
    revealed: false, used: false
  },
  {
    id: 'trap_lijian', name: '離間計', cardType: 'trap', element: '火',
    icon: '🌀', color: '#ef5350', bgColor: 'rgba(239,83,80,0.18)',
    desc: '【觸發】敵方使用【佯攻】時，佯攻效果完全無效，且敵武將防禦-20%持續1回合',
    flavorText: '佯退而前，陷阱已張',
    trigger: { cmd: 'feint', side: 'enemy' },
    effect: { type: 'cancel_feint', defDebuff: 0.20, debuffDuration: 1 },
    revealed: false, used: false
  },
  {
    id: 'trap_yibing', name: '疑兵之計', cardType: 'trap', element: '水',
    icon: '👥', color: '#42a5f5', bgColor: 'rgba(66,165,245,0.18)',
    desc: '【觸發】敵方使用【固守】時，回血效果無效，且本輪跳過敵方負效果免疫',
    flavorText: '以假亂真，虛實相生',
    trigger: { cmd: 'hold', side: 'enemy' },
    effect: { type: 'cancel_hold', cancelHeal: true, cancelImmunity: true },
    revealed: false, used: false
  },
  {
    id: 'trap_lianhuo', name: '連環計', cardType: 'trap', element: '土',
    icon: '🔗', color: '#ff9800', bgColor: 'rgba(255,152,0,0.18)',
    desc: '【觸發】敵方連續使用同一指令 3 次時，自動發動150%攻擊力反擊並揭示',
    flavorText: '環環相扣，一計破千軍',
    trigger: { cmd: 'streak', count: 3, side: 'enemy' },
    effect: { type: 'streak_counter', atkMult: 1.50 },
    revealed: false, used: false
  }
];

// ── 全卡池 ────────────────────────────────────────────────────
GameData.getAllCards = function() {
  return [
    ...GameData.generals.map(g => ({ ...g, cardType: 'general' })),
    ...GameData.healCards,
    ...GameData.trapCards
  ];
};

GameData.getCardById = function(id) {
  const all = GameData.getAllCards();
  return all.find(c => c.id === id) || null;
};

GameData.cloneCard = function(id) {
  const card = GameData.getCardById(id);
  if (!card) return null;
  const clone = JSON.parse(JSON.stringify(card));
  if (clone.cardType === 'general') {
    clone.currentHp = clone.maxHp || clone.hp;
    clone.maxHp = clone.maxHp || clone.hp;
    clone.effects = [];
    clone.awakened = false;
    clone.turnsSurvived = 0;
    clone.immuneThisTurn = false;
    if (clone.specialCmd) {
      clone.specialCmd.usesLeft = clone.specialCmd.uses;
      clone.specialCmd.currentCooldown = 0;
    }
  }
  if (clone.cardType === 'heal') {
    clone.usesLeft = clone.uses;
    clone.charges = clone.effect?.maxCharges || clone.uses;
  }
  if (clone.cardType === 'trap') {
    clone.revealed = false;
    clone.used = false;
  }
  return clone;
};
