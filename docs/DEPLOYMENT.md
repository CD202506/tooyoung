# Deployment Guide

本專案以 Next.js 16（App Router）實作，並使用 SQLite + JSON 檔。以下提供三種部署途徑：Vercel、Netlify、自行架設 Node 伺服器。

## 共同前置作業

- Node.js 18 或 20（建議 20）。
- 安裝相依：`npm ci`
- 同步資料庫（若需）：  
  1) `npm run migrate`  
  2) `npm run sync`
- 主要環境變數（依需求擴充）：
  - `NEXT_PUBLIC_BASE_URL`：站台 URL，分享連結與 API 呼叫會用到。
  - 其他 API key 視情境加入 `.env.local`。

---

## 部署到 Vercel

1. 登入 Vercel，建立專案並連結 GitHub repo。
2. Environment Variables：設定 `NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app`。
3. Build & Output：
   - Build Command：`npm run build`
   - Output Directory：自動（Next.js）
4. 若需要 SQLite seed，將 `db/tooyoung.db` 佈署前放入 repo，或在 Build Command 前新增 `npm run migrate && npm run sync`（確保 `data/` 內有案例）。

> SQLite 寫入在無伺服器環境會受限，如需完整寫入請改用 Node server 方式或使用 Vercel Edge Config/DB 替代方案。

---

## 部署到 Netlify

1. 專案根目錄的 `netlify.toml` 已設定 Next.js 插件。
2. Netlify 專案設定：
   - Build Command：`npm run build`
   - Publish Directory：`.next`
   - Environment Variables：`NEXT_PUBLIC_BASE_URL=https://your-domain.netlify.app`
3. 如需在建置時同步 SQLite，可在 Netlify Build hook 前加入 `npm run migrate && npm run sync`（需確保 `data/` 存在且允許寫入）。

> 同樣注意無伺服器環境的 SQLite 寫入限制；若要可寫 DB，建議改為自行佈署。

---

## 自行架設 Node 伺服器（Linux/Windows）

1. 環境準備：Node 20、git、可寫入檔案系統。
2. 下載程式碼：`git clone https://github.com/CD202506/tooyoung.git`
3. 安裝相依：`npm ci`
4. 佈署資料：
   - 確保 `data/` 內有案例 JSON。
   - 建置 DB：`npm run migrate && npm run sync`
5. 建置並啟動：
   - `npm run build`
   - `npm run start`（預設 PORT=3000，可在環境變數調整）
6. 反向代理：在 Nginx/Apache 將 443/80 轉發到內部 3000。

### Windows 服務化（選用）
- 使用 NSSM 或 Windows 服務管理將 `npm run start` 常駐。
- 若需開機自動執行，可在排程器加入啟動指令。

---

## 腳本與自動化

`scripts/` 內提供示範腳本（可在 CI/CD 中引用）：
- `deploy-vercel.sh`：本地建置並推送到 Vercel CLI（需先登入）。
- `deploy-netlify.sh`：本地建置並透過 Netlify CLI 部署（需先登入）。
- `deploy-node.sh`：範例流程（migrate → sync → build → start）。

請依實際環境調整指令與環境變數。
