# 星夢樂園版本發布流程

## 目標
日常開發與正式公開分離。開發成果先留在 PR／開發分支，玩家只看到管理員明確核准並部署的版本。

## 分支與環境
- `main`：已通過檢查、等待管理員驗收的候選版本；合併 PR 本身不代表發布。
- `dev/*`、`feature/*`：日常開發分支。
- GitHub Pages：只由受保護的 `production` 環境部署。
- PR CI：執行語法與測試，保留可供管理員檢查的 Actions artifact；不部署到公開 Pages。

## 管理員發布步驟
1. 在 PR 檢查變更、CI 與測試結果，並親自驗收預覽。
2. 管理員明確核准後才合併至 `main`。
3. 到 Actions 執行「發布星夢樂園到 GitHub Pages」，選擇 `main`，並勾選確認輸入。
4. GitHub 的 `production` Environment 必須設定 Required reviewers（管理員本人），且只允許 `main` 分支部署。沒有完成這項設定前，不可把 workflow_dispatch 當成已受保護。
5. 通過環境審核後才會更新公開網站。

## 舊版與回復
- 每次正式發布記錄 commit SHA，建議同時建立版本 tag（例如 `release-YYYYMMDD-N`）。
- 回復時選擇先前核准的 commit，建立回復 PR 或由管理員核准回復 commit，再經相同正式發布流程。
- 程式版本回復不執行 Supabase migration rollback，不改動玩家帳號、星塵、服裝、遊戲紀錄或聊天資料。

## 預覽與存取限制
- PR 的檢查結果與 artifact 透過 GitHub 登入後查看；不要把未核准的開發版部署到正式 Pages 網址。
- GitHub Pages 是公開網站，不能把未受保護的 preview 路徑當成管理員私有空間。
- 若未來需要在遊戲內管理中心直接預覽，應使用具真正存取控制的私有預覽主機／私有儲存與後端簽發短效連結；不能只靠前端隱藏按鈕或 URL 難猜來保護。

## 發布前檢查
- 自動檢查通過。
- 管理員實際驗收桌機與手機版。
- 確認沒有把尚未完成的功能標成已上線。
- 確認 Supabase 相容性；未經另行批准不執行資料庫寫入。
