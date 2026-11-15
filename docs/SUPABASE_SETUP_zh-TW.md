# 星夢樂園｜Supabase 全球帳號與雲端排行榜設定

這份文件說明如何將 GitHub Pages 上的星夢樂園接上 Supabase。網站目前仍處於本機展示登入模式；尚未設定專案及前端整合前，請不要把它當成已啟用的全球帳號。

## 1. 建立免費 Supabase 專案

1. 開啟 https://supabase.com/dashboard 並登入。
2. 若第一次使用，建立一個 Organization。
3. 選擇 **New project**。
4. 專案名稱填入 `starry-dreamland`。
5. Plan 選 **Free**。
6. Region 建議選 **Northeast Asia (Tokyo)**（若沒有此選項，選 **APAC / Southeast Asia (Singapore)**）。資料庫建立後不能直接改區域；要換區域需建立新專案並搬遷資料。
7. 設定一組新的、唯一且夠長的 Database Password，妥善保存在自己的密碼管理器。**不要把這個資料庫密碼傳給協作者或貼進 GitHub。**
8. 按 **Create new project**，等待 Dashboard 顯示專案可用。

Free Plan 目前可建立最多 2 個 active free projects。免費專案在 7 天低活動後可能暫停；暫停後可在 1 年內從 Dashboard 按 **Resume project** 恢復。

## 2. 在資料庫建立星夢樂園資料表

1. 開啟專案的 **SQL Editor**。
2. 按 **New query**。
3. 開啟 Repository 中的 [supabase/schema.sql](../supabase/schema.sql)，複製完整內容。
4. 貼到 SQL Editor，按 **Run**。
5. 確認畫面沒有紅色錯誤，再開啟 **Table Editor**，檢查是否出現：
   - `sd_profiles`
   - `sd_game_records`

這份 SQL 會建立玩家暱稱、個人遊戲紀錄、成人／星芽分區、RLS 權限及排行榜函式。

## 3. 設定登入後的返回網址

到 **Authentication → URL Configuration**：

- **Site URL** 設為：
  `https://edward11031709.github.io/Starry-Dreamland/`
- **Redirect URLs** 加入同一個完整網址：
  `https://edward11031709.github.io/Starry-Dreamland/`

這能讓電子郵件驗證與密碼重設連回星夢樂園。Supabase 只會接受允許清單內的 redirect URL。

## 4. 取得網站用的公開連線資訊

在專案上方按 **Connect**，或進入 **Project Settings → API Keys**：

- 複製 **Project URL**。
- 複製 **Publishable key**（通常以 `sb_publishable_` 開頭）。

這兩項會用來讓公開網頁連線。Publishable key 本來就會出現在瀏覽器程式中；安全性依靠本文件建立的 RLS 權限。**不要複製 Secret key（`sb_secret_`）、舊版 `service_role` key、資料庫密碼或 JWT 私密金鑰。**

先不要把任何金鑰貼進公開留言、截圖或 GitHub Issue。你可以只回報「Project 已建立、SQL 成功」，之後再依照安全步驟設定網站連線。

## 5. 驗證信設定

Email 登入預設已啟用；建議保留 Email confirmation，讓玩家先驗證電子郵件再登入。

Supabase 內建測試郵件服務有寄送限制（目前文件列出每小時 2 封），適合初期測試。要正式開放大量玩家註冊時，應設定自己的 SMTP 郵件服務，並完成 CAPTCHA／Auth rate limits 等防濫用設定。

## 6. 完成網站整合（需在專案建立後進行）

目前 Repository 的 `config.js` 是空白 `local-demo` 模式，網站尚未載入 Supabase SDK。建立專案及執行 SQL 後，才進行以下程式整合：

- 載入 Supabase JavaScript client，接上 Project URL 與 Publishable key。
- 電子郵件註冊、驗證、登入、登出及重設密碼。
- 以 Supabase Auth user ID 建立／讀取 `sd_profiles`。
- 把成人及星芽紀錄分別寫入 `sd_game_records`。
- 個人紀錄讀取 `sd_my_game_records()`；全球排行榜讀取 `sd_global_best_scores()`。
- 保留成人／星芽獨立積分，並規劃本機展示資料轉入帳號的方式。

**重要限制：** 目前分數仍由瀏覽器計算，RLS 能限制使用者資料存取，但無法完全阻止玩家自行修改前端程式偽造分數。正式競技排行榜仍需伺服器端驗證遊戲結果。

## 7. 資料與兒童隱私

星芽區不需要收集兒童真實姓名、生日、住址或學校。建議使用家長管理的帳號及遊戲暱稱；全球排行榜只顯示暱稱與分數，不公開 email 或聯絡方式。
