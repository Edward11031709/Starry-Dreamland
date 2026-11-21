# 星夢樂園 GitHub Pages 發布（目前版本）

正式網站：https://edward11031709.github.io/Starry-Dreamland/

本專案已改用 GitHub Actions 的人工核准發布流程，不再使用舊版 ZIP 上傳或直接把檔案提交到 `main` 的方式。

## 正確更新方式

1. 開發者將更新放在 `dev/*` 或 `feature/*` 分支，建立 Pull Request。
2. 在 PR 的 Checks、Files changed 及管理員預覽確認功能。
3. 驗收完成後，由管理員合併 PR 至 `main`。
4. GitHub → Actions → **星夢樂園檢查與正式發布** → **Run workflow**。
5. Branch 選 `main`，勾選 **「我已檢查此版本並確認發布到公開網站」**，再執行。
6. 確認檢查與部署兩個 job 都成功，開啟正式網站並按 `Ctrl + F5`。

**重要：** PR 合併或更新 `main` 不會自動發布。工作流程只接受由 `Edward11031709` 帳號從 `main` 手動觸發且勾選確認的正式部署。

## 發布前安全檢查

- PR 不是尚未完成的 Draft。
- 所有必要 Checks 都成功。
- 管理員已完成桌機與手機實際測試。
- 沒有把 Supabase service-role key、密碼或私密資料加入網站。
- `production` Environment 的部署分支與 Required reviewers 已在 Repository Settings 核對。

完整流程及失敗處理請見 [RELEASE_WORKFLOW_zh-TW.md](RELEASE_WORKFLOW_zh-TW.md)。
