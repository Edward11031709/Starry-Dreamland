# 星夢樂園版本與發布狀態
## 2026-11-22 最新主線、公開版與手遊級視覺候選

- 最新 \`main\` HEAD：\`549443d377c5db5e1ad9abb6f045bc90311eeec0\`；PR #23「系統性升級星夢樂園 3D 建築、景觀與遊樂設施」已合併。
- owner 於 2026-11-22 手動執行 Actions #185（run ID \`45029236953\`），檢查 job 與「發布正式網站」步驟均成功，部署目標為 \`main\` @ \`549443d377c5db5e1ad9abb6f045bc90311eeec0\`。此為目前確認的公開版來源。
- 新候選分支：\`feature/mobile-game-visual-fidelity-20261122\`，從最新主線 SHA 建立。目標是提升渲染與材質品質，不把前一輪增加程序幾何細節誤當作已達手遊級視覺。
- 本候選變更包含獨立 Albedo／Normal／Roughness 貼圖、PMREM 環境反射、選擇性高光光暈、柔邊接觸陰影、行動裝置後處理解析度分級，以及減少裝飾燈即時 PointLight 數量。
- 本候選尚未完成真實 WebGL shader／視覺／FPS 驗收；尚未匯入外部 GLB 模型或外部貼圖，因此不能宣稱模型本身已達手遊資產品質。
- 不修改 Supabase schema、RLS、RPC、migration、Auth 或任何正式玩家資料；不修改星塵、服裝所有權、遊戲紀錄、聊天或探索資料。
- PR #24「升級星夢樂園手遊級 PBR 材質與電影感渲染」已建立為 Ready for review（非 Draft），目前 open、尚未合併；基底為 main @ `549443d377c5db5e1ad9abb6f045bc90311eeec0`。
- PR head：`4a20e57957b033d0a48abd1707a89af315e3d204`；變更 4 個檔案（Three.js 渲染、7 項新增結構測試、3D Roadmap、Release Status）。
- Actions run #186（run ID `45030493500`）成功：Node tests **53 passed／0 failed**，Three.js／Supabase Edge Function 語法檢查及首頁 inline JavaScript parse 均通過。
- PR #24 的 `管理員確認後發布正式版` job 為 skipped；本 PR 沒有合併或發布公開網站。仍待管理員私有預覽及真實 WebGL shader、材質反射、bloom、桌機／手機橫向與 FPS 人工驗收。


## 歷史紀錄：PR #23 合併前的候選狀態（2026-11-22）

- PR #21 已合併至 main，merge commit：`309fe992f52a67a544b07ce22200f9d94a8c758c`。
- PR #22（AGENT.md 維護規範）已合併；目前 main HEAD：`a590bef43caad3c1ed07903f13a66ce8d06d9ab9`。
- Actions run #177（run ID `45011044075`）只完成語法／測試檢查；正式發布 job 為 skipped，不能視為公開部署成功。
- 最近可確認成功部署仍是 Actions #167（run ID `45004106298`），部署來源為 main @ `991088dd987617de0937a79ea2178a138a4bb5fc`。因此 PR #21、PR #22 及本次美術候選均不能宣稱已經出現在公開網站。
- 本次美術升級分支：`feature/park-visual-overhaul-20261122`，從最新 main @ `a590bef43caad3c1ed07903f13a66ce8d06d9ab9` 建立。
- 本候選範圍：塔樓、城堡正面山牆、觀測站、入口與分區尖拱、票亭、兌換／補給服務亭、樹木、城堡倒影池、浮島邊界欄杆、天空材質／燈光與主要遊樂設施比例。
- 本分支只修改 Three.js 場景與結構測試，另同步 3D Roadmap；沒有修改 Supabase schema、RLS、RPC、migration、登入資料、星塵、服裝所有權、遊戲紀錄、聊天室或探索紀錄。
- 真實瀏覽器 WebGL、私有預覽、桌機／手機橫向視覺、碰撞、設施乘坐與 FPS 尚未人工驗收；自動化結構測試不可代替人工視覺驗收。
- PR #23 已建立為 Ready for review（非 Draft），目前 open、mergeable=true，尚未合併。
- PR #23 的最新 HEAD 請以 GitHub PR metadata 為準；目前差異 4 個檔案（`js/starry-3d.js`、新增美術結構測試、3D Roadmap、Release Status）。
- Actions run #179（run ID `45013333957`）、#180（run ID `45013398280`）及 #183（run ID `45013602602`）均成功：JavaScript／Supabase Edge Function 語法檢查、首頁 inline script parse 全部通過；Node tests **46 passed／0 failed**。#183 對應修正入口踏階朝向的最新程式與回歸測試 head `0e840df7bbfb0b20b40928a5f653050d19204599`。
- PR #23 的 `管理員確認後發布正式版` job 為 skipped；本批次沒有部署公開網站。仍待管理員私有預覽及真實瀏覽器 WebGL、桌機／手機橫向、碰撞、設施搭乘與 FPS 人工驗收。


## 歷史紀錄：PR #20 合併後的狀態（2026-11-22）

- `main` 已包含 PR #20；合併 commit：`991088dd987617de0937a79ea2178a138a4bb5fc`。
- PR #17、#18 已關閉，原因是內容已由整合 PR #20 取代；兩份舊 PR 保留於 Closed 歷史，不再列於 Open PR 清單。
- PR #20 合併後，owner 於 2026-11-22 手動執行 Actions #167（run ID `45004106298`）；`管理員確認後發布正式版` job 與 `發布正式網站` 步驟均成功，部署目標為 `main` @ `991088dd987617de0937a79ea2178a138a4bb5fc`。此為目前可確認的公開版來源；尚未直接讀回公開網站的 `release.json` 作外部比對。
- 目前續作分支：`feature/castle-gothic-architecture-20261122`，從 `main` @ `991088dd987617de0937a79ea2178a138a4bb5fc` 建立。
- 續作內容：城堡主入口與外圍入園門統一多層尖拱語彙，搭配晶石拱心石、階梯金銀雙層欄杆與細柱；新增曲線對稱、階梯及外圍拱門結構測試。
- 已重新檢查 `AGENT.md`、繁中 README、3D 路線與發布流程；本批次遵守既有分支／人工發布規則，`AGENT.md` 無需修訂。
- 不修改 Supabase schema、RLS、RPC、migration 或正式玩家資料；不調整星塵、服裝所有權、帳號、遊戲紀錄、聊天或探索資料。
- Actions run #174（run ID `45004582110`）對程式與測試最新 head `ea749b7755e529952e46f8c59e81fcb15a4adb70` 成功：Node tests **30 passed／0 failed**；Three.js 與 Supabase Edge Function 語法、首頁 inline JavaScript parse 均通過。PR 事件中的正式部署 job 為 skipped。
- 私有預覽與真實瀏覽器 WebGL、桌機／手機畫質、碰撞與 FPS 尚未完成實際人工驗收；不可將自動化測試當作視覺驗收。


## 2026-11-22 整合開發批次（PR #20 合併前的歷史紀錄）

- Repository：`Edward11031709/Starry-Dreamland`；預設分支：`main`。
- 本批次基準：`main` @ `8f4873fddad924bd00d949eae60d8c41bcb2aac2`（已含 PR #19 的管理員預覽、審核入口與登入恢復變更）。
- PR #17（角色外觀精修）與 PR #18（園區景觀精修）均為 Draft／Open，且基底落後目前 main；不建議直接依序合併舊分支。
- 本整合候選以目前 main 為基礎，保留 PR #19，整合兩個 PR 各自獨立的 3D 修改區段。
- 本批次內容：四種髮型次級髮束、眉眼／鼻／耳／唇精修、四組快速造型預設、隨機與還原已保存外觀、中央步道雕花休憩花園、月光花園植栽、步道星光燈柱，以及分片後披肩與靴尖飾片。
- 沒有新增 appearance JSON 欄位，沒有執行 Supabase migration，沒有修改 schema／RLS／RPC／玩家帳號／星塵／服裝所有權／遊戲紀錄／聊天資料。
- 本候選只更新獨立 feature 分支與 PR；不合併 main，不執行正式部署。須完成 CI 與管理員真實預覽驗收後才能考慮合併。

## 最近正式發布核對

- PR #19 已合併至 main，合併 SHA：`8f4873fddad924bd00d949eae60d8c41bcb2aac2`。
- 對應正式發布 workflow run #163（run ID `45000721665`，2026-11-22）檢查 job 成功，檔案打包與 artifact 上傳成功；Pages 部署步驟失敗，原因為部署步驟找不到同一次 workflow run 的 `github-pages` artifact。
- 後續 owner 於 2026-11-22 執行 Actions #167（run ID `45004106298`），正式部署 job 與 `發布正式網站` 步驟成功，部署 `main` @ `991088dd987617de0937a79ea2178a138a4bb5fc`；此版本包含 PR #20。
- 因此 #163 的部署失敗已由 #167 的成功發布取代；本次新開的 PR #21 不在該公開版本內。

## 安全與發布邊界

- 日常開發只更新獨立 `feature/*` 分支與 PR，不直接推送 main。
- PR Checks 成功、私有預覽或 PR 合併都不代表正式發布。
- 正式發布須由 owner 從 main 手動執行 Pages workflow，明確確認並通過 production Environment。
- main branch protection 與 production Environment Required reviewers 必須在 GitHub Settings 另外核對，不可僅憑 workflow YAML 宣稱已完整保護。
- 程式版本更新或回復不可回滾 Supabase 玩家資料。

## PR #20 合併紀錄（2026-11-22）

- 整合 PR：[#20](https://github.com/Edward11031709/Starry-Dreamland/pull/20)，已於 2026-11-22 合併至 `main`。
- Merge commit：`991088dd987617de0937a79ea2178a138a4bb5fc`；整合候選 head：`fd6a693d35a1911650d78d7e0588e8f116547198`。
- Actions run #166 成功：Node tests **27 passed／0 failed**；JavaScript、Supabase Edge Function 與首頁 inline JavaScript parse 均通過。
- PR #17、#18 已關閉為由 #20 取代，不再是 Open PR。
- PR 合併本身不會自動部署；owner 隨後透過 Actions #167 手動發布 `main`，正式部署 job 成功。PR #21 尚未合併，不在此公開版內。

