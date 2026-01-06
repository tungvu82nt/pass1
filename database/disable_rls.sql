-- Tắt Row Level Security cho bảng passwords
-- Chạy script này nếu gặp lỗi 401 Unauthorized

ALTER TABLE passwords DISABLE ROW LEVEL SECURITY;

-- Kiểm tra trạng thái RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'passwords';