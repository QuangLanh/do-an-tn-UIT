# 🛒 Hệ Thống Quản Lý Tạp Hóa - Backend API

Hệ thống backend hoàn chỉnh để quản lý cửa hàng tạp hóa, được xây dựng bằng NestJS, MongoDB và tuân theo nguyên tắc Domain-Driven Design (DDD).

## 📋 Mục Lục

- [Tổng Quan](#tổng-quan)
- [Tính Năng](#tính-năng)
- [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
- [Hướng Dẫn Cài Đặt](#hướng-dẫn-cài-đặt)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [API Endpoints](#api-endpoints)
- [Xác Thực và Phân Quyền](#xác-thực-và-phân-quyền)

## 🌟 Tổng Quan

Hệ thống backend này cung cấp giải pháp hoàn chỉnh cho việc quản lý cửa hàng tạp hóa bao gồm:
- Quản lý kho sản phẩm
- Xử lý đơn hàng (bán hàng)
- Quản lý nhập hàng (bổ sung kho)
- Báo cáo tài chính và phân tích
- Quản lý người dùng với phân quyền theo vai trò
- Tạo báo cáo PDF

## ✨ Tính Năng

### 🔐 Xác Thực và Phân Quyền
- Xác thực dựa trên JWT
- Phân quyền theo vai trò (RBAC)
- Bốn vai trò người dùng: Admin, Staff, Manager, Accountant
- Mã hóa mật khẩu an toàn với bcrypt

### 📦 Quản Lý Sản Phẩm
- Thêm, sửa, xóa, xem sản phẩm
- Quản lý danh mục
- Theo dõi mức tồn kho
- Cảnh báo tồn kho thấp
- Hỗ trợ mã vạch
- Tìm kiếm sản phẩm

### 🛍️ Quản Lý Đơn Hàng
- Tạo và quản lý đơn hàng bán
- Hỗ trợ nhiều sản phẩm trong một đơn
- Tự động trừ tồn kho
- Tính thuế và giảm giá
- Theo dõi trạng thái đơn hàng
- Thống kê doanh thu

### 📥 Quản Lý Nhập Hàng
- Tạo phiếu nhập kho
- Quản lý nhà cung cấp
- Tự động cập nhật tồn kho
- Theo dõi chi phí nhập
- Lịch sử nhập hàng

### 💰 Giao Dịch và Báo Cáo
- Tổng hợp tài chính
- Tính toán doanh thu, chi phí, lợi nhuận
- Báo cáo theo tháng
- Phân tích sản phẩm bán chạy
- Xuất báo cáo PDF
- Báo cáo giá trị kho hàng

### 📊 Bảng Điều Khiển
- Chỉ số kinh doanh thời gian thực
- Tổng kết hôm nay và tháng này
- Biểu đồ xu hướng bán hàng
- Cảnh báo tồn kho thấp
- Theo dõi hoạt động gần đây

## 🚀 Công Nghệ Sử Dụng

- **Framework**: NestJS 10.x (TypeScript)
- **Cơ sở dữ liệu**: MongoDB Atlas (Cloud)
- **ODM**: Mongoose
- **Xác thực**: JWT + Passport
- **Validation**: class-validator
- **Tài liệu API**: Swagger/OpenAPI
- **Tạo PDF**: PDFKit
- **Bảo mật**: bcrypt, CORS

## 🎯 Hướng Dẫn Cài Đặt

### Yêu Cầu Hệ Thống

- Node.js phiên bản 18 trở lên
- npm hoặc yarn
- Tài khoản MongoDB Atlas (hoặc MongoDB local)

### Các Bước Cài Đặt

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd back_end_project
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   # hoặc
   yarn install
   ```

3. **Cấu hình biến môi trường**
   
   Sao chép file `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```

   Cập nhật file `.env` với thông tin MongoDB Atlas của bạn:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/taphoa
   JWT_SECRET=your_secret_key_here
   PORT=4000
   FRONTEND_URL=http://localhost:5173
   ```

4. **Chạy ứng dụng**
   ```bash
   # Chế độ development
   npm run start:dev

   # Chế độ production
   npm run build
   npm run start:prod
   ```

5. **Truy cập API**
   - API: `http://localhost:4000/api`
   - Tài liệu Swagger: `http://localhost:4000/api/docs`

## 📁 Cấu Trúc Dự Án

```
back_end_project/
├── src/
│   ├── modules/              # Các module theo domain
│   │   ├── auth/            # Xác thực
│   │   ├── user/            # Quản lý người dùng
│   │   ├── product/         # Quản lý sản phẩm
│   │   ├── order/           # Quản lý đơn hàng
│   │   ├── purchase/        # Quản lý nhập hàng
│   │   ├── transaction/     # Tổng hợp giao dịch
│   │   ├── report/          # Báo cáo & PDF
│   │   └── dashboard/       # Dữ liệu dashboard
│   ├── common/              # Tài nguyên dùng chung
│   │   ├── decorators/      # Decorators tùy chỉnh
│   │   ├── guards/          # Guards xác thực & phân quyền
│   │   ├── filters/         # Exception filters
│   │   ├── enums/           # Enumerations
│   │   └── interfaces/      # Type definitions
│   ├── config/              # File cấu hình
│   └── main.ts              # Entry point
├── .env                     # Biến môi trường
├── package.json             # Dependencies
└── README.md               # Tài liệu
```

## 🔌 API Endpoints

### Xác Thực (Authentication)
- `POST /api/auth/register` - Đăng ký người dùng mới (Chỉ Admin)
- `POST /api/auth/login` - Đăng nhập (Public)
- `GET /api/auth/profile` - Lấy thông tin profile (Tất cả roles)

### Người Dùng (Users)
- `GET /api/users` - Lấy danh sách người dùng (Admin, Manager)
- `GET /api/users/:id` - Lấy thông tin người dùng (Admin only)
- `POST /api/users` - Tạo người dùng mới (Admin only)
- `PATCH /api/users/:id` - Cập nhật người dùng (Admin only)
- `DELETE /api/users/:id` - Xóa người dùng (Admin only)

### Sản Phẩm (Products)
- `GET /api/products` - Lấy danh sách sản phẩm (Tất cả roles)
- `GET /api/products/:id` - Lấy thông tin sản phẩm (Tất cả roles)
- `POST /api/products` - Tạo sản phẩm mới (Admin, Manager)
- `PATCH /api/products/:id` - Cập nhật sản phẩm (Admin, Manager)
- `PATCH /api/products/:id/stock` - Cập nhật tồn kho (Admin, Manager)
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin only)
- `GET /api/products/low-stock` - Lấy sản phẩm tồn kho thấp (Tất cả roles)
- `GET /api/products/categories` - Lấy danh sách danh mục (Tất cả roles)

### Đơn Hàng (Orders)
- `GET /api/orders` - Lấy danh sách đơn hàng (Admin, Manager, Accountant)
- `GET /api/orders/:id` - Lấy thông tin đơn hàng (Tất cả roles)
- `POST /api/orders` - Tạo đơn hàng mới (Staff, Admin)
- `PATCH /api/orders/:id/status` - Cập nhật trạng thái (Admin only)
- `DELETE /api/orders/:id` - Xóa đơn hàng (Admin only)
- `GET /api/orders/:id/invoice` - Lấy hóa đơn đơn hàng (Staff, Manager, Accountant)
- `GET /api/orders/statistics` - Thống kê đơn hàng (Admin, Manager, Accountant)
- `GET /api/orders/top-products` - Sản phẩm bán chạy (Tất cả roles)

### Nhập Hàng (Purchases)
- `GET /api/purchases` - Lấy danh sách phiếu nhập (Admin, Manager, Accountant)
- `GET /api/purchases/:id` - Lấy thông tin phiếu nhập (Admin, Manager, Accountant)
- `POST /api/purchases` - Tạo phiếu nhập mới (Admin, Manager)
- `PATCH /api/purchases/:id` - Cập nhật phiếu nhập (Admin only)
- `DELETE /api/purchases/:id` - Xóa phiếu nhập (Admin only)
- `GET /api/purchases/statistics` - Thống kê nhập hàng (Admin, Manager, Accountant)
- `GET /api/purchases/suppliers` - Danh sách nhà cung cấp (Tất cả roles)
- `GET /api/purchases/recommendations` - Gợi ý nhập hàng thông minh theo mức độ ưu tiên (Admin, Manager)
- `GET /api/purchases/recommendations/high-priority` - Sản phẩm cần nhập gấp (Admin, Manager)
- `GET /api/purchases/recommendations/low-priority` - Sản phẩm nên nhập ít (Admin, Manager)

### Giao Dịch (Transactions)
- `GET /api/transactions/summary` - Tổng kết giao dịch (Admin, Manager, Accountant)
- `GET /api/transactions/monthly` - Dữ liệu theo tháng (Admin, Manager, Accountant)

### Báo Cáo (Reports)
- `GET /api/reports/summary` - Tổng kết báo cáo (Admin, Manager, Accountant)
- `GET /api/reports/revenue` - Báo cáo doanh thu (Admin, Manager, Accountant)
- `GET /api/reports/profit` - Báo cáo lợi nhuận (Admin, Manager, Accountant)
- `GET /api/reports/export` - Xuất PDF (Admin, Accountant)
- `GET /api/reports/inventory` - Báo cáo tồn kho (Admin, Manager, Accountant)

### Bảng Điều Khiển (Dashboard)
- `GET /api/dashboard/summary` - Tổng quan dashboard (Admin, Manager, Accountant)
- `GET /api/dashboard/overview` - Tổng quan dashboard (Admin, Manager, Accountant)
- `GET /api/dashboard/top-products` - Top sản phẩm (Admin, Manager, Accountant)
- `GET /api/dashboard/orders-trend` - Xu hướng đơn hàng (Admin, Manager, Accountant)
- `GET /api/dashboard/recent-activity` - Hoạt động gần đây (Admin, Manager, Accountant)

## 🔐 Xác Thực và Phân Quyền

### Vai Trò Người Dùng

1. **Admin** - Quyền toàn bộ hệ thống
   - Quản lý người dùng và phân quyền
   - CRUD trên tất cả entities (sản phẩm, đơn hàng, nhập hàng)
   - Xem mọi báo cáo và thống kê
   - Xuất báo cáo PDF

2. **Staff (Nhân viên bán hàng)** - Quyền bán hàng
   - Tạo đơn hàng mới
   - Thêm sản phẩm vào đơn hàng
   - Tính tổng tiền, giảm giá, in hóa đơn
   - Không được xóa hoặc chỉnh sửa đơn hàng của người khác
   - Không xem báo cáo tài chính

3. **Manager (Quản lý cửa hàng)** - Quyền quản lý
   - Xem và duyệt đơn hàng
   - Theo dõi tồn kho, nhập hàng
   - Xem báo cáo tổng hợp doanh thu, chi phí, lợi nhuận
   - Tạo và quản lý sản phẩm
   - Không được tạo tài khoản mới hoặc phân quyền

4. **Accountant (Kế toán)** - Chỉ đọc tài chính
   - Xem doanh thu, chi phí, lợi nhuận thực tế
   - Xem lịch sử giao dịch (transaction)
   - Xuất báo cáo PDF hoặc Excel
   - Không được CRUD dữ liệu

### Ví Dụ Sử Dụng

1. **Đăng ký người dùng mới**
   ```bash
   POST /api/auth/register
   {
     "email": "user@example.com",
     "password": "password123",
     "fullName": "Nguyễn Văn A"
   }
   ```

2. **Đăng nhập**
   ```bash
   POST /api/auth/login
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```

3. **Sử dụng token**
   
   Thêm JWT token vào các request tiếp theo:
   ```
   Authorization: Bearer <your_token>
   ```

## 📜 Scripts Có Sẵn

```bash
# Development
npm run start:dev        # Chạy server development với hot-reload

# Production
npm run build            # Build cho production
npm run start:prod       # Chạy server production

# Testing
npm run test             # Chạy unit tests
npm run test:watch       # Chạy tests ở chế độ watch
npm run test:cov         # Chạy tests với coverage
npm run test:e2e         # Chạy end-to-end tests

# Code Quality
npm run lint             # Chạy ESLint
npm run format           # Format code với Prettier
```

## 🗄️ Schema Database

### User Collection
```typescript
{
  email: string          // Email duy nhất
  password: string       // Mật khẩu đã hash
  fullName: string       // Họ tên
  role: string           // admin | staff | manager | accountant
  isActive: boolean      // Trạng thái hoạt động
  phone?: string         // Số điện thoại
  address?: string       // Địa chỉ
  lastLogin?: Date       // Lần đăng nhập cuối
  createdAt: Date        // Ngày tạo
  updatedAt: Date        // Ngày cập nhật
}
```

### Product Collection
```typescript
{
  name: string           // Tên sản phẩm
  sku: string            // Mã SKU duy nhất
  description?: string   // Mô tả
  category: string       // Danh mục
  purchasePrice: number  // Giá nhập
  salePrice: number      // Giá bán
  stock: number          // Tồn kho
  minStockLevel: number  // Mức tồn kho tối thiểu
  unit?: string          // Đơn vị
  barcode?: string       // Mã vạch
  imageUrl?: string      // URL hình ảnh
  isActive: boolean      // Trạng thái
  createdAt: Date
  updatedAt: Date
}
```

### Order Collection
```typescript
{
  orderNumber: string    // Mã đơn hàng duy nhất
  items: [{              // Danh sách sản phẩm
    product: ObjectId
    productName: string
    quantity: number
    price: number
    subtotal: number
  }]
  subtotal: number       // Tổng phụ
  tax: number           // Thuế
  discount: number      // Giảm giá
  total: number         // Tổng cộng
  status: string        // Trạng thái
  customerName?: string // Tên khách hàng
  customerPhone?: string// SĐT khách hàng
  notes?: string        // Ghi chú
  paymentMethod?: string// Phương thức thanh toán
  createdBy: ObjectId   // Người tạo
  createdAt: Date
  updatedAt: Date
}
```

## 🔧 Biến Môi Trường

| Biến | Mô tả | Ví dụ |
|------|-------|-------|
| `MONGO_URI` | Chuỗi kết nối MongoDB | `mongodb+srv://...` |
| `JWT_SECRET` | Khóa bí mật JWT | `your_secret_key` |
| `JWT_EXPIRATION` | Thời gian hết hạn token | `7d` |
| `PORT` | Cổng server | `4000` |
| `NODE_ENV` | Môi trường | `development` / `production` |
| `FRONTEND_URL` | URL frontend cho CORS | `http://localhost:5173` |

## 🐛 Xử Lý Sự Cố

### Lỗi Thường Gặp

1. **Lỗi kết nối MongoDB**
   - Kiểm tra `MONGO_URI` trong `.env`
   - Kiểm tra network access trong MongoDB Atlas
   - Đảm bảo username/password đúng

2. **Cổng đã được sử dụng**
   - Thay đổi `PORT` trong `.env`
   - Dừng tiến trình đang dùng cổng

3. **Lỗi xác thực JWT**
   - Đảm bảo `JWT_SECRET` được set đúng
   - Kiểm tra token còn hạn
   - Xác minh format Bearer token

## 📞 Hỗ Trợ

Nếu gặp vấn đề, vui lòng:
- Kiểm tra logs ứng dụng
- Xem tài liệu API tại `/api/docs`
- Liên hệ team phát triển

---

**Chúc bạn code vui vẻ! 🚀**

