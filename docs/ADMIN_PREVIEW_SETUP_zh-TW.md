# 管理員私有開發預覽

本功能會在 Supabase 伺服器端直接讀取公開 GitHub repository 的指定 commit，將允許的靜態網站檔案存入 Supabase **Private** Storage，再由管理員驗證過的 Edge Function 簽發短效檔案 URL。預覽頁面在隔離的 sandbox iframe 中執行，不會取代 GitHub Pages 正式網站，也不會取得正式玩家的登入工作階段。

## 安全邊界

- bucket 名稱：`sd-admin-previews`，必須是 **Private**，不可設為 Public。
- Storage 物件路徑：`releases/<40-character-commit-sha>/<site-relative-path>`。
- Edge Function：`sd-admin-preview`，部署時必須保持 JWT verification 開啟（`verify_jwt=true`）。
- 函式先用使用者 JWT 呼叫 Auth `getUser()`，再呼叫資料庫 `sd_is_admin()`；只有資料庫確認為管理員才可匯入或簽發預覽檔案。
- 匯入來源固定為公開 repository `Edward11031709/Starry-Dreamland`，只接受完整 40 字元 commit SHA。
- 匯入流程讀取 Git tree 與 Raw 靜態檔案，不執行候選 commit 中的腳本、套件安裝或建置命令。
- 匯入檔案限制為 600 個、總量 80 MB，並且只允許網站必要副檔名與安全相對路徑；拒絕絕對路徑、點目錄、反斜線、隱藏檔與未知副檔名。
- Storage 物件由 Supabase server-side secret 寫入；secret 不會提供給瀏覽器、GitHub Actions 或 repository。
- Edge Function 只會簽發 5 分鐘短效 URL；Storage bucket 沒有提供一般訪客讀取／列出物件的政策。
- 管理員預覽 iframe 不使用 `allow-same-origin`，不共享正式頁面的 Cookie／localStorage／Supabase session；預覽以訪客模式運行。
- 管理員可選擇「另開全螢幕測試分頁」或「頁內快速預覽」。獨立分頁使用整個瀏覽器可視區域（扣除上方版本提示列），適合檢查 3D 園區與手機橫向操作；兩種模式都維持相同 sandbox 隔離，不加入 `allow-same-origin`。
- 預覽檔案保留在獨立 SHA 前綴下；不會刪除舊版本或覆蓋正式網站。

## 已完成的 Supabase 設定

目前專案已建立 Private bucket `sd-admin-previews`，並已部署 `sd-admin-preview` Edge Function。部署設定保持 `verify_jwt=true`。函式使用 Supabase 自動提供的 server-side key 環境變數（支援 legacy service-role 與新式 secret key map），不需要另行建立 GitHub Actions secrets。

## 使用方式

1. 將候選程式碼推送到公開 repository 的分支或 commit。
2. 複製候選版本的完整 40 字元 commit SHA。
3. 以已在資料庫管理員名單中的帳號登入目前已發布的星夢樂園。
4. 開啟「管理中心」→「私有開發預覽」，貼上完整 SHA，優先按下「另開全螢幕測試分頁」。只需快速確認時，也可選擇「頁內快速預覽」。
5. 新分頁會立即開啟載入畫面，再由 Edge Function 重新驗證登入 session 與 `sd_is_admin()`，從 GitHub 匯入該 SHA 的靜態檔案至 Private Storage，最後簽發必要檔案的短效 URL。
6. 獨立測試分頁使用整個瀏覽器可視區域；內容仍在 sandbox iframe 中執行，不共享正式 Cookie、localStorage 或登入 session，也不應測試需要正式雲端寫入的功能。
7. 預覽 URL 約 5 分鐘到期；失效後回管理中心重新開啟該 SHA，即可取得新的短效 URL。


## 正式發布仍然分開

- 私有預覽匯入不會呼叫 GitHub Pages deploy，也不會更新正式版。
- 只有另一次手動 workflow dispatch，選擇 `main` 並將 `confirm_release=true`，再通過 GitHub `production` Environment 審核，才會更新正式網站。
- 預覽與正式發布是兩個獨立流程；先預覽、驗收，再獨立發布。

## 尚未完成的後端安全工作

此預覽功能與星塵帳務分開。它不修正客戶端可提交遊戲 reward 的問題，也不代表管理員星塵調整已開放。星塵仍須先完成伺服器權威遊戲回合、不可任意修改的帳本與隔離資料庫測試。
