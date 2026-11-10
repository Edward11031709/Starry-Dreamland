# GitHub Pages 發布（繁體中文）

本專案目前是靜態 HTML/CSS/JavaScript，現行版本不需 npm build。

## 上傳前
解壓縮發布 ZIP，確認以下項目位於 Repository 根目錄：
- index.html
- app.js
- styles.css
- config.js
- assets/
- .nojekyll

不要把整個資料夾再多包一層上傳；GitHub Pages 必須能在根目錄直接找到 index.html。

## 啟用 Pages
1. 開啟 Repository： https://github.com/Edward11031709/Starry-Dreamland
2. Settings → Pages。
3. Build and deployment 的 Source 選 **Deploy from a branch**。
4. Branch 選 **main**，資料夾選 **/(root)**。
5. Save，等待部署狀態變成成功。
6. 開啟預期網址：https://Edward11031709.github.io/Starry-Dreamland/

## 後續更新
把新版網站檔案更新到 main 分支，Pages 會自動重新發布。請先在本機測試，再上傳新版。更新時保留 index.html 於根目錄。

## 注意
- Pages 是靜態託管，無法執行安全的伺服器端計分或帳號驗證。
- 現行 V4.1 使用 localStorage，資料只在同一瀏覽器。
- 如要跨裝置玩家帳號、共用排行榜及安全積分，需另接 Supabase 等後端並設定 Row Level Security。
- 公開 Repository 不可放置密碼、私密 API key、service-role key 或個人資料。