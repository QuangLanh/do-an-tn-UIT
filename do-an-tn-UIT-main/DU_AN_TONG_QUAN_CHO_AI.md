# Tài liệu tổng quan dự án – Hệ thống quản lý tạp hóa (cho AI hỗ trợ lập trình)

Tài liệu này mô tả toàn bộ dự án để AI (ví dụ Gemini) có thể hiểu cấu trúc, công nghệ, API, dữ liệu và quy ước, từ đó hỗ trợ lập trình chính xác, không bỏ sót.

---

## 1. Tổng quan dự án

- **Tên**: Grocery Store Management System (Hệ thống quản lý tạp hóa)
- **Mục đích**: Quản lý bán hàng, nhập hàng, tồn kho, đơn hàng, báo cáo, dashboard cho cửa hàng tạp hóa tại Việt Nam
- **Thành phần**:
  - **Backend**: NestJS, MongoDB, REST API, JWT, Swagger
  - **Frontend Admin**: React + Vite + TypeScript, Tailwind, React Router, Zustand, Recharts
  - **Customer App**: React + Vite (app riêng cho khách đặt hàng, có OTP login)

**Thư mục gốc**: `do-an-tn-UIT-main/`

- `back_end_project/` – Backend API
- `front_end_project/` – Web app quản trị (admin/staff)
- `customer_app/` – Web app khách hàng (đặt hàng, OTP, giỏ hàng)

---

## 2. Công nghệ và công cụ

### Backend (back_end_project)

| Công nghệ | Phiên bản / Ghi chú |
|-----------|---------------------|
| Node.js | - |
| NestJS | ^10/11 |
| MongoDB | Mongoose ^8 |
| JWT | @nestjs/jwt, passport-jwt |
| Swagger | @nestjs/swagger |
| Validation | class-validator, class-transformer |
| PDF | pdfkit |
| Khác | bcrypt, axios |

- **Chạy**: `yarn install` → `yarn start:dev`
- **Cổng mặc định**: 4000
- **API base**: `http://localhost:4000/api`
- **Swagger**: `http://localhost:4000/api/docs`
- **Prefix toàn cục**: `/api`

### Frontend Admin (front_end_project)

| Công nghệ | Ghi chú |
|-----------|--------|
| React | 18 |
| Vite | 7 |
| TypeScript | 5 |
| React Router | 6 |
| Tailwind CSS | 3 |
| Zustand | State (auth, sản phẩm cache, sidebar) |
| Axios | Gọi API (apiClient / apiService) |
| Recharts | Biểu đồ báo cáo/dashboard |
| React Quill | Soạn thảo (lazy load) |
| react-hot-toast | Thông báo |

- **Chạy**: `yarn install` → `yarn dev`
- **Cổng mặc định**: 5173
- **Biến môi trường**: `VITE_API_BASE_URL` (mặc định `http://localhost:4000/api`)

### Customer App (customer_app)

- React + Vite + Tailwind, cổng 5174 (hoặc cấu hình riêng)
- Đăng nhập OTP, giỏ hàng, đặt hàng, tra cứu đơn

---

## 3. Cấu trúc Backend (back_end_project)

### 3.1 Cây thư mục chính

