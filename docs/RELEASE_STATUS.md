# 正式版本與發布狀態

## 2026-11-18 唯讀核對

- Repository：`Edward11031709/Starry-Dreamland`
- 預設分支：`main`
- `main` 最新候選 commit：`607836fe88fe9a21396571b622306b909ec615a1`（2026-11-18，移除私有預覽對 GitHub Actions Secrets 的依賴）。
- 本次每日開發從上述 SHA 建立獨立 `dev/*` 分支；不直接提交 `main`。
- 本次開發 PR 的自動驗證已成功；正式部署 job 為 skipped，並非正式發布。
- 以 `workflow_dispatch` 篩選目前可見的 Actions 執行紀錄，沒有找到正式發布 run；main 最新 commit 也沒有回報 combined status。
- GitHub Pages 的 `release.json` 公開端點目前無法由本次檢查工具讀取，因此**無法可靠確認目前玩家實際看到的正式版 commit SHA**。不得把 `main` 最新候選 SHA 當成已發布版本。
- GitHub integration 無法讀取 main branch protection 設定；正式發布前仍須由 Repository owner 確認 `production` Environment 的 Required reviewers 與分支限制。

## 正式發布安全邊界

- `.github/workflows/pages.yml` 僅由 PR 觸發驗證，或由管理員手動 `workflow_dispatch`。
- 正式部署 job 另要求：分支為 main、觸發者為 Repository owner、confirm_release 設為 true，並通過 production Environment 審核。
- PR 檢查成功、建立私有預覽、建立或更新 PR，都不代表正式發布核准。
- 每日開發不得合併 PR、推送 `main`、觸發正式發布或更改 GitHub Pages 設定。
- 正式發布後應以 `release.json` 記錄實際部署 SHA 與時間；在取得可讀的正式部署紀錄前，正式版 SHA 維持「待 owner 確認」。

## 資料安全

- 不執行 Supabase migration，不變更 schema／RLS／RPC，不寫入正式玩家資料。
- 不修改玩家星塵、服裝所有權、帳號、遊戲紀錄或聊天資料。
- 私有預覽由 Supabase Edge Function 重新驗證登入者與資料庫 `sd_is_admin()`，使用 Private Storage 與短效 URL；不需要 GitHub Actions Secrets。
- 任何星塵管理功能都必須先有伺服器端管理員授權與不可任意修改的帳本；真實餘額調整另需使用者明確指示。
