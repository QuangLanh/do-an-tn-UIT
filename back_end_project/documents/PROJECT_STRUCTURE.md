# Project Structure Documentation

This document explains the organization and architecture of the Grocery Store Management Backend.

## 📂 Directory Structure

```
back_end_project/
│
├── src/                                    # Source code
│   │
│   ├── phan-he/                            # Feature modules (Domain Layer)
│   │   │
│   │   ├── xac-thuc/                       # Authentication Module
│   │   │   ├── dto/                       # Data Transfer Objects
│   │   │   │   ├── dang-nhap.dto.ts       # Login request DTO
│   │   │   │   └── dang-ky.dto.ts         # Register request DTO
│   │   │   ├── chien-luoc/                # Passport strategies
│   │   │   │   ├── chien-luoc-jwt.ts      # JWT validation strategy
│   │   │   │   └── chien-luoc-dia-phuong.ts # Local auth strategy
│   │   │   ├── xac-thuc.dieu-khien.ts     # Auth controller
│   │   │   ├── xac-thuc.dich-vu.ts        # Auth service
│   │   │   └── xac-thuc.phan-he.ts        # Auth module definition
│   │   │
│   │   ├── nguoi-dung/                    # User Management Module
│   │   │   ├── schemas/                   # Database schemas
│   │   │   │   └── user.schema.ts
│   │   │   ├── dto/                       # DTOs
│   │   │   │   ├── tao-nguoi-dung.dto.ts
│   │   │   │   └── cap-nhat-nguoi-dung.dto.ts
│   │   │   ├── nguoi-dung.dieu-khien.ts
│   │   │   ├── nguoi-dung.dich-vu.ts
│   │   │   └── nguoi-dung.phan-he.ts
│   │   │
│   │   ├── san-pham/
│   │   │   ├── schemas/product.schema.ts
│   │   │   ├── dto/
│   │   │   │   ├── tao-san-pham.dto.ts
│   │   │   │   ├── cap-nhat-san-pham.dto.ts
│   │   │   │   └── cap-nhat-ton-kho.dto.ts
│   │   │   ├── san-pham.dieu-khien.ts
│   │   │   ├── san-pham.dich-vu.ts
│   │   │   └── san-pham.phan-he.ts
│   │   │
│   │   ├── don-hang/
│   │   │   ├── schemas/order.schema.ts
│   │   │   ├── dto/
│   │   │   │   ├── tao-don-hang.dto.ts
│   │   │   │   └── cap-nhat-trang-thai-don-hang.dto.ts
│   │   │   ├── don-hang.dieu-khien.ts
│   │   │   ├── don-hang.dich-vu.ts
│   │   │   └── don-hang.phan-he.ts
│   │   │
│   │   ├── nhap-hang/
│   │   │   ├── schemas/purchase.schema.ts
│   │   │   ├── dto/
│   │   │   │   ├── tao-nhap-hang.dto.ts
│   │   │   │   └── goi-y-nhap-hang.dto.ts
│   │   │   ├── nhap-hang.dieu-khien.ts
│   │   │   ├── nhap-hang.dich-vu.ts
│   │   │   └── nhap-hang.phan-he.ts
│   │   │
│   │   ├── giao-dich/                      # Transaction Aggregation Module
│   │   │   ├── giao-dich.dieu-khien.ts
│   │   │   ├── giao-dich.dich-vu.ts
│   │   │   └── giao-dich.phan-he.ts
│   │   │
│   │   ├── bao-cao/
│   │   │   ├── bao-cao.dieu-khien.ts
│   │   │   ├── bao-cao.dich-vu.ts
│   │   │   └── bao-cao.phan-he.ts
│   │   │
│   │   └── bang-dieu-khien/
│   │       ├── bang-dieu-khien.dieu-khien.ts
│   │       ├── bang-dieu-khien.dich-vu.ts
│   │       └── bang-dieu-khien.phan-he.ts
│   │
│   ├── dung-chung/                          # Shared resources
│   │   │
│   │   ├── trang-tri/                      # Decorators
│   │   │   ├── vai-tro.trang-tri.ts
│   │   │   └── nguoi-dung-hien-tai.trang-tri.ts
│   │   │
│   │   ├── bao-ve/                          # Route guards
│   │   │   ├── bao-ve-jwt.ts
│   │   │   └── bao-ve-vai-tro.ts
│   │   │
│   │   ├── bo-loc/                          # Exception filters
│   │   │   └── bo-loc-ngoai-le-http.ts
│   │   │
│   │   ├── liet-ke/                        # Shared enums
│   │   │   ├── vai-tro-nguoi-dung.enum.ts
│   │   │   ├── trang-thai-don-hang.enum.ts
│   │   │   └── loai-giao-dich.enum.ts
│   │   │
│   │   └── giao-dien/                      # Interfaces
│   │       └── jwt-payload.giao-dien.ts
│   │
│   ├── cau-hinh/                            # Configuration files
│   │   ├── cau-hinh-co-so-du-lieu.ts
│   │   └── cau-hinh-jwt.ts
│   │
│   ├── ung-dung.phan-he.ts                  # Root application module
│   ├── ung-dung.dieu-khien.ts               # Root controller (health checks)
│   ├── ung-dung.dich-vu.ts                  # Root service
│   ├── main.ts                              # Application entry point
│   └── gieo-du-lieu.ts                      # Database seeder
│
├── uploads/                               # Upload directory
│   └── pdfs/                              # Generated PDF files
│
├── .env                                   # Environment variables (not in git)
├── .env.example                           # Environment template
├── .gitignore                             # Git ignore rules
├── .eslintrc.js                           # ESLint configuration
├── .prettierrc                            # Prettier configuration
├── nest-cli.json                          # NestJS CLI configuration
├── package.json                           # Project dependencies
├── tsconfig.json                          # TypeScript configuration
├── README.md                              # Main documentation (English)
└── documents/
    ├── USER_GUIDE.md                      # Vietnamese guide
    ├── API_USAGE_EXAMPLES.md             # API usage examples
    ├── DEPLOYMENT_GUIDE.md                # Deployment instructions
    ├── CHANGELOG.md                       # Version history
    ├── QUICK_START_GUIDE.md               # Quick start guide
    ├── GETTING_STARTED.md                 # Getting started guide
    ├── PERMISSIONS.md                     # RBAC permissions
    ├── UPDATE_SUMMARY.md                  # Update summary
    ├── PROJECT_STRUCTURE.md               # This file
    └── README.md                          # Documents index
```