```
back_end_project/
├── src/
│   ├── main.ts                    # Entry, CORS, ValidationPipe, Swagger
│   ├── ung-dung.phan-he.ts        # Root module (import tất cả module)
│   ├── ung-dung.dieu-khien.ts     # Health: GET /, GET /health
│   ├── ung-dung.dich-vu.ts
│   ├── gieo-du-lieu.ts            # Seed DB (sản phẩm, v.v.)
│   ├── cau-hinh/
│   │   ├── cau-hinh-co-so-du-lieu.ts   # Mongoose URI từ process.env.MONGO_URI
│   │   └── cau-hinh-jwt.ts
│   ├── dung-chung/
│   │   ├── cache/cache-nho.ts     # Cache in-memory TTL 60s (báo cáo, dashboard)
│   │   ├── bao-ve/                # Guards: BaoVeJwt, BaoVeVaiTro
│   │   ├── bo-loc/                # Exception filter HTTP
│   │   ├── liet-ke/               # Enums: TrangThaiDonHang, VaiTroNguoiDung, ...
│   │   ├── trang-tri/             # Decorators: @VaiTro(), @NguoiDungHienTai(), @CongKhai()
│   │   └── giao-dien/             # JWT payload interface
│   └── phan-he/                   # Feature modules
│       ├── xac-thuc/              # Auth: login, register, OTP, profile
│       ├── nguoi-dung/            # Users CRUD (admin)
│       ├── khach-hang/            # Customers CRUD (admin)
│       ├── san-pham/              # Products CRUD, categories, low-stock, barcode
│       ├── don-hang/              # Orders CRUD, đổi/trả, ghi nợ, thống kê
│       ├── nhap-hang/             # Purchases CRUD, gợi ý nhập hàng
│       ├── giao-dich/             # Transactions: summary, daily-summary, monthly
│       ├── bao-cao/               # Reports: revenue, daily-sales, top-products, PDF, inventory
│       ├── bang-dieu-khien/       # Dashboard: summary, top-products, orders-trend
│       ├── danh-sach-mua-hang/    # Shopping lists (customer)
│       ├── nha-cung-cap/          # Suppliers CRUD (không guard)
│       └── ...
├── documents/                     # Tài liệu API, deployment, ...
├── du-lieu-san-pham.json          # Dữ liệu seed sản phẩm
├── .env                           # MONGO_URI, JWT_SECRET, PORT, FRONTEND_URLS
└── package.json
```

### 3.2 Quy ước đặt tên file (Backend)

- **Module**: `*.phan-he.ts` (ví dụ: `san-pham.phan-he.ts`)
- **Controller**: `*.dieu-khien.ts`
- **Service**: `*.dich-vu.ts`
- **Schema**: `schemas/*.schema.ts`
- **DTO**: `dto/*.dto.ts`
- **Guard**: `bao-ve/*.ts`
- **Decorator**: `trang-tri/*.trang-tri.ts`
- **Enum**: `liet-ke/*.enum.ts`

Tên class: `DieuKhienSanPham`, `DichVuSanPham`, `PhanHeSanPham`, v.v.

---

## 4. API Backend – Danh sách endpoint

Base URL: `http://localhost:4000/api`. Tất cả (trừ một số route công khai) cần header `Authorization: Bearer <token>`.

### 4.1 Health (không prefix /api trong main nhưng app dùng prefix /api)

| Method | Path | Mô tả |
|--------|------|--------|
| GET | / | Thông tin chào mừng |
| GET | /health | Health check |

### 4.2 Auth – `/auth`

| Method | Path | Auth | Mô tả |
|--------|------|------|--------|
| POST | /auth/register | Bearer (Admin) | Đăng ký user mới |
| POST | /auth/login | - | Đăng nhập (email, password) |
| POST | /auth/customer/login | - | Đăng nhập khách (số ĐT) – deprecated, dùng OTP |
| POST | /auth/customer/request-otp | - | Gửi OTP |
| POST | /auth/customer/verify-otp | - | Xác thực OTP, trả token |
| GET | /auth/customer/me | Bearer (Customer) | Thông tin khách đăng nhập |
| PUT | /auth/customer/profile | Bearer (Customer) | Cập nhật profile khách |
| GET | /auth/profile | Bearer | Profile user hiện tại |
| PUT | /auth/profile | Bearer (Admin/Staff) | Cập nhật profile nhân viên |
| PATCH | /auth/profile | Bearer (Admin/Staff) | Cập nhật profile nhân viên |

### 4.3 Users – `/users`

| Method | Path | Vai trò | Mô tả |
|--------|------|---------|--------|
| POST | /users | Admin | Tạo user |
| GET | /users | Admin | Danh sách user |
| GET | /users/:id | Admin | Chi tiết user |
| PATCH | /users/:id | Admin | Cập nhật user |
| DELETE | /users/:id | Admin | Xóa user |

### 4.4 Customers – `/customers`

| Method | Path | Vai trò | Mô tả |
|--------|------|---------|--------|
| POST | /customers | Admin | Tạo khách hàng |
| GET | /customers | Admin | Danh sách khách |
| GET | /customers/:id | Admin | Chi tiết khách |
| PATCH | /customers/:id | Admin | Cập nhật khách |
| POST | /customers/sync-from-orders | Admin | Đồng bộ khách từ đơn hàng |

