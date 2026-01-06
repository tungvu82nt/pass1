# Phân Tích Chi Tiết Backend & Hệ Thống Dữ Liệu

## 1. Kiến Trúc Tổng Quan (Architecture Overview)

Hiện tại, dự án **Memory Safe Guard** sử dụng kiến trúc **Serverless / BaaS (Backend-as-a-Service)** với **Supabase** đóng vai trò là backend chính.

*   **Database**: PostgreSQL (cung cấp bởi Supabase hoặc NeonDB).
*   **API Layer**: Supabase RESTful API (tự động sinh từ Database Schema).
*   **Client SDK**: `@supabase/supabase-js` được sử dụng trực tiếp ở Frontend để giao tiếp với Database.
*   **Authentication**: Supabase Auth (đang được cấu hình cơ bản, có hỗ trợ RLS nhưng hiện tại đang có dấu hiệu tắt hoặc mở rộng quyền truy cập để debug).

Không có một server Node.js/Express riêng biệt (backend truyền thống). Toàn bộ logic tương tác dữ liệu nằm ở lớp **Service Layer** trong Frontend code.

---

## 2. Thiết Kế Cơ Sở Dữ Liệu (Database Design)

Dữ liệu được lưu trữ trong Database PostgreSQL với cấu trúc chính xoay quanh bảng `passwords`.

### 2.1. Schema: Bảng `passwords`
Dựa trên script `database/create_passwords_table.sql`:

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Định danh duy nhất cho mỗi bản ghi. |
| `service` | `VARCHAR(255)` | `NOT NULL` | Tên dịch vụ (ví dụ: Facebook, Gmail). |
| `username` | `VARCHAR(255)` | `NOT NULL` | Tên đăng nhập. |
| `password` | `TEXT` | `NOT NULL` | Mật khẩu (lưu plain text hoặc mã hóa tùy vào logic frontend, DB coi là text). |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm tạo. |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm cập nhật cuối cùng. |

### 2.2. Indexes & Performance
Hệ thống đã thiết lập các chỉ mục (Indexes) để tối ưu hóa hiệu suất truy vấn:
1.  **`idx_passwords_service`**: Tối ưu tìm kiếm theo tên dịch vụ.
2.  **`idx_passwords_username`**: Tối ưu tìm kiếm theo tên người dùng.
3.  **`idx_passwords_updated_at`**: Tối ưu việc sắp xếp danh sách theo thời gian cập nhật mới nhất.

### 2.3. Automation (Triggers)
*   Function: `update_updated_at_column()`
*   Trigger: `update_passwords_updated_at`
*   **Mục đích**: Tự động cập nhật cột `updated_at` thành thời gian hiện tại (`NOW()`) mỗi khi có lệnh `UPDATE` vào một dòng dữ liệu. Điều này đảm bảo tính toàn vẹn dữ liệu thời gian mà không cần logic ở phía client.

---

## 3. Bảo Mật & Phân Quyền (Security & RLS)

Đây là phần quan trọng và cũng là điểm yếu hiện tại nếu không cấu hình đúng.

### 3.1. Row Level Security (RLS)
Supabase sử dụng RLS của PostgreSQL để kiểm soát quyền truy cập.
*   **Trạng thái lý tưởng (`database/setup_rls_policies.sql`)**:
    *   Bật RLS: `ALTER TABLE passwords ENABLE ROW LEVEL SECURITY;`
    *   Chính sách: Tạo policy cho phép `anon` và `authenticated` roles thực hiện các thao tác.
*   **Trạng thái thực tế/Debug (`database/disable_rls.sql`)**:
    *   Có script để **TẮT RLS** (`DISABLE ROW LEVEL SECURITY`).
    *   Trong `create_passwords_table_simple.sql` cũng có lệnh tắt RLS.
    *   **Rủi ro**: Nếu RLS bị tắt, bất kỳ ai có `ANON_KEY` và `URL` đều có thể đọc/ghi/xóa toàn bộ dữ liệu bảng `passwords`. Cần đảm bảo RLS được bật và cấu hình policy chặt chẽ khi deploy Production.

