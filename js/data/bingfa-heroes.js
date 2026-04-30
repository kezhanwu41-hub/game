/**
 * bingfa-heroes.js — 兵法推演候選武將（按 8 大職位歸類）
 * 每位武將綁定一個職位 + 五行 + 陣營
 * 與 equipment.js 的 JOBS 對應
 */
window.BingFaData = window.BingFaData || {};

(function() {
  'use strict';

  // 8 大職位
  const JOBS = ['king','strategist','chancellor','marshal','minister','general','commandant','vanguard'];
  const JOB_NAMES = {
    king: '主公', strategist: '軍師', chancellor: '臣相',
    marshal: '大司馬', minister: '大司農', general: '大將軍',
    commandant: '行軍總管', vanguard: '破陣先鋒'
  };
  const ELEMENTS = ['金','木','水','火','土'];
  const FACTIONS = ['漢','魏','蜀','吳','唐','宋','明','秦','楚'];

  // 武將池（每職位 4 人，共 32 人）
  const HEROES = [
    // 主公 (king) ×4
    { id:'h_liubei',    name:'劉備',     job:'king',       elem:'土', faction:'蜀', power:88, desc:'仁德之主，臣相效果+10%' },
    { id:'h_caocao',    name:'曹操',     job:'king',       elem:'水', faction:'魏', power:92, desc:'魏武揮鞭，全軍+3攻' },
    { id:'h_li_shimin', name:'李世民',   job:'king',       elem:'金', faction:'唐', power:90, desc:'天策上將，破陣+5傷' },
    { id:'h_qin',       name:'秦始皇',   job:'king',       elem:'土', faction:'秦', power:95, desc:'王道霸業，主公HP+10' },

    // 軍師 (strategist) ×4
    { id:'h_zhuge',     name:'諸葛亮',   job:'strategist', elem:'木', faction:'蜀', power:90, desc:'臥龍出山，雙陣加成+10%' },
    { id:'h_sima',      name:'司馬懿',   job:'strategist', elem:'土', faction:'魏', power:88, desc:'冢虎，每回合揭露1戰術' },
    { id:'h_zhou_yu',   name:'周瑜',     job:'strategist', elem:'火', faction:'吳', power:85, desc:'美周郎，火陣+15傷' },
    { id:'h_liu_bowen', name:'劉伯溫',   job:'strategist', elem:'水', faction:'明', power:84, desc:'神機軍師，被剋反噬-30%' },

    // 臣相 (chancellor) ×4
    { id:'h_xun_yu',    name:'荀彧',     job:'chancellor', elem:'土', faction:'魏', power:78, desc:'王佐之才，化解相剋+10%' },
    { id:'h_wei_zheng', name:'魏徵',     job:'chancellor', elem:'金', faction:'唐', power:76, desc:'諫官，每回合回血+3' },
    { id:'h_li_si',     name:'李斯',     job:'chancellor', elem:'金', faction:'秦', power:75, desc:'法家相，主公受擊-10%' },
    { id:'h_zhang_liang',name:'張良',    job:'chancellor', elem:'木', faction:'漢', power:80, desc:'運籌帷幄，每3回合抽1戰術' },

    // 大司馬 (marshal) ×4
    { id:'h_guan_yu',   name:'關羽',     job:'marshal',    elem:'金', faction:'蜀', power:90, desc:'武聖，揭露敵雙陣其中之一' },
    { id:'h_xiahou_dun',name:'夏侯惇',   job:'marshal',    elem:'金', faction:'魏', power:82, desc:'拔矢啖睛，反擊+10傷' },
    { id:'h_yu_chi',    name:'尉遲恭',   job:'marshal',    elem:'土', faction:'唐', power:80, desc:'門神，先手防禦+15%' },
    { id:'h_xu_da',     name:'徐達',     job:'marshal',    elem:'土', faction:'明', power:78, desc:'中山王，金陣+10傷' },

    // 大司農 (minister) ×4
    { id:'h_xiao_he',   name:'蕭何',     job:'minister',   elem:'土', faction:'漢', power:75, desc:'每3回合全軍回5血' },
    { id:'h_zhang_juzheng',name:'張居正',job:'minister',   elem:'木', faction:'明', power:74, desc:'一條鞭法，每2回合補1戰術' },
    { id:'h_guo_jia',   name:'郭嘉',     job:'minister',   elem:'火', faction:'魏', power:72, desc:'鬼才，補給點 +20%' },
    { id:'h_fang_xuanling',name:'房玄齡',job:'minister',   elem:'土', faction:'唐', power:70, desc:'貞觀文相，前3回合穩定+5血' },

    // 大將軍 (general) ×4
    { id:'h_zhang_fei', name:'張飛',     job:'general',    elem:'木', faction:'蜀', power:88, desc:'萬人敵，征伐+10傷' },
    { id:'h_xiang_yu',  name:'項羽',     job:'general',    elem:'火', faction:'楚', power:96, desc:'霸王，全軍+5%攻' },
    { id:'h_zhang_liao',name:'張遼',     job:'general',    elem:'金', faction:'魏', power:85, desc:'威震逍遙津，破甲+12' },
    { id:'h_yue_fei',   name:'岳飛',     job:'general',    elem:'木', faction:'宋', power:90, desc:'精忠報國，主公附近+8防' },

    // 行軍總管 (commandant) ×4
    { id:'h_zhao_yun',  name:'趙雲',     job:'commandant', elem:'金', faction:'蜀', power:86, desc:'七進七出，被剋木陣減傷10' },
    { id:'h_li_jing',   name:'李靖',     job:'commandant', elem:'水', faction:'唐', power:84, desc:'藥師，敵雙陣相同時-3傷' },
    { id:'h_xu_huang',  name:'徐晃',     job:'commandant', elem:'土', faction:'魏', power:78, desc:'治軍嚴明，被剋減傷15' },
    { id:'h_lu_meng',   name:'呂蒙',     job:'commandant', elem:'水', faction:'吳', power:76, desc:'白衣渡江，後援優先' },

    // 破陣先鋒 (vanguard) ×4
    { id:'h_lvbu',      name:'呂布',     job:'vanguard',   elem:'火', faction:'漢', power:98, desc:'人中呂布，金陣優先且+5傷' },
    { id:'h_chang_yuchun',name:'常遇春', job:'vanguard',   elem:'金', faction:'明', power:88, desc:'先鋒之神，相同五行-5血' },
    { id:'h_huo_qubing',name:'霍去病',   job:'vanguard',   elem:'金', faction:'漢', power:90, desc:'冠軍侯，首回合+15傷' },
    { id:'h_yang_zaixing',name:'楊再興', job:'vanguard',   elem:'木', faction:'宋', power:82, desc:'小商河，反擊+5%' }
  ];

  // 10 種五行兵法戰術（金木水火土各2）
  const TACTICS = [
    // 金（鋒銳/破陣）
    { id:'t_jin1', name:'白虎陣', elem:'金', desc:'鋒銳破甲：對相剋目標+10傷' },
    { id:'t_jin2', name:'金戈鐵馬', elem:'金', desc:'攻擊+8，破陣優先結算' },
    // 木（生長/補給）
    { id:'t_mu1', name:'青龍陣', elem:'木', desc:'生機循環：被剋時減傷10' },
    { id:'t_mu2', name:'森羅萬象', elem:'木', desc:'回血+6，相生時額外+4' },
    // 水（變化/迷惑）
    { id:'t_shui1', name:'玄武陣', elem:'水', desc:'柔克剛：被剋時反噬-15%' },
    { id:'t_shui2', name:'萬流歸宗', elem:'水', desc:'攻擊+5，每3回合迷惑敵1次' },
    // 火（爆發/烈攻）
    { id:'t_huo1', name:'朱雀陣', elem:'火', desc:'烈焰焚城：相生時+15傷' },
    { id:'t_huo2', name:'燎原之勢', elem:'火', desc:'連擊：第二陣同火時+10傷' },
    // 土（穩固/防禦）
    { id:'t_tu1', name:'勾陳陣', elem:'土', desc:'穩如泰山：受傷-8' },
    { id:'t_tu2', name:'厚德載物', elem:'土', desc:'防禦+10，主公附近+5血' }
  ];

  // 五行相生：木→火→土→金→水→木
  const SHENG = { 木:'火', 火:'土', 土:'金', 金:'水', 水:'木' };
  // 五行相剋：木→土→水→火→金→木
  const KE = { 木:'土', 土:'水', 水:'火', 火:'金', 金:'木' };

  function relation(a, b) {
    if (a === b) return 'same';
    if (SHENG[a] === b) return 'sheng';      // a 生 b（a 回血）
    if (SHENG[b] === a) return 'sheng_in';   // b 生 a（同生關係，這裡簡化視為相生）
    if (KE[a] === b) return 'ke';            // a 剋 b（a 對 b）
    if (KE[b] === a) return 'ke_by';         // a 被 b 剋
    return 'none';
  }

  // 50 組羈絆（簡化：選 12 組示範，剩餘可擴）
  const BONDS = [
    { ids:['h_liubei','h_zhuge'],         name:'三顧茅廬', bonus:{ atk:8, def:5 }, desc:'劉備+諸葛亮：全軍攻防+8/+5' },
    { ids:['h_liubei','h_guan_yu','h_zhang_fei'], name:'桃園三結義', bonus:{ atk:15, def:10, hp:20 }, desc:'劉關張：傳奇羈絆 +15攻+10防+20HP' },
    { ids:['h_caocao','h_xiahou_dun'],    name:'宗親猛將', bonus:{ atk:6 }, desc:'曹操+夏侯惇：+6攻' },
    { ids:['h_caocao','h_xun_yu'],        name:'王佐之才', bonus:{ def:8 }, desc:'曹操+荀彧：+8防' },
    { ids:['h_caocao','h_guo_jia'],       name:'鬼才奉孝', bonus:{ atk:10 }, desc:'曹操+郭嘉：+10攻，補給+15%' },
    { ids:['h_zhuge','h_zhang_fei'],      name:'臥龍燕人', bonus:{ atk:5, hp:10 }, desc:'諸葛+張飛：+5攻+10HP' },
    { ids:['h_li_shimin','h_yu_chi'],     name:'門神戍唐', bonus:{ def:10 }, desc:'李世民+尉遲恭：+10防' },
    { ids:['h_qin','h_li_si'],            name:'法家威儀', bonus:{ atk:5, def:5 }, desc:'秦始皇+李斯：法家+5/+5' },
    { ids:['h_xiang_yu','h_zhang_liang'], name:'楚漢相爭', bonus:{ atk:12 }, desc:'雖敵對但羈絆觸發 +12攻' },
    { ids:['h_zhou_yu','h_lu_meng'],      name:'吳國雙絕', bonus:{ atk:7, def:7 }, desc:'周瑜+呂蒙：+7/+7' },
    { ids:['h_yue_fei','h_yang_zaixing'], name:'岳家軍', bonus:{ atk:8, hp:15 }, desc:'岳飛+楊再興：+8攻+15HP' },
    { ids:['h_li_shimin','h_li_jing'],    name:'天策軍威', bonus:{ atk:6, def:6 }, desc:'李世民+李靖：+6/+6' }
  ];

  BingFaData.JOBS = JOBS;
  BingFaData.JOB_NAMES = JOB_NAMES;
  BingFaData.ELEMENTS = ELEMENTS;
  BingFaData.HEROES = HEROES;
  BingFaData.HEROES_BY_ID = HEROES.reduce((m,h)=>{ m[h.id]=h; return m; }, {});
  BingFaData.TACTICS = TACTICS;
  BingFaData.SHENG = SHENG;
  BingFaData.KE = KE;
  BingFaData.relation = relation;
  BingFaData.BONDS = BONDS;
})();
