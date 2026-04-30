/**
 * 羣雄遊戲館 — Google Apps Script Web App 入口
 *
 * 功能：把 GitHub 上的靜態檔（index.html / bingfa.html / huaxia.html / css / js / img）
 *      包裝成 GAS Web App，讓任何人能用 GAS 網址直接遊玩。
 *
 * 部署步驟：
 * 1) script.google.com → 新專案 → 貼上本檔內容
 * 2) 把專案資料夾下的 `index.html` / `bingfa.html` / `huaxia.html` 加入 GAS 為 HTML 檔
 *    (檔案 → 新增 → HTML)
 * 3) 部署 → 新增部署 → 類型「網頁應用程式」
 *    執行身分：我；存取權：任何人
 * 4) 取得部署網址 → 完成上線
 *
 * 注意：CSS / JS / img 仍需透過 GitHub Pages 或 jsDelivr CDN 載入，
 *      因此 doGet() 會把資源 URL 改寫到 raw.githack.com。
 */

// ──── 設定：你的 GitHub 倉庫資訊 ────────────────────────
var GITHUB_OWNER = 'kezhanwu41-hub';   // GitHub 帳號
var GITHUB_REPO  = 'game';              // 倉庫名稱
var GITHUB_BRANCH= 'main';              // 分支
var CDN_BASE = 'https://cdn.jsdelivr.net/gh/' + GITHUB_OWNER + '/' + GITHUB_REPO + '@' + GITHUB_BRANCH;

// ──── 路由 ─────────────────────────────────────────────
function doGet(e) {
  var page = (e && e.parameter && e.parameter.page) || 'index';
  var fileMap = {
    'index'  : 'index',
    'bingfa' : 'bingfa',
    'huaxia' : 'huaxia',
    'lobby'  : 'index'
  };
  var name = fileMap[page] || 'index';

  var template = HtmlService.createTemplateFromFile(name);
  template.cdn = CDN_BASE;
  return template
    .evaluate()
    .setTitle('羣雄遊戲館 — 兵法推演 / 華夏風雲錄')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

/**
 * 提供給 HTML 內 inline 載入（不常用 — 建議改用 raw.githack/jsDelivr）
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * 健康檢查（可選）— 部署後可用 ?action=health 看狀態
 */
function doPost(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, ts: new Date().toISOString() }))
    .setMimeType(ContentService.MimeType.JSON);
}