## 🏗️ Architecture Layers

### 1. Presentation Layer (Controllers)
- **Location**: `*.controller.ts` in each module
- **Purpose**: Handle HTTP requests/responses
- **Responsibilities**:
  - Define API endpoints
  - Validate request data (DTOs)
  - Call service layer methods
  - Return formatted responses
  - Apply guards and decorators

Example:
```typescript
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
  @Get()
  findAll(@Query() query: any) {
    return this.productService.findAll(query);
  }
}
```

### 2. Application Layer (Services)
- **Location**: `*.service.ts` in each module
- **Purpose**: Business logic implementation
- **Responsibilities**:
  - Implement business rules
  - Coordinate between different modules
  - Handle transactions
  - Process data
  - Call database operations

Example:
```typescript
@Injectable()
export class OrderService {
  async create(createOrderDto: CreateOrderDto, userId: string) {
    // Business logic here
    // Validate products, calculate totals, update stock, etc.
  }
}
```

### 3. Domain Layer (Schemas/Entities)
- **Location**: `schemas/` directories
- **Purpose**: Define data models
- **Responsibilities**:
  - Define data structure
  - Set validation rules
  - Create indexes
  - Define relationships

Example:
```typescript
@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;
  
  @Prop({ required: true })
  price: number;
}
```

### 4. Infrastructure Layer (Config, Database)
- **Location**: `config/` directory
- **Purpose**: External dependencies
- **Responsibilities**:
  - Database connections
  - Third-party services
  - Configuration management

## 🔄 Data Flow

```
Client Request
    ↓
Controller (Presentation)
    ↓
Guards & Decorators (Security)
    ↓
Service (Application Logic)
    ↓
Repository/Schema (Data Access)
    ↓
MongoDB Database
    ↓
Response back through layers
```

## 📦 Module Structure

Each feature module follows this structure:

