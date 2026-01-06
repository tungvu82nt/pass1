import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Setup dirname trong môi trường ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tìm và load file .env.local từ thư mục gốc
const envPath = path.resolve(__dirname, '../.env.local');

console.log('🔄 Đang khởi tạo script test kết nối NeonDB...');

if (fs.existsSync(envPath)) {
  console.log(`📄 Đã tìm thấy file cấu hình: ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.error('❌ Không tìm thấy file .env.local! Vui lòng kiểm tra lại.');
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Lỗi: DATABASE_URL chưa được thiết lập trong .env.local');
  console.error('💡 Gợi ý: Hãy thêm dòng DATABASE_URL=postgresql://... vào file .env.local');
  process.exit(1);
}

// Mask password để log an toàn
const maskedUrl = connectionString.replace(/:([^:@]+)@/, ':****@');
console.log(`🔌 Connection String: ${maskedUrl}`);

const { Client } = pg;

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false // NeonDB thường yêu cầu SSL
  }
});

async function testConnection() {
  try {
    console.log('⏳ Đang kết nối đến NeonDB...');
    await client.connect();
    console.log('✅ KẾT NỐI THÀNH CÔNG!');

    // Thực hiện truy vấn kiểm tra thời gian và version của database
    const res = await client.query('SELECT NOW() as current_time, version()');
    
    console.log('\n📊 Thông tin Database:');
    console.log(`   🕒 Thời gian server: ${res.rows[0].current_time}`);
    console.log(`   ℹ️  Phiên bản: ${res.rows[0].version}`);

    // Kiểm tra xem bảng 'passwords' đã tồn tại chưa
    const tableCheck = await client.query(`
      SELECT exists (
        SELECT FROM information_schema.tables 
        WHERE  table_schema = 'public'
        AND    table_name   = 'passwords'
      );
    `);
    
    const hasPasswordsTable = tableCheck.rows[0].exists;
    console.log(`   📂 Bảng 'passwords': ${hasPasswordsTable ? 'ĐÃ TỒN TẠI ✅' : 'CHƯA TỒN TẠI ⚠️'}`);

  } catch (err) {
    console.error('\n❌ KẾT NỐI THẤT BẠI:', err);
  } finally {
    await client.end();
    console.log('\n🔌 Đã đóng kết nối.');
  }
}

testConnection();