### 4.5 Products – `/products`

| Method | Path | Auth | Mô tả |
|--------|------|------|--------|
| POST | /products | Admin/Staff | Tạo sản phẩm |
| GET | /products | Có thể công khai (@CongKhai) | Danh sách (query: category, search, lowStock) |
| GET | /products/categories | Công khai | Danh sách category |
| GET | /products/low-stock | JWT | Sản phẩm sắp hết |
| GET | /products/barcode/:barcode | JWT | Tìm theo barcode |
| GET | /products/:id | Công khai | Chi tiết sản phẩm |
| PATCH | /products/:id | Admin/Staff | Cập nhật sản phẩm |
| PATCH | /products/:id/stock | Admin/Staff | Cập nhật tồn kho |
| DELETE | /products/:id | Admin | Xóa sản phẩm |

### 4.6 Orders – `/orders`

| Method | Path | Auth | Mô tả |
|--------|------|------|--------|
| POST | /orders | Staff/Admin | Tạo đơn hàng |
| GET | /orders | Admin/Staff | Danh sách (status, from, to, isOnline) |
| GET | /orders/debts | Admin/Staff | Đơn ghi nợ |
| GET | /orders/history | Customer | Lịch sử mua hàng (theo SĐT) |
| POST | /orders/customer | Công khai | Tạo đơn từ khách (không đăng nhập) |
| GET | /orders/customer/my-orders | Customer | Đơn của khách đăng nhập |
| GET | /orders/customer/by-phone | Công khai | Tra cứu đơn theo SĐT (query: phone) |
| GET | /orders/customer/:id | Công khai | Chi tiết đơn (khách) |
| POST | /orders/customer/:id/cancel | Công khai | Hủy đơn |
| GET | /orders/statistics | Admin/Staff | Thống kê (from, to) |
| GET | /orders/top-products | Admin/Staff | Top sản phẩm bán chạy (limit) |
| GET | /orders/exchanges | Admin/Staff | Đơn đổi hàng |
| GET | /orders/returns | Admin/Staff | Đơn trả hàng |
| GET | /orders/search/phone/:phone | Admin/Staff | Tìm theo SĐT |
| GET | /orders/search/code/:orderNumber | Admin/Staff | Tìm theo mã đơn |
| POST | /orders/exchange | Staff/Admin | Tạo đơn đổi hàng |
| POST | /orders/return | Staff/Admin | Tạo đơn trả hàng |
| GET | /orders/:id | Admin/Staff | Chi tiết đơn |
| PATCH | /orders/:id/status | Admin | Cập nhật trạng thái |
| PATCH | /orders/:id/pay-debt | Admin/Staff | Thanh toán nợ |
| PATCH | /orders/:id/payment-status | Admin/Staff | Cập nhật trạng thái thanh toán |
| PATCH | /orders/:id/customer-info | Admin/Staff | Cập nhật tên/SĐT khách |
| DELETE | /orders/:id | Admin | Xóa đơn |
| GET | /orders/:id/invoice | Staff/Admin | Thông tin hóa đơn |

### 4.7 Purchases – `/purchases`

| Method | Path | Vai trò | Mô tả |
|--------|------|---------|--------|
| POST | /purchases | Admin/Staff | Tạo phiếu nhập |
| GET | /purchases | Admin/Staff | Danh sách (supplier, from, to) |
| GET | /purchases/statistics | Admin/Staff | Thống kê (from, to) |
| GET | /purchases/suppliers | Admin/Staff | Danh sách nhà cung cấp |
| GET | /purchases/recommendations | Admin/Staff | Gợi ý nhập hàng |
| GET | /purchases/recommendations/high-priority | Admin/Staff | Gợi ý ưu tiên cao |
| GET | /purchases/recommendations/low-priority | Admin/Staff | Gợi ý ưu tiên thấp |
| GET | /purchases/:id | Admin/Staff | Chi tiết phiếu nhập |
| PATCH | /purchases/:id | Admin | Cập nhật |
| DELETE | /purchases/:id | Admin | Xóa |

### 4.8 Transactions – `/transactions`

