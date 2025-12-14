## IA Phase 4-C Rebase Report

### A) 現況路由清單（App Router, `src/app`）

| URL | 檔案 | 功能摘要 | 建議分層 |
| --- | --- | --- | --- |
| / | src/app/page.tsx | 黑底 MVP Gate，四階段說明與前往 /cases CTA | 入口 |
| /about | src/app/about/page.tsx | 關於介紹 | 公共 |
| /analytics/clinical | src/app/analytics/clinical/page.tsx | 臨床分析儀表 | 系統 |
| /analytics/symptoms | src/app/analytics/symptoms/page.tsx | 症狀分析 | 系統 |
| /cases | src/app/cases/page.tsx | 示範個案列表，連到事件/症狀/時間軸 | 系統 |
| /cases/new | src/app/cases/new/page.tsx | 新增個案表單 | 系統 |
| /cases/[id] | src/app/cases/[id]/page.tsx | 示範個案詳情（事件/症狀/時間軸入口） | 系統 |
| /cases/[id]/events | src/app/cases/[id]/events/page.tsx | 示範事件列表 | 系統 |
| /cases/[id]/symptoms | src/app/cases/[id]/symptoms/page.tsx | 示範症狀統計 | 系統 |
| /cases/[id]/timeline | src/app/cases/[id]/timeline/page.tsx | 示範時間軸 | 系統 |
| /cases/[slug] | src/app/cases/[slug]/page.tsx | 舊版 slug 個案頁（已被列表替換） | 系統/待清理 |
| /cases/[slug]/edit | src/app/cases/[slug]/edit/page.tsx | 舊版編輯頁 | 系統/待清理 |
| /clinical/map | src/app/clinical/map/page.tsx | 臨床地圖 | 系統 |
| /contact | src/app/contact/page.tsx | 聯絡頁 | 公共 |
| /dashboard | src/app/dashboard/page.tsx | 儀表總覽 | 系統 |
| /features | src/app/features/page.tsx | 功能介紹 | 公共 |
| /legal/privacy | src/app/legal/privacy/page.tsx | 隱私條款 | 公共 |
| /legal/terms | src/app/legal/terms/page.tsx | 服務條款 | 公共 |
| /login | src/app/login/page.tsx | 簡易密碼登入 | 入口 |
| /profile | src/app/profile/page.tsx | 個人/個案設定 | 系統 |
| /scales | src/app/scales/page.tsx | 量表列表 | 系統 |
| /scales/new | src/app/scales/new/page.tsx | 建立量表 | 系統 |
| /scales/mmse/new | src/app/scales/mmse/new/page.tsx | 建立 MMSE | 系統 |
| /scales/cdr/new | src/app/scales/cdr/new/page.tsx | 建立 CDR | 系統 |
| /scales/trend | src/app/scales/trend/page.tsx | 量表趨勢 | 系統 |
| /scales/[id] | src/app/scales/[id]/page.tsx | 量表詳情 | 系統 |
| /scales/[id]/edit | src/app/scales/[id]/edit/page.tsx | 編輯量表 | 系統 |
| /search | src/app/search/page.tsx | 搜尋頁 | 系統 |
| /settings/share | src/app/settings/share/page.tsx | 分享設定 | 系統 |
| /share/[slug] | src/app/share/[slug]/page.tsx | 分享頁 | 公共/入口混合 |
| /summary | src/app/summary/page.tsx | 總覽 | 系統 |
| /summary/clinical | src/app/summary/clinical/page.tsx | 臨床摘要 | 系統 |
| /summary/visit | src/app/summary/visit/page.tsx | 回診摘要 | 系統 |
| /symptoms | src/app/symptoms/page.tsx | 症狀概覽示範（force-dynamic, runtime DB guard） | 公共/系統混合 |
| /tags/[tag] | src/app/tags/[tag]/page.tsx | 標籤搜尋 | 公共 |
| /timeline | src/app/timeline/page.tsx | 公版時間軸（runtime only, force-dynamic） | 公共 |
| /visit-brief | src/app/visit-brief/page.tsx | 回診摘要（App 版） | 系統 |

### B) 現況守門規則
- `middleware.ts`：若 `NEXT_PUBLIC_MVP_OPEN==="1"` 則全站放行；否則僅 `/`, `/login`, `/features`, `/about`, `/contact`, `/legal/privacy`, `/legal/terms`, `/api/auth/login` 放行。其他路由需 cookie `tooyoung_auth` 命中密碼，否則 redirect `/login`.
- 其他 redirect/守門：未發現額外針對 /cases 的 redirect，首頁 CTA 直接指向 `/cases`.
- 搜尋 `/login` 相關：`components/home/CTASection`、`components/home/HeroSection` 仍有連到 `/login` 的 Link（可能未被首頁使用）。

### C) 推導的分層（Rebase 建議）
- 公共層：/about, /features, /contact, /legal/*, /timeline, /tags/[tag], /symptoms（若作為公共知識）、/share/[slug]（公開分享）, /（若當展示入口）
- 入口層：現行 `/` 黑底 MVP Gate；/login 為權限入口。
- 系統層：/cases* 及其子路由、/dashboard, /profile, /summary*, /analytics*, /scales*, /settings/share, /search, /visit-brief, /clinical/map。
- 待清理：/cases/[slug] 舊版路徑（及 /edit）。

### D) 差距與風險
- 守門與分層不一致：`middleware` 在 MVP 關閉時會鎖住 `/symptoms`、`/timeline` 等公共/展示性內容，與「公共層可自由瀏覽」不符。
- 路由重複/遺留：/cases/[slug] 與 /cases/[id] 並存，可能造成導覽混亂；slug/edit 已標記刪除中。
- 公共資訊不足：缺少醫學新知/FAQ/評估工具專區；目前僅 /features /about /contact /legal。
- CTA 來源：首頁與部分元件 CTA 方向不一（部分 Link 仍指向 /login），需統一。

### E) 建議的最小改動路徑
1) 分層與守門對齊：在 middleware 調整白名單，放行公共層（/about, /features, /contact, /timeline, /symptoms, /tags 等），系統層維持鎖或 demo 模式放行。
2) 路由收斂：淘汰舊 /cases/[slug] 與 /edit；以 /cases/[id] 為唯一系統層個案路由。
3) 公共內容規劃：新增/整理「知識/FAQ/評估工具」為獨立公共層（例如 /knowledge 或 /public），首頁 CTA 指向入口或 /cases（demo）時明確標示展示模式；同時清理舊元件中指向 /login 的 CTA。 
