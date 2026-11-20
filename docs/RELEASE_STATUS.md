# 正式版本與發布狀態

## 2026-11-20 唯讀核對

- Repository：`Edward11031709/Starry-Dreamland`；預設分支：`main`。
- `main` 最新 commit：`607836fe88fe9a21396571b622306b909ec615a1`。
- GitHub Actions run #138（2026-11-18，`workflow_dispatch`，`main`）的「管理員確認後發布正式版」job 與「發布正式網站」步驟均為 `success`；該 run 的 `head_sha` 為上述 commit。依 workflow 的 `release.json` 產生步驟，這是目前可確認的最近一次成功 Pages 發布候選 SHA。
- 最近可見的 Actions 執行紀錄中，#138 之後沒有更新的 production workflow dispatch；#139–#147 均為 PR 驗證，最新 #147 成功，#145／#146 因後續提交而取消，沒有任何一個部署正式網站。
- 本次無法從外部讀取 Pages 的 `release.json` 端點，因此發布 SHA 的確認依據是 GitHub Actions #138 的成功部署 job，而非即時 HTTP 讀取。
- 開啟中的 PR #17（角色模型／外觀）及 PR #18（園區氛圍）皆為 Draft，未合併；目前沒有開啟中的正式發布 PR。
- GitHub branch list 回報 `main` 的 `protected=false`，目前可讀取的 repository rulesets 清單為空；目前連線無法確認 `production` Environment 的 Required reviewers 設定。**不得因此宣稱 main 或 production 環境已完整受保護**，發布前需由 owner 在 GitHub 設定中再次核對。
- 今日開發只更新 `dev/*` 分支；不得把開發分支或 PR head SHA 當成正式版本。

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
