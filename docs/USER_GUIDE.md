# HƯỚNG DẪN CÀI ĐẶT & SỬ DỤNG: MESSENGER AUTO ASSISTANT

## 1. Yêu cầu hệ thống

- Hệ điều hành: Windows 10 hoặc Windows 11 (64-bit).
- Trình duyệt: Google Chrome (phiên bản mới nhất).
- Runtime: Node.js v18+ hoặc v20+ (đã tích hợp sẵn bộ portable trong `.tools/node` của dự án).

---

## 2. Hướng dẫn khởi chạy nhanh bằng 1-Click

Thư mục gốc đã chuẩn bị sẵn các tệp thực thi tự động:

1. **Khởi động toàn bộ hệ thống (Khuyên dùng)**:
   - Nhấp đúp chuột vào file: `start-all.bat`
   - File này sẽ tự động:
     - Bật Backend API Server trên cổng `5000`.
     - Bật Web App Frontend trên cổng `5173`.
     - Tự động mở Google Chrome tới địa chỉ `http://localhost:5173`.

2. **Khởi động riêng từng phần**:
   - `start-backend.bat`: Khởi động máy chủ backend và cơ sở dữ liệu SQLite.
   - `start-web.bat`: Khởi động giao diện Web App.
   - `start-desktop.bat`: Khởi động ứng dụng Desktop Windows (Electron) với biểu tượng khay hệ thống (System Tray).

3. **Tài khoản đăng nhập mặc định**:
   - Email: `admin@messenger.vn`
   - Mật khẩu: `Password123@`
   *(Bạn cũng có thể bấm nút "Dùng tài khoản mẫu" ở màn hình Đăng nhập để điền nhanh)*

---

## 3. Hướng dẫn sử dụng các chức năng cốt lõi

### 3.1. Soạn tin nhắn thông minh bằng AI (`/ai-generator`)
1. Chọn người nhận từ danh bạ hoặc nhập tên người nhận.
2. Nhập ý tưởng/chủ đề muốn nói (Ví dụ: "Rủ bạn đi cà phê cuối tuần", "Chúc sinh nhật sếp", v.v.).
3. Chọn phong cách (Tone): Thân thiện, Dễ thương, Lãng mạn, Hài hước, Lịch sự, Chuyên nghiệp, Quan tâm, Xin lỗi, Chào buổi sáng, Chúc ngủ ngon.
4. Chọn độ dài: Ngắn gọn / Vừa phải / Dài.
5. Nhấn **"Tạo 3 phương án tin nhắn"**.
6. Tại mỗi phương án:
   - Nhấn **"Sao chép"** để copy nhanh.
   - Nhấn **"Mở Messenger gửi"**: Hệ thống tự động copy tin vào khay nhớ tạm và mở tab chat Messenger chính thức để bạn dán (Ctrl+V) gửi ngay.
   - Nhấn **"Lên lịch gửi"**: Chuyển nội dung này sang màn hình Hẹn giờ nhắc nhở.

### 3.2. Trợ lý phân tích hội thoại AI (`/ai-conversation`)
1. Khi nhận được tin nhắn khó trả lời từ người khác, dán nội dung vào ô phân tích.
2. Kéo thanh điều chỉnh độ thân mật (từ 1 đến 5).
3. Nhấn **"Phân tích & Gợi ý câu trả lời"**.
4. AI sẽ bóc tách:
   - Sắc thái cảm xúc của đối phương (Vui vẻ, hờn dỗi, trang trọng...).
   - Ý định thật sự đằng sau câu nói.
   - Lời khuyên tâm lý giao tiếp.
   - 3 phương án trả lời khéo léo nhất.

### 3.3. Lên lịch nhắc gửi tin nhắn (`/schedules`)
1. Nhấn nút **"Tạo lịch nhắc mới"**.
2. Chọn người nhận từ danh bạ và nhập nội dung (hoặc chọn chèn nhanh từ Thư viện mẫu tin).
3. Chọn ngày giờ gửi và chu kỳ lặp lại (Một lần, Hằng ngày, Hằng tuần).
4. Nhấn **"Lưu lịch nhắc"**.
5. Khi đến thời điểm hẹn:
   - Chuông thông báo sẽ vang lên và bảng thông báo Popup bật sáng.
   - Trên Desktop Windows, thông báo Toast góc màn hình sẽ xuất hiện.
   - Bấm **"Mở Messenger gửi"** và nhấn **"Xác nhận đã gửi"** để lưu vết lịch sử.

### 3.4. Kịch bản tự động hóa (`/automation`)
1. Thêm kịch bản: Nhập từ khóa kích hoạt (Ví dụ: `xin chào, hello, alo`).
2. Nhập câu phản hồi tương ứng.
3. Cài đặt khung giờ áp dụng (Ví dụ: 08:00 đến 22:00).
4. Sử dụng khung **"Thử nghiệm kịch bản"** ở bên phải để test thử phản xạ của hệ thống với bất kỳ câu nói nào.

### 3.5. Cài đặt API Key & Sao lưu dữ liệu (`/settings`)
1. Cấu hình AI: Mặc định hệ thống đã có sẵn động cơ AI tự nhiên chạy độc lập. Nếu muốn dùng Gemini hoặc OpenAI riêng, hãy dán API Key vào ô cấu hình và lưu lại.
2. Sao lưu dữ liệu: Nhấn **"Tải bản sao lưu JSON"** để xuất toàn bộ danh bạ, kịch bản, lịch hẹn về máy tính cá nhân.

---

## 4. Hướng dẫn đóng gói ứng dụng Desktop thành file .EXE

1. Nhấp đúp chuột vào file: `build-exe.bat`
2. Hệ thống sẽ:
   - Tự động đóng gói bản build production của Frontend.
   - Biên dịch mã nguồn Electron Main Process sang `dist-electron/`.
   - Chạy `electron-builder` để đóng gói thành tệp ứng dụng Windows độc lập.
3. Tệp cài đặt / ứng dụng hoàn thiện sẽ nằm tại thư mục: `desktop\release\`
