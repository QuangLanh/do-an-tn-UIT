# 🛒 Hệ Thống Quản Lý Tạp Hóa

Ứng dụng quản lý tạp hóa được xây dựng với React 18 + TypeScript + Vite, sử dụng kiến trúc DDD (Domain-Driven Design).

## ✨ Tính năng chính

### 1. 🔐 Phân quyền người dùng
- **Admin**: Toàn quyền quản lý hệ thống
- **Nhân viên**: Xem và chỉnh sửa sản phẩm (không xóa)
- **Kế toán**: Xem báo cáo doanh thu

### 2. 📦 Quản lý sản phẩm (CRUD)
- Thêm, sửa, xóa sản phẩm
- Quản lý giá nhập, giá bán
- Tìm kiếm sản phẩm theo tên, danh mục, nhà cung cấp
- Hiển thị tồn kho realtime

### 3. 📊 Dashboard trực quan
- Thống kê doanh thu, lợi nhuận hôm nay
- Biểu đồ doanh thu 7 ngày gần nhất
- Top 5 sản phẩm bán chạy
- Cảnh báo sản phẩm sắp hết hàng

### 4. 🏪 Quản lý tồn kho thông minh
- Hiển thị sản phẩm sắp hết hàng (< 10 đơn vị)
- Cảnh báo tồn kho theo 3 mức: Thấp, Rất thấp, Hết hàng
- Gợi ý số lượng nhập hàng dựa trên doanh số trung bình
- Tính toán tổng giá trị tồn kho

### 5. 📈 Báo cáo và xuất PDF
- Báo cáo doanh thu 30 ngày gần nhất
- Top 10 sản phẩm bán chạy
- Phân tích tỷ suất lợi nhuận
- Xuất báo cáo ra file PDF

### 6. 🎨 UI/UX hiện đại
- Dark/Light mode
- Responsive design (mobile, tablet, desktop)
- Toast notifications
- Sidebar có thể toggle
- Loading states

## 🏗️ Kiến trúc DDD

```
src/
├── domains/              # Domain Layer - Business Logic
│   ├── products/
│   │   ├── entities/     # Product entity
│   │   ├── repositories/ # Data access interface
│   │   ├── services/     # Business logic
│   │   └── usecases/     # Use cases
│   ├── inventory/        # Inventory domain
│   ├── reports/          # Reports domain
│   └── users/            # Users & Auth domain
├── ui/                   # Presentation Layer
│   ├── components/       # Reusable components
│   ├── pages/            # Page components
│   ├── layouts/          # Layout components
│   └── hooks/            # Custom hooks
├── infra/                # Infrastructure Layer
│   ├── api/              # API clients
│   └── utils/            # Utilities
├── store/                # State Management (Zustand)
├── router/               # Routing configuration
└── main.tsx              # Entry point
```

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js >= 16
- Yarn (khuyến nghị) hoặc npm

### Bước 1: Cài đặt dependencies
```bash
yarn
```

### Bước 2: Chạy development server
```bash
yarn dev
```

Ứng dụng sẽ chạy tại: `http://localhost:5173`

### Bước 3: Build production
```bash
yarn build
```

### Bước 4: Preview production build
```bash
yarn preview
```

## 👥 Tài khoản demo

Sử dụng các tài khoản sau để đăng nhập:

### Admin (Toàn quyền)
- **Username**: `admin`
- **Password**: `admin123`

### Nhân viên (Không được xóa sản phẩm)
- **Username**: `employee`
- **Password**: `employee123`

### Kế toán (Chỉ xem báo cáo)
- **Username**: `accountant`
- **Password**: `accountant123`

## 🛠️ Tech Stack

### Core
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool

### Styling
- **TailwindCSS** - Utility-first CSS

### State Management
- **Zustand** - Lightweight state management

### Routing
- **React Router DOM v6** - Client-side routing

### Charts
- **Recharts** - Declarative charts

### PDF Export
- **jsPDF** - PDF generation
- **html2canvas** - HTML to canvas

### UI/UX
- **Lucide React** - Icons
- **React Hot Toast** - Toast notifications

## 📂 Cấu trúc file quan trọng

