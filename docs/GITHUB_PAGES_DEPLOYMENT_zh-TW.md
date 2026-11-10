# GitHub Pages 發布（繁體中文）

本專案目前是靜態 HTML/CSS/JavaScript，V4.1 不需要 npm build。Repository 已預先建立 GitHub Actions 部署工作流程：`.github/workflows/pages.yml`。

## 第一步：上傳完整網站檔案
1. 下載 Starry Dreamland GitHub Pages 上傳包。
2. 在 Windows 對 ZIP 按右鍵 → **全部解壓縮**。
3. 打開解壓後的資料夾，選取裡面的所有檔案與資料夾（不要只選最外層資料夾）。
4. 開啟 Repository：https://github.com/Edward11031709/Starry-Dreamland
5. 點 **Add file → Upload files**。
6. 將選取的檔案拖入上傳區。確認 `index.html`、`app.js`、`styles.css`、`config.js` 和 `assets/` 都位於 Repository 根目錄。
7. 點 **Commit changes**，提交到 `main`。

## 第二步：啟用 GitHub Pages
1. Repository → **Settings → Pages**。
2. Build and deployment 的 **Source** 選 **GitHub Actions**。
3. 不需再建立新的 workflow，因為 `.github/workflows/pages.yml` 已經存在。
4. 儲存後，打開 **Actions** 分頁，確認「Deploy Starry Dreamland to GitHub Pages」執行成功。
5. 成功後開啟：https://Edward11031709.github.io/Starry-Dreamland/

## 後續更新
將新版網站檔案更新到 `main` 分支，GitHub Actions 會自動重新發布。請先在本機測試，再上傳新版。務必保留根目錄的 `index.html`。

## 注意
- GitHub Pages 是靜態託管，無法自行執行安全的伺服器端計分或帳號驗證。
- V4.1 使用 localStorage，資料只在同一瀏覽器，不會跨裝置同步。
- 如要跨裝置玩家帳號、共用排行榜及安全積分，需另接 Supabase 等後端並設定 Row Level Security。
- 公開 Repository 不可放置密碼、私密 API key、service-role key 或真實玩家個人資料。
