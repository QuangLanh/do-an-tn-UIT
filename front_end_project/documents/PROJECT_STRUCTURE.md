# 🏗️ CẤU TRÚC PROJECT

## 📁 Tổng quan cấu trúc folder

```
front_end_project/
├── 📄 index.html                 # HTML entry point
├── 📄 package.json               # Dependencies & scripts
├── 📄 tsconfig.json              # TypeScript config
├── 📄 vite.config.ts             # Vite config
├── 📄 tailwind.config.js         # TailwindCSS config
├── 📄 postcss.config.js          # PostCSS config
├── 📄 .eslintrc.cjs              # ESLint config
├── 📄 .gitignore                 # Git ignore rules
│
├── 📂 public/                    # Static assets
│   └── vite.svg                  # Favicon
│
├── 📂 src/                       # Source code
│   ├── 📄 main.tsx               # React entry point
│   ├── 📄 UngDung.tsx            # Root component (App)
│   ├── 📄 chi-so.css             # Global styles
│   │
│   ├── 📂 linh-vuc/              # 🔵 DOMAIN LAYER (Business Logic)
│   │   │
│   │   ├── 📂 products/          # Product domain
│   │   │   ├── 📂 entities/
│   │   │   │   └── Product.ts    # Product entity & DTOs
│   │   │   ├── 📂 repositories/
│   │   │   │   └── ProductRepository.ts  # Data access layer
│   │   │   ├── 📂 services/
│   │   │   │   └── ProductService.ts     # Business logic
│   │   │   └── 📂 usecases/
│   │   │       ├── GetAllProducts.ts     # Use case: Get all
│   │   │       ├── CreateProduct.ts      # Use case: Create
│   │   │       ├── UpdateProduct.ts      # Use case: Update
│   │   │       └── DeleteProduct.ts      # Use case: Delete
│   │   │
│   │   ├── 📂 inventory/         # Inventory domain
│   │   │   ├── 📂 entities/
│   │   │   │   └── InventoryAlert.ts     # Alert entity
│   │   │   └── 📂 services/
│   │   │       └── InventoryService.ts   # Inventory logic
│   │   │
│   │   ├── 📂 reports/           # Reports domain
│   │   │   ├── 📂 entities/
│   │   │   │   └── Report.ts             # Report entities
│   │   │   └── 📂 services/
│   │   │       └── ReportService.ts      # Report generation
│   │   │
│   │   └── 📂 users/             # Users & Auth domain
│   │       ├── 📂 entities/
│   │       │   └── User.ts               # User entity
│   │       └── 📂 services/
│   │           └── AuthService.ts        # Authentication
│   │
│   ├── 📂 giao-dien/             # 🟢 PRESENTATION LAYER (UI)
│   │   │
│   │   ├── 📂 components/        # Reusable components
│   │   │   ├── HuyHieu.tsx       # Badge component
│   │   │   ├── NutBam.tsx        # Button component
│   │   │   ├── TheThongTin.tsx   # Card component
│   │   │   ├── NhapLieu.tsx      # Input component
│   │   │   ├── HopThoai.tsx      # Modal component
│   │   │   ├── TheThongKe.tsx    # Stat card component
│   │   │   └── BangDuLieu.tsx    # Table component
│   │   │
│   │   ├── 📂 layouts/           # Layout components
│   │   │   ├── BoCucChinh.tsx    # Main layout wrapper
│   │   │   ├── ThanhDieuHuong.tsx# Top navigation bar
│   │   │   └── ThanhBen.tsx      # Side menu
│   │   │
│   │   └── 📂 pages/             # Page components (đặt tên thuần Việt)
│   │       ├── TrangDangNhap.tsx
│   │       ├── TrangBangDieuKhien.tsx
│   │       ├── TrangSanPham.tsx
│   │       ├── TrangKiemKe.tsx
│   │       ├── TrangBaoCao.tsx
│   │       ├── TrangDonHang.tsx
│   │       ├── TrangNhapHang.tsx
│   │       ├── TrangTaoDonHang.tsx
│   │       ├── TrangTaoNhapHang.tsx
│   │       └── TrangKhongTimThay.tsx
│   │
│   ├── 📂 ha-tang/               # 🟣 INFRASTRUCTURE LAYER
│   │   ├── 📂 api/
│   │   │   ├── productApi.ts     # Product API factory
│   │   │   ├── orderApi.ts
│   │   │   ├── purchaseApi.ts
│   │   │   └── reportApi.ts
│   │   └── 📂 utils/
│   │       └── formatters.ts     # Utility functions
│   │
│   ├── 📂 kho-trang-thai/        # 🟡 STATE MANAGEMENT (Zustand)
│   │   ├── khoXacThuc.ts         # Auth state
│   │   ├── khoChuDe.ts           # Theme state
│   │   └── khoThanhBen.ts        # Sidebar state
│   │
│   └── 📂 dinh-tuyen/            # 🔴 ROUTING
│       ├── UngDungDinhTuyen.tsx  # Main router
│       └── TuyenBaoVe.tsx        # Protected route wrapper
│
└── 📚 documents/                 # Documentation
    ├── README.md                 # Documentation index
    ├── GETTING_STARTED.md        # Quick start guide
    ├── FEATURES.md               # Features list
    └── PROJECT_STRUCTURE.md      # This file
```

## 🎯 Chi tiết từng layer

### 🔵 DOMAIN LAYER (Business Logic)
**Mục đích:** Chứa toàn bộ business logic, không phụ thuộc UI

