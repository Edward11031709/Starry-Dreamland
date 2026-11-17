# 星夢樂園安全與資料版本檢查（2026-11-17）

> 本文件是唯讀檢查紀錄與開發計畫，不代表已修正生產資料庫。檢查期間沒有執行 DDL、migration、資料更新或星塵調整。

## 已確認的現況

### 星塵獎勵可信度

- public.sd_game_records 啟用 RLS。
- Players submit records only for themselves INSERT policy 只檢查 auth.uid() = user_id。
- reward 欄位限制為 0–15，但資料表本身沒有驗證 reward 是否符合遊戲結果。
- private.sd_avatar_state() 以成人遊戲紀錄的 reward 加總，再扣除 avatar_spent_points 作為餘額。
- private.sd_avatar_unlock() 也以相同的紀錄加總計算可用餘額。

因此，登入玩家仍可能直接送入符合欄位範圍、但未經伺服器驗證的獎勵紀錄。這會影響星塵餘額與服裝解鎖可信度。單純把前端按鈕隱藏、限制單筆 reward 上限，或在 RPC 內重算客戶端提供的 score，都不足以構成完整防護。

### 管理員身分

- 管理員名單存放於 private.sd_admins。
- private.sd_is_admin() 使用 auth.uid() 對照管理員名單。
- 管理員前端入口應繼續以資料庫 RPC 的結果為依據；不得以暱稱、email、user_metadata 或 localStorage 作為授權依據。

### Migration 版本落差

- 生產資料庫目前回報 11 筆已套用 migration。
- GitHub main 的 supabase/migrations 目前只追蹤到 1 個 SQL 檔。
- supabase/schema.sql 不能視為可安全重建現有資料庫的完整現況，也不可直接重跑。

在建立任何新 migration 前，必須先盤點每一筆已套用 migration 的 SQL 來源、schema 物件與 repo 差異，補齊版本追蹤策略；不可重建專案或重置玩家資料。

## 安全實作順序

1. 設計伺服器權威的遊戲回合／挑戰流程：伺服器建立一次性 session 或 nonce，保存遊戲種類、參數、有效期限與可驗證的結果界線。
2. 由受保護的 Edge Function 或受限 RPC 驗證回合結果；未驗證的客戶端不得自行指定 reward。
3. 移除或收緊直接新增獎勵紀錄的權限，並保留必要的遊戲紀錄讀取能力。
4. 以不可任意修改的星塵帳本記錄管理員調整：actor、target、delta、reason、balance_after、created_at；管理員只能透過伺服器端授權的原子操作調整自己或指定玩家的餘額。
5. 更新 sd_avatar_state() 與 sd_avatar_unlock()，讓經驗證的獎勵和帳本調整共同決定餘額。
6. 在隔離的開發資料庫／測試環境驗證 RLS、負數、超額、競態、重複請求、非管理員呼叫與管理員自我調整，再提出 production migration 供管理員審核。

## 管理員私有預覽設計

- 新增 `sd-admin-preview` Edge Function 原始碼：先驗證使用者 JWT，再呼叫 `sd_is_admin()`，僅簽發 5 分鐘私有 Storage URL。
- 新增 main owner 手動觸發的私有預覽上傳 job；只讀取指定 commit 的靜態檔案，不執行候選程式碼，並拒絕 Public bucket。
- 管理中心加入隔離 sandbox iframe 預覽，刻意不授予 `allow-same-origin`，不共享正式登入工作階段。
- 這些是 repository 開發分支的程式與設定文件；尚未部署 Edge Function、建立 bucket 或設定 Actions secrets，未影響生產 Supabase。

## 本次開發分支狀態

- 角色模型新增立體肩飾、寶石肩扣、V 字領飾、胸前刺繡、垂墜腰飾與額前冠飾。
- 3D 園區加入城堡冷色輪廓補光與緩慢星空動態。
- 管理中心可檢視公開版本、候選版本、PR 差異與歷史提交。
- 私有預覽程式已加入，但需 owner 設定 Private bucket、GitHub secrets 並部署 Edge Function 才能實際使用。
- 星塵帳本與伺服器權威獎勵流程尚未完成。
- 沒有寫入或變更生產 Supabase 資料。