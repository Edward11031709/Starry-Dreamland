# Starry Dreamland｜星夢樂園

**打開網頁就能開始遊玩的星空奇幻小遊戲平台。**

預計遊戲網址：https://Edward11031709.github.io/Starry-Dreamland/

## 🌌 遊戲內容

- **星夢廣場**：從主廣場選擇想玩的設施。
- **星座校準**：在時間內依照指引連接正確星點。
- **月相共鳴**：觀察月亮移動，在中央提示區按下共鳴。
- **引力迷航**：控制發光星球穿越迷宮，收集星塵後抵達出口。
- **星芽探索區**：提供星星連連看與星星記憶，適合輕鬆練習。
- **排行榜與遊玩紀錄**：查看目前瀏覽器保存的分數及挑戰紀錄。
- **星際競技館**：目前為尚未開放的遠景設施，未來可擴充運動及競技遊戲。

## 🎮 如何開始遊玩

1. 使用電腦或手機瀏覽器開啟遊戲網址。
2. 在登入畫面輸入暱稱，進入星夢廣場。
3. 點選任一遊戲設施，閱讀遊戲說明後按下「開始挑戰」。
4. 完成遊戲後查看分數、星塵獎勵及個人紀錄。
5. 使用頁面上方導覽列前往星芽探索區、排行榜或遊玩紀錄。

本版本不需要下載桌面程式，也不需要安裝開發工具。

## ✨ 視覺與未來方向

- 介面主要使用繁體中文（台灣）。
- 美術方向為電影級寫實奇幻 3D，採深藍、紫羅蘭、銀白及暖金色系。
- 3D 開發先完成固定斜上方視角的中央廣場，再加入城堡、觀測塔、漂浮島及 3D 小遊戲。
- 自由移動、滑鼠旋轉視角及縮放列為最後階段。
- 只使用已存在且授權清楚的 GLB/glTF 模型，不自行建立 3D 模型。

## 📌 目前版本的重要限制

目前版本使用瀏覽器的 `localStorage` 保存暱稱、星塵積分及遊玩紀錄。因此：

- 資料只存在目前裝置的目前瀏覽器。
- 換裝置、換瀏覽器或清除網站資料後，紀錄不會自動帶過去。
- 目前排行榜是本機展示排行榜，不是全體玩家共用排行榜。
- 請勿輸入真實密碼或敏感個人資料。

未來若要提供全體玩家共用帳號、跨裝置紀錄及正式排行榜，需要另外連接雲端資料庫（例如 Supabase）、設定資料存取權限，並由可信任的伺服器端驗證分數。GitHub Pages 本身只負責發布靜態網站，不能單獨提供安全的帳號驗證或伺服器計分。

## 🚀 GitHub Pages 發布方式

本 Repository 已加入 GitHub Actions 發布流程：`.github/workflows/pages.yml`。

首次啟用時，請由 Repository 擁有者手動設定一次：

1. 開啟本 Repository 的 **Settings → Pages**。
2. 在 **Build and deployment → Source** 選擇 **GitHub Actions**。
3. 開啟 **Actions** 分頁。
4. 確認「Deploy Starry Dreamland to GitHub Pages」顯示成功。
5. 使用上方預計遊戲網址開啟網站。

之後更新 `main` 分支時，GitHub Actions 會自動重新發布。

## 📚 專案文件

- [繁體中文專案與遊玩說明](README_zh-TW.md)
- [GitHub Pages 發布步驟](docs/GITHUB_PAGES_DEPLOYMENT_zh-TW.md)
- [電影級寫實 3D 升級路線圖](docs/3D_ROADMAP_CINEMATIC_FREE_ROAM_zh-TW.md)
- [GaiaCraft 參考案例整理](docs/REFERENCE_GAIACRAFT_zh-TW.md)
- [未來小遊戲提案](docs/FUTURE_GAME_IDEAS.md)
- [素材授權紀錄](LICENSES.md)

## 🔒 公開 Repository 注意事項

此 Repository 為公開專案。請勿提交真實玩家個資、密碼、私密 API 金鑰、Supabase service-role key 或其他管理員憑證。