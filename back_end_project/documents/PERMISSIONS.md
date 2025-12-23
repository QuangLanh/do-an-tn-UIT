# 🔐 Hệ Thống Phân Quyền Chi Tiết

## 📋 Tổng Quan

Hệ thống Quản Lý Tạp Hóa sử dụng **Role-Based Access Control (RBAC)** với **3 vai trò** người dùng:
- **ADMIN**: cao nhất
- **STAFF**: nhân viên
- **KHACH_HANG**: khách hàng (read-only + danh sách mua)

---

## 🧑‍💼 Các Vai Trò

### 1️⃣ Admin (Quản Trị Viên)
**Quyền cao nhất - Toàn quyền hệ thống**

#### Quyền Hạn:
- ✅ **Quản lý người dùng**: Tạo, xem, sửa, xóa người dùng
- ✅ **Phân quyền**: Gán và thay đổi vai trò người dùng
- ✅ **Sản phẩm**: CRUD đầy đủ
- ✅ **Đơn hàng**: CRUD đầy đủ, xem tất cả đơn hàng
- ✅ **Nhập hàng**: CRUD đầy đủ
- ✅ **Báo cáo**: Xem và xuất tất cả báo cáo
- ✅ **Dashboard**: Truy cập đầy đủ
- ✅ **Giao dịch**: Xem và quản lý tất cả giao dịch

#### Hạn Chế:
- Không có hạn chế

---

### 2️⃣ Staff (Nhân Viên Bán Hàng)
**Quyền vận hành/bán hàng**

#### Quyền Hạn:
- ✅ **Sản phẩm**: tạo/sửa (không xoá)
- ✅ **Đơn hàng**: tạo, xem danh sách, xem chi tiết/in hoá đơn
- ✅ **Nhập hàng**: tạo/cập nhật cơ bản
- ✅ **Báo cáo/Dashboard/Giao dịch**: xem (tuỳ cấu hình)

#### Hạn Chế:
- ❌ **Không xoá sản phẩm**
- ❌ **Không quản lý người dùng**
- ❌ **Không thao tác dữ liệu khách hàng**

---

### 3️⃣ Khách hàng (KHACH_HANG)
**Quyền dành cho khách hàng (không thanh toán online)**

#### Quyền Hạn:
- ✅ **Xem sản phẩm**: `GET /products`, `GET /products/:id`
- ✅ **Danh sách mua hàng**: tạo/cập nhật/xoá/hoàn thành danh sách mua (không phải Order)
- ✅ **Lịch sử mua hàng**: `GET /orders/history` (đơn do nhân viên tạo)

#### Hạn Chế:
- ❌ Không tạo đơn hàng
- ❌ Không thanh toán
- ❌ Không quản lý kho/sản phẩm
- ✅ Chỉ thao tác dữ liệu của chính mình

---

## 📊 Bảng phân quyền (tóm tắt)

| Nhóm API | Endpoint | Admin | Staff | Khách hàng |
|---|---|---:|---:|---:|
| Auth | `POST /auth/login` | ✅ | ✅ | ❌ |
| Auth | `POST /auth/customer/login` | ✅ | ✅ | ✅ |
| Auth | `GET /auth/profile` | ✅ | ✅ | ❌ |
| Auth | `GET /auth/customer/me` | ❌ | ❌ | ✅ |
| Products | `GET /products`, `GET /products/:id` | ✅ | ✅ | ✅ |
| Products | `POST/PATCH/DELETE /products...` | ✅ | ✅(không xoá) | ❌ |
| Orders | `POST /orders` | ✅ | ✅ | ❌ |
| Orders | `GET /orders/history` | ❌ | ❌ | ✅ |
| Shopping Lists | `/shopping-lists...` | ❌ | ❌ | ✅ |

---

## 🔒 Implementation Details

### Backend (NestJS)

#### Guards và Decorators:
```typescript
// Sử dụng @Roles decorator để bảo vệ routes
@Roles(UserRole.ADMIN, UserRole.STAFF)
@UseGuards(JwtAuthGuard, RolesGuard)
@Get('products')
findAll() { ... }
```

#### Default Role:
- Khi đăng ký qua API (bởi Admin), role mặc định: `STAFF`

### Frontend (React)

#### Permission Checking:
```typescript
// Sử dụng authStore để kiểm tra quyền
const { hasPermission } = useAuthStore()

if (hasPermission('create_order')) {
  // Hiển thị nút tạo đơn hàng
}
```

#### Available Permissions:
- `create_product` - Tạo sản phẩm
- `edit_product` - Sửa sản phẩm
- `delete_product` - Xóa sản phẩm
- `create_order` - Tạo đơn hàng
- `create_purchase` - Tạo phiếu nhập
- `view_orders` - Xem đơn hàng
- `view_purchases` - Xem nhập hàng
- `view_reports` - Xem báo cáo
- `export_reports` - Xuất báo cáo
- `manage_users` - Quản lý người dùng

---

## 🧪 Test Credentials

Sau khi chạy `yarn seed` hoặc `npm run seed`:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | `admin@taphoa.com` | `admin123` | Full access |
| Staff | `staff@taphoa.com` | `staff123` | Sales only |
| Khách hàng | Đăng nhập bằng `soDienThoai` | (không mật khẩu) | Customer flow |

---

## 📝 Notes

1. **Staff**: tạo đơn hàng tại cửa hàng + xem danh sách/chi tiết/invoice.
2. **Khách hàng**: chỉ thao tác dữ liệu của chính mình (shopping list + order history).
3. **Register chỉ Admin**: Chỉ Admin mới có quyền tạo tài khoản mới (nhân viên).

---

**Last Updated**: 2024-10-30
**Version**: 1.0.0