| Method | Path | Vai trò | Mô tả |
|--------|------|---------|--------|
| GET | /transactions/summary | Admin/Staff | Tổng hợp giao dịch (from, to), có cache 60s |
| GET | /transactions/daily-summary | Admin/Staff | Thống kê theo ngày (from, to), cache 60s |
| GET | /transactions/monthly | Admin/Staff | Dữ liệu theo tháng (year) |

### 4.9 Reports – `/reports`

| Method | Path | Vai trò | Mô tả |
|--------|------|---------|--------|
| GET | /reports/summary | Admin/Staff | Báo cáo tổng quan (from, to) |
| GET | /reports/daily-sales | Admin/Staff | Doanh thu theo ngày (days, mặc định 30), cache 60s |
| GET | /reports/top-products | Admin/Staff | Top sản phẩm (limit), cache 60s |
| GET | /reports/export | Admin/Staff | Xuất PDF (from, to) |
| GET | /reports/inventory | Admin/Staff | Báo cáo tồn kho |

### 4.10 Dashboard – `/dashboard`

| Method | Path | Vai trò | Mô tả |
|--------|------|---------|--------|
| GET | /dashboard/summary | Admin/Staff | Tổng quan (today, thisMonth, debt, alerts), cache 60s |
| GET | /dashboard/overview | Admin/Staff | Giống summary |
| GET | /dashboard/top-products | Admin/Staff | Top sản phẩm (limit), cache 60s |
| GET | /dashboard/orders-trend | Admin/Staff | Xu hướng đơn (days) |
| GET | /dashboard/recent-activity | Admin/Staff | Hoạt động gần đây |

### 4.11 Shopping lists – `/shopping-lists`

| Method | Path | Vai trò | Mô tả |
|--------|------|---------|--------|
| POST | /shopping-lists | Customer | Tạo/cập nhật danh sách ACTIVE |
| GET | /shopping-lists/active | Customer | Lấy danh sách ACTIVE |
| PUT | /shopping-lists/:id | Customer | Cập nhật danh sách |
| DELETE | /shopping-lists/:id | Customer | Xóa |
| PATCH | /shopping-lists/:id/complete | Customer | Đánh dấu hoàn thành |

### 4.12 Suppliers – `/suppliers`

| Method | Path | Guard | Mô tả |
|--------|------|--------|--------|
| POST | /suppliers | (không guard) | Tạo NCC |
| GET | /suppliers | (không guard) | Danh sách NCC |

(Lưu ý: controller suppliers không dùng @UseGuards; nếu cần bảo vệ thì thêm sau.)

---

## 5. Schema MongoDB (Mongoose)

### 5.1 User (users)

- email (required, unique), password, fullName, role (enum: admin, staff, customer), isActive, phone?, address?, lastLogin?

### 5.2 KhachHang (customers)

- soDienThoai (required, unique), ten?, email?, diaChi?, role (mặc định CUSTOMER), isActive

### 5.3 Product (products)

- name, sku (unique), description?, brand?, origin?, category, purchasePrice, salePrice, stock, minStockLevel, unit?, barcode? (unique sparse), imageUrl?, tags[], defaultSupplierId? (ref NhaCungCap), shelfLifeMonths?, isActive
- Index: text (name, sku, barcode), unique sku, unique sparse barcode

### 5.4 Order (orders)

- orderNumber (unique), items[], subtotal, tax, discount, total, status (TrangThaiDonHang), customerName?, customerPhone?, customerAddress?, customerEmail?, notes?, paymentMethod?, paymentStatus (PAID | DEBT | REFUNDED), paidAt?, wasDebt?, orderType (SALE | EXCHANGE | RETURN), relatedOrderCode?, hasAfterSale?, returnReason?, isRestocked?, createdBy (ref User), isOnline?
- OrderItem: product (ref), productName, quantity, price (giá bán), importPrice (giá vốn), subtotal
- TrangThaiDonHang: pending, shipping, completed, cancelled

### 5.5 Purchase (purchases)

- purchaseNumber (unique), items[], supplier (string), supplierId? (ref NhaCungCap), supplierNameSnapshot?, supplierContact?, total, notes?, status, createdBy (ref User)
- PurchaseItem: product (ref), productName, quantity, purchasePrice, subtotal, expiryDate?, manufactureDate?, lotNumber?

### 5.6 DanhSachMuaHang (shoppinglists)

