# 星夢樂園版本與發布狀態
## 2026-11-26 最新主線、公開版與角色臉型候選

- 最新 `main` HEAD：`631b2b7ddc1e35b379127b675c04e869a0d1f1b7`；最新主線提交為合併 PR #30「保留奇幻 GLB 的手繪 PBR 材質細節」。
- 最近可確認成功的正式 Pages 發布仍為 Actions #185（run ID `45029236953`），部署 SHA：`549443d377c5db5e1ad9abb6f045bc90311eeec0`，日期 2026-11-22。之後 main 的更新尚未由本輪每日開發程序發布；Repository Releases 清單目前為空。
- PR #31「升級星夢城堡、旋轉木馬與摩天輪高細節模型」為 Open、Ready for review、mergeable=true；HEAD `5cc2a2ddf6c776bd6241c68a103517161888bc3a`。最新 Actions #239（run ID `45625613930`）成功，PR 說明記錄 Node tests 91 passed／0 failed；正式部署 job skipped，沒有 Actions artifact。真實 WebGL、搭乘位置、碰撞與手機 FPS 仍待人工驗收。
- PR #27「旅人角色 3D 精修」仍 Open、非 Draft，但 GitHub 回報 mergeable=false；其 base SHA 為舊版 `61a0f5d6fcafb7122a1f14d9285a191280b9ddd3`，目前 main 已前進。不要直接合併或重寫此舊分支；須由管理員檢查差異及是否已有等效修改進入 main。
- 本輪角色臉型候選分支：`feature/avatar-face-sculpt-20261126`，以 main @ `631b2b7ddc1e35b379127b675c04e869a0d1f1b7` 建立；以 13 點 LatheGeometry／48 radial segments 取代球形臉部底模，改善下顎、顴頰及太陽穴剪影。保留既有臉部五官錨點與 appearance JSON 四個欄位，不修改資料庫或玩家資料。
- PR #32「旅人臉部輪廓塑形」已建立為 Open、Ready for review（非 Draft）、mergeable=true；功能實作 SHA `4a6c9129f32eab71b627b63d9d05145bdce772f7` 的 Actions #240（run ID `45744861425`）成功：Node tests **82 passed／0 failed**，Three.js 與 Supabase Edge Function 語法檢查、首頁 import map JSON 與 inline JavaScript parse 均通過。正式發布 job skipped，沒有 Pages artifact。之後僅同步文件，不更動臉型程式；最新 HEAD 的 PR CI 仍需以最新 Actions 為準。真實 WebGL 視覺與手機 FPS 尚未驗收。
- GitHub Repository rulesets 清單讀取為空；main branch protection API 回傳 403（目前連線缺少讀取權限），production Environment Required reviewers 亦未能核實。不得宣稱正式發布保護已完整確認。

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

## 2026-11-23 設施模型搭乘整合與畫質精修（PR #26 已合併）

