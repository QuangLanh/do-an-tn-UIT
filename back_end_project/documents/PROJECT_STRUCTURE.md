# Project Structure Documentation

This document explains the organization and architecture of the Grocery Store Management Backend.

## 📂 Directory Structure

```
back_end_project/
│
├── src/                                    # Source code
│   │
│   ├── modules/                           # Feature modules (Domain Layer)
│   │   │
│   │   ├── auth/                          # Authentication Module
│   │   │   ├── dto/                       # Data Transfer Objects
│   │   │   │   ├── login.dto.ts          # Login request DTO
│   │   │   │   └── register.dto.ts       # Register request DTO
│   │   │   ├── strategies/               # Passport strategies
│   │   │   │   ├── jwt.strategy.ts       # JWT validation strategy
│   │   │   │   └── local.strategy.ts     # Local auth strategy
│   │   │   ├── auth.controller.ts        # Auth endpoints
│   │   │   ├── auth.service.ts           # Auth business logic
│   │   │   └── auth.module.ts            # Auth module definition
│   │   │
│   │   ├── user/                          # User Management Module
│   │   │   ├── schemas/                   # Database schemas
│   │   │   │   └── user.schema.ts        # User mongoose schema
│   │   │   ├── dto/                       # DTOs
│   │   │   │   ├── create-user.dto.ts    # Create user DTO
│   │   │   │   └── update-user.dto.ts    # Update user DTO
│   │   │   ├── user.controller.ts        # User endpoints
│   │   │   ├── user.service.ts           # User business logic
│   │   │   └── user.module.ts            # User module definition
│   │   │
│   │   ├── product/                       # Product Management Module
│   │   │   ├── schemas/
│   │   │   │   └── product.schema.ts     # Product schema
│   │   │   ├── dto/
│   │   │   │   ├── create-product.dto.ts
│   │   │   │   ├── update-product.dto.ts
│   │   │   │   └── update-stock.dto.ts   # Stock management DTO
│   │   │   ├── product.controller.ts
│   │   │   ├── product.service.ts
│   │   │   └── product.module.ts
│   │   │
│   │   ├── order/                         # Order Management Module
│   │   │   ├── schemas/
│   │   │   │   └── order.schema.ts       # Order & OrderItem schemas
│   │   │   ├── dto/
│   │   │   │   ├── create-order.dto.ts
│   │   │   │   └── update-order-status.dto.ts
│   │   │   ├── order.controller.ts
│   │   │   ├── order.service.ts
│   │   │   └── order.module.ts
│   │   │
│   │   ├── purchase/                      # Purchase Management Module
│   │   │   ├── schemas/
│   │   │   │   └── purchase.schema.ts    # Purchase schema
│   │   │   ├── dto/
│   │   │   │   └── create-purchase.dto.ts
│   │   │   ├── purchase.controller.ts
│   │   │   ├── purchase.service.ts
│   │   │   └── purchase.module.ts
│   │   │
│   │   ├── transaction/                   # Transaction Aggregation Module
│   │   │   ├── transaction.controller.ts # Transaction endpoints
│   │   │   ├── transaction.service.ts    # Transaction calculations
│   │   │   └── transaction.module.ts
│   │   │
│   │   ├── report/                        # Reporting Module
│   │   │   ├── report.controller.ts      # Report endpoints
│   │   │   ├── report.service.ts         # Report generation & PDF
│   │   │   └── report.module.ts
│   │   │
│   │   └── dashboard/                     # Dashboard Module
│   │       ├── dashboard.controller.ts   # Dashboard endpoints
│   │       ├── dashboard.service.ts      # Dashboard data aggregation
│   │       └── dashboard.module.ts
│   │
│   ├── common/                            # Shared resources
│   │   │
│   │   ├── decorators/                    # Custom decorators
│   │   │   ├── roles.decorator.ts        # @Roles decorator for RBAC
│   │   │   └── current-user.decorator.ts # @CurrentUser decorator
│   │   │
│   │   ├── guards/                        # Route guards
│   │   │   ├── jwt-auth.guard.ts         # JWT authentication guard
│   │   │   └── roles.guard.ts            # Role-based authorization guard
│   │   │
│   │   ├── filters/                       # Exception filters
│   │   │   └── http-exception.filter.ts  # Global exception handler
│   │   │
│   │   ├── enums/                         # Shared enumerations
│   │   │   ├── user-role.enum.ts         # User roles
│   │   │   ├── order-status.enum.ts      # Order statuses
│   │   │   └── transaction-type.enum.ts  # Transaction types
│   │   │
│   │   └── interfaces/                    # Type definitions
│   │       └── jwt-payload.interface.ts  # JWT token payload
│   │
│   ├── config/                            # Configuration files
│   │   ├── database.config.ts            # MongoDB configuration
│   │   └── jwt.config.ts                 # JWT configuration
│   │
│   ├── app.module.ts                      # Root application module
│   ├── app.controller.ts                  # Root controller (health checks)
│   ├── app.service.ts                     # Root service
│   └── main.ts                            # Application entry point
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

