# 星夢樂園｜Supabase 全球帳號與雲端排行榜設定

## 目前連線狀態

Supabase 專案已建立，資料庫遷移已成功套用，並已接入網站程式。

- 專案名稱：`Starry-Dreamland`
- 區域：Tokyo（`ap-northeast-1`）
- 專案目前狀態：`ACTIVE_HEALTHY`
- 資料表：`public.sd_profiles`、`public.sd_game_records`
- 兩張資料表都已啟用 RLS。
- 內部 `SECURITY DEFINER` 函式放在不對外公開的 `private` schema；前端呼叫的 `public` RPC wrapper 為 `SECURITY INVOKER`。
- Supabase Security Advisor 與 Health Advisor 目前沒有警告。
- 網站使用固定版本 `@supabase/supabase-js@2.119.0`，並透過 CDN ESM 載入。

## 0. 已完成：3D 中央廣場第一階段

- 首頁加入 Three.js r187 即時 3D 場景，固定斜上方相機。
- 場景含浮空主島、城堡、觀測塔、遠方星球、雲海及三座可點擊挑戰星門。
- 目前場景是程序生成幾何體的空間原型，尚未替換成最終授權 GLB/glTF 模型。
- 訪客可先預覽廣場；訪客成績不會寫入雲端。
- WebGL／CDN 載入失敗時，仍保留 HTML 遊戲卡片作為備援。

## 1. 已完成：雲端資料庫

已建立以下內容：
- `sd_profiles`：Supabase Auth 使用者 ID、旅人暱稱、建立時間。
- `sd_game_records`：遊戲 ID、成人／星芽分類、分數、結果狀態、獎勵及時間。
- RLS 政策：使用者只能讀取／更新自己的個人資料，只能新增自己的遊戲紀錄。
- 個人紀錄 RPC：`sd_my_game_records()`。
- 全球最佳成績 RPC：`sd_global_best_scores()`，只回傳玩家暱稱及各遊戲最佳成績。
- 高權限函式存放在未公開的 `private` schema，且檢查登入使用者身分。

完整 SQL 位於 [supabase/schema.sql](../supabase/schema.sql)。

## 2. 已完成：網站程式連線

- `config.js` 已設定 Project URL 及公開 Publishable key。
- `js/supabase-client.js` 透過固定版本 CDN 載入 Supabase JavaScript SDK。
- 登入頁面支援電子郵件註冊、登入、登出及密碼重設。
- 登入後會載入雲端暱稱及個人遊玩紀錄。
- 每次遊戲結束會把成績寫入 `sd_game_records`。
- 全球排行榜讀取 `sd_global_best_scores()`。
- 成人星塵與星芽星塵分開計算。

Publishable key 是設計給瀏覽器使用的公開金鑰；RLS 才是資料保護邊界。不要把 Secret key、`service_role`、資料庫密碼或 JWT 私密金鑰放進公開 Repository。

## 3. 仍須由專案擁有者設定一次：登入返回網址

開啟 Supabase Dashboard → Authentication → URL Configuration：

- **Site URL** 設為：
  `https://edward11031709.github.io/Starry-Dreamland/`
- **Redirect URLs** 加入同一個完整網址：
  `https://edward11031709.github.io/Starry-Dreamland/`

儲存後，電子郵件驗證及密碼重設連結才會返回正式網站。此專案管理連線目前未提供 Auth URL Configuration 的寫入操作，因此這一步需要你在 Dashboard 手動完成。

## 4. 電子郵件寄送

Email provider 可用於註冊及登入。建議保留 Email confirmation。Supabase 內建測試郵件服務有寄送限制，適合初期測試；公開營運前建議設定自有 SMTP，並按需要設定 CAPTCHA 及 Auth rate limits。

## 5. 實際測試順序

完成第 3 節後：

1. 開啟正式網站並按 Ctrl + F5。
2. 使用自己的電子郵件及至少 8 個字元的密碼註冊，填入遊戲暱稱。
3. 到信箱開啟 Supabase 驗證郵件，返回正式網站。
4. 登入後完成一局成人挑戰，查看成人星塵與遊玩紀錄是否更新。
5. 再完成一局星芽遊戲，確認只增加星芽星塵。
6. 在另一個瀏覽器／裝置使用同一帳號登入，確認紀錄同步。
7. 開啟排行榜，確認成人與星芽榜分開。

## 6. 舊本機資料

舊版展示帳號與紀錄仍保存在原本的瀏覽器 localStorage；它們不會自動寫入新雲端帳號。請先確認登入及雲端同步正常，再決定是否需要另外製作本機資料匯入功能。

## 7. 重要安全限制

- RLS 能限制誰讀寫資料，但前端仍可被修改。現階段遊戲分數由瀏覽器計算，玩家有機會偽造分數。
- 正式競技排行榜需再加入伺服器端驗證／計分函式。
- 星芽區不需要兒童真實姓名、生日、住址或學校。建議使用家長管理的帳號與遊戲暱稱；排行榜只公開暱稱和分數。
- 免費 Supabase 專案在低活動時可能暫停；請保留定期備份，並留意 Dashboard 通知。
