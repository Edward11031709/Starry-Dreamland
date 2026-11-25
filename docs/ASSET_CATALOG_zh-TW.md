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


## 2026-11-25：動漫奇幻手遊光影統一

- 這批模型仍使用上表已記錄的 CC0 資產，沒有新增外部 GLB 或改變授權來源。
- 對不透明、非高金屬的手繪表面套用 4 段式 Toon ramp，保留原本 base-color、normal、AO 與 emissive 貼圖；透明、傳輸與高金屬表面留在 PBR。
- 這是材質風格整合，不代表幾何模型已被替換為專門手工製作的動漫遊樂園資產；外部 GLB 的實際材質表現仍待 WebGL 預覽驗收。



## 2026-11-25：正式旅人角色資產候選篩選（未匯入不合規格素材）

使用者要求的是精緻動漫奇幻手遊角色，不是只要有骨架的任意免費人形。以下是本輪查核後的候選來源與不採用原因：

| 來源 | 已查到的特性／授權 | 本輪決策 |
|---|---|---|
| [Grab3D Character Mixer](https://grab3d.com/tools/character-mixer/) | 官方頁標示 CC0；198 個模組零件、Cozy／Blocky／Low Poly 三種風格，提供 19 骨架、Idle／Walk／Run／Wave／Jump 等動畫；但沒有面部 blend shapes。 | 不直接匯入。其列出的風格仍偏簡化可愛／低模，不符合目前指定的動漫手遊精緻造型；可作為骨架／流程參考。 |
| [Broadside 3D Anime Characters](https://broadside2037.com/free-3d-anime-characters) | 官方頁列出 1,754 個免費 VRM，僅個別明確標示 CC0 的角色可免費商用；多數帶標準 Humanoid 骨架、17 種臉部表情與頭髮／衣物 Spring Bone。 | 暫不匯入任意角色。集合含動物頭、賽博龐克、街頭服飾等不同設計；必須逐一挑選與魔法旅人世界觀相符且明確 CC0 的角色，再檢查服裝、髮型、骨架及外觀客製化映射。 |
| [3DAssets.dev fantasy stylized characters](https://3dassets.dev/assets?category=characters&style=stylized&tag=fantasy) | 搜尋頁列出 73 個 CC0 GLB；目前可見結果以龍、飛龍與生物模型為主。 | 未找到符合玩家角色需求的高品質人形魔法旅人，因此不採用空白人形或龍類作為玩家外觀替代。 |
| [OpenGameArt Base Rigged Stylized Humanoid](https://opengameart.org/content/base-rigged-stylized-humanoid-character-yw) | 頁面標示 CC0、動漫比例靈感、骨架與基本動畫，但介紹為 base mesh，臉部簡單；本輪來源頁讀取受限，無法確認實際檔案與材質品質。 | 不視為可直接上線模型。若後續採用，只能先作為重新製作服裝與臉部的底模，並須再次驗證實際下載檔及授權。 |

**採用門檻：** 正面／側面／背面剪影、臉部與髮型細節、魔法服裝層次、頭髮與披風骨架、表情支援、完整動畫、明確商用授權、GLB／VRM 檔案大小及手機載入成本都要過關。若只有低模角色、一般街服或未確認授權，不得為了替換而替換。


## 2026-11-25 第四批：手繪奇幻工坊建築

來源資產包：[Fantasy MMO City And Townsfolk](https://3dassets.dev/packs/fantasy-mmo-city-and-townsfolk)。資產頁標示 CC0 1.0 Universal；同一資產包揭露使用 AI 工具輔助產生模型，屬貢獻者申報資訊，並非聲稱為純手工建模。此包包含 87 個獨立 GLB，且另外含 townsfolk／NPC；本專案只選擇兩棟建築，**不載入整包、不載入任何 townsfolk／NPC，也不載入整個 starter scene**。

| 資產 | GLB | 來源頁 | 原始尺寸（約） | 三角面數 | 動畫 | 用途 |
|---|---|---|---:|---:|---|---|
| Alchemist Shop | [32732 GLB](https://cdn.3dassets.dev/assets/32732/v1/model.glb) | [資產頁](https://3dassets.dev/assets/fantasy-mmo-city-and-townsfolk-alchemist-shop-d5f14853) | 8.76 × 12.9 × 9.04 m | 32.3k | open、close、crystal-spin、sign-sway | 星辰煉金工坊；保留旋轉晶石與招牌擺動 |
| Apothecary Shop | [32736 GLB](https://cdn.3dassets.dev/assets/32736/v1/model.glb) | [資產頁](https://3dassets.dev/assets/fantasy-mmo-city-and-townsfolk-apothecary-shop-922c13d1) | 8.18 × 9.88 × 9.23 m | 21k | open、close、sign-sway | 月草藥劑工坊；保留招牌擺動及藥草店外觀 |
| Adventurers Guild Hall | [32743 GLB](https://cdn.3dassets.dev/assets/32743/v1/model.glb) | [資產頁](https://3dassets.dev/assets/fantasy-mmo-city-and-townsfolk-adventurers-guild-hall-d597e1c9) | 12.92 × 12.90 × 14.33 m | 49.9k | open、close、banner-sway、sign-sway | 星際冒險者公會；保留旗幟與招牌擺動 |

- 三個模型分別約 1.7 MB、1.0 MB 與 2.6 MB（合計約 5.3 MB），採個別 GLB CDN 載入，不下載 92.2 MB 的完整資產包。
- 主場景只載入兩棟建築，不載入資產包內 14 位 townsfolk／NPC。
- 匯入時保留原始手繪貼圖並依共用動漫 Toon/PBR 規則調整材質；動畫僅播放經確認存在的片段，不要求模型必須具備不存在的動畫。
- 建築各自使用定位樞紐：先依 GLB bounds center 校正模型原點，再朝向中央步道，避免以不明作者原點旋轉造成模型偏位。
- 碰撞半徑、探索區、入口步道、廣場、接地陰影皆為專案端設定；尚待實際 WebGL 私有預覽檢查建築比例、朝向、動畫、碰撞與手機效能。


## 2026-11-25：外部 GLB 材質細節保留修正（候選）
- 先前共用材質轉換會將部分有手繪 base-color 貼圖的 GLB 也轉成 MeshToonMaterial；MeshToonMaterial 無法完整呈現 roughnessMap、metalnessMap 與部分額外 PBR 通道，可能讓石材、木材、屋瓦、金屬等近距離表面看起來過平。
- 新版分流：有任何表面貼圖（base-color、normal、roughness、metalness、bump、displacement、AO、emissive、light、alpha）的材質保留 clone 後的 glTF 原生 PBR 通道；只有未貼圖的簡單材質使用共用四階 Toon ramp。
- 透明、transmission、金屬與 clearcoat 材質保留 PBR；色調只加極輕的藍紫環境融合，避免破壞原始貼圖的手繪色階。
- **效果邊界：** 這項修正能減少渲染流程丟失的既有材質資料，但不會替模型增加三角面、雕刻、貼圖解析度或服裝細節；仍需視覺驗收，也不能代替高品質主體資產。
