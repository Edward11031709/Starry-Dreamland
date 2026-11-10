# Starry Dreamland｜星夢樂園

**以瀏覽器直接開啟的星空奇幻遊戲平台。**

首頁固定使用根目錄的 `index.html`。玩家打開網站網址即可進入遊戲，不需要安裝桌面程式。

## 專案方向
- 介面語言：繁體中文（台灣）。
- 美術：電影級寫實奇幻 3D；深藍、紫羅蘭、銀白、暖金。
- 先以固定斜上方相機完成穩定廣場；自由移動、滑鼠旋轉及縮放列為最後階段。
- 僅使用已有且授權清楚的 GLB/glTF 模型，不自行建模。
- 既有 V4.1 是目前遊戲玩法基準，更新時應保留三款主遊戲與星芽探索區。

## 遊戲區域
- 星夢廣場：主遊戲入口。
- 星芽探索區：兒童友善的星座連線、星星記憶。
- 星際競技館：未來運動與競技內容，現階段鎖定。

## 目前版本限制
現行 V4.1 是本機展示版本，使用瀏覽器 localStorage。帳號、積分與紀錄只存在同一個瀏覽器，不會跨裝置同步。要做全體玩家共用帳號與排行榜，需另接 Supabase 等後端並正確設定 RLS。GitHub Pages 只負責靜態網站檔案，不提供安全的伺服器端計分 API。

## GitHub Pages 發布
1. 將網站發佈包解壓縮。
2. 把 `index.html`、`app.js`、`styles.css`、`config.js`、`assets/` 等內容上傳到 Repository 根目錄。
3. 進入 Settings → Pages。
4. Source 選 Deploy from a branch；Branch 選 `main`；資料夾選 `/(root))。
5. 儲存並等待 GitHub Pages 部署完成。

預期網址：https://Edward11031709.github.io/Starry-Dreamland/

## 文件
- [電影級寫實 3D 自由探索路線圖](docs/3D_ROADMAP_CINEMATIC_FREE_ROAM_zh-TW.md)
- [GitHub Pages 發布步驟](docs/GITHUB_PAGES_DEPLOYMENT_zh-TW.md)
- [GaiaCraft 參考案例整理](docs/REFERENCE_GAIACRAFT_zh-TW.md)
- [未來遊戲方向](docs/FUTURE_GAME_IDEAS.md)
- [素材授權紀錄](LICENSES.md)

## 公開 Repository 注意事項
不要上傳真實玩家個資、密碼、service-role key、私密憑證或任何管理員金鑰。