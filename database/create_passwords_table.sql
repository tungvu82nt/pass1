-- Memory Safe Guard - Passwords Table Schema
-- Tạo bảng lưu trữ thông tin mật khẩu

-- Tạo bảng passwords
CREATE TABLE IF NOT EXISTS passwords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo index để tối ưu tìm kiếm
CREATE INDEX IF NOT EXISTS idx_passwords_service ON passwords(service);
CREATE INDEX IF NOT EXISTS idx_passwords_username ON passwords(username);
CREATE INDEX IF NOT EXISTS idx_passwords_updated_at ON passwords(updated_at DESC);

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

-- Thêm RLS (Row Level Security) nếu cần
-- ALTER TABLE passwords ENABLE ROW LEVEL SECURITY;

-- Comment cho bảng và các cột
COMMENT ON TABLE passwords IS 'Bảng lưu trữ thông tin mật khẩu của người dùng';
COMMENT ON COLUMN passwords.id IS 'ID duy nhất của mật khẩu';
COMMENT ON COLUMN passwords.service IS 'Tên dịch vụ hoặc website';
COMMENT ON COLUMN passwords.username IS 'Tên đăng nhập hoặc email';
COMMENT ON COLUMN passwords.password IS 'Mật khẩu được mã hóa';
COMMENT ON COLUMN passwords.created_at IS 'Thời gian tạo';
COMMENT ON COLUMN passwords.updated_at IS 'Thời gian cập nhật cuối cùng';