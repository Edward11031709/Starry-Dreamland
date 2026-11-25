# 星夢樂園版本與發布狀態

## 2026-11-25 最新主線、公開版與角色模型候選核對

- 最新 `main` HEAD：`61a0f5d6fcafb7122a1f14d9285a191280b9ddd3`，為 PR #26「精修高品質遊樂設施整合、乘坐動畫與場景清晰度」的 merge commit。PR #24 已於 2026-11-23 合併（merge commit `7de13e6743baeadd5aa5b907749af07743feddec`），PR #26 亦已合併；兩者都已在 main，但不能因此推定已部署公開網站。
- 最近一次可確認成功的公開 Pages 部署仍是 owner 於 2026-11-22 手動執行 Actions #185（run ID `45029236953`），部署來源為 `main` @ `549443d377c5db5e1ad9abb6f045bc90311eeec0`。本次唯讀檢查確認驗證 job、production job 及「發布正式網站」步驟均成功；未能另行讀回公開網站的 `release.json`，因此以 workflow deployment SHA 作為目前可確認的公開版依據。
- 目前開啟中的 PR：#25、#27。PR #25「精修旅人髮際線與眼尾細節」仍保留 Open／Ready for review，但相較目前 main 為 ahead 3／behind 48、compare status `diverged`，GitHub metadata 回報 `mergeable=false`。沒有關閉、重寫或刪除該舊 PR。
- 今日將 PR #25 中獨立的髮際線／眼尾修改重新套用至最新 main 基礎的 PR #27，並與原有禮服布料摺線精修整合。PR #27 標題更新為「旅人角色 3D 精修：髮際線、眼部與禮服布料層次」，分支仍為 `feature/avatar-fabric-drape-20261124`，base 為 main @ `61a0f5d6fcafb7122a1f14d9285a191280b9ddd3`。
- 本批程式／測試／Roadmap 更新提交：`d1a0c8491532f8bb2523a4cfa4c91419614a82a4`。四種髮型各增加兩束依輪廓設計的前額／鬢角髮束，左右上眼尾各增加一條低對比睫線；保留既有 hairStyle 值及 appearance JSON 四欄位。禮服仍保留四道沿 robeProfile 曲面配置的低對比緞面摺線。
- Actions #218（run ID `45532744561`）對上述程式／測試／Roadmap 提交成功：Node tests **66 passed／0 failed**；`node --check js/starry-3d.js`、Supabase Edge Function 語法檢查、首頁 import map JSON 與 inline JavaScript parse 均通過。PR 的「管理員確認後發布正式版」job 為 **skipped**；沒有 Pages artifact 或正式部署。
- 本批只修改角色 3D 幾何、模型結構測試及開發文件；沒有新增外部資產／套件、Supabase schema／RLS／RPC／migration，沒有寫入玩家資料、調整星塵或服裝所有權，也沒有新增 NPC／假玩家。
- `AGENT.md`、`README_zh-TW.md`、`README.md`、3D Roadmap、Release Workflow、管理員預覽及 Supabase 安全文件已重新檢查；AGENT.md 的既有長期規範足以涵蓋本批工作，無需實質修訂。
- 仍待管理員以私有預覽檢查四種髮型正／側／背面、髮束穿插、眼尾自然度、禮服摺線與桌機／手機橫向 FPS。自動化測試不等於真實 WebGL 視覺驗收。
- 發布文件風險：`docs/RELEASE_CHECKLIST_zh-TW.md` 與 `docs/GITHUB_PAGES_DEPLOYMENT_zh-TW.md` 仍含舊版直接上傳 main／修改 Pages Source 的操作說明，與現行人工審核發布流程不一致；本批未混入角色 PR，需另立文件修正批次。

---


## 2026-11-24 開發基準、公開版與候選 PR 核對

