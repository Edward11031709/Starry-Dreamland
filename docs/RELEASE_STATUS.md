# 正式版本與發布狀態

## 2026-11-22 開發與唯讀核對

- Repository：`Edward11031709/Starry-Dreamland`；預設分支：`main`。
- `main` 最新 commit：`607836fe88fe9a21396571b622306b909ec615a1`。
- 最近一次可確認成功的正式 GitHub Pages 發布為 Actions run #138（run ID：`44224188281`，2026-11-18，事件 `workflow_dispatch`，分支 `main`，SHA 與目前 main 相同）。截至本次查核，未發現 #138 之後的 production workflow_dispatch。
- PR #17：`dev/avatar-hair-couture-20261118`，Draft／Open，未合併；今日角色髮束精修與模型測試更新後的程式／測試 commit 為 `2c2f9351674c70e9005e2c1cfbe787f0ba645d81`，相對 main ahead 28、behind 0。
- PR #17 Actions run #160（2026-11-22）成功：Node tests **21 passed／0 failed**；`js/starry-3d.js` 語法檢查、Supabase Edge Function 語法檢查、`index.html` inline script parse 均通過；正式部署 job 為 `skipped`。
- PR #17 先前 run #150–#153 曾因測試擷取／語法問題失敗，已修正；後續 #154、#157、#158、#159、#160 成功。以各自最新成功結果為準。
- PR #18：`feature/park-atmosphere-refinement` @ `55e8dae13b5c1d589dc27c117cd31606e3b06ba7`，Draft／Open，未合併；最新已確認 run #156 成功，正式部署 job 未執行。
- 今日角色模型變更：在長髮、雙馬尾、短髮及兜帽髮型加入低細分次級髮束／方向性高光曲線；預期髮束曲線數量分別為 6、6、5、4。沒有加入外部模型或貼圖，沒有改變外觀 JSON 欄位或 Supabase 行為。
- run #160 沒有產生 Actions artifact；目前沒有可直接開啟的視覺預覽 artifact。需由已登入且通過資料庫 `sd_is_admin()` 驗證的管理中心私有預覽流程檢查候選 commit。
- 本次未從公開 Pages 即時讀取 `release.json`；正式版本依據是 GitHub Actions #138 的成功 Pages 部署紀錄及其 main SHA。
- GitHub branch API 回報 `main` 的 `protected=false`，目前可讀取的 repository rulesets 清單為空；目前連線無法確認 `production` Environment 的 Required reviewers。**不得宣稱 main 或 production 環境已完整受保護**，發布前需由 owner 在 GitHub 設定中再次核對。
- 本次每日開發只更新 `dev/*` 分支；不得把開發分支或 PR head SHA 當成正式版本。

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
