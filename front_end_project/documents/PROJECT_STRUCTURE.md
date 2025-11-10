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
│   ├── 📄 App.tsx                # Root component
│   ├── 📄 index.css              # Global styles
│   │
│   ├── 📂 domains/               # 🔵 DOMAIN LAYER (Business Logic)
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
│   ├── 📂 ui/                    # 🟢 PRESENTATION LAYER (UI)
│   │   │
│   │   ├── 📂 components/        # Reusable components
│   │   │   ├── Badge.tsx         # Badge component
│   │   │   ├── Button.tsx        # Button component
│   │   │   ├── Card.tsx          # Card component
│   │   │   ├── Input.tsx         # Input component
│   │   │   ├── Modal.tsx         # Modal component
│   │   │   ├── StatCard.tsx      # Stat card component
│   │   │   └── Table.tsx         # Table component
│   │   │
│   │   ├── 📂 layouts/           # Layout components
│   │   │   ├── MainLayout.tsx    # Main layout wrapper
│   │   │   ├── Navbar.tsx        # Top navigation bar
│   │   │   └── Sidebar.tsx       # Side menu
│   │   │
│   │   └── 📂 pages/             # Page components
│   │       ├── LoginPage.tsx     # Login page
│   │       ├── DashboardPage.tsx # Dashboard page
│   │       ├── ProductsPage.tsx  # Products management page
│   │       ├── InventoryPage.tsx # Inventory page
│   │       ├── ReportsPage.tsx   # Reports page
│   │       └── NotFoundPage.tsx  # 404 page
│   │
│   ├── 📂 infra/                 # 🟣 INFRASTRUCTURE LAYER
│   │   ├── 📂 api/
│   │   │   └── productApi.ts     # Product API factory
│   │   └── 📂 utils/
│   │       └── formatters.ts     # Utility functions
│   │
│   ├── 📂 store/                 # 🟡 STATE MANAGEMENT
│   │   ├── authStore.ts          # Auth state (Zustand)
│   │   ├── themeStore.ts         # Theme state (Zustand)
│   │   └── sidebarStore.ts       # Sidebar state (Zustand)
│   │
│   └── 📂 router/                # 🔴 ROUTING
│       ├── AppRouter.tsx         # Main router
│       └── ProtectedRoute.tsx    # Protected route wrapper
│
└── 📚 Docs/                      # Documentation
    ├── README.md                 # Main documentation (English)
    ├── HUONG_DAN.md              # Vietnamese guide
    ├── QUICK_START.md            # Quick start guide
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

### 🟢 PRESENTATION LAYER (UI)
**Mục đích:** Hiển thị UI và xử lý user interactions

#### Components
- Reusable components
- Props-driven
- TypeScript typed

#### Layouts
- Layout wrappers
- Navbar, Sidebar
- Consistent structure

#### Pages
- Full page components
- Connect to domain layer
- Handle routing

### 🟣 INFRASTRUCTURE LAYER
**Mục đích:** Technical details, utilities

#### API
- API clients
- Factory pattern
- Dependency injection

#### Utils
- Helper functions
- Formatters
- Constants

### 🟡 STATE MANAGEMENT (Zustand)
**Mục đích:** Global state management

- `authStore` - Authentication & user info
- `themeStore` - Dark/Light mode
- `sidebarStore` - Sidebar open/close

### 🔴 ROUTING (React Router v6)
**Mục đích:** Navigation và route protection

- `AppRouter` - Route definitions
- `ProtectedRoute` - Auth guard
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

