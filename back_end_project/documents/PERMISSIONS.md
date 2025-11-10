# 🔐 Hệ Thống Phân Quyền Chi Tiết

## 📋 Tổng Quan

Hệ thống Quản Lý Tạp Hóa sử dụng **Role-Based Access Control (RBAC)** với **4 vai trò** người dùng chính.

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
**Quyền bán hàng cơ bản**

#### Quyền Hạn:
- ✅ **Tạo đơn hàng**: Tạo đơn hàng mới
- ✅ **Xem sản phẩm**: Xem danh sách và chi tiết sản phẩm
- ✅ **In hóa đơn**: Xem và in hóa đơn đơn hàng
- ✅ **Tính toán**: Tính tổng tiền, thuế, giảm giá

#### Hạn Chế:
- ❌ **Không xem đơn hàng**: Không xem danh sách đơn hàng của người khác
- ❌ **Không chỉnh sửa**: Không sửa/xóa đơn hàng
- ❌ **Không xem báo cáo tài chính**: Không xem doanh thu, chi phí, lợi nhuận
- ❌ **Không quản lý sản phẩm**: Không tạo/sửa/xóa sản phẩm
- ❌ **Không nhập hàng**: Không tạo phiếu nhập
- ❌ **Không quản lý người dùng**

---

### 3️⃣ Manager (Quản Lý Cửa Hàng)
**Quyền quản lý và giám sát**

#### Quyền Hạn:
- ✅ **Xem đơn hàng**: Xem và duyệt đơn hàng
- ✅ **Quản lý sản phẩm**: Tạo, sửa sản phẩm (không xóa)
- ✅ **Nhập hàng**: Tạo phiếu nhập kho
- ✅ **Theo dõi tồn kho**: Xem tồn kho và cảnh báo
- ✅ **Báo cáo**: Xem báo cáo doanh thu, chi phí, lợi nhuận
- ✅ **Dashboard**: Truy cập đầy đủ dashboard
- ✅ **Xem người dùng**: Xem danh sách người dùng

#### Hạn Chế:
- ❌ **Không xóa đơn hàng**: Chỉ xem và duyệt
- ❌ **Không xóa sản phẩm**: Không thể xóa sản phẩm
- ❌ **Không quản lý người dùng**: Không tạo/sửa/xóa người dùng
- ❌ **Không phân quyền**: Không thể gán vai trò
- ❌ **Không xuất PDF**: Chỉ xem báo cáo, không xuất file

---

### 4️⃣ Accountant (Kế Toán)
**Quyền chỉ đọc tài chính**

#### Quyền Hạn:
- ✅ **Xem báo cáo**: Xem doanh thu, chi phí, lợi nhuận
- ✅ **Xem giao dịch**: Xem lịch sử giao dịch
- ✅ **Xuất báo cáo**: Xuất PDF/Excel
- ✅ **Xem đơn hàng**: Xem danh sách đơn hàng
- ✅ **Xem nhập hàng**: Xem phiếu nhập kho
- ✅ **Dashboard**: Xem dashboard tổng quan

#### Hạn Chế:
- ❌ **Không CRUD**: Không tạo/sửa/xóa bất kỳ dữ liệu nào
- ❌ **Chỉ đọc**: Chỉ xem và xuất báo cáo
- ❌ **Không quản lý**: Không thể quản lý sản phẩm, đơn hàng, nhập hàng

---

## 📊 Bảng Phân Quyền Chi Tiết

