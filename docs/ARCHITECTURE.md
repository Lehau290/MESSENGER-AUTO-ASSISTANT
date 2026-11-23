# KIẾN TRÚC HỆ THỐNG: MESSENGER AUTO ASSISTANT

## 1. Tổng quan mô hình kiến trúc

Dự án **Messenger Auto Assistant** được thiết kế theo kiến trúc Micro-Client / Centralized-Backend:

```
+-----------------------------------+       +------------------------------------+
|  Google Chrome Web Application    |       | Windows 10/11 Desktop Application  |
|  (React 18 + TS + Tailwind CSS)   |       | (Electron + System Tray + Notifs)  |
+-----------------+-----------------+       +-----------------+------------------+
                  |                                           |
                  | REST API & WebSocket (Socket.io)          | REST API & WebSocket
                  +---------------------+---------------------+
                                        |
                                        v
                    +---------------------------------------+
                    |       Node.js Express Backend API     |
                    | - JWT Auth & Security Middleware      |
                    | - AI Natural Language Engine          |
                    | - Real-time Cron Scheduler            |
                    | - Automation Rule Evaluation Engine   |
                    | - Meta Webhook Verification Endpoint  |
                    +-------------------+-------------------+
                                        |
                                        v
                    +---------------------------------------+
                    |        Prisma ORM & SQLite / DB       |
                    | - Users, Contacts, Templates          |
                    | - ScheduledMessages, AutomationRules  |
                    | - ActivityLogs, AISettings, Preferences|
                    +---------------------------------------+
```

## 2. Giải pháp kỹ thuật tuân thủ chính sách Meta cá nhân

- **Thực trạng**: Meta Messenger Platform **không** cung cấp Public Graph API cho tài khoản Facebook cá nhân để đọc trộm hoặc tự động gửi tin nhắn mà không qua phê duyệt người dùng.
- **Phương án độc lập & hợp pháp**:
  1. Trợ lý AI phân tích ngữ cảnh, soạn thảo 3 biến thể tin nhắn theo phong cách người dùng lựa chọn (Dễ thương, Lịch sự, Hài hước, v.v.).
  2. Hệ thống tạo liên kết điều hướng thông minh chuẩn giao thức Messenger: `https://m.me/{fbUsername}`.
  3. Khi bấm "Mở Messenger gửi", hệ thống tự động chép nội dung vào khay nhớ tạm (Clipboard) và kích hoạt mở cửa sổ chat chính thức của Messenger.
  4. Hệ thống lập lịch chạy ngầm kiểm tra mỗi 30 giây; khi đến giờ hẹn sẽ phát âm thanh và hiển thị thông báo Toast góc màn hình Windows để người dùng nhấn xác nhận gửi thủ công.
  5. Minh bạch trạng thái hoạt động: `DRAFT`, `PENDING_CONFIRMATION`, `CONFIRMED_MANUAL_SENT`, `CANCELLED`, `FAILED`. Tuyệt đối không đánh dấu là "đã gửi" nếu người dùng chỉ mới sao chép.

## 3. Các thực thể cơ sở dữ liệu (Prisma Database Schema)

1. **users**: Lưu thông tin đăng nhập, mật khẩu mã hóa bcrypt, vai trò quản trị/người dùng.
2. **contacts**: Danh bạ liên hệ cá nhân, username Messenger, quan hệ (Bạn bè, Gia đình, Công việc, Crush), ghi chú cá nhân, thẻ tag.
3. **message_templates**: Thư viện mẫu tin nhắn phân theo 8 danh mục, hỗ trợ biến `{name}`, `{time_greeting}`.
4. **scheduled_messages**: Lịch hẹn gửi tin, chu kỳ lặp lại (Một lần, Hằng ngày, Hằng tuần), trạng thái thông báo và thời điểm kích hoạt.
5. **message_drafts**: Lưu trữ các bản nháp và biến thể tin nhắn do AI tạo ra.
6. **automation_rules**: Kịch bản tự động hóa từ khóa (chứa từ khóa, so khớp chính xác, regex), khung giờ hoạt động, câu phản hồi đề xuất.
7. **activity_logs**: Lịch sử kiểm toán chi tiết mọi thao tác (Soạn AI, Nhắc lịch, Xác nhận gửi, Mở Messenger).
8. **ai_settings**: Cấu hình nhà cung cấp AI (Google Gemini, OpenAI, OpenRouter, Custom Local), mã hóa khóa API.
9. **user_preferences**: Tùy chọn giao diện (sáng/tối), chuông báo, chạy ngầm khay hệ thống Windows.
10. **integrations**: Điểm neo sẵn sàng tích hợp chính thức Webhook Meta Messenger nếu được cấp quyền Page/App.
