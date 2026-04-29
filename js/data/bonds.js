window.GameData = window.GameData || {};

GameData.bonds = [
  {
    id: 'taoyuan', name: '桃園結義',
    members: ['liu_bei', 'guan_yu', 'zhang_fei'],
    minRequired: 3,
    desc: '劉關張三義結拜，義比生死。全體每回合回復5%生命，士氣不低於20。',
    effect: { type: 'regen_and_morale_floor', regenPct: 0.05, moraleFloor: 20 }
  },
  {
    id: 'jiangdong', name: '江東柱石',
    members: ['sun_ce', 'zhou_yu', 'taishi_ci'],
    minRequired: 3,
    desc: '孫策、周瑜、太史慈，江東三傑相互輝映。開局士氣+15，強攻傷害+10%。',
    effect: { type: 'start_morale_and_atk', moraleBonus: 15, atkBonus: 0.10 }
  },
  {
    id: 'wuhujiang', name: '五虎上將',
    members: ['guan_yu', 'zhang_fei', 'zhao_yun'],
    minRequired: 3,
    desc: '蜀漢猛將三人同陣。全體攻擊力+10%，覺醒效果增強。',
    effect: { type: 'team_atk_boost', atkBonus: 0.10, awakenAmplify: 1.20 }
  },
  {
    id: 'weizhongchen', name: '魏之重臣',
    members: ['cao_cao', 'dian_wei', 'xiahou_dun'],
    minRequired: 3,
    desc: '曹操與心腹重臣共陣。全體防禦+15%，被擊殺時士氣不降低。',
    effect: { type: 'def_boost_morale_shield', defBonus: 0.15, noMoraleLossOnDeath: true }
  },
  {
    id: 'wofengshuang', name: '臥鳳雙杰',
    members: ['zhuge_liang', 'zhou_yu'],
    minRequired: 2,
    desc: '臥龍諸葛亮與鳳雛龐統（或周瑜）共謀。軍師技能冷卻-1回合，佯攻效果+15%。',
    effect: { type: 'advisor_cooldown_and_feint', cooldownReduction: 1, feintBonus: 0.15 }
  },
  {
    id: 'bawang', name: '霸王無敵',
    members: ['xiang_yu'],
    minRequired: 1,
    desc: '西楚霸王獨力撐場。血量低於30%時，攻擊力+50%，免疫佯攻削減效果。',
    effect: { type: 'last_stand_passive', threshold: 0.30, atkBoost: 0.50, feintImmune: true }
  },
  {
    id: 'hanjun', name: '漠北雙騎',
    members: ['huo_qubing', 'wei_qing'],
    minRequired: 2,
    desc: '霍去病與衛青，漠北雙騎橫掃匈奴。全體速度+8，正面強攻連擊機率+20%。',
    effect: { type: 'spd_boost_and_chain_chance', spdBonus: 8, chainChance: 0.20 }
  },
  {
    id: 'qinjun', name: '秦軍鐵陣',
    members: ['bai_qi', 'meng_tian'],
    minRequired: 2,
    desc: '殺神白起與蒙恬共鎮。全體防禦+10%，每回合士氣-5但攻擊力+15%。',
    effect: { type: 'high_atk_low_morale', defBonus: 0.10, atkBonus: 0.15, moralePerTurn: -5 }
  },
  {
    id: 'tangjun', name: '唐之驍將',
    members: ['li_jing', 'xue_rengui', 'qin_qiong'],
    minRequired: 3,
    desc: '唐朝三名將齊陣。開局先手優先，後攻傷害提升至70%。',
    effect: { type: 'first_strike_and_rear', forceFirst: true, rearAtkMult: 0.70 }
  },
  {
    id: 'songjun', name: '精忠宋將',
    members: ['yue_fei', 'di_qing'],
    minRequired: 2,
    desc: '岳飛與狄青，精忠報國共擔天下。每擊敗一名敵將，士氣+15（加倍）。',
    effect: { type: 'morale_amplify_on_kill', moralePerKill: 15 }
  }
];

GameData.checkBonds = function(generalIds) {
  const active = [];
  for (const bond of GameData.bonds) {
    const presentMembers = bond.members.filter(m => generalIds.includes(m));
    if (presentMembers.length >= bond.minRequired) {
      active.push({ bond, presentMembers });
    }
  }
  return active;
};
