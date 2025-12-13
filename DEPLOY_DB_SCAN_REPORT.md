# Deployment DB Scan Report

掃描範圍：`src/app/**/page.tsx`, `src/app/**/layout.tsx`, `src/app/**/generateMetadata`, `src/app/**/route.ts`, `src/pages/**/*.ts`  
掃描條件：`better-sqlite3` 匯入、新建 `Database`, 同步 DB/FS 存取等。

| 檔案 | 風險等級 | 為何可能在 build 階段執行 | dynamic 設定 | 建議修正 |
| --- | --- | --- | --- | --- |
| src/app/cases/page.tsx | MEDIUM | Server Component 內同步 `better-sqlite3` 匯入與 `new Database`，雖有 `dynamic = "force-dynamic"` 但模組會在 bundling 時載入，存在潛在 build 期初始化風險。 | dynamic=force-dynamic；未設定 revalidate | 將 SQLite 匯入/連線改為函式內動態 import，並在 build 階段以環境判斷短路；或改由 API route 取資料。 |
| src/app/profile/page.tsx | MEDIUM | Server Component 內同步匯入/建立 SQLite，render 時即觸發 DB，build 打包時模組載入仍帶有 native 相依性風險。 | dynamic=force-dynamic | 同上，改用動態 import 或 API proxy，build 階段 short-circuit。 |
| src/app/timeline/page.tsx | HIGH | 無 `dynamic`，Server Component 內同步 `better-sqlite3` 匯入與 `new Database`，且使用 `fs.readFileSync`；可能在 prerender/build 直接打到 SQLite。 | 無 | 加上 `export const dynamic = "force-dynamic"`/`revalidate = 0`，並將 SQLite/FS 存取改為動態 import + build 階段 guard，或移到 API route。 |
| src/app/symptoms/page.tsx | LOW | 已加 `dynamic`、`revalidate=0` 且以動態 import + build 階段 guard；僅於 runtime 觸發 SQLite。 | dynamic=force-dynamic; revalidate=0 | 已處理，可維持現況。 |
| src/app/api/**/route.ts (clinical/mapdata, analytics/clinical, latest, share/[slug]) | LOW | API Route，僅在呼叫時執行；含 `better-sqlite3` 匯入與同步 DB 操作，但不會在 Next build/prerender 觸發。 | N/A (API) | 可視需要改為動態 import 以縮短 cold start；build 期風險低。 |
| src/pages/api/** (case-profile, cases, cases/[slug], case-profile-share, profile/share, profile/index, profile/update, summary/*, search, tags/[tag], visit-brief) | LOW | Pages Router API，不參與 App Router prerender；含同步 SQLite/FS；build 期不會執行。 | N/A (API) | 可保持，或採動態 import 以減少 native 模組載入成本。 |

> 備註：本報告僅列出符合條件的潛在風險點，未對程式碼進行任何修改。***
