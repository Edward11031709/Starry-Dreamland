# 星夢樂園正式發布檢查表

## PR 驗收
- [ ] PR 目標分支是 `main`，來源為 `dev/*` 或 `feature/*`。
- [ ] PR 不再是未驗收的 Draft。
- [ ] Files changed 只包含本次預期的變更。
- [ ] GitHub Actions 的必要檢查全部成功。
- [ ] 管理員已檢查私有預覽或可用測試版本。
- [ ] 桌機／手機操作、角色碰撞、遊樂設施及主要遊戲均已實際驗收。
- [ ] 沒有不必要的 Supabase schema、RLS/RPC 或正式資料變更。
- [ ] 管理員明確同意將此候選版本公開。

## 合併
- [ ] 管理員核准後，才合併 PR 至 `main`。
- [ ] 記錄合併後的 main commit SHA。
- [ ] 確認 GitHub Environment `production` 的分支限制及 Required reviewers 設定。

## 正式發布
- [ ] Actions → **星夢樂園檢查與正式發布**。
- [ ] Run workflow 的 Branch 選 `main`。
- [ ] 勾選 `confirm_release`（「我已檢查此版本並確認發布到公開網站」）。
- [ ] 檢查 job 成功。
- [ ] 部署 job 成功。
- [ ] `release.json` 記錄的 SHA 與預期版本一致。
- [ ] 正式網站已用 `Ctrl + F5` 重新整理並完成基本冒煙測試。

## 失敗／回復
- [ ] 任一檢查失敗時不繼續發布。
- [ ] 部署失敗時先檢查 Actions log，不宣稱已上線。
- [ ] 必要時建立回復 PR，仍經同樣驗收與手動發布。
- [ ] 不以程式回復流程回滾 Supabase 玩家資料。
