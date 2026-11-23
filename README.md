# MESSENGER AUTO ASSISTANT 🚀
### Phần mềm Hỗ trợ Quản lý và Tự động hóa Tin nhắn Facebook Cá nhân

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.18-green.svg)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-darkblue.svg)](https://www.prisma.io/)
[![Electron](https://img.shields.io/badge/Electron-33.2-teal.svg)](https://www.electronjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)

---

## 🌟 Giới thiệu sản phẩm

**Messenger Auto Assistant** là một giải pháp phần mềm chuyên nghiệp, hoàn chỉnh dành cho người dùng cá nhân, chủ shop kinh doanh, người làm việc tự do (freelancer) và người bận rộn cần quản lý, soạn thảo và hẹn giờ gửi tin nhắn Facebook Messenger một cách thông minh và có kế hoạch.

Sản phẩm sở hữu cả **hai phiên bản đồng bộ dữ liệu thời gian thực**:
1. **Phiên bản Web App**: Truy cập mượt mà trên Google Chrome, giao diện Responsive hiện đại theo ngôn ngữ thiết kế của Apple, Linear và Notion.
2. **Phiên bản Desktop App**: Dành riêng cho Windows 10/11, hỗ trợ thu nhỏ xuống System Tray, chạy ngầm theo dõi lịch và phát chuông cùng thông báo Toast khi đến giờ gửi.

Cả hai phiên bản chia sẻ chung một **Backend API** và **Cơ sở dữ liệu Prisma SQLite** độc lập, an toàn tuyệt đối.

---

## 🛡️ Tuyên bố An toàn & Tuân thủ Chính sách Meta (Facebook)

> [!IMPORTANT]
> Meta Messenger Platform không cung cấp Public API cho phép đọc lén hoặc tự động gửi tin nhắn từ tài khoản Facebook cá nhân.
> Do đó, **Messenger Auto Assistant** được kiến trúc theo nguyên tắc:
> - **KHÔNG** thu thập hoặc lưu trữ mật khẩu Facebook.
> - **KHÔNG** lấy cookie đăng nhập Facebook của người dùng.
> - **KHÔNG** can thiệp trái phép hoặc vượt cơ chế bảo mật của Facebook.
> - **Hỗ trợ người dùng thông minh**: Soạn tin nhắn AI đa phong cách, gợi ý câu trả lời theo từ khóa, hẹn giờ nhắc nhở chuông báo và kích hoạt liên kết điều hướng chính thức `https://m.me/{username}` để người dùng chủ động kiểm tra và xác nhận gửi thủ công.
> - **Minh bạch trạng thái**: Phân biệt rành mạch giữa *Bản nháp*, *Đang chờ xác nhận*, *Đã xác nhận gửi* và *Đã hủy*.

---

## ⚡ Các chức năng chính

1. **Dashboard Trực quan**: Thống kê số lượng tin soạn thảo, tin đã gửi, lịch nhắc chờ, biểu đồ xu hướng 7 ngày và nhật ký kiểm toán gần nhất.
2. **Quản lý hội thoại Messenger cá nhân**: Quản lý danh bạ, phân loại quan hệ (Bạn bè, Gia đình, Đồng nghiệp, Crush, Khách hàng), ghi chú riêng và mở nhanh hộp thoại `m.me`.
3. **Soạn tin nhắn AI (AI Generator)**:
   - 10 phong cách: *Dễ thương, Thân thiện, Lãng mạn, Hài hước, Lịch sự, Chuyên nghiệp, Quan tâm, Xin lỗi, Chào buổi sáng, Chúc ngủ ngon*.
   - Độ dài: *Ngắn gọn, Vừa phải, Dài*.
   - Thao tác: *Tạo 3 phương án, Viết lại, Rút gọn, Viết dài hơn, Sao chép 1-click, Mở Messenger dán ngay, Lên lịch gửi*.
4. **Trợ lý phân tích hội thoại AI (Conversation Assistant)**:
   - Dán tin nhắn đối phương gửi để phân tích cảm xúc, tâm lý ngầm, nhận lời khuyên giao tiếp và 3 câu phản hồi mẫu khéo léo.
5. **Kịch bản tự động hóa (Auto Reply Assistant)**:
   - Thiết lập từ khóa kích hoạt, câu phản hồi đề xuất, điều kiện so khớp (Contains, Exact, Starts with, Regex) và khung giờ hoạt động.
   - Hộp cát Sandbox thử nghiệm kịch bản trực tiếp.
6. **Lập lịch nhắc nhở gửi tin (Scheduled Messages)**:
   - Hẹn giờ gửi tin với chu kỳ Một lần, Hằng ngày, Hằng tuần.
   - Chuông báo âm thanh và thông báo Popup / Toast khi đến giờ.
   - Tùy chọn hoãn 15 phút, 1 giờ hoặc xác nhận đã gửi.
7. **Thư viện mẫu tin nhắn (Template Library)**:
   - 8 danh mục phổ biến, hỗ trợ biến động `{name}`, `{time_greeting}`.
   - Nhân bản, chỉnh sửa và gắn thẻ tag.
8. **Lịch sử hoạt động (Activity Audit Logs)**:
   - Lưu trữ và phân loại minh bạch mọi thao tác, lọc theo sự kiện và trạng thái.
9. **Cài đặt & Tùy biến**:
   - Tùy chọn nhà cung cấp AI: Tích hợp sẵn AI nội bộ không cần key, hoặc kết nối Google Gemini / OpenAI / OpenRouter / Custom Local LLM.
   - Sao lưu dữ liệu toàn diện định dạng JSON 1-click.
   - Sẵn sàng tích hợp Webhook Meta chính thức.

---

## 🚀 Hướng dẫn khởi chạy dự án

### Cách 1: Khởi động tự động bằng 1-Click (Khuyên dùng)
Chỉ cần nhấp đúp chuột vào file:
👉 **`start-all.bat`**

Hệ thống sẽ tự động khởi động Backend (`http://localhost:5000`), Frontend (`http://localhost:5173`) và mở trình duyệt Google Chrome.

**Tài khoản đăng nhập dùng thử**:
- Email: `admin@messenger.vn`
- Mật khẩu: `Password123@`

---

### Cách 2: Khởi động thủ công bằng dòng lệnh

**Bước 1: Khởi động Backend**
```bash
cd backend
npm run dev
```

**Bước 2: Khởi động Web App**
```bash
cd frontend
npm run dev
```
Truy cập: `http://localhost:5173`

**Bước 3: Khởi động Desktop Windows App (Tùy chọn)**
```bash
cd desktop
npm run dev
```

---

## 📦 Hướng dẫn đóng gói file .EXE cho Windows

Nhấp đúp chuột vào file:
👉 **`build-exe.bat`**

Quá trình đóng gói sẽ tạo ra file cài đặt / portable Windows tại thư mục:
`desktop\release\`

---

## 📁 Cấu trúc thư mục mã nguồn

```
messenger-auto-assistant/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (10 bảng thực thể)
│   │   └── dev.db                 # SQLite database file
│   └── src/
│       ├── config/                # Prisma client & database config
│       ├── controllers/           # 10 Controllers cho từng phân hệ
│       ├── middleware/            # JWT Auth, Error Handler
│       ├── prisma/seed.ts         # Script tạo dữ liệu mẫu phong phú
│       ├── routes/                # REST API Routes
│       ├── services/              # AI Service, Scheduler (Cron), Automation
│       └── index.ts               # Express & Socket.io server
├── frontend/
│   ├── src/
│   │   ├── components/            # Sidebar, Navbar, ReminderModal
│   │   ├── hooks/                 # useAuth, useTheme
│   │   ├── layouts/               # MainLayout
│   │   ├── pages/                 # 12 Trang giao diện chức năng hoàn chỉnh
│   │   ├── services/              # Axios API client, Socket.io client
│   │   ├── styles/                # Tailwind CSS & Glassmorphism styles
│   │   ├── App.tsx                # React Router & Protected Routes
│   │   └── main.tsx               # Entry point
│   ├── package.json
│   └── vite.config.ts
├── desktop/
│   ├── assets/                    # Icon ứng dụng .ico & .png
│   ├── electron/
│   │   ├── main.ts                # Electron Main process, Tray, Notifs, IPC
│   │   └── preload.ts             # Electron Preload script
│   └── package.json
├── docs/
│   ├── ARCHITECTURE.md            # Tài liệu kiến trúc hệ thống
│   ├── API_DOCUMENTATION.md       # Đặc tả các REST API endpoints
│   ├── META_INTEGRATION_POLICY.md # Phân tích chính sách Meta & giải pháp
│   └── USER_GUIDE.md              # Cẩm nang người dùng
├── start-all.bat                  # Script khởi động 1-click
├── start-backend.bat              # Script bật riêng Backend
├── start-web.bat                  # Script bật riêng Web
├── start-desktop.bat              # Script bật riêng Desktop
└── build-exe.bat                  # Script đóng gói file .EXE
```

---

## 📄 Bản quyền & Tác quyền
Dự án được xây dựng hoàn chỉnh theo tiêu chuẩn Full-stack Enterprise, giao diện hiện đại, mã nguồn phân tách module rõ ràng, sẵn sàng cho việc sử dụng thực tế và mở rộng quy mô.
