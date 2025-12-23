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
- Ba vai trò người dùng: Admin, Staff, Khách hàng
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
- `POST /api/auth/login` - Đăng nhập nhân viên (Admin/Staff)
- `GET /api/auth/profile` - Profile nhân viên (Admin/Staff)
- `POST /api/auth/customer/login` - Đăng nhập khách hàng bằng số điện thoại
- `GET /api/auth/customer/me` - Thông tin khách hàng hiện tại

### Người Dùng (Users)
- `GET /api/users` - Danh sách người dùng (Admin)
- `POST /api/users` - Tạo người dùng mới (Admin)
- `PATCH /api/users/:id` - Cập nhật người dùng (Admin)
- `DELETE /api/users/:id` - Xóa người dùng (Admin)

### Sản Phẩm (Products) - Read-only cho Khách hàng
- `GET /api/products` - Danh sách sản phẩm (Admin/Staff/Khách hàng)
- `GET /api/products/:id` - Chi tiết sản phẩm (Admin/Staff/Khách hàng)
- `POST /api/products` - Tạo sản phẩm (Admin/Staff)
- `PATCH /api/products/:id` - Cập nhật sản phẩm (Admin/Staff)
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin)

### Đơn Hàng (Orders)
- `POST /api/orders` - Tạo đơn hàng (Admin/Staff)
- `GET /api/orders` - Danh sách đơn hàng (Admin/Staff)
- `GET /api/orders/:id` - Chi tiết đơn hàng (Admin/Staff)
- `GET /api/orders/:id/invoice` - Hoá đơn (Admin/Staff)
- `GET /api/orders/history` - Lịch sử mua hàng của khách (Khách hàng - read only)

### Danh Sách Mua Hàng (Shopping Lists)
- `POST /api/shopping-lists` - Tạo/cập nhật danh sách ACTIVE (Khách hàng)
- `GET /api/shopping-lists/active` - Lấy danh sách ACTIVE (Khách hàng)
- `PUT /api/shopping-lists/:id` - Cập nhật danh sách (Khách hàng)
- `DELETE /api/shopping-lists/:id` - Xoá danh sách (Khách hàng)
- `PATCH /api/shopping-lists/:id/complete` - Hoàn thành danh sách (Khách hàng)

## 🔐 Xác Thực và Phân Quyền

### Vai Trò Người Dùng

1. **Admin** - Quyền toàn bộ hệ thống
   - Quản lý người dùng và phân quyền
   - CRUD trên tất cả entities (sản phẩm, đơn hàng, nhập hàng)
   - Xem mọi báo cáo và thống kê
   - Xuất báo cáo PDF

2. **Staff (Nhân viên)** - Quyền vận hành
   - Tạo đơn hàng tại cửa hàng
   - Quản lý sản phẩm/nhập hàng ở mức cho phép
   - Xem báo cáo/dữ liệu tổng hợp (tuỳ cấu hình)

3. **Khách hàng (KHACH_HANG)** - Quyền dành cho khách
   - Đăng nhập bằng số điện thoại (không mật khẩu)
   - Xem sản phẩm
   - Tạo danh sách mua hàng trước khi đi chợ (không phải Order)
   - Xem lịch sử mua hàng (đơn do nhân viên tạo)

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

