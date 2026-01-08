# 📝 Tóm tắt cập nhật (Roles + Customer)

## 🎯 Thay đổi chính

- **Chuẩn hoá roles còn 3 vai trò**:
  - **ADMIN** (cao nhất)
  - **STAFF** (nhân viên)
  - **KHACH_HANG** (khách hàng)
- **Loại bỏ**: Manager / Accountant (cả Backend + Frontend)
- **Bổ sung luồng Khách hàng**:
  - Đăng nhập bằng **số điện thoại** (không mật khẩu)
  - Xem sản phẩm (read-only)
  - Tạo danh sách mua hàng (Shopping List)
  - Xem lịch sử mua hàng (Order do nhân viên tạo tại cửa hàng)

---

## 📦 Backend (NestJS)

### Roles
- `VaiTroNguoiDung`: `ADMIN | STAFF | KHACH_HANG`
- JWT payload hỗ trợ `soDienThoai` cho khách hàng

### APIs mới cho Khách hàng
- `POST /api/auth/customer/login`
- `GET /api/auth/customer/me`
- `POST /api/shopping-lists`
- `GET /api/shopping-lists/active`
- `PUT /api/shopping-lists/:id`
- `DELETE /api/shopping-lists/:id`
- `PATCH /api/shopping-lists/:id/complete`
- `GET /api/orders/history`

### Seeder
- Seeder chỉ tạo **Admin + Staff**
- Khách hàng được tạo khi login lần đầu bằng số điện thoại

---

## 🎨 Frontend (React)

### Roles
- `UserRole`: `'admin' | 'staff' | 'khach-hang'`

### Customer UI (thuần Việt)
- `/khach-hang/dang-nhap`
- `/khach-hang/san-pham`
- `/khach-hang/san-pham/:id`
- `/khach-hang/danh-sach-mua`
- `/khach-hang/lich-su-mua`

---

## ✅ Verify

- Frontend: `yarn build` ✅
- Backend: `yarn build` ✅