- 最新 `main` HEAD：`61a0f5d6fcafb7122a1f14d9285a191280b9ddd3`，為 PR #26 的合併 commit。
- 最近一次可確認的公開版仍是 owner 於 2026-11-22 手動執行 Actions #185（run ID `45029236953`）部署的 `main` @ `549443d377c5db5e1ad9abb6f045bc90311eeec0`；檢查 job、production job、打包與「發布正式網站」步驟均成功。
- PR #24 已於 2026-11-23 合併，合併 commit 為 `7de13e6743baeadd5aa5b907749af07743feddec`；PR #26 已於 2026-11-23 合併，合併 commit 為 `61a0f5d6fcafb7122a1f14d9285a191280b9ddd3`。這兩批變更目前存在於 main，但部署 run #185 的 SHA 早於它們，因此**尚不能宣稱已出現在公開網站**。
- PR #25「精修旅人髮際線與眼尾細節」仍為 Open／Ready for review，但其分支 `feature/avatar-hairline-couture-20261123` 相較目前 main 為 ahead 3／behind 48、compare status 為 diverged，PR metadata 回報 mergeable=false。此舊 PR 保留待管理員決定，不直接合併、不重寫其歷史，也不把它當作目前可直接合併的分支。
- 今日角色服裝候選 PR：[ #27 精修旅人禮服布料摺線與曲面層次 ](https://github.com/Edward11031709/Starry-Dreamland/pull/27)，分支 `feature/avatar-fabric-drape-20261124`，以最新 main @ `61a0f5d6fcafb7122a1f14d9285a191280b9ddd3` 為基礎，程式／測試 commit：`178acb5358692270409fb3ecc6b18d4b2c751b79`。
- PR #27 以既有 robeProfile 曲面半徑插值，新增四道低對比、低金屬度的布料摺線；保留既有角色與 appearance JSON，不新增資料庫欄位、不改碰撞／動畫。
- Actions #214（run ID `45312334404`）驗證程式／測試 commit `178acb5358692270409fb3ecc6b18d4b2c751b79` 成功：Node tests **66 passed／0 failed**，Three.js、Supabase Edge Function 語法及首頁 inline JavaScript／import map 檢查通過。
- Release Status 文件同步後的 docs-only commit `af2f3c7ad8aaa8c4fbe80efd34aa2d011417103e` 由 Actions #215（run ID `45312394847`）再次驗證成功：**66 passed／0 failed**；正式發布 job **skipped**，沒有 Pages artifact 或正式部署。
- 已重新讀取 `AGENT.md`、繁中 README、3D Roadmap、Release Status、Release Workflow、管理員預覽、資產目錄及 Supabase 安全文件。AGENT.md 的長期規範已涵蓋本批工作，無需實質修改。
- 本批沒有修改 Supabase schema、RLS、RPC、migration、Auth 或任何正式玩家資料；沒有調整星塵、服裝所有權或解鎖狀態；沒有新增假 NPC／假玩家。
- 尚待管理員以私有預覽檢查正面、斜側面、側面、背面、不同服裝配色、摺線穿插及桌機／手機橫向 FPS。自動化模型結構測試不等同真實 WebGL 美術驗收。

---

## 2026-11-22 最新主線、公開版與手遊級視覺候選

- 最新 `main` HEAD：`549443d377c5db5e1ad9abb6f045bc90311eeec0`；PR #23「系統性升級星夢樂園 3D 建築、景觀與遊樂設施」已合併。
- owner 於 2026-11-22 手動執行 Actions #185（run ID `45029236953`），檢查 job 與「發布正式網站」步驟均成功，部署目標為 `main` @ `549443d377c5db5e1ad9abb6f045bc90311eeec0`。此為目前確認的公開版來源。
- 新候選分支：`feature/mobile-game-visual-fidelity-20261122`，從最新主線 SHA 建立。目標是提升渲染與材質品質，不把前一輪增加程序幾何細節誤當作已達手遊級視覺。
- 本候選變更包含獨立 Albedo／Normal／Roughness 貼圖、PMREM 環境反射、選擇性高光光暈、柔邊接觸陰影、行動裝置後處理解析度分級，以及減少裝飾燈即時 PointLight 數量。
- 本候選尚未完成真實 WebGL shader／視覺／FPS 驗收；尚未匯入外部 GLB 模型或外部貼圖，因此不能宣稱模型本身已達手遊資產品質。
- 不修改 Supabase schema、RLS、RPC、migration、Auth 或任何正式玩家資料；不修改星塵、服裝所有權、遊戲紀錄、聊天或探索資料。
- PR #24「升級星夢樂園手遊級 PBR 材質與電影感渲染」已建立為 Ready for review（非 Draft），目前 open、尚未合併；基底為 main @ `549443d377c5db5e1ad9abb6f045bc90311eeec0`。
- PR #24 最新 HEAD：`d640fe93094fc537c90449d06be70985767f559e`；變更 4 個檔案（Three.js 渲染、7 項新增結構測試、3D Roadmap、Release Status）。
- Actions run #186（run ID `45030493500`）、#187（run ID `45030566635`）、#188（run ID `45030772979`）及 #189（run ID `45030827052`）均成功：Node tests **53 passed／0 failed**，Three.js／Supabase Edge Function 語法檢查及首頁 inline JavaScript parse 均通過；#189 對應最新 HEAD `d640fe93094fc537c90449d06be70985767f559e`。
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




## 2026-11-23 四批次高品質模型整合候選（PR #24 後續提交）
- 在 PR #24 原有 PBR／PMREM／後處理基礎上新增固定 Three.js r187 的 GLTFLoader import map 與外部 GLB 載入器。
- 第一批：城堡大教堂、觀測站魔法塔、廣場噴泉；第二批：旋轉木馬、茶杯、自由落體、摩天輪與雲霄飛車列車；第三批：水晶垂枝樹與月光晶簇；第四批：旅人角色新增頭冠寶石、腕部飾環與靴部金屬細節，保留既有外觀資料；尚未覆蓋為外部角色 GLB，避免破壞玩家外觀客製化。
- 資產來源頁標示 CC0 1.0；模型透過 3DAssets.dev CDN 載入，程式在載入時計算 SHA-256 並記錄。由於二進位檔不 vendoring 至 Repository，尚無固定本地 hash 清單；需在後續版本決定是否改為本地鎖定資產。
- 單一模型載入失敗會保留程序化模型；載入併發限制為 2；設施 ride id、既有互動及雲霄飛車軌道路徑保留。
- 尚未實測外部 CDN 真實下載、GLTFLoader parse、WebGL 材質視覺、模型朝向與比例、碰撞及手機 FPS；不得宣稱已達最終手遊級畫面。


## 2026-11-23 四批次模型整合驗證更新
- 新增 `docs/ASSET_CATALOG_zh-TW.md`，記錄 10 項 CC0 GLB 資產的來源頁、CDN、授權、作者／貢獻者資訊與用途；來源頁揭露多數模型使用 AI 工具，已如實記錄。
- 最新成功 PR CI：run #195（run ID `45105027288`），驗證候選程式碼 SHA `75097df48d6f38291e361bf866701c61f7b31dad`；Node tests **57 passed／0 failed**，Three.js、Supabase Edge Function 語法及首頁 import map JSON／inline JavaScript parse 均成功。
- PR CI 的正式部署 job 為 skipped；沒有合併、沒有發布公開網站，也沒有修改 Supabase。
- 本批外部模型透過固定 CDN URL 載入，下載時計算 SHA-256 並記錄到瀏覽器 console；因 GLB 尚未 vendoring 到 Repository，未建立固定本地 hash pinning。資產目錄已明確記錄此限制。
- 自動化測試通過不代表實際 CDN 下載、GLB 解析、WebGL 畫面、模型比例、鏡頭、碰撞及手機效能已驗收；仍需管理員私有預覽及實機檢查。

## 2026-11-23 設施模型搭乘整合與畫質精修候選（PR #26）
- 候選分支：`feature/ride-asset-integration-polish-20261123`；PR：[ #26 精修高品質遊樂設施整合、乘坐動畫與場景清晰度 ](https://github.com/Edward11031709/Starry-Dreamland/pull/26)，目前 Open／Ready for review，尚未合併、尚未正式發布。
- 修正四種遊樂設施的 GLB 乘坐錨點：依馬匹／杯體／吊艙語意節點包圍盒建立跟隨模型動畫的旅人錨點；必需節點與動畫先驗證，成功後才隱藏程序化 fallback。茶杯要求平台及杯體兩段動畫；自由落體使用往返升降動畫；摩天輪只承諾來源模型實際提供的輪體 spin，吊艙水平保持限制仍列為人工驗收事項。
- 修正 GLB 地面接觸點、設施碰撞範圍與下車距離；摩天輪取消不必要的父層放大。手機後處理內部解析度由 0.78 提高至 0.86，新增手機 2×／桌面 4× 多重取樣。
- CI run #212（run ID `45197395604`）對候選 SHA `a841fb343ce64b1af1671fd5db42742e7f173158` 成功：Node tests **65 passed／0 failed**；Three.js 語法與首頁 inline JavaScript／import map 檢查均成功。正式部署 job 依 PR 保護流程 skipped。
- 尚未實測真實 CDN GLB 節點名稱、WebGL 畫面、實際第一人稱乘坐高度、桌機／手機 FPS、熱量與畫質觀感；自動化測試通過不等於手遊級美術驗收。須於私有預覽及實機檢查後再評估合併。
- 未修改 Supabase schema、RLS、RPC、Auth 或玩家資料；未推送 main、未執行正式部署。
