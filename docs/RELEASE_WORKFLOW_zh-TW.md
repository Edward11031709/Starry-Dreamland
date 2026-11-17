# 星夢樂園版本發布流程

## 目標
日常開發與正式公開分離。開發成果先留在 PR／開發分支，玩家只看到管理員明確核准並部署的版本。

## 分支與環境
- `main`：已通過檢查、等待管理員驗收的候選版本；合併 PR 本身不代表發布。
- `dev/*`、`feature/*`：日常開發分支。
- GitHub Pages：只由受保護的 `production` 環境部署；部署時產生 `release.json`，記錄實際公開的 commit SHA。
- PR CI：執行語法與測試；不部署到公開 Pages。管理員中心會讀取 PR、歷史提交與 `release.json`，區分「公開版本」和「main 最新候選」。

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

## 私有預覽與存取限制
- PR CI 不部署 GitHub Pages，也不取得 Supabase service-role secrets。
- 私有預覽使用 Supabase Private Storage bucket `sd-admin-previews`，搭配 `sd-admin-preview` Edge Function。只有登入後通過資料庫 `sd_is_admin()` 驗證的管理員才能取得 5 分鐘短效檔案 URL。
- 在 main 上手動執行 workflow，設定 `publish_private_preview=true`、`preview_commit_sha=<完整 SHA>`、`confirm_release=false)，只會上傳私有預覽，不會部署公開網站。
- 私有預覽上傳工作只讀取指定 commit 的靜態檔案，不執行候選 commit 的腳本；GitHub Actions service-role secret 只供 main 上的 owner 手動工作使用。
- 管理中心以不含 `allow-same-origin` 的 sandbox iframe 開啟預覽，不共享正式登入 session 或 localStorage。預覽以訪客模式運行，不測試需要正式雲端寫入的功能。
- bucket、Edge Function、GitHub Actions secrets 尚未完成 owner 設定與部署前，管理中心會顯示設定錯誤，不會回退到公開預覽網址。
- 詳細設定：`docs/ADMIN_PREVIEW_SETUP_zh-TW.md`。

## 發布前檢查
- 自動檢查通過。
- 管理員實際驗收桌機與手機版。
- 確認沒有把尚未完成的功能標成已上線。
- 確認 Supabase 相容性；未經另行批准不執行資料庫寫入。
