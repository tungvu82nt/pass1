# Hướng dẫn Setup Supabase cho Memory Safe Guard

## Bước 1: Truy cập Supabase Dashboard

1. Truy cập: https://supabase.com/dashboard
2. Đăng nhập vào tài khoản của bạn
3. Chọn project: `spb-i1kdlonbpn687q42`

## Bước 2: Tạo Database Schema

1. Trong Dashboard, chọn **SQL Editor** từ menu bên trái
2. Tạo một query mới
3. Copy và paste nội dung từ file `src/lib/supabase/schema.sql`:

```sql
-- Memory Safe Guard Database Schema
-- Tạo bảng passwords để lưu trữ thông tin mật khẩu

-- Tạo extension UUID nếu chưa có
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tạo bảng passwords
CREATE TABLE IF NOT EXISTS passwords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID DEFAULT NULL -- Để mở rộng cho multi-user trong tương lai
);

-- Tạo indexes để tối ưu tìm kiếm
CREATE INDEX IF NOT EXISTS idx_passwords_service ON passwords(service);
CREATE INDEX IF NOT EXISTS idx_passwords_username ON passwords(username);
CREATE INDEX IF NOT EXISTS idx_passwords_updated_at ON passwords(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_passwords_user_id ON passwords(user_id);

-- Tạo function để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tạo trigger để tự động cập nhật updated_at khi có thay đổi
DROP TRIGGER IF EXISTS update_passwords_updated_at ON passwords;
CREATE TRIGGER update_passwords_updated_at
    BEFORE UPDATE ON passwords
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Thêm một số dữ liệu mẫu để test (optional)
INSERT INTO passwords (service, username, password) VALUES
    ('Gmail', 'user@gmail.com', 'sample_password_123'),
    ('Facebook', 'user@facebook.com', 'fb_password_456'),
    ('GitHub', 'developer', 'github_token_789')
ON CONFLICT (id) DO NOTHING;
```

4. Nhấn **Run** để thực thi script

## Bước 3: Cấu hình Row Level Security (RLS)

Để bảo mật, bạn có thể bật RLS cho bảng passwords:

```sql
-- Bật RLS cho bảng passwords
ALTER TABLE passwords ENABLE ROW LEVEL SECURITY;

-- Tạo policy cho phép tất cả operations (cho demo)
-- Trong production, bạn nên tạo policy phù hợp với yêu cầu bảo mật
CREATE POLICY "Allow all operations on passwords" ON passwords
    FOR ALL USING (true);
```

## Bước 4: Lấy API Keys

1. Trong Dashboard, chọn **Settings** > **API**
2. Copy các thông tin sau:
   - **Project URL**: `https://spb-i1kdlonbpn687q42.supabase.opentrust.net`
   - **anon public key**: (key dài bắt đầu bằng `eyJ...`)

## Bước 5: Cập nhật Environment Variables

Cập nhật file `.env.local` với thông tin thực tế:

```env
VITE_SUPABASE_URL=https://spb-i1kdlonbpn687q42.supabase.opentrust.net
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

## Bước 6: Test Kết nối

1. Khởi chạy ứng dụng: `npm run dev`
2. Truy cập: http://localhost:8080
3. Nhấn nút **"Test Supabase"** để mở panel test
4. Nhấn **"Test kết nối"** để kiểm tra

## Cấu trúc Database

### Bảng `passwords`

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UUID | Primary key, tự động tạo |
| `service` | VARCHAR(255) | Tên dịch vụ (Gmail, Facebook, v.v.) |
| `username` | VARCHAR(255) | Tên đăng nhập hoặc email |
| `password` | TEXT | Mật khẩu |
| `created_at` | TIMESTAMPTZ | Thời gian tạo |
| `updated_at` | TIMESTAMPTZ | Thời gian cập nhật cuối |
| `user_id` | UUID | ID người dùng (để mở rộng tương lai) |

### Indexes

- `idx_passwords_service`: Tối ưu tìm kiếm theo service
- `idx_passwords_username`: Tối ưu tìm kiếm theo username  
- `idx_passwords_updated_at`: Tối ưu sắp xếp theo thời gian
- `idx_passwords_user_id`: Tối ưu filter theo user

## Troubleshooting

### Lỗi "relation does not exist"
- Đảm bảo đã chạy script tạo bảng trong SQL Editor
- Kiểm tra tên bảng có đúng là `passwords` không

### Lỗi "permission denied"
- Kiểm tra RLS policies
- Đảm bảo anon key có quyền truy cập

### Lỗi kết nối
- Kiểm tra URL và anon key trong `.env.local`
- Đảm bảo project Supabase đang hoạt động

## Các chức năng test

Trong component **SupabaseConnectionTest**:

- **Test kết nối**: Kiểm tra kết nối cơ bản
- **Lấy thống kê**: Đếm số lượng mật khẩu
- **Thêm dữ liệu mẫu**: Thêm 3 mật khẩu mẫu
- **Xóa tất cả**: Xóa toàn bộ dữ liệu (cẩn thận!)

## Bảo mật

⚠️ **Lưu ý quan trọng**:
- Anon key được expose ở frontend, chỉ dùng cho read/write operations
- Không bao giờ expose service role key
- Trong production, cần setup RLS policies phù hợp
- Cân nhắc mã hóa mật khẩu trước khi lưu vào database