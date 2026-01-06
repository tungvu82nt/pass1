-- Thiết lập Row Level Security cho bảng passwords
-- Chạy script này trong Supabase SQL Editor

-- Bật RLS cho bảng passwords
ALTER TABLE passwords ENABLE ROW LEVEL SECURITY;

-- Tạo policy cho phép tất cả operations (cho demo)
-- Trong production, nên có authentication và user-specific policies
CREATE POLICY "Allow all operations for demo" ON passwords
FOR ALL 
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Hoặc nếu muốn tắt RLS hoàn toàn (chỉ cho demo)
-- ALTER TABLE passwords DISABLE ROW LEVEL SECURITY;

-- Kiểm tra policies hiện tại
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'passwords';

-- Kiểm tra RLS status
SELECT schemaname, tablename, rowsecurity, forcerowsecurity 
FROM pg_tables 
WHERE tablename = 'passwords';