- customerId (ref KhachHang), items: [{ productId, quantity }], status (ACTIVE | COMPLETED)

### 5.7 NhaCungCap

- (Entity/DTO: name, contact, ... – xem file nha-cung-cap.thuc-the.ts / tao-nha-cung-cap.dto.ts)

### 5.8 OTP (xac-thuc)

- Schema OTP cho đăng nhập khách hàng (request-otp / verify-otp).

---

## 6. Enum và hằng số

- **VaiTroNguoiDung**: admin, staff, customer
- **TrangThaiDonHang**: pending, shipping, completed, cancelled
- **TrangThaiNhapHang**: (trong liet-ke, nếu có)
- **Order paymentStatus**: PAID, DEBT, REFUNDED
- **Order orderType**: SALE, EXCHANGE, RETURN

---

## 7. Cache (Backend)

- File: `src/dung-chung/cache/cache-nho.ts`
- Class `CacheNho`: Map in-memory, TTL mặc định 60 giây
- Singleton: `cacheNho`
- Được dùng tại:
  - `giao-dich.dich-vu`: getSummary (key `tx:summary:...`), getDailySummary (key `tx:daily:...`)
  - `bao-cao.dich-vu`: getDailySalesReport (`reports:daily-sales:${days}`), getTopProductsReport (`reports:top-products:${limit}`)
  - `bang-dieu-khien.dich-vu`: getSummary (`dashboard:summary`), getTopProducts (`dashboard:top:${limit}`)

---

## 8. Cấu trúc Frontend Admin (front_end_project)

### 8.1 Thư mục chính

```
front_end_project/src/
├── main.tsx
├── dinh-tuyen/
│   ├── UngDungDinhTuyen.tsx   # Định nghĩa toàn bộ Route
│   └── TuyenBaoVe.tsx         # Protected route (requiredRoles, requiredPermission)
├── giao-dien/
│   ├── layouts/
│   │   ├── BoCucChinh.tsx     # Layout có sidebar + outlet
│   │   ├── ThanhBen.tsx       # Sidebar menu
│   │   └── ThanhDieuHuong.tsx
│   └── pages/
│       ├── TrangDangNhap.tsx
│       ├── TrangBangDieuKhien.tsx   # Dashboard
│       ├── TrangSanPham.tsx
│       ├── TrangKiemKe.tsx          # Tồn kho / kiểm kê
│       ├── TrangBaoCao.tsx
│       ├── TrangDonHang.tsx
│       ├── TrangDanhSachDonDatHang.tsx
│       ├── TrangDonHangGhiNo.tsx
│       ├── TrangTaoDonHang.tsx
│       ├── TrangBanHang.tsx
│       ├── TrangNhapHang.tsx
│       ├── TrangTaoNhapHang.tsx
│       ├── TrangDoiTraHang.tsx
│       ├── TrangDanhSachTaiKhoan.tsx
│       ├── TrangNhaCungCap.tsx
│       └── TrangKhongTimThay.tsx
├── ha-tang/
│   └── api/
│       ├── index.ts           # Export apiService, apiClient, API_ENDPOINTS
│       ├── khachHangApi.ts     # Axios instance (baseURL từ VITE_API_BASE_URL), interceptors
│       ├── cau-hinh/apiEndpoints.ts   # Object path cho từng endpoint
│       ├── dich-vu/
│       │   ├── baseApiService.ts
│       │   └── apiService.ts   # apiService.auth, .users, .products, .orders, .purchases, ...
│       ├── productApi.ts, purchaseApi.ts, reportApi.ts, supplierApi.ts, ...
│       └── moc/useApi.ts      # useApiCall hook
├── kho-trang-thai/
│   ├── khoXacThuc.ts          # Zustand: auth (token, user, login, logout)
│   ├── khoSanPham.ts          # Zustand: cache sản phẩm 60s (useProductStore)
│   └── khoThanhBen.ts        # Sidebar state
├── linh-vuc/
│   ├── products/repositories/RealProductRepository.ts
│   ├── orders/repositories/RealOrderRepository.ts
│   ├── purchases/repositories/RealPurchaseRepository.ts
│   └── users/services/RealAuthService.ts
└── vi-du/                     # Ví dụ dùng API
```