| Module | Endpoint | Method | Admin | Staff | Manager | Accountant |
|--------|----------|--------|-------|-------|---------|------------|
| **Auth** |
| | `/api/auth/register` | POST | ✅ | ❌ | ❌ | ❌ |
| | `/api/auth/login` | POST | ✅ | ✅ | ✅ | ✅ |
| | `/api/auth/profile` | GET | ✅ | ✅ | ✅ | ✅ |
| **Users** |
| | `/api/users` | GET | ✅ | ❌ | ✅ | ❌ |
| | `/api/users/:id` | GET | ✅ | ❌ | ❌ | ❌ |
| | `/api/users` | POST | ✅ | ❌ | ❌ | ❌ |
| | `/api/users/:id` | PATCH | ✅ | ❌ | ❌ | ❌ |
| | `/api/users/:id` | DELETE | ✅ | ❌ | ❌ | ❌ |
| **Products** |
| | `/api/products` | GET | ✅ | ✅ | ✅ | ✅ |
| | `/api/products/:id` | GET | ✅ | ✅ | ✅ | ✅ |
| | `/api/products` | POST | ✅ | ❌ | ✅ | ❌ |
| | `/api/products/:id` | PATCH | ✅ | ❌ | ✅ | ❌ |
| | `/api/products/:id/stock` | PATCH | ✅ | ❌ | ✅ | ❌ |
| | `/api/products/:id` | DELETE | ✅ | ❌ | ❌ | ❌ |
| | `/api/products/low-stock` | GET | ✅ | ✅ | ✅ | ✅ |
| | `/api/products/categories` | GET | ✅ | ✅ | ✅ | ✅ |
| **Orders** |
| | `/api/orders` | GET | ✅ | ❌ | ✅ | ✅ |
| | `/api/orders/:id` | GET | ✅ | ✅ | ✅ | ✅ |
| | `/api/orders` | POST | ✅ | ✅ | ❌ | ❌ |
| | `/api/orders/:id/status` | PATCH | ✅ | ❌ | ❌ | ❌ |
| | `/api/orders/:id` | DELETE | ✅ | ❌ | ❌ | ❌ |
| | `/api/orders/:id/invoice` | GET | ✅ | ✅ | ✅ | ✅ |
| | `/api/orders/statistics` | GET | ✅ | ❌ | ✅ | ✅ |
| | `/api/orders/top-products` | GET | ✅ | ✅ | ✅ | ✅ |
| **Purchases** |
| | `/api/purchases` | GET | ✅ | ❌ | ✅ | ✅ |
| | `/api/purchases/:id` | GET | ✅ | ❌ | ✅ | ✅ |
| | `/api/purchases` | POST | ✅ | ❌ | ✅ | ❌ |
| | `/api/purchases/:id` | PATCH | ✅ | ❌ | ❌ | ❌ |
| | `/api/purchases/:id` | DELETE | ✅ | ❌ | ❌ | ❌ |
| | `/api/purchases/statistics` | GET | ✅ | ❌ | ✅ | ✅ |
| | `/api/purchases/suppliers` | GET | ✅ | ✅ | ✅ | ✅ |
| | `/api/purchases/recommendations` | GET | ✅ | ❌ | ✅ | ❌ |
| | `/api/purchases/recommendations/high-priority` | GET | ✅ | ❌ | ✅ | ❌ |
| | `/api/purchases/recommendations/low-priority` | GET | ✅ | ❌ | ✅ | ❌ |
| **Transactions** |
| | `/api/transactions/summary` | GET | ✅ | ❌ | ✅ | ✅ |
| | `/api/transactions/monthly` | GET | ✅ | ❌ | ✅ | ✅ |
| **Reports** |
| | `/api/reports/summary` | GET | ✅ | ❌ | ✅ | ✅ |
| | `/api/reports/revenue` | GET | ✅ | ❌ | ✅ | ✅ |
| | `/api/reports/profit` | GET | ✅ | ❌ | ✅ | ✅ |
| | `/api/reports/export` | GET | ✅ | ❌ | ❌ | ✅ |
| | `/api/reports/inventory` | GET | ✅ | ❌ | ✅ | ✅ |
| **Dashboard** |
| | `/api/dashboard/summary` | GET | ✅ | ❌ | ✅ | ✅ |
| | `/api/dashboard/overview` | GET | ✅ | ❌ | ✅ | ✅ |
| | `/api/dashboard/top-products` | GET | ✅ | ❌ | ✅ | ✅ |
| | `/api/dashboard/orders-trend` | GET | ✅ | ❌ | ✅ | ✅ |
| | `/api/dashboard/recent-activity` | GET | ✅ | ❌ | ✅ | ✅ |

---

## 🔒 Implementation Details

### Backend (NestJS)

#### Guards và Decorators:
```typescript
// Sử dụng @Roles decorator để bảo vệ routes
@Roles(UserRole.ADMIN, UserRole.MANAGER)
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
| Manager | `manager@taphoa.com` | `manager123` | Management |
| Accountant | `accountant@taphoa.com` | `accountant123` | Read-only financial |

---

## 📝 Notes

1. **Staff không thể xem danh sách orders**: Chỉ có thể tạo đơn mới và xem invoice của đơn đã tạo
2. **Manager không thể xóa**: Chỉ Admin mới có quyền xóa
3. **Accountant chỉ đọc**: Tất cả endpoints đều là GET, không có POST/PATCH/DELETE
4. **Register chỉ Admin**: Chỉ Admin mới có quyền tạo tài khoản mới

---

**Last Updated**: 2024-10-30
**Version**: 1.0.0