### 3.2. Authentication Settings (`supabase/config.toml`)
*   `enable_signup`: `true` (Cho phép đăng ký mới).
*   `enable_anonymous_sign_ins`: `false` (Có thể cần bật nếu muốn user dùng thử mà không cần login, nhưng hiện tại đang tắt).
*   `jwt_expiry`: 3600s (1 giờ).
*   Config cũng cho thấy các thiết lập SMTP (Email) và SMS đang ở chế độ mặc định hoặc tắt.

---

## 4. Business Logic Layer (Client-Side "Backend")

Logic xử lý nghiệp vụ nằm chủ yếu trong `src/lib/supabase-service-fixed.ts`. Đây là lớp trung gian (Wrapper) giúp tách biệt code UI khỏi code Database.

### 4.1. `SupabasePasswordService` Class
*   **Abstraction**: Cung cấp các phương thức static (`getAllPasswords`, `addPassword`, `searchPasswords`, v.v.) giúp code clean hơn.
*   **Error Handling**:
    *   Có phương thức `handleError` tập trung.
    *   Sử dụng `logger` utility để ghi log có cấu trúc.
    *   Map lỗi từ Supabase SDK sang các thông báo lỗi thân thiện (`ERROR_MESSAGES`).
*   **Validation**:
    *   Phương thức `validatePasswordData` kiểm tra độ dài và dữ liệu đầu vào trước khi gửi request tới Supabase.
    *   Khử trùng (Sanitize) dữ liệu search query để tránh lỗi hoặc injection cơ bản.
*   **Optimistic Updates**:
    *   Trong Hooks (`usePasswordsSupabase`), UI được cập nhật ngay lập tức trước khi server phản hồi để tăng trải nghiệm người dùng (UX).

---

## 5. Kết Nối & Môi Trường (Integration)

### 5.1. Supabase Connection
*   Sử dụng biến môi trường: `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`.
*   Client được khởi tạo với cấu hình:
    ```typescript
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
    ```

### 5.2. NeonDB Integration (Mới)
*   User vừa thêm kết nối NeonDB vào `.env.local` (`DATABASE_URL`).
*   Script kiểm thử (`scripts/test-neon-db.js`) cho thấy kết nối hoạt động tốt.
*   **Hiện trạng**:
    *   NeonDB đang là một database "trống", chưa có bảng `passwords`.
    *   Ứng dụng chính vẫn đang chạy trên Supabase Database cũ (do config `supabase.ts` trỏ tới URL Supabase).
    *   **Tiềm năng**: Có thể chuyển đổi hoàn toàn sang NeonDB làm database chính, sử dụng thư viện `pg` (cho backend Node.js) hoặc qua HTTP Proxy của Neon cho Serverless.

---

## 6. Đánh Giá & Khuyến Nghị

### ✅ Điểm Mạnh
*   **Code Clean**: Cấu trúc Service Layer rõ ràng, tách biệt tốt.
*   **Type Safety**: Sử dụng TypeScript interface đầy đủ cho Database Row và App Models.
*   **Logging**: Hệ thống log chi tiết giúp debug dễ dàng.

### ⚠️ Điểm Cần Lưu Ý (Critical)
1.  **RLS Policy**: Cần kiểm tra kỹ xem trên Production RLS đang BẬT hay TẮT. Tuyệt đối không để tắt RLS khi đã go-live.
2.  **Database Migration**:
    *   Hiện tại DB Schema được quản lý bằng các file SQL rời rạc. Nên cân nhắc sử dụng tool migration chuyên nghiệp (như Prisma, Drizzle Kit hoặc Supabase CLI Migration) để đồng bộ hóa Schema giữa môi trường Dev/Test/Prod (và giữa NeonDB vs Supabase).
3.  **Security**:
    *   Mật khẩu hiện đang được lưu dưới dạng Plain Text hoặc mã hóa phía Client (cần xác minh logic mã hóa trong UI). Nếu lưu Plain Text vào DB là rủi ro lớn.

### 📝 Next Steps
1.  Chạy script tạo bảng trên NeonDB để đồng bộ schema.
2.  Quyết định xem sẽ dùng Supabase SDK tiếp tục (trỏ về NeonDB nếu Neon hỗ trợ) hay chuyển sang dùng Backend API riêng.
