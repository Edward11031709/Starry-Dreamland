# 星夢樂園外部 3D 資產目錄（2026-11-23）

本目錄記錄本批次新增的遠端 GLB 資產。全部資產頁均標示 **CC0 1.0 Universal**，允許修改及商業使用。這批模型由 3DAssets.dev 提供；該站資產頁對多數本批模型標示「AI used」，並列出 contributor-reported AI model。採用前已把這項來源資訊納入紀錄，未將模型描述成純手工製作。

| 批次 | 資產 | 作者／來源 | 資產頁 | CDN GLB | 授權 | 用途 |
|---|---|---|---|---|---|---|
| 1 | City Cathedral | 3DAssets.dev／Fantasy MMO City And Townsfolk 貢獻者（AI 使用為貢獻者申報） | https://3dassets.dev/assets/fantasy-mmo-city-and-townsfolk-city-cathedral-260bcd65 | https://cdn.3dassets.dev/assets/32747/v1/model.glb | CC0 1.0 | 星夢城堡主體 |
| 1 | Arcane Mage Tower | 3DAssets.dev／Fantasy MMO City And Townsfolk 貢獻者（AI 使用為貢獻者申報） | https://3dassets.dev/assets/fantasy-mmo-city-and-townsfolk-arcane-mage-tower-3270d276 | https://cdn.3dassets.dev/assets/32746/v1/model.glb | CC0 1.0 | 星辰觀測站主體 |
| 1 | Plaza Fountain | 3DAssets.dev／Fantasy MMO City And Townsfolk 貢獻者（AI 使用為貢獻者申報） | https://3dassets.dev/assets/fantasy-mmo-city-and-townsfolk-plaza-fountain-9b482127 | https://cdn.3dassets.dev/assets/32770/v1/model.glb | CC0 1.0 | 中央廣場噴泉 |
| 2 | Carousel | 3DAssets.dev／Theme Park Rides and Coasters 貢獻者（AI 使用為貢獻者申報） | https://3dassets.dev/assets/theme-park-rides-and-coasters-theme-park-rides-and-coa-b3ccf619 | https://cdn.3dassets.dev/assets/28656/v1/model.glb | CC0 1.0 | 星光旋轉木馬 |
| 2 | Spinning Teacups | 3DAssets.dev／Theme Park Rides and Coasters 貢獻者（AI 使用為貢獻者申報） | https://3dassets.dev/assets/theme-park-rides-and-coasters-theme-park-rides-and-coa-70d0de97 | https://cdn.3dassets.dev/assets/28657/v1/model.glb | CC0 1.0 | 星月茶杯 |
| 2 | Drop Tower | 3DAssets.dev／Theme Park Rides and Coasters 貢獻者（AI 使用為貢獻者申報） | https://3dassets.dev/assets/theme-park-rides-and-coasters-theme-park-rides-and-coa-a2e7ac6f | https://cdn.3dassets.dev/assets/28658/v1/model.glb | CC0 1.0 | 星際自由落體 |
| 2 | Ferris Wheel | 3DAssets.dev／Theme Park Rides and Coasters 貢獻者（AI 使用為貢獻者申報） | https://3dassets.dev/assets/theme-park-rides-and-coasters-theme-park-rides-and-coa-d18acb96 | https://cdn.3dassets.dev/assets/28655/v1/model.glb | CC0 1.0 | 星河摩天輪 |
| 2 | Wooden Coaster Train | 3DAssets.dev／Theme Park Rides and Coasters 貢獻者（AI 使用為貢獻者申報） | https://3dassets.dev/assets/theme-park-rides-and-coasters-theme-park-rides-and-coa-993fa7ed | https://cdn.3dassets.dev/assets/28653/v1/model.glb | CC0 1.0 | 星際雲霄飛車列車；沿用現有軌道路徑 |
| 3 | Runestone Conservatory Crystal Willow Tree | 3DAssets.dev／Runestone Conservatory 貢獻者（AI 使用為貢獻者申報） | https://3dassets.dev/assets/runestone-conservatory-crystal-willow-tree | https://cdn.3dassets.dev/assets/108/v1/model.glb | CC0 1.0 | 晶石花園樹木 |
| 3 | Glowing Crystal Cluster | 3DAssets.dev／Sunken City and Underwater Ruins 貢獻者（AI 使用為貢獻者申報） | https://3dassets.dev/assets/sunken-city-and-underwater-ruins-glowing-crystal-clust-897febc9 | https://cdn.3dassets.dev/assets/36999/v1/model.glb | CC0 1.0 | 月光晶簇景觀 |

## 檔案完整性與版本管理

- 下載日期／整合日期：2026-11-23。
- 本次以固定版本 CDN URL 載入，未將 GLB 二進位檔複製到 Repository；因此沒有本地 vendored binary 的固定 SHA-256。
- 每次瀏覽器成功下載 GLB 後，會對實際 ArrayBuffer 計算 SHA-256，並在 console 的 `[Starry Dreamland asset]` 記錄輸出資產 ID、SHA-256、位元組數與來源頁；同時派發 `starry-3d-asset-loaded` 事件。
- 這是下載當次的完整性指紋，不等於對遠端內容做固定 hash pinning。若要完全鎖定版本，下一階段應將核准的 GLB 下載到 Repository，記錄靜態 SHA-256，再改為本地載入。
- 模型採雙併發載入；任一模型失敗會保留對應程序化模型。外部模型不帶碰撞資料，碰撞仍由專案既有 ride／collider 系統管理。
- 本批沒有載入任何 townsfolk／NPC／假玩家模型。

## 第四批角色模型策略

第四批目前精修既有旅人模型的頭冠寶石、腕部飾環與靴部金屬細節，保留已保存的外觀欄位、髮型、髮色、膚色、服裝及角色類型。尚未找到已核實可直接映射既有客製化系統的完整玩家角色 GLB，因此不以來源／骨架／比例未確認的角色資產覆蓋現有玩家模型。

## 2026-11-23：高品質遊樂設施搭乘整合精修

- 外部設施 GLB 不再只掛在設施根節點。載入時會依照模型節點名稱尋找 horse、cup、gondola、cabin 等語意節點，從該節點實際包圍盒計算旅人乘坐錨點；錨點成為 GLB 節點的子物件，跟隨模型動畫更新。
- 旋轉木馬要求 spin；星月茶杯同時要求 platform-spin 與 cup-spin；自由落體要求 open 並以往返播放呈現升降；摩天輪要求 spin。必要節點或動畫缺失時，保留原本可玩的程序化設施，不會留下「看得到模型、卻搭不到或坐在空中的」半成品。
- 雲霄飛車列車沿用曲線軌道與既有互動座位，繼續播放 wheel-roll。
- 模型定位統一保留 GLB 包圍盒最低點校正，並依匯入模型尺寸更新設施碰撞半徑與下車距離。
- 摩天輪匯入後使用較合宜的父層比例，避免 1.4 倍父層縮放讓模型佔滿相鄰園區。
- 已知來源限制：3DAssets.dev 的摩天輪模型頁說明其 spin 只旋轉輪體，吊艙沒有獨立的水平保持反向通道；這批整合不會把它宣稱為具備完整獨立吊艙物理的模擬。實際乘坐視角仍須在瀏覽器中驗收。
