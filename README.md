# 羣雄列陣 v2 — 五行策略 + 武器庫 RPG

整合 **TCG 策略** 與 **RPG 養成**：30+ 歷史武將、五行相生相剋、雙陣法戰術、武器庫鍛造、即時 P2P 對戰。

## 啟動方式

```bash
npm install
npm start
```

開瀏覽器到 `http://localhost:7892`。

## v2 新增系統

### 武器庫（武器 / 防具 / 坐騎）
- 三類裝備分槽：每位武將最多 1 武器 + 1 防具 + 1 坐騎
- **君王神器**：傳國玉璽等 `artifact` 裝備僅君王可掛，HP 致命時觸發 50% 反擊（每場 1 次）
- **耐久度**：每次攻擊 / 成功格擋 -1，歸零自動損壞
- **專武共鳴**：歷史專武對應武將時解鎖額外加成（青龍偃月刀×關羽、方天畫戟×呂布等）

### 抽卡（雙池 + 雙保底）
- **武器池**：武器 + 坐騎
- **防具池**：防具
- **每 10 抽** 必出 SR 以上
- **每 80 抽** 必出當期傳說
- **十連 9 折**（1440 vs 單抽 160×10）
- 重複的 SSR/LEGEND 自動轉為「碎片」，5 碎合成同件裝備

### 鐵匠鋪
- **戰後素材**：依戰損比例獎勵 隕鐵 / 皮革 / 馬鈴銀 / 強化石
- **升級系統**：每件裝備可升至 Lv.10，對應素材 + 強化石 + 玉帛
- **碎片合成**：5 個同件碎片 → 1 件 SSR/LEGEND 裝備

### PVE / PVP 平衡
- **PVE**：玩家培養的等級全套生效
- **PVP**：自動切換為「標準競技模板」，等級當 0、耐久不消耗，雙方公平起跑

## 檔案結構

```
heroes-formation-v2/
├── index.html              # UI（含大廳 / Gacha / Armory / Smithy / Battle）
├── server.js               # Express + Socket.IO 對戰伺服器
├── css/
│   ├── style.css
│   ├── gacha.css
│   └── equipment.css       # ★ 新：武器庫 / 鐵匠鋪 / 裝備槽 UI
├── js/
│   ├── data/
│   │   ├── generals.js     # 30+ 武將
│   │   ├── advisors.js
│   │   ├── bonds.js
│   │   ├── cards.js
│   │   ├── campaign.js
│   │   ├── equipment.js    # ★ 新：武器/防具/坐騎/神器資料
│   │   ├── materials.js    # ★ 新：素材定義 + 戰損獎勵
│   │   └── inventory.js    # ★ 重寫：玉帛/裝備/碎片/素材/將魂統一倉儲
│   ├── engine/
│   │   ├── gameState.js
│   │   ├── combat.js
│   │   ├── ai.js
│   │   ├── network.js
│   │   ├── gachaEngine.js  # ★ 重寫：雙池 + 10/80 保底 + 十連
│   │   ├── equipmentEngine.js  # ★ 新：掛載 / 耐久 / 共鳴 / 神器反擊
│   │   ├── smithy.js       # ★ 新：升級 + 碎片合成 + 戰後結算
│   │   └── balance.js      # ★ 新：PVE/PVP 數值切換
│   └── main.js             # 整合控制器（已修 3 個 bug）
└── img/                    # 武將肖像
```

## 已修復 bug

1. `main.js` 中 `resolveBattleTurn` 重複定義（呼叫到不存在的 `checkGameOver`/`finishGame`）
2. `index.html` 寫死 `http://localhost:7892/socket.io/socket.io.js`，改用 CDN 自動切換
3. `startCampaignLevel` 跳到不存在的 `screen-pick`，已改為統一的 `screen-draft`

## 部署

把 `heroes-formation-v2/` 推到 GitHub，然後：
- **推薦**：Render Web Service → Build `npm install` ／ Start `npm start`
- 不要用 GitHub Pages（無法跑 Socket.IO 後端）

`network.js` 已寫好自動切換：本機跑 `localhost:7892`，部署後自動用同源 URL。

## 已知範圍 / 後續

- 30+ 件武器中目前實作 6 件代表作的特效（青龍、方天、丈八、紫薇、楊家槍、玉璽等）
- 其餘專武走通用加成；想要哪幾件先寫特效再告訴我
- AI 尚未針對裝備做選擇（單機 AI 暫不掛裝備，PVP 全靠玩家）

## 授權
ISC
