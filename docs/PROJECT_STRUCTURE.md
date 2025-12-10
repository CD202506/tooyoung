# Project Structure

概覽本倉庫的重要資料夾與檔案。路徑皆為相對於 repo 根目錄。

```
tooyoung/
├─ data/
│  ├─ cases/                  # 事件案例 JSON，命名採日期時間
│  ├─ profile/                # 個案主檔 JSON（同步至 SQLite）
│  └─ schema/                 # JSON schema 參考
├─ db/
│  ├─ migrations/             # SQLite migration SQL（001_init.sql, 002_create_clinical_scales.sql）
│  └─ tooyoung.db             # 本地 SQLite 資料庫（由腳本讀寫）
├─ public/                    # 靜態資源（圖檔、icon、字型）
├─ scripts/                   # 部署／運維腳本（Node / Vercel / Netlify）
├─ src/
│  ├─ app/                    # Next.js App Router 頁面與 API routes
│  │  ├─ api/                 # REST endpoints（cases, scales, summary, share...）
│  │  ├─ cases/               # 事件列表、詳情、編輯、新增頁
│  │  ├─ clinical/            # /clinical/map 三軸分析頁
│  │  ├─ summary/             # 摘要、PDF 匯出
│  │  ├─ settings/share/      # 分享與隱私設定頁
│  │  └─ ...                  # 其他頁面（timeline、analytics、visit-brief 等）
│  ├─ components/             # React 元件（CaseCard、Lightbox、ShareSettingsPanel...）
│  ├─ lib/                    # 商業邏輯與工具（symptomCategories、privacy、normalizeCase...）
│  ├─ types/                  # TypeScript 型別（Case, CaseProfile, ClinicalScale 等）
│  └─ utils/                  # 腳本與共用函式（dbInit, syncCasesToSQLite, verify 等）
├─ .github/workflows/         # CI / Release GitHub Actions
├─ docs/                      # 本文件、部署、治理指南
├─ netlify.toml               # Netlify 部署設定（Next.js plugin）
├─ package.json               # 專案腳本與依賴
└─ README.md
```

## 關鍵腳本與工作流程
- `npm run dev`：啟動 Next.js 開發伺服器。
- `npm run build` / `npm run start`：建置並以 Node 伺服器啟動。
- `npm run migrate`：執行 SQLite migrations。
- `npm run sync`：將 `data/cases/*.json` 同步到 SQLite。
- `npm run verify`：快速檢查資料夾、SQLite 資料表與 API 可用性。

## 主要資料流
1. 作者在 `data/cases/` 編輯事件 JSON。
2. 透過 `npm run sync` 將 JSON 同步進 SQLite（cases_index, tags_index, cases_fts）。
3. Next.js API routes / 前端頁面讀取 SQLite 與 JSON，呈現事件列表、時間軸、臨床分析。
4. 分享／隱私設定存放在 `case_profiles` 表，由 `/api/case-profile` 相關路由存取。