### 8.2 Routing (Frontend)

- **Public**: `/login`
- **Protected** (TuyenBaoVe, roles admin/staff):
  - `/dashboard` → TrangBangDieuKhien
  - `/products` → TrangSanPham
  - `/inventory` → TrangKiemKe
  - `/sales` → TrangBanHang
  - `/orders/new` → TrangTaoDonHang
  - `/orders/list` → TrangDanhSachDonDatHang
  - `/orders/debts` → TrangDonHangGhiNo
  - `/orders/:id` → TrangTaoDonHang (xem/sửa)
  - `/orders` → TrangDonHang
  - `/returns-exchanges` → TrangDoiTraHang
  - `/purchases` → TrangNhapHang
  - `/purchases/new` → TrangTaoNhapHang
  - `/purchases/:id` → TrangTaoNhapHang
  - `/nha-cung-cap` → TrangNhaCungCap
  - `/reports` → TrangBaoCao (admin, view_reports)
  - `/accounts` → TrangDanhSachTaiKhoan (admin, manage_users)
- **Root**: `/` → redirect đến `/dashboard` (đã đăng nhập) hoặc `/login`
- **404**: `*` → TrangKhongTimThay

**Lưu ý**: Route `/nha-cung-cap` trong `UngDungDinhTuyen.tsx` có indentation hơi lệch so với các route khác; có thể chỉnh lại cho đồng nhất.

### 8.3 API Service (Frontend)

- **apiService** (singleton): gọi qua `apiService.auth.*`, `apiService.products.*`, `apiService.orders.*`, `apiService.purchases.*`, `apiService.transactions.*`, `apiService.reports.*`, `apiService.dashboard.*`, `apiService.users.*`, `apiService.customers.*`, `apiService.shoppingLists.*`
- **apiClient**: Axios instance với baseURL = `VITE_API_BASE_URL || 'http://localhost:4000/api'`, interceptors gắn token, xử lý lỗi
- **Cache sản phẩm**: `useProductStore()` (Zustand, TTL 60s) dùng ở TrangSanPham, TrangBanHang, TrangTaoDonHang, TrangTaoNhapHang, TrangKiemKe, TrangBaoCao, TrangBangDieuKhien để tránh gọi `productApi.getAllProducts` nhiều lần.

---

## 9. DTO chính (Backend)

- **TaoDonHangDto**: items (productId, quantity), tax?, discount?, customerName?, customerPhone?, notes?, paymentMethod?, isDebt?
- **TaoNhapHangDto**: items (productId, quantity, purchasePrice, expiryDate?, manufactureDate?, lotNumber?), supplier, supplierId?, supplierContact?, notes?
- **TaoSanPhamDto**: name, sku, category, purchasePrice, salePrice, (stock, minStockLevel, unit, barcode, brand?, origin?, tags?, ...)
- **DangNhapDto**: email, password
- **DangKyDto**: email, password, fullName, role?, ...
- **RequestOtpDto / VerifyOtpDto**: soDienThoai, ...

(Chi tiết từng field xem trong thư mục `dto/` từng phạn-he.)

---

## 10. Môi trường và chạy dự án

### Backend (.env)

