# 🔧 Netlify Environment Variables Setup

## 🎯 Mục tiêu
Setup environment variables trên Netlify để enable cross-device password sync

## 📋 Các bước thực hiện

### Bước 1: Vào Netlify Dashboard
1. Đăng nhập vào [netlify.com](https://netlify.com)
2. Chọn site **Memory Safe Guard** của bạn
3. Vào **Site settings** → **Environment variables**

### Bước 2: Thêm Environment Variables
Click **"Add a variable"** và thêm từng biến sau:

#### 🗄️ Database Connection
```
Name: DATABASE_URL
Value: postgresql://neondb_owner:npg_DSM3EZX8jfIa@ep-dawn-smoke-a13kcspj-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

#### 🌐 App Configuration  
```
Name: VITE_APP_DOMAIN
Value: yapee.online
```

```
Name: VITE_APP_URL
Value: https://YOUR-SITE-NAME.netlify.app
```
*(Thay YOUR-SITE-NAME bằng tên site thực tế của bạn)*

#### 🔗 API Configuration
```
Name: VITE_API_BASE_URL
Value: https://YOUR-SITE-NAME.netlify.app/api/passwords
```

### Bước 3: Trigger Redeploy
1. Vào **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Đợi deploy hoàn thành (~2-3 phút)

## ✅ Kiểm tra hoạt động

### Test API Endpoint:
Mở browser và truy cập:
```
https://YOUR-SITE-NAME.netlify.app/api/passwords
```
Nếu thành công sẽ thấy `[]` (empty array) hoặc danh sách passwords

### Test Cross-Device Sync:
1. **Thiết bị A**: Thêm password mới
2. **Thiết bị B**: Refresh page → Sẽ thấy password từ thiết bị A
3. **Mobile**: Cũng sẽ sync data

## 🔍 Troubleshooting

### Nếu không thấy sync:
1. **Check Functions logs**: Netlify Dashboard → Functions → View logs
2. **Verify environment variables**: Đảm bảo DATABASE_URL đúng
3. **Test API manually**: 
   ```bash
   curl https://YOUR-SITE-NAME.netlify.app/api/passwords
   ```

### Common Issues:
- **DATABASE_URL sai**: Check connection string từ Neon
- **CORS errors**: Đã handle trong code, nếu vẫn lỗi check browser console
- **Functions not deployed**: Redeploy site sau khi add env vars

## 🎊 Kết quả mong đợi

Sau khi setup thành công:
- ✅ Passwords sync giữa tất cả thiết bị
- ✅ Offline support vẫn hoạt động (IndexedDB)
- ✅ Fast local access + cloud backup
- ✅ Real-time sync khi có internet

---

**🚀 Sau khi setup xong, test ngay bằng cách thêm password trên một thiết bị và kiểm tra trên thiết bị khác!**