# 🔄 Setup Đồng Bộ Dữ Liệu Giữa Thiết Bị

## Vấn đề hiện tại
- **IndexedDB chỉ lưu cục bộ** trên từng trình duyệt/thiết bị
- Passwords lưu trên máy A không thấy trên máy B
- Cần **đồng bộ qua cloud database** (Neon PostgreSQL)

## ✅ Giải pháp đã implement

### 1. Hybrid Storage Architecture
- **Local**: IndexedDB (fast access, offline support)
- **Cloud**: Neon PostgreSQL (sync across devices)
- **Auto-sync**: Khi có internet connection

### 2. Netlify Functions API
- **Endpoint**: `/api/passwords`
- **Methods**: GET, POST, PUT, DELETE
- **Database**: Neon PostgreSQL connection

### 3. Configuration Updates
- ✅ Enable API sync trong production
- ✅ Netlify Functions setup
- ✅ API redirects configured

## 🚀 Deployment Steps

### Bước 1: Commit và Push Changes
```bash
git add .
git commit -m "Add sync functionality with Netlify Functions and Neon DB"
git push origin main
```

### Bước 2: Setup Environment Variables trên Netlify
1. Vào **Netlify Dashboard** → Site Settings → Environment Variables
2. Thêm các biến sau:

```env
DATABASE_URL=postgresql://neondb_owner:npg_DSM3EZX8jfIa@ep-dawn-smoke-a13kcspj-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

VITE_APP_DOMAIN=yapee.online
VITE_APP_URL=https://your-netlify-site.netlify.app
```

### Bước 3: Redeploy Site
- Netlify sẽ tự động redeploy khi push code mới
- Hoặc manual trigger deploy trong dashboard

## 🔧 Cách hoạt động

### Khi thêm password:
1. **Lưu local** vào IndexedDB (instant)
2. **Sync to cloud** via API call
3. **Toast notification** confirm success

### Khi mở app trên thiết bị mới:
1. **Load from cloud** via API
2. **Cache local** vào IndexedDB
3. **Merge data** nếu có conflicts

### Offline Support:
1. **Hoạt động bình thường** với IndexedDB
2. **Auto-sync** khi có internet trở lại

## 📱 Test Sync

### Sau khi deploy:
1. **Máy A**: Thêm password mới
2. **Máy B**: Refresh page → Should see password từ máy A
3. **Mobile**: Cũng sẽ thấy data đồng bộ

## 🛠️ Troubleshooting

### Nếu sync không hoạt động:
1. **Check Netlify Functions logs**
2. **Verify DATABASE_URL** trong environment variables
3. **Test API endpoint** manually: `https://your-site.netlify.app/api/passwords`

### Debug API:
```bash
# Test GET
curl https://your-site.netlify.app/api/passwords

# Test POST
curl -X POST https://your-site.netlify.app/api/passwords \
  -H "Content-Type: application/json" \
  -d '{"service":"test","username":"test","password":"test123"}'
```

## 🎯 Expected Results

### ✅ Sau khi setup thành công:
- Passwords sync giữa tất cả thiết bị
- Offline support vẫn hoạt động
- Fast local access với IndexedDB
- Automatic cloud backup

### 📊 Performance:
- **Local access**: < 10ms (IndexedDB)
- **Cloud sync**: < 500ms (Netlify Functions)
- **Offline mode**: Full functionality

---

**🔄 Sync sẽ hoạt động sau khi deploy với environment variables!**