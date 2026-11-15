# 星夢樂園｜全球帳號與雲端排行榜設定

本文件是下一階段接通全球帳號時使用的設定說明。**目前公開網站仍是本機展示登入**；這份 SQL 不會自行建立 Supabase 專案，也不會讓網站在尚未設定金鑰時假裝已經有全球帳號。

## 建議架構

- GitHub Pages：繼續發布遊戲介面，全球玩家使用同一個網址。
- Supabase Auth：處理電子郵件／密碼登入、註冊及驗證信。
- Supabase Database：儲存帳號暱稱、遊戲紀錄及全球排行榜。
- 成人挑戰與星芽探索：資料表使用 category 分開，兩邊分開計分與排名。

Supabase 免費方案目前提供 50,000 月活躍使用者、每個專案 500 MB 資料庫及 5 GB egress；免費專案閒置一週後可能暫停。請以官方價格頁面為準：https://supabase.com/pricing

## 一次性建立雲端專案

1. 前往 https://supabase.com/ 建立帳號並新增一個 Free 專案。
2. 專案建立後，在 **Project Settings → API** 找到 Project URL 與 publishable/anon key。
3. 在 **SQL Editor** 執行 Repository 中的 `supabase/schema.sql`。
4. 在 **Authentication → URL Configuration**，將 Site URL 設為：
   `https://edward11031709.github.io/Starry-Dreamland/`
5. 把同一個公開網址加入 Redirect URLs。
6. 保留電子郵件驗證；設定完成後，網站登入流程再接入 Supabase。

## 安全規則

- 公開網站只可使用 publishable/anon key。它本來就是瀏覽器端使用的公開金鑰，安全性必須依靠 RLS。
- **絕對不要**把 `service_role`、secret key、資料庫密碼或管理員憑證放進 `config.js`、HTML、GitHub 或聊天訊息。
- SQL 已啟用 RLS。個人資料及遊玩明細只允許本人讀取；新增紀錄時只能以自己的 user ID 寫入。全球排行榜透過資料庫函式只回傳玩家暱稱與每款遊戲最佳分數，不回傳電子郵件。
- 目前的瀏覽器遊戲仍由前端計算分數。即使使用登入與 RLS，仍不能完全防止玩家修改瀏覽器程式、偽造自己的分數。若要做正式競技排名，下一階段必須增加伺服器端關卡驗證／計分函式。

## 設定完成後要做的網站整合

目前 `config.js` 保留空白設定，沒有啟用雲端模式。等 Supabase 專案建立後，才把 Project URL 與公開 publishable/anon key 寫進設定，並完成以下功能：

- 電子郵件註冊、驗證、登入、登出及重設密碼。
- 登入後載入雲端暱稱、成人／星芽星塵及個人遊玩紀錄。
- 每次完成挑戰後同步紀錄。
- 排行榜改讀取全球最佳成績。
- 本機展示模式保留為離線／測試備援。

## 兒童資料提醒

星芽區不需要收集兒童姓名、生日、住址或學校。建議以家長管理的帳號建立玩家暱稱，排行榜只公開暱稱與分數，不公開 email 或任何聯絡資料。