#### Entities
- Định nghĩa cấu trúc dữ liệu
- Interfaces và Types
- DTOs (Data Transfer Objects)

#### Repositories
- Interface để truy cập dữ liệu
- Mock implementation với localStorage
- Có thể thay bằng real API sau

#### Services
- Business logic chính
- Validation rules
- Calculations

#### UseCases
- Các case sử dụng cụ thể
- Orchestrate services và repositories
- Single Responsibility Principle

### 🟢 PRESENTATION LAYER (UI - `giao-dien/`)
**Mục đích:** Hiển thị UI và xử lý user interactions

#### Components
- Các component tái sử dụng (NutBam, NhapLieu, HuyHieu, BangDuLieu…)
- Props-driven
- TypeScript typed

#### Layouts
- BoCucChinh, ThanhDieuHuong, ThanhBen
- Consistent structure

#### Pages
- Các trang đặt tên thuần Việt (`TrangBangDieuKhien`, `TrangSanPham`, …)
- Connect to domain layer
- Handle routing

### 🟣 INFRASTRUCTURE LAYER (`ha-tang/`)
**Mục đích:** Technical details, utilities

#### API
- API clients (productApi, orderApi, purchaseApi, reportApi)
- Factory pattern
- Dependency injection

#### Utils
- Helper functions
- Formatters
- Constants

### 🟡 STATE MANAGEMENT (Zustand - `kho-trang-thai/`)
**Mục đích:** Global state management

- `khoXacThuc` - Authentication & user info
- `khoChuDe` - Dark/Light mode
- `khoThanhBen` - Sidebar open/close

### 🔴 ROUTING (React Router v6 - `dinh-tuyen/`)
**Mục đích:** Navigation và route protection

- `UngDungDinhTuyen` - Route definitions
- `TuyenBaoVe` - Auth guard
- Permission-based access

## 📊 Data Flow

```
User Action (UI)
    ↓
Component Event Handler
    ↓
UseCase (from API factory)
    ↓
Service (Business Logic)
    ↓
Repository (Data Access)
    ↓
LocalStorage (Mock DB)
    ↓
Return data back up the chain
    ↓
Update UI State
    ↓
Re-render Component
```

## 🔗 Dependencies giữa các layer

```
┌─────────────────────────────────────┐
│         UI Layer (Pages)            │
│  Depends on: Components, Layouts,   │
│  Domain UseCases, Stores            │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│       Domain Layer (UseCases)       │
│  Depends on: Services, Entities     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│       Domain Layer (Services)       │
│  Depends on: Repositories, Entities │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│    Domain Layer (Repositories)      │
│  Depends on: Entities only          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Infrastructure (Storage)       │
│  No dependencies                    │
└─────────────────────────────────────┘
```

## 🎨 Naming Conventions

### Files
- Components: `PascalCase.tsx` (e.g., `Button.tsx`)
- Services: `PascalCase.ts` (e.g., `ProductService.ts`)
- Stores: `camelCase.ts` (e.g., `authStore.ts`)
- Utils: `camelCase.ts` (e.g., `formatters.ts`)

### Variables
- Components: `PascalCase` (e.g., `const Button = () => {}`)
- Functions: `camelCase` (e.g., `const handleClick = () => {}`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `const API_URL = ''`)

### Interfaces
- Entities: `PascalCase` (e.g., `interface Product {}`)
- Props: `PascalCase + Props` (e.g., `interface ButtonProps {}`)
- DTOs: `PascalCase + Dto` (e.g., `type CreateProductDto`)

## 📝 Code Organization Rules

1. **One component per file**
2. **Related files in same directory**
3. **Index files for re-exports** (if needed)
4. **Types with implementation**
5. **Tests next to source** (future)

## 🔍 Tìm file nhanh

### Muốn sửa UI của sản phẩm?
→ `src/ui/pages/ProductsPage.tsx`

### Muốn thay đổi business logic sản phẩm?
→ `src/domains/products/services/ProductService.ts`

### Muốn thêm field mới cho Product?
→ `src/domains/products/entities/Product.ts`

### Muốn sửa màu theme?
→ `tailwind.config.js`

### Muốn thêm route mới?
→ `src/router/AppRouter.tsx`

### Muốn thêm global state?
→ `src/store/` (tạo file mới)

## 💡 Best Practices được áp dụng

✅ **Separation of Concerns** - Tách biệt rõ ràng
✅ **Single Responsibility** - Mỗi file một trách nhiệm
✅ **DRY (Don't Repeat Yourself)** - Tái sử dụng code
✅ **Type Safety** - TypeScript everywhere
✅ **Component Composition** - Tái sử dụng components
✅ **Unidirectional Data Flow** - Data flow một chiều
✅ **Immutability** - Không mutate state trực tiếp

## 🚀 Mở rộng project

### Thêm domain mới
1. Tạo folder trong `src/domains/new-domain/`
2. Tạo entities, repositories, services, usecases
3. Export API từ `src/infra/api/`

### Thêm page mới
1. Tạo file trong `src/ui/pages/`
2. Thêm route trong `src/router/AppRouter.tsx`
3. Thêm menu item trong `src/ui/layouts/Sidebar.tsx`

### Thêm component mới
1. Tạo file trong `src/ui/components/`
2. Export và import nơi cần dùng

### Thêm global state mới
1. Tạo store trong `src/store/`
2. Use hook trong components

---

**Cấu trúc này giúp project dễ maintain, test và scale! 🎯**

