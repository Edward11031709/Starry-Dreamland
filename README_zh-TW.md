# Starry Dreamland｜星夢樂園

**以瀏覽器直接開啟的星空奇幻遊戲平台。**

正式網址：https://edward11031709.github.io/Starry-Dreamland/

## 遊戲分區

### 成人挑戰區
- **月相共鳴**：12–15 拍不規則節奏挑戰，每局速度不同。
- **星域解碼**：從符號與位置線索推理四位密碼。
- **軌道接線**：在 5 × 5 隨機管線矩陣中旋轉節點，連接能源起點與星門出口。

### 星芽探索區
- **星星連連看**：隨機星點位置的順序連線遊戲。
- **星星記憶**：每局重新洗牌的圖案配對。
- **星座校準**：較輕鬆的星點連線挑戰。
- **引力迷航**：隨機生成迷宮、尋找兩枚星塵碎片並抵達出口。

成人星塵與星芽星塵分開累積，排行榜亦分成成人挑戰榜與星芽探索榜。星際競技館目前尚未開放。

## 關卡變化

每次開始遊戲都會重新生成節奏、密碼、管線、星點位置或迷宮路線，不再使用固定順序與同一張迷宮地圖。

## 目前資料模式與全球帳號

目前公開網站仍使用瀏覽器 `localStorage` 保存暱稱、積分與紀錄。資料只存在目前裝置及瀏覽器，尚未跨裝置同步，也尚未啟用全球註冊／登入。

全球帳號的雲端資料結構已先準備在：
- [Supabase 全球帳號設定指南](docs/SUPABASE_SETUP_zh-TW.md)
- [Supabase 資料表與 RLS SQL](supabase/schema.sql)

要啟用全球登入，仍須建立 Supabase 專案、執行 SQL，並將 Project URL 與公開 publishable/anon key 接入網站。**不可將 service_role key 或其他私密金鑰放進公開 Repository。**

GitHub Pages 只負責發布靜態網站；全球登入、跨裝置資料與共享排行榜由 Supabase 提供。若將來要正式競技，仍需再加伺服器端分數驗證，避免客戶端偽造分數。

## GitHub Pages 發布

Repository 已有 `.github/workflows/pages.yml`，更新 `main` 分支後會自動部署。若需排查發布問題，請參考 [GitHub Pages 發布步驟](docs/GITHUB_PAGES_DEPLOYMENT_zh-TW.md)。

## 未來 3D 方向

- 電影級寫實奇幻 3D，深藍、紫羅蘭、銀白及暖金色。
- 第一階段先完成固定斜上方鏡頭的中央廣場。
- 後續逐步加入城堡、觀測塔、漂浮島嶼及 3D 遊戲。
- 自由移動、鏡頭旋轉及縮放留到最後階段。
- 只使用授權清楚的 GLB/glTF 模型，不使用授權不明素材。

## 其他文件
- [未來遊戲方向](docs/FUTURE_GAME_IDEAS.md)
- [電影級寫實 3D 自由探索路線圖](docs/3D_ROADMAP_CINEMATIC_FREE_ROAM_zh-TW.md)
- [素材授權紀錄](LICENSES.md)
