# GitHub Pages 發布檢查表

## 上傳前
- [ ] 解壓縮發布 ZIP。
- [ ] 確認 index.html、app.js、styles.css、config.js 都在根目錄。
- [ ] 確認 assets/ 資料夾也在根目錄。
- [ ] 不要上傳 ZIP 本身取代檔案；需要上傳解壓後內容。
- [ ] 確認沒有密碼、service-role key 或真實玩家資料。

## GitHub
- [ ] 將解壓後所有內容上傳至 main 分支根目錄。
- [ ] Settings → Pages → Source 選 GitHub Actions。
- [ ] Actions 出現綠色成功狀態。
- [ ] 開啟 https://Edward11031709.github.io/Starry-Dreamland/

## 瀏覽器測試
- [ ] 登入／展示帳號流程可用。
- [ ] 三款遊戲可開始、結束及返回廣場。
- [ ] 積分及歷史紀錄可保存於目前瀏覽器。
- [ ] 手機畫面沒有主要按鈕被裁切。
- [ ] 3D／星塵動畫失敗時有可用 fallback。

## 已知限制
目前 localStorage 資料不跨裝置同步。全體玩家共用帳號及排行榜需另外連接 Supabase 等後端。