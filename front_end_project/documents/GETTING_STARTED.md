# ⚡ QUICK START - Bắt đầu nhanh trong 3 phút

## 🎯 Mục đích
Hướng dẫn nhanh nhất để chạy được project ngay lập tức.

## 📋 Checklist trước khi bắt đầu
- [ ] Đã cài Node.js (v16+)
- [ ] Đã cài Yarn
- [ ] Đã mở Terminal/Command Prompt

## 🚀 3 BƯỚC ĐƠN GIẢN

### BƯỚC 1: Cài đặt
```bash
yarn
```
⏱️ Thời gian: ~2-3 phút

### BƯỚC 2: Chạy
```bash
yarn dev
```
⏱️ Khởi động ngay lập tức

### BƯỚC 3: Mở trình duyệt
Truy cập: **http://localhost:5173**

## 🔐 Đăng nhập ngay

### Admin (Xem tất cả)
```
Username: admin
Password: admin123
```

### Nhân viên (Staff)
```
Username: staff
Password: staff123
```

### Khách hàng
- Truy cập: **/khach-hang/dang-nhap**
- Đăng nhập bằng **số điện thoại** (không cần mật khẩu)

## ✅ Test ngay 5 tính năng chính

1. **Dashboard** → Xem biểu đồ doanh thu
2. **Sản phẩm** → Thử thêm 1 sản phẩm mới
3. **Tồn kho** → Xem sản phẩm sắp hết hàng
4. **Báo cáo** → Nhấn "Xuất PDF"
5. **Dark mode** → Click icon 🌙 ở góc trên

## 🎨 Thử ngay các tính năng UI

- ☀️ Bật/tắt **Dark mode**
- 📱 Resize cửa sổ để xem **Responsive**
- 🔍 Dùng ô **tìm kiếm** sản phẩm
- ⚙️ Click **icon Menu** để đóng/mở Sidebar

## ❓ Gặp lỗi?

### Lỗi: "Cannot find module"
```bash
rm -rf node_modules yarn.lock
yarn
```

### Lỗi: "Port 5173 already in use"
```bash
# Dừng process đang chạy hoặc đổi port:
yarn dev --port 3000
```

### Lỗi khác
Xem file `documents/USER_GUIDE.md` phần "Xử lý sự cố"

## 📚 Muốn tìm hiểu thêm?

- **Hướng dẫn chi tiết:** Đọc `documents/USER_GUIDE.md`
- **Tính năng đầy đủ:** Đọc `documents/FEATURES.md`
- **Cấu trúc project:** Đọc `documents/PROJECT_STRUCTURE.md`
- **Kỹ thuật & API:** Đọc `README.md` hoặc `documents/API_SERVICE_GUIDE.md`

## 🎉 HOÀN THÀNH!

Giờ bạn đã có thể:
- ✅ Quản lý sản phẩm
- ✅ Theo dõi tồn kho
- ✅ Xem dashboard
- ✅ Xuất báo cáo PDF
- ✅ Chuyển Dark/Light mode

**Enjoy coding! 🚀**

