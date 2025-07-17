# API 設計（旅人共管、授權、評量分享）

## 旅人與團員關聯管理
- GET   /api/travelers/:id/members            // 取得共管團員列表
- POST  /api/travelers/:id/invite             // 邀請新團員（Body: email/name, role）
- POST  /api/travelers/:id/members            // 新增團員（受邀方接受邀請時呼叫）
- DELETE /api/travelers/:id/members/:memberId // 移除團員
- PATCH /api/travelers/:id/members/:memberId  // 變更團員權限（如評量/管理員）

## 評量/日誌/留言/標籤
- GET   /api/travelers/:id/records            // 取得旅人所有紀錄（依權限自動篩選）
- POST  /api/travelers/:id/records            // 新增紀錄（Body: type, content, tags, visibility, shared_with）
- POST  /api/travelers/:id/records/:recId/comment // 留言
- PATCH /api/travelers/:id/records/:recId     // 編輯/調整分享設定
- GET   /api/public_records                   // 取得平台所有公開紀錄

## 團員邀請
- POST  /api/invite_member                    // 發送邀請（Body: traveler_id, email, inviter_id, role）
- POST  /api/accept_invite                    // 接受邀請（驗證token，加入共管）

> 資料格式請參考前端需求，所有請求均需 session/token 驗證。