```
module-name/
├── dto/                    # Data Transfer Objects
│   ├── create-*.dto.ts    # Creation DTOs
│   └── update-*.dto.ts    # Update DTOs
├── schemas/               # Database schemas
│   └── *.schema.ts
├── *.controller.ts        # HTTP endpoints
├── *.service.ts           # Business logic
└── *.module.ts           # Module definition
```

## 🔐 Security Components

### Guards
Located in `src/common/guards/`

1. **JwtAuthGuard**: Validates JWT tokens
2. **RolesGuard**: Checks user roles/permissions

### Decorators
Located in `src/common/decorators/`

1. **@Roles()**: Specify required roles for endpoints
2. **@CurrentUser()**: Extract user from request

Usage:
```typescript
@Get()
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
findAll(@CurrentUser() user) {
  // Only admins can access
}
```

## 📊 Database Schema Design

### Collections

1. **users** - User accounts and authentication
2. **products** - Product inventory
3. **orders** - Sales orders with embedded items
4. **purchases** - Purchase orders with embedded items

### Relationships

- **Orders → User**: Many-to-One (createdBy)
- **Orders → Products**: Many-to-Many (via items array)
- **Purchases → User**: Many-to-One (createdBy)
- **Purchases → Products**: Many-to-Many (via items array)

### Indexes

Performance indexes are created on:
- `users.email` (unique)
- `products.sku` (unique)
- `orders.orderNumber` (unique)
- `orders.status`
- `purchases.purchaseNumber` (unique)
- Text indexes for search functionality

## 🎯 Design Patterns Used

### 1. Module Pattern
Each feature is isolated in its own module with clear boundaries.

### 2. Repository Pattern
Services interact with database through Mongoose models (repositories).

### 3. Dependency Injection
NestJS built-in DI container manages dependencies.

### 4. DTO Pattern
Data Transfer Objects validate and transform data.

### 5. Strategy Pattern
Passport strategies for different authentication methods.

### 6. Guard Pattern
Route protection with reusable guards.

## 🔧 Configuration Files

### tsconfig.json
TypeScript compiler configuration with path aliases:
```json
{
  "paths": {
    "@common/*": ["src/common/*"],
    "@config/*": ["src/config/*"],
    "@modules/*": ["src/modules/*"]
  }
}
```

### nest-cli.json
NestJS CLI configuration for building and development.

### .eslintrc.js
Code quality rules and linting configuration.

### .prettierrc
Code formatting rules.

## 📝 Naming Conventions

### Files
- Controllers: `*.controller.ts`
- Services: `*.service.ts`
- Modules: `*.module.ts`
- Schemas: `*.schema.ts`
- DTOs: `*.dto.ts`
- Guards: `*.guard.ts`
- Decorators: `*.decorator.ts`

### Classes
- Controllers: `ProductController`
- Services: `ProductService`
- DTOs: `CreateProductDto`
- Schemas: `Product`

### Variables
- camelCase for variables: `userName`
- UPPER_CASE for constants: `JWT_SECRET`
- PascalCase for classes: `UserService`

## 🚀 Module Dependencies

```
AppModule
├── ConfigModule (Global)
├── MongooseModule (Global)
├── AuthModule
│   └── UserModule
├── ProductModule
├── OrderModule
│   └── ProductModule
├── PurchaseModule
│   └── ProductModule
├── TransactionModule
│   ├── OrderModule
│   └── PurchaseModule
├── ReportModule
│   ├── TransactionModule
│   ├── OrderModule
│   ├── PurchaseModule
│   └── ProductModule
└── DashboardModule
    ├── TransactionModule
    ├── OrderModule
    └── ProductModule
```

## 📚 Additional Resources

- **API Documentation**: Available at `/api/docs` (Swagger UI)
- **Main README**: `README.md`
- **Vietnamese Guide**: `documents/USER_GUIDE.md`
- **API Examples**: `documents/API_USAGE_EXAMPLES.md`
- **Deployment Guide**: `documents/DEPLOYMENT_GUIDE.md`

---

This structure provides:
- ✅ Clear separation of concerns
- ✅ Scalability
- ✅ Maintainability
- ✅ Testability
- ✅ Reusability

