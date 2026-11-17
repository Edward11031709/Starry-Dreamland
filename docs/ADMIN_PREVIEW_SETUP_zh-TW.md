# 管理員私有開發預覽設定

本功能將未發布的靜態網站檔案存入 Supabase **Private** Storage bucket，再由管理員驗證過的 Edge Function 簽發短效檔案 URL。預覽頁面在隔離的 sandbox iframe 中執行，不會取代 GitHub Pages 正式網站，也不會取得正式玩家的登入工作階段。

## 安全邊界

- bucket 名稱：`sd-admin-previews`，必須是 **Private**，不可設為 Public。
- Storage 物件路徑：`releases/<40-character-commit-sha>/<site-relative-path>`。
- Edge Function：`sd-admin-preview`，部署時必須保持 JWT verification 開啟（`verify_jwt=true`）。
- 函式會先用使用者 JWT 呼叫 Auth `getUser()`，再呼叫資料庫 `sd_is_admin()`；只有資料庫確認為管理員才會簽發 5 分鐘短效 URL。
- 僅允許網站必要的靜態檔案副檔名與安全相對路徑；拒絕絕對路徑、點目錄、反斜線、隱藏檔與未知副檔名。
- 管理員預覽 iframe 不使用 `allow-same-origin`，不共享正式頁面的 Cookie／localStorage／Supabase session；預覽以訪客模式運行。
- 不把 service-role／secret key 放進前端、Storage 物件或 Git repository。
- 上傳流程只讀取指定 commit 的靜態網站檔案，不執行該 commit 中的腳本、套件安裝或建置命令。
- 預覽檔案保留在獨立 SHA 前綴下；不會刪除舊版本或覆蓋正式網站。

## 一次性設定（由 Repository owner 操作）

### 1. 建立私有 Storage bucket

在 Supabase Dashboard → Storage → New bucket：
- Name：`sd-admin-previews`
- Public bucket：**關閉**
- 不需建立任何給 `anon` 或一般 `authenticated` 使用者的讀取政策。

### 2. 設定 Edge Function secrets

在 Supabase Dashboard → Edge Functions → Secrets 確認以下值：
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` 或 `SUPABASE_PUBLISHABLE_KEY`；若使用新式 key map，也支援 `SUPABASE_PUBLISHABLE_KEYS` JSON 的 `default` 項目。
- `SUPABASE_SERVICE_ROLE_KEY` 或 `SUPABASE_SECRET_KEY`；若使用新式 key map，也支援 `SUPABASE_SECRET_KEYS` JSON 的 `default` 項目。這些 server-side key 絕不可提供給瀏覽器。
- `ADMIN_PREVIEW_BUCKET=sd-admin-previews`
- `ADMIN_PREVIEW_ALLOWED_ORIGINS=https://edward11031709.github.io`

將 `supabase/functions/sd-admin-preview/index.ts` 與共用檢查檔 `supabase/functions/_shared/preview-path.mjs` 一起部署為 `sd-admin-preview`，並確認 JWT verification 開啟。此 repository PR 不會自行部署 Edge Function 或修改正式 Supabase 專案。

### 3. 設定 GitHub Actions secrets

在 Repository Settings → Secrets and variables → Actions → Repository secrets 新增：
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

這兩個 secrets 只會被 main 上的手動 `workflow_dispatch` 私有預覽上傳工作使用；目前 workflow 另外限制只有 repository owner 帳號 `Edward11031709` 能啟動私有預覽上傳與正式發布工作。PR 驗證工作不會取得這些 secrets。上傳工作只執行 workflow 內固定的上傳程式，不執行候選 commit 的程式碼。

## 首次啟用的必要步驟

目前正式網站尚未包含這次新增的管理員中心，因此第一次啟用前，必須先由 owner 檢查並核准本 PR，合併到 `main`，再依正式發布流程手動發布這個已核准版本。這次首次發布會把管理員中心加入正式網站，但不會自動發布任何後續開發版。之後才可從正式網站的管理中心，預覽尚未發布的其他 PR。

## 上傳與預覽流程

1. 先將已審查的候選程式碼放在 PR 分支，等待 CI 成功。
2. 複製該 PR 的完整 40 字元 head commit SHA。
3. 合併已核准的管理員中心與上傳 workflow 基礎至 `main`（合併本身不會發布正式 Pages）。
4. 在 GitHub Actions 手動執行「星夢樂園檢查與正式發布」workflow，選擇 `main`：
   - `publish_private_preview=true`
   - `preview_commit_sha=<PR head SHA>`
   - `confirm_release=false`
5. 確認私有預覽上傳工作成功後，以管理員帳號登入正式網站，開啟管理中心，輸入相同 SHA 並建立預覽。
6. 預覽頁在隔離 iframe 內運行，不會使用正式登入 session，也不應測試需要雲端寫入的功能。

## 正式發布仍然分開

- 私有預覽上傳不會呼叫 GitHub Pages deploy，也不會更新 `release.json`。
- 只有另一次手動 workflow dispatch，選擇 `main` 並將 `confirm_release=true`，再通過 GitHub `production` Environment 審核，才會更新正式網站。
- 不應在同一次操作中同時勾選私有預覽與正式發布，先預覽、驗收，再獨立發布。

## 尚未完成的後端安全工作

此預覽功能與星塵帳務分開。它不修正客戶端可提交遊戲 reward 的問題，也不代表管理員星塵調整已開放。星塵仍須先完成伺服器權威遊戲回合、不可任意修改的帳本與隔離資料庫測試。
