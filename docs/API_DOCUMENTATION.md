# TÀI LIỆU REST API: MESSENGER AUTO ASSISTANT

Tất cả các API yêu cầu xác thực cần gửi kèm Header:
`Authorization: Bearer <JWT_TOKEN>`

Endpoint gốc mặc định: `http://localhost:5000/api`

---

## 1. Authentication (`/api/auth`)

- `POST /api/auth/register`
  - Body: `{ email, password, fullName }`
  - Response: `{ success, token, user }`
- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Response: `{ success, token, user }`
- `GET /api/auth/me`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, user }`
- `PUT /api/auth/profile`
  - Body: `{ fullName, avatarUrl }`
- `PUT /api/auth/change-password`
  - Body: `{ currentPassword, newPassword }`

---

## 2. Dashboard (`/api/dashboard`)

- `GET /api/dashboard/stats`
  - Trả về thống kê tổng quan (drafts, sent, pending, templates, contacts, rules), biểu đồ 7 ngày gần nhất, lịch sắp tới, hoạt động gần nhất.

---

## 3. Contacts (`/api/contacts`)

- `GET /api/contacts?relationship=&search=&isFavorite=`
  - Danh sách người liên hệ kèm số lượng lịch hẹn.
- `GET /api/contacts/:id`
  - Chi tiết người liên hệ kèm lịch sử trao đổi.
- `POST /api/contacts`
  - Body: `{ name, fbUsername, relationshipType, phone, email, notes, tags, isFavorite }`
- `PUT /api/contacts/:id`
  - Cập nhật thông tin người liên hệ.
- `DELETE /api/contacts/:id`
  - Xóa người liên hệ.
- `PATCH /api/contacts/:id/favorite`
  - Đánh dấu/bỏ đánh dấu yêu thích.

---

## 4. AI Message Generation (`/api/ai`)

- `POST /api/ai/generate`
  - Body: `{ contactId, recipientName, topic, context, tone, length, action }`
  - Tones: `CUTE`, `FRIENDLY`, `ROMANTIC`, `FUNNY`, `POLITE`, `PROFESSIONAL`, `CARING`, `APOLOGETIC`, `MORNING`, `NIGHT`
  - Length: `SHORT`, `MEDIUM`, `LONG`
  - Action: `GENERATE`, `REWRITE`, `SHORTEN`, `EXPAND`
  - Response: `{ success, data: { draftId, variations: string[], tone, length } }`
- `POST /api/ai/analyze`
  - Body: `{ conversationText, intimacyLevel, desiredTone }`
  - Response: `{ success, data: { sentiment, intent, suggestedResponses, tips } }`
- `GET /api/ai/drafts`
  - Lịch sử các bản nháp AI đã soạn.

---

## 5. Schedules (`/api/schedules`)

- `GET /api/schedules?status=`
  - Lấy danh sách lịch gửi tin nhắn (PENDING, NOTIFIED, CONFIRMED_MANUAL_SENT, CANCELLED).
- `POST /api/schedules`
  - Body: `{ contactId, content, scheduledAt, recurrenceType, recurrenceCustomDays }`
- `PUT /api/schedules/:id`
  - Cập nhật lịch gửi.
- `DELETE /api/schedules/:id`
  - Xóa lịch gửi.
- `POST /api/schedules/:id/postpone`
  - Body: `{ minutes: 15 }` (Hoãn lịch thêm N phút).
- `POST /api/schedules/:id/confirm-manual-sent`
  - Đánh dấu đã xác nhận gửi thủ công qua Messenger.

---

## 6. Automation Rules (`/api/automation`)

- `GET /api/automation/rules`
  - Danh sách kịch bản tự động hóa.
- `POST /api/automation/rules`
  - Body: `{ name, keywords, replyContent, triggerCondition, activeHoursStart, activeHoursEnd, isEnabled, priority }`
- `PUT /api/automation/rules/:id`
  - Cập nhật kịch bản.
- `DELETE /api/automation/rules/:id`
  - Xóa kịch bản.
- `POST /api/automation/test`
  - Body: `{ sampleText }` (Kiểm tra thử độ khớp kịch bản).

---

## 7. Templates (`/api/templates`)

- `GET /api/templates?category=&search=`
  - Thư viện mẫu tin nhắn.
- `POST /api/templates`
  - Body: `{ title, category, content, tags, isFavorite }`
- `PUT /api/templates/:id`
  - Chỉnh sửa mẫu.
- `DELETE /api/templates/:id`
  - Xóa mẫu.
- `POST /api/templates/:id/duplicate`
  - Nhân bản mẫu tin nhắn.
- `POST /api/templates/:id/use`
  - Body: `{ recipientName }` (Giải mã biến `{name}`, `{time_greeting}`).

---

## 8. Activity Logs (`/api/logs`)

- `GET /api/logs?actionType=&status=&page=&limit=`
  - Danh sách nhật ký kiểm toán.
- `POST /api/logs`
  - Ghi nhận hành động mới (COPY_MESSAGE, OPEN_MESSENGER, v.v.).
- `DELETE /api/logs/clear`
  - Xóa toàn bộ lịch sử hoạt động.

---

## 9. Settings & Backup (`/api/settings`)

- `GET /api/settings`
  - Cấu hình AI và tùy chọn người dùng.
- `PUT /api/settings/ai`
  - Cập nhật API Key và mô hình AI.
- `PUT /api/settings/preferences`
  - Cập nhật âm thanh, thông báo, khay hệ thống.
- `GET /api/settings/export`
  - Tải về tệp sao lưu dữ liệu toàn diện định dạng JSON.

---

## 10. Meta Integration & Webhook (`/api/integrations`)

- `GET /api/integrations/status`
- `PUT /api/integrations/meta`
- `GET /api/integrations/webhook` (Meta Hub Challenge Verification)
- `POST /api/integrations/webhook` (Meta Event Receiver)