- `MONGO_URI`: connection string MongoDB
- `JWT_SECRET`: secret ký JWT
- `PORT`: cổng (mặc định 4000)
- `FRONTEND_URLS`: danh sách origin CORS, cách nhau bằng dấu phẩy (ví dụ: http://localhost:5173,http://localhost:5174)

### Frontend

- `VITE_API_BASE_URL`: base URL API (mặc định http://localhost:4000/api)

### Thứ tự chạy

1. MongoDB đang chạy
2. Backend: `cd back_end_project && yarn install && yarn start:dev`
3. Admin FE: `cd front_end_project && yarn install && yarn dev`
4. (Tùy chọn) Customer app: `cd customer_app && yarn install && yarn dev`

---

## 11. Một số quy ước khi viết code

- **Backend**: Dùng tiếng Việt không dấu cho tên file (phan-he, dieu-khien, dich-vu, dung-chung). Tên class tiếng Anh hoặc PascalCase (DieuKhienSanPham, DichVuSanPham).
- **Validation**: DTO dùng class-validator; global ValidationPipe với whitelist, forbidNonWhitelisted, transform.
- **Bảo mật**: Route cần JWT thì dùng `@UseGuards(BaoVeJwt, BaoVeVaiTro)` và `@VaiTro(VaiTroNguoiDung.ADMIN, ...)`. Route công khai dùng `@CongKhai()`.
- **Frontend**: Trang (page) đặt tên `Trang*`. State auth/sản phẩm dùng Zustand. Gọi API qua `apiService` hoặc repository tương ứng.

---

## 12. Tài liệu thêm (trong repo)

- `back_end_project/documents/`: PROJECT_STRUCTURE.md, API_USAGE_EXAMPLES.md, GETTING_STARTED.md, DEPLOYMENT_GUIDE.md, PERMISSIONS.md, USER_GUIDE.md, ...
- `front_end_project/documents/`: API_SERVICE_GUIDE.md, PROJECT_STRUCTURE.md, FEATURES.md, ...
- Swagger: sau khi chạy backend, mở `http://localhost:4000/api/docs` để xem đầy đủ endpoint và thử API.

---

Khi AI hỗ trợ lập trình, nên:
- Tham chiếu đúng tên file và class (dieu-khien, dich-vu, phan-he, schema, dto).
- Thêm API mới: thêm method trong controller + service, cập nhật DTO/schema nếu cần; frontend thêm trong apiEndpoints + apiService và gọi từ trang tương ứng.
- Đổi schema/collection: cập nhật schema Mongoose và seed (gieo-du-lieu.ts) nếu cần; kiểm tra DTO và service liên quan.
- Bảo mật: luôn kiểm tra Guard và @VaiTro cho endpoint mới; frontend dùng TuyenBaoVe với requiredRoles/requiredPermission phù hợp.

---

## 13. Ghi chú bổ sung cho AI

### 13.1 Tài khoản mẫu & phân quyền

- **Ví dụ tài khoản (nếu đã seed sẵn)** – có thể điều chỉnh lại theo thực tế của bạn:
  - Admin: `admin@example.com / 123456`
  - Staff: `staff@example.com / 123456`
- **Quyền cơ bản theo vai trò**:
  - `admin`:
    - Toàn quyền: quản lý user, sản phẩm, đơn hàng, nhập hàng, báo cáo, dashboard, cấu hình.
  - `staff`:
    - Bán hàng, xem/tạo/sửa đơn hàng, nhập hàng, xem dashboard/báo cáo cơ bản.
  - `customer`:
    - Đặt hàng (online/offline), dùng shopping list, xem lịch sử đơn, cập nhật profile khách.

Khi AI tạo/chỉnh sửa endpoint hoặc UI, hãy luôn kiểm tra:

- Vai trò nào được phép truy cập (mapping với `VaiTroNguoiDung`).
- Trên FE: route phải bọc trong `TuyenBaoVe` với `requiredRoles`/`requiredPermission` tương ứng.

### 13.2 Ví dụ request/response quan trọng

**1) Tạo đơn hàng (Admin/Staff) – `POST /api/orders`**

- Request body (TaoDonHangDto – tối thiểu):
```json
{
  "items": [
    { "productId": "507f1f77bcf86cd799439011", "quantity": 2 },
    { "productId": "507f1f77bcf86cd799439012", "quantity": 1 }
  ],
  "tax": 0,
  "discount": 0,
  "customerName": "Nguyen Van A",
  "customerPhone": "0123456789",
  "notes": "Giao trước 5h chiều",
  "paymentMethod": "cash",
  "isDebt": false
}
```

- Response (rút gọn):
```json
{
  "_id": "665e9c3f5df0b2e6e4cf1234",
  "orderNumber": "DH000001",
  "items": [
    {
      "product": "507f1f77bcf86cd799439011",
      "productName": "Sữa tươi A",
      "quantity": 2,
      "price": 15000,
      "importPrice": 10000,
      "subtotal": 30000
    }
  ],
  "subtotal": 30000,
  "tax": 0,
  "discount": 0,
  "total": 30000,
  "status": "pending",
  "paymentStatus": "PAID",
  "orderType": "SALE",
  "isOnline": false,
  "createdAt": "2026-02-13T10:00:00.000Z"
}
```

**2) Tạo phiếu nhập – `POST /api/purchases`**

