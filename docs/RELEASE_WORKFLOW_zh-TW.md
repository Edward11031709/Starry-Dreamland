# 星夢樂園正式發布流程（照著畫面操作）

正式網站：https://edward11031709.github.io/Starry-Dreamland/

## 先理解兩種版本

- **測試候選版**：位於 `dev/*` 或 `feature/*` 分支及 Pull Request。Actions 只執行程式檢查，不會覆蓋公開網站。
- **正式公開版**：只有經管理員驗收、合併至 `main`，再由管理員手動執行正式發布工作流程的版本。

**合併 PR 不會自動發布。** 目前 `.github/workflows/pages.yml` 沒有 `push` 部署觸發條件；正式部署使用 `workflow_dispatch`。

## A. 測試候選版本

1. 開啟 Repository 的 **Pull requests** 分頁。
2. 點選要驗收的 PR，先看 **Checks** 是否全部成功。
3. 若管理員中心已完成私有預覽設定，使用私有預覽實際檢查桌機與手機畫面、角色移動、碰撞、遊樂設施和操作流程。若頁面顯示預覽設定錯誤，先完成私有預覽設定；不要拿公開網站當作尚未發布程式碼的預覽。
4. 若 PR 顯示 **Draft**，代表仍是草稿；確認可交付後才按 **Ready for review**。
5. 測試尚未完成時，不要合併 PR，也不要執行正式發布。

## B. 將驗收版本合併到 main

1. 在 PR 的 **Files changed** 再確認變更範圍。
2. 確認所有必要 Checks 成功，並完成實際預覽驗收。
3. 管理員確認可以公開後，才按 **Merge pull request**。
4. 合併完成後，記下 main 上的最新 commit SHA。

注意：合併只是把候選程式碼放到 `main`，此時公開網站仍是上一次成功發布的版本。

## C. 手動發布到所有訪客可見的網站

1. 回到 Repository，點上方 **Actions**。
2. 在左側工作流程清單選 **「星夢樂園檢查與正式發布」**。
3. 點右側 **Run workflow**。
4. Branch 下拉選單選 **`main`**。
5. 勾選 **「我已檢查此版本並確認發布到公開網站」**（對應 `confirm_release=true`）。
6. 點綠色 **Run workflow** 按鈕。
7. 開啟這次執行紀錄，確認 **「檢查程式與園區必要元件」** 和 **「管理員確認後發布正式版」** 都顯示 Success。
8. 開啟正式網站並強制重新整理：Windows 可按 `Ctrl + F5`。

正式發布的工作流程有四個必要條件：事件必須是手動 `workflow_dispatch`、分支必須是 `main`、執行者必須是 GitHub 帳號 `Edward11031709`、且必須勾選 `confirm_release`。任何一項不符合，正式部署 job 都會跳過。

## D. 如何確認大家看到的是新版本

- Actions 執行成功後，開啟正式網站：<https://edward11031709.github.io/Starry-Dreamland/>
- 也可開啟 <https://edward11031709.github.io/Starry-Dreamland/release.json>，查看這次正式發布的 commit SHA 與時間。
- 若畫面仍是舊版，先用 `Ctrl + F5` 強制重新整理，再確認 `release.json` 的 commit 是否與此次 main 版本一致。

## E. 發布失敗或需要回復

- 若檢查 job 失敗：不要繼續發布；回 PR 修正後重新測試。
- 若部署 job 失敗：先看 Actions 失敗步驟，公開網站不應被視為已更新。
- 若新版本有嚴重問題：從先前核准的 commit 建立回復 PR，經同樣驗收與正式發布程序處理。
- 回復程式版本不會回滾 Supabase 玩家帳號、星塵、外觀、紀錄或聊天資料。

## 安全設定提醒（目前仍需管理員確認）

截至 2026-11-21，GitHub 回報 `main` **尚未啟用 branch protection**。正式使用前，建議在 Repository → **Settings → Branches** 為 `main` 設定禁止直接推送、必須經 Pull Request 合併及必要狀態檢查。

工作流程會使用名為 `production` 的 GitHub Environment；請在 Settings → **Environments → production** 確認部署分支限制及 Required reviewers。這些 Environment 審核人設定無法只從工作流程 YAML 推斷；尚未核對前，不應宣稱已啟用人工審核。

## 與私有預覽的差別

管理員私有預覽是測試用途，與公開 GitHub Pages 發布分開。私有預覽不會讓一般訪客看到，也不會取代本文件的正式發布程序。私有預覽設定請見 [ADMIN_PREVIEW_SETUP_zh-TW.md](ADMIN_PREVIEW_SETUP_zh-TW.md)。
