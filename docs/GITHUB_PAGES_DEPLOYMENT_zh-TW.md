# GitHub Pages 開發與正式發布流程

本專案使用根目錄 index.html 作為網站入口，GitHub Actions workflow 位於 .github/workflows/pages.yml。日常開發、PR 驗證與正式 Pages 部署必須分離。

## 日常開發

1. 先讀取 AGENT.md、繁中 README、相關 docs、最新 main commit、開啟中的 PR／Issue 與 Actions 狀態。
2. 只在 dev/* 或 feature/* 分支修改。
3. 以 PR 提交到 main，讓 GitHub Actions 執行語法與測試。
4. PR CI 只負責驗證；pages.yml 的正式部署 job 另有條件限制，PR 事件不得部署公開 Pages。
5. 管理員檢查 PR 差異、CI、授權與必要的私有預覽。尚未合併或發布的功能必須明確標示為候選版。

**不可直接把 ZIP／網站檔案上傳到 main，也不可在日常開發中直接提交或推送 main。**

## 正式發布前提

正式發布不是 PR 建立、CI 成功或合併後自動發生的事。必須全部符合：

- 專案擁有者已親自檢查並明確批准候選版本。
- 已核准的程式碼已由擁有者依審核流程合併至 main。
- GitHub Actions 的正式 workflow 由擁有者手動以 workflow_dispatch 執行，ref 選擇 main。
- 擁有者明確設定 confirm_release=true。
- GitHub production Environment 的 Required reviewers、允許部署分支與審核人設定已由管理員確認，並完成環境審核。
- 同一次 workflow run 的驗證與 Pages 部署工作均成功。

目前 .github/workflows/pages.yml 的 deploy job 條件要求事件為 workflow_dispatch、ref 為 refs/heads/main、執行者為 Edward11031709，且 confirm_release == true；部署工作使用 production Environment。PR 事件只執行驗證，正式部署工作應為 skipped。

## 擁有者手動發布步驟

1. 在 PR 頁面再次檢查變更、測試及管理員預覽結果。
2. 明確批准後，由擁有者手動合併至 main。
3. 開啟 Repository → Actions →「星夢樂園檢查與正式發布」。
4. 選擇 main，執行 workflow_dispatch，並在確認已完成驗收後設定 confirm_release=true。
5. 在 production Environment 完成人工審核。
6. 確認同一個 run 的 validate 與 deploy job 都成功。
7. 開啟正式網址，讀取 release.json，核對實際部署 commit SHA。
8. 更新 docs/RELEASE_STATUS.md，記錄部署日期、run ID、部署 SHA、結果及上一個可回復 SHA。

## GitHub Pages 設定

- 日常開發不得修改 Repository Settings → Pages、Source、Environment 或部署分支設定。
- 若管理員檢查發現 Pages Source 或 Environment 設定與目前 workflow 不一致，先停止發布並提出差異；不得自行更改正式設定。
- production Environment 的 Required reviewers 與允許部署分支，必須從 GitHub Settings 實際確認；不能只根據 YAML 或文件推定已受保護。

## 私有預覽

- 候選版本優先使用管理中心的 Supabase 私有預覽，不得把候選版部署到公開 Pages。
- 私有預覽必須由登入管理員通過資料庫端 sd_is_admin() 驗證。
- 預覽使用 Private Storage 與短效 signed URL；候選檔案只作靜態讀取，不執行候選 commit 的腳本。
- 預覽 iframe 不授予 allow-same-origin，不共享正式登入 session 或 localStorage。
- 私有預覽是訪客隔離模式，不能證明正式登入、雲端寫入或多人同步已通過。

詳細設定請見 docs/ADMIN_PREVIEW_SETUP_zh-TW.md。

## 回復

若正式網站需要回復，由擁有者建立並審核 revert PR，回到先前已知良好的程式碼版本，再手動執行相同的正式發布流程。程式回復不等於資料庫回滾；不得重設或回復玩家帳號、星塵、服裝所有權、遊戲紀錄或聊天資料。

## 安全提醒

- 不把 GitHub 寫入 Token、Supabase secret key、service-role key、資料庫密碼或管理員憑證放進前端或公開 Repository。
- 不建立或執行未經明確批准的 Supabase migration。
- 不因部署文件或 workflow 測試而寫入正式玩家資料。
- 不調整星塵或花費星塵。