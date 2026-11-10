# Starry Dreamland｜星夢樂園

**以瀏覽器直接開啟的星空奇幻遊戲平台。**

玩家開啟網站網址後，會直接進入根目錄的 `index.html)，不需要安裝桌面程式，也不需要 npm build。

## 目前可遊玩的內容
- 星夢廣場：三個主遊戲入口。
- 星座校準：依序連接目標星點。
- 月相共鳴：配合月亮軌道節奏按下共鳴。
- 引力迷航：收集兩枚星塵後抵達出口。
- 星芽探索區：星星連連看、星星記憶。
- 星塵積分、個人遊玩紀錄及本機排行榜。
- 星際競技館目前顯示尚未開放。

## 目前資料模式與限制
這個公開入門版使用瀏覽器 `localStorage` 保存展示暱稱、積分與紀錄。資料只存在目前這台裝置及瀏覽器，不會跨裝置同步，也不是正式帳號系統。請勿輸入真實密碼或個人敏感資料。

未來若要全體玩家共用帳號、積分及排行榜，需要另外連接 Supabase 等後端，設定 Row Level Security，並由可信任的伺服器驗證遊戲分數。GitHub Pages 本身只提供靜態網站託管。

## GitHub Pages 發布
預期正式網址：https://Edward11031709.github.io/Starry-Dreamland/

1. 開啟 Repository 的 **Settings → Pages**。
2. 在 **Build and deployment → Source** 選擇 **GitHub Actions**。
3. Repository 已經有 `.github/workflows/pages.yml`，不必再建立 workflow。
4. 開啟 **Actions**，確認 **Deploy Starry Dreamland to GitHub Pages** 執行成功。
5. 成功後開啟上方網址。更新 `main` 分支後會自動重新部署。

目前單檔入門版不需要安裝或建置指令。

## 已確認的 3D 方向
- 電影級寫實奇幻 3D。
- 第一階段先完成固定斜上方鏡頭的中央廣場。
- 後續逐步加入城堡、觀測塔、漂浮島嶼及 3D 小遊戲。
- 自由移動、滑鼠旋轉及縮放列為最後階段。
- 只使用已存在且授權清楚的 GLB/glTF 模型，不自行建模。

## 文件
- [電影級寫實 3D 自由探索路線圖](docs/3D_ROADMAP_CINEMATIC_FREE_ROAM_zh-TW.md)
- [GitHub Pages 發布步驟](docs/GITHUB_PAGES_DEPLOYMENT_zh-TW.md)
- [GaiaCraft 參考案例整理](docs/REFERENCE_GAIACRAFT_zh-TW.md)
- [未來遊戲方向](docs/FUTURE_GAME_IDEAS.md)
- [素材授權紀錄](LICENSES.md)

## 公開 Repository 注意事項
不要上傳真實玩家個資、密碼、service-role key、私密憑證或管理員金鑰。