# 羣雄列陣 — 兩款卡牌遊戲，一個入口

打開 `index.html` 就是大廳，內含兩個遊戲室：

| 遊戲室 | 路徑 | 玩法 | 特色 |
| --- | --- | --- | --- |
| 第一遊戲室「兵法推演」 | `bingfa.html` | BP 禁選 + 五行雙陣 | 純競技、AI 軍師輔佐、Three.js 3D 戰場 |
| 第二遊戲室「華夏風雲錄」 | `huaxia.html` | 君王戰 TCG/RPG | 武器庫、抽卡、鐵匠鋪、武器分職限定、P2P 對戰 |

兩款遊戲共用 8 大職位定義（`js/data/equipment.js` 的 `JOBS`），武器透過 `jobs[]` 限定可裝備的職位。

---

## 啟動

### 純前端（最簡單）

```bash
# 直接打開
start index.html
```

### 帶 P2P 對戰伺服器（推薦）

```bash
npm install
npm start    # http://localhost:7892
```

---

## 第一遊戲室 — 兵法推演

純競技 BP / 雙陣對戰，無養成數值。

1. **BP 五階段**：禁、選、禁、選、禁、選 — 共 6 禁、8 選；雙方各派 1 主公 + 1 軍師 + 6 特殊職位
2. **8 大職位**：主公、軍師、臣相、大司馬、大司農、大將軍、行軍總管、破陣先鋒
3. **五行雙陣**：每回合佈下「第一陣」+「第二陣」，10 種戰術（金木水火土各 2）
4. **雙陣結算**：先算我方雙陣內部相生（回 10）/ 相剋（自損 30）/ 相同（傷敵 15），再算敵我交鋒
5. **職位戰術加成**：
   - 大將軍：全軍 +5% 攻 + 征伐 +5 傷
   - 破陣先鋒：金陣優先結算、相同五行敵額外 -5 血
   - 行軍總管：被剋時木陣減傷 10
   - 大司農：每 3 回合回 5 血
   - 大司馬：揭露敵方一陣
   - 臣相：30% 機率化解雙陣相剋反噬
6. **羈絆系統**：12 組已實作（桃園三結義、三顧茅廬…），可擴充至 50 組
7. **段位積分**：`localStorage.bingfa_points`（見習 / 謀將 / 宗師 / 王者）
8. **AI 軍師**：BP 階段建議禁選，戰報生成史詩旁白

## 第二遊戲室 — 華夏風雲錄

TCG × RPG，君王 5 HP 直擊戰。

- **戰場**：陣前區（Active）+ 後營區（Bench）
- **回合**：抽牌 / 準備 / 主要 / 戰鬥 / 結束
- **武器庫**：weapon / armor / mount + 君王神器（kingOnly artifact）
- **職業限定武器** ⭐ 新功能：每件武器有 `jobs[]` 陣列，只有對應職位的武將才能裝備
  - 例：青龍偃月刀 → `general / vanguard`
  - 例：傳國玉璽 → `king`（kingOnly）
  - 例：羽扇 → `strategist`
  - 例：糧倉鉤 → `minister`
- **耐久度**：每次攻擊 / 格擋 -1，歸零自動損壞
- **專武共鳴**：歷史專武對應武將時 +25%
- **抽卡**：雙池（武器 / 防具）+ 雙保底（10 抽 SR、80 抽 LEGEND）+ 十連 9 折
- **鐵匠鋪**：戰後素材獎勵 + 升級至 Lv.10 + 5 碎合成
- **PVE / PVP 平衡**：PVP 自動切換為「等級 0、不消耗耐久」競技模板
- **P2P 對戰**：Socket.IO 房間碼

---

## 部署選項

### 選項 1：Google Apps Script（GAS Web App）

把網站包成 GAS Web App，得到 `https://script.google.com/macros/s/.../exec` 域名。

詳見 [`gas/README.md`](gas/README.md)。

### 選項 2：GitHub Pages（純靜態）

兵法推演 + 華夏風雲錄的單機部分皆可運作；P2P 對戰功能會降級為 AI 補位。

```
git remote add origin https://github.com/<USER>/<REPO>.git
git push -u origin main
# Settings → Pages → Source: main / root
```

### 選項 3：Render Web Service（推薦，含 P2P）

完整支援 Socket.IO 對戰：

- Build: `npm install`
- Start: `npm start`

`network.js` 已寫好自動切換：本機跑 `localhost:7892`，部署後用同源 URL。

---

## 檔案結構

```
heroes-formation-v2/
├── index.html              # 🏛️ 遊戲大廳（選擇遊戲室）
├── bingfa.html             # ⚔️ 兵法推演（第一遊戲室）
├── huaxia.html             # 👑 華夏風雲錄（第二遊戲室）
├── server.js               # Express + Socket.IO 對戰伺服器
├── package.json
├── css/
│   ├── style.css, gacha.css, equipment.css, splash.css
├── js/
│   ├── data/
│   │   ├── generals.js, advisors.js, bonds.js, cards.js, campaign.js
│   │   ├── equipment.js    # ⭐ 含 8 大職業 + 武器 jobs[] 限定
│   │   ├── materials.js, inventory.js
│   │   └── bingfa-heroes.js  # ⭐ 兵法推演武將池（按職位）
│   ├── engine/
│   │   ├── gameState.js, combat.js, ai.js, network.js
│   │   ├── gachaEngine.js, equipmentEngine.js
│   │   ├── smithy.js, balance.js, splash.js
│   │   └── bingfa-engine.js  # ⭐ BP / 雙陣結算引擎
│   ├── main.js               # 華夏風雲錄主控
│   └── bingfa-main.js        # ⭐ 兵法推演主控
├── gas/                      # ⭐ Google Apps Script 部署
│   ├── Code.gs
│   ├── appsscript.json
│   └── README.md
└── img/
```

---

## 共用機制

兩款遊戲共用：

- **8 大職位**：`GameData.JOBS` / `BingFaData.JOBS`
- **五行系統**：金木水火土相生相剋
- **localStorage**：玉帛、裝備庫、段位積分

兵法推演純競技、無裝備系統；華夏風雲錄則把武器透過 `jobs[]` 對應到 8 大職位。

---

## 已知範圍

- 兵法推演：12 組羈絆已實作（剩 38 組待擴）
- 華夏風雲錄：30+ 件武器中 6 件特效已實作
- AI 對手裝備邏輯：暫不掛裝備（PVE 全玩家自由配）

## 授權

ISC
