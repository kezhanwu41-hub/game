# Google Apps Script 部署說明

把「羣雄遊戲館」用 GAS 包成 Web App，最簡上線方式：

## 步驟

1. 開 https://script.google.com → 新專案
2. 把 `Code.gs` 內容貼進專案的 `Code.gs`
3. 把專案根目錄的 `index.html` / `bingfa.html` / `huaxia.html` 內容
   分別新增為 GAS 的 HTML 檔（檔案 → 新增 → HTML，命名要一致）
4. 把 `appsscript.json` 內容覆蓋到 GAS 的 manifest（顯示「資訊清單」後可編輯）
5. 部署 → 新增部署 → 類型「網頁應用程式」
   - 執行身分：我
   - 存取權：任何人
6. 完成後拿到網址，例如：
   `https://script.google.com/macros/s/AKfycb.../exec`

## CSS / JS / 圖片

GAS 自身不託管二進位資源；本專案的 `css/*.css` 與 `js/**/*.js`
建議透過 jsDelivr CDN 載入（推到 GitHub 後即可使用）：

```
https://cdn.jsdelivr.net/gh/<USER>/<REPO>@<BRANCH>/css/style.css
https://cdn.jsdelivr.net/gh/<USER>/<REPO>@<BRANCH>/js/main.js
```

`Code.gs` 中的 `CDN_BASE` 變數已預設好替換規則，把 `GITHUB_OWNER`、
`GITHUB_REPO`、`GITHUB_BRANCH` 改成你自己的即可。

## 路由

- `?page=index`（或不帶參數）→ 大廳
- `?page=bingfa` → 兵法推演
- `?page=huaxia` → 華夏風雲錄

## 另一個更簡單的選項

如果不想用 GAS，可直接：

1. **GitHub Pages**：靜態頁面（純前端）就能跑兵法推演 + 華夏風雲錄的單機部分
2. **Render Web Service**：完整支援華夏風雲錄的 P2P 對戰（需 Node.js + Socket.IO）
   - Build: `npm install`
   - Start: `npm start`

GAS 適合：想拿到 Google 域名 + 不想管伺服器 + 不需要即時 P2P 對戰的情境。
