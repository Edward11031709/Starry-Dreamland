# 正式版本與發布狀態

## 2026-11-21 唯讀核對

- Repository：`Edward11031709/Starry-Dreamland`；預設分支：`main`。
- `main` 最新 commit：`607836fe88fe9a21396571b622306b909ec615a1`。
- 最近一次可確認成功的正式 Pages 發布仍是 GitHub Actions run #138（2026-11-18，`workflow_dispatch`，`main`）；「管理員確認後發布正式版」job 與「發布正式網站」步驟均為 `success`，其 `head_sha` 與目前 main 最新 commit 相同。
- #138 之後未發現更新的 production `workflow_dispatch`。PR 驗證不代表發布：PR #17 最新 run #158（2026-11-21）成功，Node tests 21 passed／0 failed，語法與 inline script parse 通過，deploy job 為 `skipped`；PR #18 最新 run #156 成功，deploy job 亦未執行。
- PR #17 的中間驗證 run #150–#153 曾因新測試擷取／語法問題失敗，已修正；其後 #154、#157、#158 成功。以最新 #158 的成功結果為準。
- PR #17 head：`dev/avatar-hair-couture-20261118` @ `537be443aba745131bee95e2832c4bb4ad390a2d`；PR #18 head：`feature/park-atmosphere-refinement` @ `55e8dae13b5c1d589dc27c117cd31606e3b06ba7`。兩者皆為 Draft／Open，未合併。
- PR #17 run #158 沒有產生 Actions artifact；目前沒有可直接開啟的視覺預覽 artifact。私有預覽仍須由通過資料庫管理員驗證的管理中心流程執行。
- 本次無法從外部讀取 Pages 的 `release.json` 端點，因此正式發布 SHA 的確認依據是 GitHub Actions #138 的成功部署 job，而非即時 HTTP 讀取。
- GitHub branch list 回報 `main` 的 `protected=false`，目前可讀取的 repository rulesets 清單為空；目前連線無法確認 `production` Environment 的 Required reviewers 設定。**不得因此宣稱 main 或 production 環境已完整受保護**，發布前需由 owner 在 GitHub 設定中再次核對。
- 本次每日開發只更新 `dev/*` 分支；不得把開發分支或 PR head SHA 當成正式版本。

## 正式發布安全邊界

- `.github/workflows/pages.yml` 只由 PR 觸發驗證，或由管理員手動 `workflow_dispatch`。
- 正式部署 job 另要求：分支為 main、觸發者為 Repository owner、`confirm_release=true`，並使用名為 `production` 的 GitHub Environment。
- PR 檢查成功、建立私有預覽、建立或更新 PR，都不代表正式發布核准。
- 每日開發不得合併 PR、推送 `main`、觸發正式發布或更改 GitHub Pages 設定。
- 正式發布後應保留 `release.json` 的實際部署 SHA 與時間；若外部端點無法讀取，應以成功的 Pages deploy job 作為有限度證據，並明確記錄驗證限制。

## 資料安全

- 不執行 Supabase migration，不變更 schema／RLS／RPC，不寫入正式玩家資料。
- 不修改玩家星塵、服裝所有權、帳號、遊戲紀錄或聊天資料。
- 私有預覽由 Supabase Edge Function 重新驗證登入者與資料庫 `sd_is_admin()`，使用 Private Storage 與短效 URL；不需要 GitHub Actions Secrets。
- 任何星塵管理功能都必須先有伺服器端管理員授權與不可任意修改的帳本；真實餘額調整另需使用者明確指示。
