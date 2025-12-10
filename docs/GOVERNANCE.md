# Repo Governance & Workflow

## 分支策略
- `main`：受保護分支，永遠保持可部署狀態。
- 功能分支：`feature/<topic>`，完成後發 PR 合併至 `main`。
- 修補分支：`hotfix/<topic>`，僅限緊急修正。

## 提交與 PR 規範
- 提交訊息：簡潔描述，建議動詞開頭（e.g., `add`, `fix`, `refactor`）。
- PR 必填：變更摘要、測試結果、風險說明。
- PR 檢查：至少 1 人審核；CI（lint/build）通過才可合併。

## 版本與 Release
- 標籤格式：`vX.Y.Z`
- 發版流程：
  1. 合併至 `main`
  2. 建立 tag：`git tag vX.Y.Z && git push origin vX.Y.Z`
  3. GitHub Actions release workflow 會產生簡易 changelog 並建立 GitHub Release。

## 保護規則建議
- `main`：要求 PR、要求通過 CI、至少 1 reviewer、禁止直接推送。
- 強制線性歷史（可選）：如需要保持簡單歷史，可在保護規則啟用。

## Issue / 任務管理
- Issue 模板（建議）：描述、重現步驟、預期/實際結果、螢幕截圖。
- 標籤：`bug`、`feature`、`chore`、`docs`、`design` 等。
- 優先權：`P0/P1/P2` 可在標題或標籤註記。

## 安全與隱私
- 不要將個資/敏感資料放入 repo（包含 `.env`、API keys）。
- 分享連結（share_token）僅限必要時產生，切換為 private 時應自動撤銷。

## 測試與驗證
- CI 會執行 `npm run lint`、`npm run build`（如需額外測試可加上）。
- 本地修改後，至少跑 lint/build，必要時執行 `npm run verify` 檢查 SQLite / API。