- PR：[ #26 精修高品質遊樂設施整合、乘坐動畫與場景清晰度 ](https://github.com/Edward11031709/Starry-Dreamland/pull/26)，已合併至 `main`。
- 合併後 `main` commit：`61a0f5d6fcafb7122a1f14d9285a191280b9ddd3`。這只代表程式碼進入 main，不代表公開 Pages 已更新；本紀錄沒有核實到使用者核准的正式部署。
- 設施模型以實際 GLB 語意節點掛載乘坐錨點，檢查必需動畫後才隱藏程序化 fallback；茶杯雙動畫、自由落體往返動畫、摩天輪輪體 spin；同步修正模型地面定位、碰撞與下車距離。
- 手機後處理解析度提升至 0.86，採手機 2×／桌面 4× 多重取樣。
- 先前最終候選 CI run #213（run ID `45197615798`）成功：Node tests **65 passed／0 failed**；PR 部署工作跳過。該 CI 只能確認結構與語法，不代表真實 WebGL 視覺驗收。
- 尚未在真實瀏覽器驗收模型實際節點、搭乘視角、碰撞、桌機／手機 FPS 及畫質；未修改 Supabase／玩家資料。

## 2026-11-25 PR #25 無法 Pull 的處理

- PR：[ #25 精修旅人髮際線與眼尾細節 ](https://github.com/Edward11031709/Starry-Dreamland/pull/25) 已於 2026-11-25 關閉（未合併）。
- 舊分支 `feature/avatar-hairline-couture-20261123` 曾相對當時 main 落後 48 個提交並分岔；目前該分支仍留在 GitHub，需由 repo owner 在 Branches 頁面手動刪除。連接的 GitHub 操作未提供 DELETE git ref 能力，沒有假稱已刪除。
- #25 唯一的髮際線前束、鬢角髮束、眼尾睫線及相應測試，已重新移植至最新 main，並隨 PR #28 合併；既有髮型 ID 與 appearance JSON 欄位不變。

## 2026-11-25 動漫奇幻手遊角色與外部模型風格整合（PR #28）

- PR：[ #28 朝動漫奇幻手遊質感精修旅人角色與 Toon 光影 ](https://github.com/Edward11031709/Starry-Dreamland/pull/28)，已於 2026-11-25 合併至 `main`。
- Merge commit：`8ea0ccdeeb7ea4556f49e04a437c31395598883d`；合併前候選 HEAD：`5f5c6b4503a211c47a7ae5ca5ae2f36732774c25`。程式碼合併不代表使用者已手動發布 Pages。
- 旅人角色加入四段式 Toon 漸層光影、重點輪廓線、前額／鬢角髮束、眼尾睫線及較清楚的虹膜與眼睛高光；保留 long／short／twin／hood 等既有髮型 ID、旅人類型及 appearance JSON。
- 對現有外部奇幻 GLB 的不透明、非高金屬材質加入共用 Toon 漸層；保留原始 base-color、normal、AO、emissive 貼圖。透明／transmission／高金屬與極低粗糙度表面保留 PBR，避免玻璃、金屬、水晶失去原有光學質感。
- 新增材質快取，避免每個網格建立重複材質；不改變外部模型幾何、資產來源、設施動畫、座位錨點、碰撞與 fallback。
- GitHub Actions run #225（run ID `45601489252`）成功，驗證最終 PR #28 HEAD `5f5c6b4503a211c47a7ae5ca5ae2f36732774c25`：Node tests **69 passed／0 failed**；Three.js、Supabase Edge Function 與首頁 inline JavaScript／import map 檢查成功；正式部署工作依 PR 流程 skipped。
- 尚未進行真實 WebGL 管理員私有預覽、桌機／手機外觀及 FPS 人工驗收。Toon 光影是風格整合的第一步，**不代表已完成真正高品質、具骨架與完整服裝造型的動漫角色模型**；後續仍須挑選／製作符合魔法奇幻設定、授權清楚且相容既有客製化資料的角色資產。
- 不修改 Supabase schema、RLS、RPC、Auth、migration、帳號、星塵、服裝所有權或任何正式玩家資料；不建立假 NPC／玩家；不執行正式部署。


## 2026-11-25 旅人模型來源篩選補充

- 已檢查 Grab3D CC0 modular character tool、Broadside CC0 anime VRM collection、3DAssets.dev fantasy character listing，以及 OpenGameArt 基礎人形底模。
- 本輪沒有匯入不符合標準的低模、街頭服飾或僅為空白底模的素材；理由與各來源限制已記錄於 `docs/ASSET_CATALOG_zh-TW.md` 與 Roadmap。
- 不因取得授權就假設模型符合角色美術；完整角色仍需檢查服裝世界觀、臉部／表情、髮絲／披風骨架、動畫及手機成本。


## 2026-11-25 PR #29 手繪奇幻工坊區（候選）

- 候選分支：`feature/handpainted-fantasy-district-20261125`，以 PR #28 的合併 SHA 為基底。
- 新增星辰煉金工坊（Alchemist Shop）、月草藥劑工坊（Apothecary Shop）與星際冒險者公會（Adventurers Guild Hall）三個單獨 CC0 GLB；分別約 32.3k／21k／49.9k triangles，約 1.7／1.0／2.6 MB（合計約 103k triangles／5.3 MB）。
- 新增朝向中央步道的 bounds-center placement pivot、左右支線步道、兩座小廣場、建築碰撞、探索區及接地陰影；移開建築入口周圍的樹木。
- 動畫使用來源模型的 crystal-spin／sign-sway；不載入資產包中的 NPC，也不載入整個 starter scene。
- CI 與真實 WebGL 預覽尚待候選 PR 建立後確認。自動測試不等於畫面驗收；建築比例、動畫與手機 FPS 仍須私有預覽檢查。
- 不修改 Supabase schema、RLS、RPC、Auth、migration、玩家帳號、星塵或服裝所有權；不執行正式部署。
