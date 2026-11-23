# CHÍNH SÁCH TÍCH HỢP & TUÂN THỦ META (FACEBOOK MESSENGER)

## 1. Giới hạn kỹ thuật của Facebook đối với tài khoản cá nhân

- **Meta Graph API**: Meta chỉ cung cấp quyền gửi và nhận tin nhắn tự động (Messenger Platform API) cho **Facebook Pages** và **Instagram Business Accounts** đã được đăng ký và xét duyệt qua cổng [Meta for Developers](https://developers.facebook.com).
- **Tài khoản cá nhân (Personal Profiles)**: Meta nghiêm cấm việc sử dụng bot tự động hóa không chính thống, các kỹ thuật cào cookie, giả lập token hoặc chèn script nhằm tự ý đọc trộm hộp thư và spam tin nhắn hàng loạt. Hành vi này vi phạm Điều khoản dịch vụ của Meta và dẫn đến việc tài khoản Facebook bị khóa vĩnh viễn (Check-point / Ban).

## 2. Giải pháp kỹ thuật chuẩn mực của Messenger Auto Assistant

Phần mềm **Messenger Auto Assistant** được thiết kế theo nguyên tắc: **Bảo vệ tài khoản người dùng tuyệt đối, minh bạch và hoàn toàn hợp pháp**:

1. **Không yêu cầu và không lưu trữ mật khẩu Facebook**: Người dùng đăng nhập vào hệ thống trợ lý bằng tài khoản riêng của ứng dụng, không cần cung cấp mật khẩu Facebook.
2. **Không trích xuất hay lưu trữ Cookie Facebook**: Ứng dụng không thực hiện can thiệp vào cookie phiên của trình duyệt Chrome.
3. **Cơ chế Quick-Action m.me Link**:
   - Sử dụng liên kết chính thức được Meta hỗ trợ: `https://m.me/<username_or_id>`.
   - Trợ lý AI chuẩn bị trước nội dung tin nhắn phù hợp ngữ cảnh, tự động đưa vào bộ nhớ tạm (Clipboard), sau đó mở cửa sổ trò chuyện chính thức của Messenger để người dùng chủ động kiểm tra và bấm gửi.
4. **Cơ chế Đề xuất tự động (Suggest Mode)**:
   - Thay vì cố gắng gửi lén lút sau lưng người dùng, khi có tin nhắn hoặc từ khóa khớp kịch bản, hệ thống thông báo đề xuất phản hồi tối ưu để người dùng 1-click gửi qua giao diện Messenger.
5. **Cơ chế Lập lịch nhắc nhở (Scheduled Reminders)**:
   - Đúng thời điểm đã hẹn, chuông báo và thông báo Toast trên màn hình Windows sẽ bật lên. Người dùng bấm "Mở Messenger để gửi" và "Xác nhận đã gửi".
   - Trạng thái chỉ chuyển thành `CONFIRMED_MANUAL_SENT` khi người dùng đã chủ động xác nhận.

## 3. Khả năng mở rộng API chính thức khi được cấp phép

Backend đã xây dựng đầy đủ các endpoint theo chuẩn Webhook của Meta:
- Endpoint xác thực Webhook: `GET /api/integrations/webhook` (Hub Mode & Verify Token Challenge).
- Endpoint nhận Webhook Event: `POST /api/integrations/webhook`.
- Khi doanh nghiệp hoặc nhà phát triển kết nối App ID và Page Access Token đã được Meta phê duyệt, hệ thống có thể chuyển sang chế độ `DIRECT_META_API` ngay lập tức mà không cần sửa đổi kiến trúc.