- Request body (TaoNhapHangDto – tối thiểu):
```json
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 100,
      "purchasePrice": 8000,
      "expiryDate": "2026-12-31",
      "manufactureDate": "2026-01-01",
      "lotNumber": "LOT-2026-001"
    }
  ],
  "supplier": "ABC Supplier Co.",
  "supplierId": "65f1f77bcf86cd7994390112",
  "supplierContact": "0987654321",
  "notes": "Ưu tiên giao sớm"
}
```

**3) Dashboard summary – `GET /api/dashboard/summary`**

- Response (rút gọn, cấu trúc quan trọng):
```json
{
  "today": {
    "revenue": 1500000,
    "orders": 10,
    "profit": 350000
  },
  "thisMonth": {
    "revenue": 32000000,
    "orders": 250,
    "profit": 7500000,
    "profitMargin": 23.4
  },
  "debt": {
    "totalDebtOrders": 5,
    "totalDebtAmount": 1200000
  },
  "alerts": {
    "lowStockCount": 3,
    "lowStockProducts": [
      { "id": "507f1f77bcf86cd799439011", "name": "Mì gói X", "currentStock": 5, "minStockLevel": 10 }
    ]
  }
}
```

### 13.3 Quy ước lỗi & format response

- **Validation error** (class-validator + ValidationPipe):
  - Dạng NestJS chuẩn:
```json
{
  "statusCode": 400,
  "message": [
    "items must not be empty",
    "customerPhone must be a string"
  ],
  "error": "Bad Request"
}
```

- **Business error** (được xử lý qua `BoLocNgoaiLeHttp`):
  - Thường cũng trả dạng:
```json
{
  "statusCode": 400,
  "message": "Sản phẩm không đủ tồn kho",
  "error": "Bad Request"
}
```

Khi AI viết FE, nên:

- Bắt `error.response?.data?.message` để hiển thị, fallback sang thông báo chung nếu không có.

### 13.4 Múi giờ & tiền tệ

- **Múi giờ**:
  - Các thống kê `giao-dich` và `bang-dieu-khien` được thiết kế để chạy theo **giờ Việt Nam (UTC+7)**:
    - Dùng helper `getCurrentVNDate`, `createVNDate` và format `YYYY-MM-DD` với `timeZone: 'Asia/Ho_Chi_Minh'`.
  - Khi AI thêm report mới theo ngày/tháng, hãy:
    - Luôn chuẩn hóa thời gian theo VN (`00:00:00.000+07:00` đến `23:59:59.999+07:00`).

- **Tiền tệ**:
  - Đơn vị mặc định: **VND**.
  - FE format bằng `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`.
  - Khi AI hiển thị số tiền mới, hãy dùng cùng format để đồng bộ UI.

### 13.5 Checklist khi thêm tính năng mới

1. **Backend**:
   - Xác định module (`phan-he`) phù hợp.
   - Thêm/ cập nhật DTO (`dto/*.dto.ts`) + validation.
   - Cập nhật service (`*.dich-vu.ts`) với business logic.
   - Thêm endpoint trong controller (`*.dieu-khien.ts`), gắn Guard + @VaiTro đúng vai trò.
   - Nếu liên quan báo cáo/thống kê lặp lại nhiều:
     - Xem xét dùng `cacheNho` (TTL 60s) với key rõ ràng.

2. **Frontend**:
   - Thêm path mới vào `API_ENDPOINTS` nếu cần.
   - Thêm method tương ứng vào `apiService`.
   - Nếu là hành vi phức tạp, bọc qua repository trong `linh-vuc/*`.
   - Gọi từ page hoặc hook tương ứng; nếu cần quyền, bọc route bằng `TuyenBaoVe`.

3. **Dữ liệu & schema**:
   - Khi đổi schema Mongoose:
     - Cập nhật DTO, service, front-end models/repository.
     - Kiểm tra `gieo-du-lieu.ts` nếu dữ liệu seed có liên quan.

4. **Kiểm thử nhanh**:
   - Test API trong Swagger `/api/docs`.
   - Trên FE, kiểm tra:
     - Auth & vai trò.
     - Luồng happy-path (OK) và một vài lỗi phổ biến (thiếu field, sai kiểu, không đủ tồn kho, v.v.).
