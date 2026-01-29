# Customer App - Hướng Dẫn Cài Đặt và Chạy

## Giới Thiệu

Customer App là ứng dụng web dành cho khách hàng, cho phép:
- Xem và tìm kiếm sản phẩm
- Thêm sản phẩm vào giỏ hàng
- Đặt hàng (có hoặc không cần đăng nhập)
- Xem lịch sử đơn hàng
- Đăng nhập bằng OTP qua số điện thoại

## Cài Đặt

### 1. Di chuyển vào thư mục customer_app

```bash
cd customer_app
```

### 2. Cài đặt dependencies

Sử dụng npm:
```bash
npm install
```

Hoặc sử dụng yarn:
```bash
yarn install
```

### 3. Cấu hình biến môi trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:

```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_API_URL=http://localhost:4000
```

**Lưu ý:** Đảm bảo backend đang chạy trên cổng 4000.

## Chạy Ứng Dụng

### Development Mode

```bash
npm run dev
# hoặc
yarn dev
```

Ứng dụng sẽ chạy tại: `http://localhost:5173`

### Production Build

```bash
npm run build
# hoặc
yarn build
```

Build sẽ được tạo trong thư mục `dist/`

### Preview Production Build

```bash
npm run preview
# hoặc
yarn preview
```

## Các Tính Năng Chính

### 1. Xem Sản Phẩm
- Trang chủ hiển thị danh sách tất cả sản phẩm
- Tìm kiếm theo tên hoặc danh mục
- Xem chi tiết sản phẩm

### 2. Giỏ Hàng
- Thêm/xóa sản phẩm
- Cập nhật số lượng
- Xem tổng giá trị đơn hàng

### 3. Đặt Hàng
- Không cần đăng nhập: Nhập thông tin (tên, SĐT, địa chỉ)
- Đã đăng nhập: Tự động điền thông tin
- Chọn phương thức thanh toán (tiền mặt/chuyển khoản)
- Thêm ghi chú cho đơn hàng

### 4. Quản Lý Đơn Hàng
- Xem lịch sử đơn hàng (theo SĐT hoặc đăng nhập)
- Theo dõi trạng thái đơn hàng:
  - Chờ xử lý
  - Đã xác nhận
  - Đang xử lý
  - Đang vận chuyển
  - Đã giao hàng
  - Hoàn thành
  - Đã hủy

### 5. Xác Thực
- Đăng nhập bằng OTP (gửi qua SMS)
- Đăng nhập bằng mật khẩu (sau khi đã đặt)
- Đổi mật khẩu

## Cấu Trúc Thư Mục

```
customer_app/
├── src/
│   ├── api/              # API clients
│   │   ├── client.ts     # Axios config
│   │   ├── authApi.ts    # Authentication APIs
│   │   ├── orderApi.ts   # Order APIs
│   │   └── productApi.ts # Product APIs
│   ├── components/       # UI Components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Spinner.tsx
│   │   └── Badge.tsx
│   ├── pages/           # Page Components
│   │   ├── ProductListPage.tsx
│   │   ├── ProductDetailPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── OrdersPage.tsx
│   │   └── LoginPage.tsx
│   ├── store/           # State Management (Zustand)
│   │   ├── authStore.ts
│   │   └── cartStore.ts
│   ├── types/           # TypeScript Types
│   │   └── index.ts
│   ├── utils/           # Utility Functions
│   │   └── formatters.ts
│   ├── App.tsx          # Main App Component
│   ├── main.tsx         # Entry Point
│   └── index.css        # Global Styles
├── public/              # Static Assets
├── index.html
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## API Endpoints Sử Dụng

### Products
- `GET /api/san-pham` - Lấy danh sách sản phẩm
- `GET /api/san-pham/:id` - Lấy chi tiết sản phẩm

### Orders
- `POST /api/orders/customer` - Tạo đơn hàng mới
- `GET /api/orders/customer/by-phone?phone=xxx` - Tra cứu đơn hàng theo SĐT
- `GET /api/orders/customer/my-orders` - Lấy đơn hàng của tôi (cần đăng nhập)
- `GET /api/orders/customer/:id` - Xem chi tiết đơn hàng
- `POST /api/orders/customer/:id/cancel` - Hủy đơn hàng

### Authentication
- `POST /api/auth/customer/login` - Đăng nhập (OTP/Password)
- `GET /api/auth/customer/me` - Lấy thông tin user hiện tại

## Tech Stack

- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Zustand** - State Management
- **React Router** - Routing
- **Axios** - HTTP Client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## Lưu Ý

1. **Backend phải chạy trước** - Đảm bảo backend NestJS đang chạy ở `http://localhost:4000`

2. **CORS** - Backend cần cấu hình CORS để cho phép frontend truy cập

3. **Port khác nhau** - Mặc định customer app chạy ở port 5173, admin app ở port 5174 (nếu chạy cùng lúc)

4. **Local Storage** - App sử dụng localStorage để lưu:
   - Giỏ hàng (`customer-cart-storage`)
   - Authentication (`customer-auth-storage`)

## Troubleshooting

### Lỗi "Cannot connect to server"
- Kiểm tra backend có đang chạy không
- Kiểm tra `VITE_API_BASE_URL` trong `.env`
- Kiểm tra CORS configuration ở backend

### Lỗi build
```bash
# Xóa node_modules và cài lại
rm -rf node_modules
npm install
```

### Lỗi Vite
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## Deploy Production

### Build
```bash
npm run build
```

### Serve với Nginx
```nginx
server {
    listen 80;
    server_name customer.yourdomain.com;
    
    root /path/to/customer_app/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:4000;
    }
}
```

### Serve với Node.js
```bash
npm install -g serve
serve -s dist -l 3000
```

## Liên Hệ

Nếu có vấn đề, liên hệ team phát triển.
