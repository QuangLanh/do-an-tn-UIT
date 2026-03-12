# Grocery Store Management System

Hệ thống quản lý bán hàng tạp hóa gồm 3 ứng dụng:
- **Backend API** (`back_end_project`) - NestJS + MongoDB
- **Admin Web App** (`front_end_project`) - React + Vite (quản trị nội bộ)
- **Customer App** (`customer_app`) - React + Vite (khách hàng đặt hàng online)

## Tính năng chính

### Admin Web App
- Quản lý sản phẩm (CRUD, giá nhập/bán, tồn kho)
- Bán hàng tại quầy (POS), đơn ghi nợ
- Quản lý đơn hàng, đổi/trả hàng
- Quản lý nhập hàng + gợi ý nhập hàng thông minh (HIGH/MEDIUM/LOW)
- Quản lý nhà cung cấp
- Kiểm kê tồn kho, cảnh báo hàng sắp hết
- Dashboard, báo cáo doanh thu, xuất PDF
- Quản lý tài khoản nội bộ, phân quyền

### Customer App
- Xem danh sách và chi tiết sản phẩm
- Giỏ hàng, đặt hàng online
- Guest checkout (không cần đăng nhập)
- Đăng nhập OTP bằng số điện thoại
- Theo dõi lịch sử đơn hàng và chi tiết đơn

### Backend API
- Xác thực JWT + phân quyền theo vai trò
- API cho sản phẩm, đơn hàng, nhập hàng, báo cáo, dashboard
- API gợi ý nhập hàng dựa trên dữ liệu bán hàng 30 ngày
- API khách hàng: OTP, đặt hàng online, lịch sử đơn

## Cấu trúc thư mục

```text
do-an-tn-UIT-main/
├── back_end_project/
├── front_end_project/
├── customer_app/
├── BAO_CAO_DO_AN_TOT_NGHIEP.md
└── BAO_CAO_MUC_5_5_KET_QUA_HE_THONG.md
```

## Yêu cầu hệ thống

- Node.js >= 18
- npm hoặc yarn
- MongoDB Atlas (hoặc MongoDB local)

## Chạy nhanh toàn bộ hệ thống

### 1) Backend API

```bash
cd back_end_project
npm install
# hoặc: yarn install
npm run start:dev
# hoặc: yarn start:dev
```

Backend chạy tại: `http://localhost:4000/api`  
Swagger: `http://localhost:4000/api/docs`

### 2) Admin Web App

```bash
cd front_end_project
npm install
# hoặc: yarn install
npm run dev
# hoặc: yarn dev
```

Admin app chạy tại: `http://localhost:5173`

### 3) Customer App

```bash
cd customer_app
npm install
# hoặc: yarn install
npm run dev -- --port 5174
# hoặc: yarn dev --port 5174
```

Customer app chạy tại: `http://localhost:5174`

## Biến môi trường cơ bản

### Backend (`back_end_project/.env`)

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=7d
PORT=4000
FRONTEND_URL=http://localhost:5173
```

### Admin (`front_end_project/.env.local`)

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

### Customer (`customer_app/.env`)

```env
VITE_API_URL=http://localhost:4000/api
```

## Tài liệu chi tiết

- Backend: `back_end_project/README.md`
- Admin App: `front_end_project/README.md`
- Customer App: `customer_app/README.md`
- Báo cáo tổng: `BAO_CAO_DO_AN_TOT_NGHIEP.md`

---

Nếu bạn bị lỗi kết nối MongoDB Atlas, hãy kiểm tra:
- IP hiện tại đã whitelist trong Atlas chưa
- `MONGO_URI` có đúng user/password/cluster không