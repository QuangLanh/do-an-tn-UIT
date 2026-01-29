# Customer App - Ứng Dụng Khách Hàng

Ứng dụng web dành cho khách hàng của hệ thống quản lý cửa hàng tạp hóa.

## Tính Năng

- 🛒 Xem danh sách sản phẩm và chi tiết sản phẩm
- 🛍️ Giỏ hàng (thêm, xóa, cập nhật số lượng)
- 📦 Đặt hàng (có hoặc không cần đăng nhập)
- 📜 Xem lịch sử đơn hàng
- 🔐 Đăng nhập bằng số điện thoại + OTP
- 🔑 Đổi mật khẩu

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand (State Management)
- React Router
- Axios

## Cài Đặt

```bash
# Cài đặt dependencies
npm install
# hoặc
yarn install

# Copy file .env
cp .env.example .env

# Chỉnh sửa .env với thông tin API của bạn
```

## Chạy Development

```bash
npm run dev
# hoặc
yarn dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

## Build Production

```bash
npm run build
# hoặc
yarn build
```

## Cấu Trúc Thư Mục

```
customer_app/
├── src/
│   ├── api/           # API clients và services
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page components
│   ├── store/         # Zustand stores
│   ├── types/         # TypeScript types
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Main app component
│   └── main.tsx       # Entry point
├── public/            # Static assets
└── ...config files
```

## Backend API

Ứng dụng này kết nối đến backend NestJS chung với admin app.
Đảm bảo backend đang chạy tại URL được cấu hình trong `.env`.