### Domain Layer
- `src/domains/products/entities/Product.ts` - Product entity định nghĩa
- `src/domains/products/repositories/ProductRepository.ts` - Data access layer
- `src/domains/products/services/ProductService.ts` - Business logic
- `src/domains/products/usecases/*.ts` - Use cases (CRUD operations)

### UI Layer
- `src/ui/components/*.tsx` - Reusable components
- `src/ui/layouts/*.tsx` - Layout components (Navbar, Sidebar)
- `src/ui/pages/*.tsx` - Page components

### State Management
- `src/store/authStore.ts` - Authentication state
- `src/store/themeStore.ts` - Theme (dark/light) state
- `src/store/sidebarStore.ts` - Sidebar state

### Infrastructure
- `src/infra/api/productApi.ts` - Product API factory
- `src/infra/api/apiService.ts` - Centralized API service
- `src/infra/utils/formatters.ts` - Formatting utilities

## 🎯 Các tính năng nâng cao đã implement

### 1. DDD Architecture
- Tách biệt rõ ràng giữa Domain, UI, và Infrastructure
- Business logic tập trung trong Domain layer
- Dễ dàng test và mở rộng

### 2. Type Safety với TypeScript
- Strongly typed
- Interfaces và types cho tất cả entities
- Autocomplete và IntelliSense tốt

### 3. State Persistence
- Authentication state được lưu trong localStorage (với JWT token từ backend)
- Theme preference được lưu
- Sidebar state được lưu

### 4. Responsive Design
- Mobile-first approach
- Sidebar toggle trên mobile
- Tables responsive với scroll

### 5. Dark Mode
- Smooth transition
- Persist user preference
- Apply to all components

### 6. Permission-based Access Control
- Route-level protection
- Component-level permission checks
- UI elements conditional rendering

## 📝 Lưu ý

### API Integration
- Frontend đã được tích hợp hoàn toàn với Backend API
- Tất cả dữ liệu được lấy từ backend thông qua REST API
- Xem [API_MIGRATION_GUIDE.md](./documents/API_MIGRATION_GUIDE.md) để hiểu chi tiết về migration

### PDF Export
- Chức năng xuất PDF capture toàn bộ nội dung trang báo cáo
- Hỗ trợ Dark mode khi xuất PDF
- File PDF tự động đặt tên theo ngày

### Performance
- Lazy loading cho charts
- Memoization cho expensive calculations
- Debounced search

## 🔧 Troubleshooting

### Port đã được sử dụng
```bash
# Thay đổi port trong vite.config.ts hoặc
yarn dev --port 3000
```

### Dependencies lỗi
```bash
# Xóa node_modules và lockfile rồi cài lại
rm -rf node_modules yarn.lock
yarn
```

### Build lỗi
```bash
# Clear cache và build lại
yarn build --force
```

## 📦 Scripts có sẵn

```bash
yarn dev      # Chạy development server
yarn build    # Build production
yarn preview  # Preview production build
yarn lint     # Chạy ESLint
```

## 🎨 Customization

### Thay đổi màu chính
Chỉnh sửa `tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      primary: {
        // Màu của bạn
      }
    }
  }
}
```

### Thêm domain mới
1. Tạo folder trong `src/domains/your-domain/`
2. Tạo entities, repositories, services, usecases
3. Export API từ `src/infra/api/`

## 📚 Tài liệu

Tất cả các tài liệu chi tiết được lưu trong thư mục [`documents/`](./documents/):
- [GETTING_STARTED.md](./documents/GETTING_STARTED.md) - Bắt đầu nhanh
- [USER_GUIDE.md](./documents/USER_GUIDE.md) - Hướng dẫn sử dụng
- [PROJECT_STRUCTURE.md](./documents/PROJECT_STRUCTURE.md) - Cấu trúc dự án
- [API_SERVICE_GUIDE.md](./documents/API_SERVICE_GUIDE.md) - Hướng dẫn API
- [FEATURES.md](./documents/FEATURES.md) - Danh sách tính năng
- [CHANGELOG.md](./documents/CHANGELOG.md) - Lịch sử thay đổi

## 📄 License

MIT License - Free to use for personal and commercial projects.

## 👨‍💻 Phát triển bởi

Hệ thống Quản Lý Tạp Hóa - 2024

---

**Happy Coding! 🚀**

Nếu có vấn đề gì, vui lòng tạo issue hoặc liên hệ support.

