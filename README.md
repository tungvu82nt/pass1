---
title: Memory Safe Guard
emoji: 🔐
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
app_port: 7860
---

# Memory Safe Guard 🔐

Ứng dụng quản lý mật khẩu hiện đại được xây dựng với React, TypeScript và Database NeonDB. Lưu trữ và quản lý mật khẩu một cách an toàn.

🌐 **Live Demo**: [https://yapee.online](https://yapee.online)

## ✨ Tính năng chính

- 🏠 **Lưu trữ đám mây**: Sử dụng NeonDB (PostgreSQL) để lưu trữ dữ liệu an toàn
- 🔒 **Quản lý mật khẩu**: Thêm, chỉnh sửa, xóa và tìm kiếm mật khẩu
- 🎨 **Giao diện hiện đại**: Thiết kế đẹp mắt với shadcn/ui và Tailwind CSS
- 🛡️ **Bảo mật**: Kết nối Backend Node.js riêng biệt
- 🎲 **Tạo mật khẩu**: Tính năng tạo mật khẩu ngẫu nhiên mạnh
- 📋 **Sao chép nhanh**: Sao chép thông tin đăng nhập vào clipboard

## 🚀 Công nghệ sử dụng

- **React 18.3.1** - Frontend framework
- **TypeScript 5.5.3** - Static typing
- **Vite 5.4.1** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Node.js & Express** - Backend API
- **NeonDB** - PostgreSQL Database

## ⚙️ Cài đặt & Chạy

1. **Cài đặt dependencies**: `npm install`
2. **Cấu hình môi trường**:
   - Copy `.env.example` sang `.env.local`
   - Cập nhật `DATABASE_URL` (NeonDB connection string)
3. **Chạy Migration**: `npm run migrate`
4. **Chạy ứng dụng (Full Stack)**: `npm run dev:full`

## 📱 Sử dụng

1. Mở ứng dụng trong trình duyệt (thường là `http://localhost:5173`)
2. Thêm mật khẩu mới bằng nút "Thêm mật khẩu"
3. Tìm kiếm mật khẩu theo tên dịch vụ hoặc username
4. Sao chép thông tin đăng nhập bằng một click
5. Chỉnh sửa hoặc xóa mật khẩu khi cần

---

**Memory Safe Guard** - Bảo vệ mật khẩu của bạn một cách an toàn và hiện đại! 🚀