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

## 全球帳號與雲端資料

星夢樂園已建立 Supabase 專案，並建立：
- `sd_profiles`：玩家暱稱及帳號資料。
- `sd_game_records`：成人／星芽遊戲分區、分數、狀態及星塵獎勵。
- 個人遊玩紀錄及全球最佳成績 RPC。
- RLS 存取政策；內部高權限函式放在未公開的 `private` schema。

網站已接上 Supabase JavaScript SDK（固定版本）及 Project URL／公開 Publishable key，登入介面支援電子郵件註冊、登入、登出、重設密碼、個人資料／紀錄同步及全球排行榜。

**首次正式註冊前，專案擁有者仍須在 Supabase Dashboard → Authentication → URL Configuration 設定：**

- Site URL：`https://edward11031709.github.io/Starry-Dreamland/`
- Redirect URLs：加入同一個完整網址。

設定後再使用正式網站測試註冊與驗證信。Supabase 內建郵件寄送額度較適合初期測試；公開營運前建議設定自有 SMTP。

### 安全與資料限制
- 網站只使用公開 Publishable key；不可把 `sb_secret_`、`service_role`、資料庫密碼或管理員金鑰放入公開 Repository。
- 資料表啟用 RLS，個人紀錄限制為本人；全球排行榜只回傳暱稱與最佳成績。
- 舊版本機展示資料仍留在使用過的瀏覽器，**不會自動匯入新雲端帳號**。
- 目前遊戲分數仍由前端計算。若未來要做正式競技，需另外增加伺服器端計分／驗證，避免偽造分數。
- 免費 Supabase 專案閒置時可能暫停；暫停後需在官方期限內從 Dashboard 恢復。

完整設定與維護說明：[Supabase 全球帳號設定指南](docs/SUPABASE_SETUP_zh-TW.md)。

## 關卡變化

每次開始遊戲都會重新生成節奏、密碼、管線、星點位置或迷宮路線，不再使用固定順序與同一張迷宮地圖。

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
