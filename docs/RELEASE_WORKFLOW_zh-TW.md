# 星夢樂園版本發布流程

## 分支與版本角色

- `main`：經審查的候選程式碼；合併 PR 不等於已發布。
- `dev/*`、`feature/*`：日常開發分支。每個可審查批次以 PR 提交。
- GitHub Pages：只由受保護的 `production` Environment 發布。
- 正式部署會產生 `release.json`，記錄實際公開的 commit SHA、UTC 發布時間與 ref。
- 若沒有可讀的 `release.json` 或正式部署 run，不可推定 `main` 就是目前公開版本。

## 開發與審核

1. 先讀取 `AGENT.md`、`README_zh-TW.md`、相關 docs、現有程式、Issues／PR 與 Actions 狀態。
2. 只在 `dev/*` 或 `feature/*` 分支開發，不直接提交 `main`。
3. 每批變更執行語法檢查與相關測試，記錄測試限制。
4. 開啟 PR，列出 commit、變更摘要、CI 證據及尚未完成的瀏覽器／手機驗收。
5. 管理員檢查 PR 與私有預覽後，明確批准才可進入正式發布流程。
6. 每日自動開發不得合併 PR、推送 `main` 或啟動 production workflow。

## 管理員私有預覽

- 私有預覽使用 Supabase Private Storage bucket `sd-admin-previews` 與 `sd-admin-preview` Edge Function。
- Edge Function 先驗證使用者 JWT，再以資料庫 `sd_is_admin()` 確認管理員權限；只有通過驗證的管理員可匯入或取得短效簽名 URL。
- 匯入來源固定為公開 repository 的完整 40 字元 commit SHA，只讀取允許的靜態檔案，不執行候選 commit 的程式碼。
- 管理中心以不含 `allow-same-origin` 的 sandbox iframe 開啟預覽，不共享正式玩家的 Cookie、localStorage 或 Supabase session。
- 私有預覽不會部署 GitHub Pages、不會修改正式玩家資料，也不需要 GitHub Actions Secrets。使用步驟見 `docs/ADMIN_PREVIEW_SETUP_zh-TW.md`。

## 正式發布（只限 owner 手動操作）

1. 在 PR 檢查程式差異、CI 與私有預覽；桌機與手機實機驗收需由管理員完成。
2. 管理員明確核准後，才由 owner 合併 PR 至 `main`。
3. 開啟 Actions 的「星夢樂園檢查與正式發布」，選擇 `main)，並將 `confirm_release=true`。
4. 確認 GitHub `production` Environment 已設定 Required reviewers（管理員本人）及只允許 `main`；未確認前不得發布。
5. 通過 Environment 審核後才會執行 Pages deploy。完成後核對 `release.json` 的 commit SHA 與發布時間。

## 回復與資料安全

- 回復程式版本時，選擇先前已核准的 commit，建立回復 PR，再走相同人工發布流程。
- 程式版本回復不執行 Supabase migration rollback，不改動玩家帳號、星塵、服裝、遊戲紀錄或聊天資料。
- 未經使用者對該項變更另行明確批准，不建立／執行 migration，不修改正式 Supabase schema、RLS、RPC 或資料。
- 星塵調整只能由資料庫後端驗證管理員身分，並以不可任意修改的流水與原因記錄；任何真實餘額調整都需要使用者另行明確要求。
