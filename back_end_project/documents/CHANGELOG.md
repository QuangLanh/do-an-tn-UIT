# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-10-30

### Added

#### Core Features
- Complete NestJS backend application with TypeScript
- MongoDB Atlas integration with Mongoose ODM
- JWT-based authentication system
- Role-based access control (RBAC) with four roles: Admin, Staff, Manager, Accountant
- Swagger/OpenAPI documentation

#### Modules
- **Authentication Module**
  - User registration
  - User login with JWT token generation
  - Password hashing with bcrypt
  - JWT strategy for protected routes
  - Profile endpoint

- **User Management Module**
  - CRUD operations for users (Admin only)
  - User role management
  - Active/inactive user status
  - Last login tracking

- **Product Module**
  - Complete CRUD operations for products
  - Category management
  - Stock level tracking
  - Low stock alerts
  - Barcode support
  - Product search functionality
  - Stock update operations (add, subtract, set)

- **Order Module**
  - Create and manage sales orders
  - Multi-item order support
  - Automatic stock deduction
  - Tax and discount calculations
  - Order status tracking (pending, completed, cancelled)
  - Unique order number generation
  - Revenue statistics
  - Top-selling products analytics

- **Purchase Module**
  - Purchase order creation
  - Supplier management
  - Automatic stock updates on purchase
  - Purchase price tracking
  - Unique purchase number generation
  - Purchase statistics

- **Transaction Module**
  - Financial summary (revenue, cost, profit)
  - Profit margin calculation
  - Monthly transaction reports
  - Date range filtering

- **Report Module**
  - Revenue reports with customizable date ranges
  - PDF export functionality using PDFKit
  - Inventory reports
  - Low stock product reports
  - Top products analysis

- **Dashboard Module**
  - Real-time business metrics
  - Today's summary (revenue, orders, profit)
  - Monthly summary
  - Sales trends visualization
  - Low stock alerts
  - Recent activity tracking
  - Orders trend over configurable days

#### Security Features
- JWT authentication with configurable expiration
- Role-based guards for route protection
- Password hashing with bcrypt (salt rounds: 10)
- CORS configuration for frontend integration
- Global exception filter
- Input validation with class-validator

#### API Features
- RESTful API design
- Global validation pipe
- Swagger documentation with examples
- Bearer token authentication
- Query parameters for filtering
- Pagination support

#### Documentation
- Comprehensive README.md
- API usage examples (API_USAGE_EXAMPLES.md)
- Deployment guide (DEPLOYMENT_GUIDE.md)
- Project structure documentation
- Environment configuration examples

#### Configuration
- Environment-based configuration
- MongoDB connection configuration
- JWT configuration
- CORS configuration
- Logging configuration

### Technical Details

#### Database Schemas
- User schema with role and authentication fields
- Product schema with stock management
- Order schema with items array and calculations
- Purchase schema with supplier information
- Indexed fields for better query performance

#### Guards and Decorators
- JwtAuthGuard for authentication
- RolesGuard for authorization
- @Roles decorator for role-based access
- @CurrentUser decorator for accessing user data

#### Error Handling
- Global exception filter
- Structured error responses
- Timestamp and path logging
- Meaningful error messages

#### Logging
- NestJS built-in logger
- Request/response logging
- Error logging with stack traces
- User activity logging

### Dependencies

#### Production Dependencies
- @nestjs/common: ^10.0.0
- @nestjs/core: ^10.0.0
- @nestjs/mongoose: ^10.0.2
- @nestjs/jwt: ^10.2.0
- @nestjs/passport: ^10.0.3
- @nestjs/swagger: ^7.1.17
- mongoose: ^8.0.3
- passport-jwt: ^4.0.1
- bcrypt: ^5.1.1
- class-validator: ^0.14.0
- pdfkit: ^0.14.0

#### Development Dependencies
- @nestjs/cli: ^10.0.0
- @typescript-eslint/eslint-plugin: ^6.0.0
- eslint: ^8.42.0
- prettier: ^3.0.0
- typescript: ^5.1.3

### API Endpoints

#### Authentication
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/profile

#### Users (Admin only)
- GET /api/users
- GET /api/users/:id
- POST /api/users
- PATCH /api/users/:id
- DELETE /api/users/:id

#### Products
- GET /api/products
- GET /api/products/:id
- POST /api/products
- PATCH /api/products/:id
- PATCH /api/products/:id/stock
- DELETE /api/products/:id
- GET /api/products/low-stock
- GET /api/products/categories

#### Orders
- GET /api/orders
- GET /api/orders/:id
- POST /api/orders
- PATCH /api/orders/:id/status
- GET /api/orders/statistics
- GET /api/orders/top-products

#### Purchases
- GET /api/purchases
- GET /api/purchases/:id
- POST /api/purchases
- GET /api/purchases/statistics
- GET /api/purchases/suppliers

#### Transactions
- GET /api/transactions/summary
- GET /api/transactions/monthly

#### Reports
- GET /api/reports/revenue
- GET /api/reports/revenue/export (PDF)
- GET /api/reports/inventory

#### Dashboard
- GET /api/dashboard/summary
- GET /api/dashboard/top-products
- GET /api/dashboard/orders-trend
- GET /api/dashboard/recent-activity

### Known Issues
- None at initial release

### Future Enhancements
- [ ] Add email notifications
- [ ] Implement caching with Redis
- [ ] Add real-time updates with WebSocket
- [ ] Implement product images upload
- [ ] Add barcode scanning support
- [ ] Create admin dashboard UI
- [ ] Add customer management module
- [ ] Implement loyalty points system
- [ ] Add multi-language support
- [ ] Create mobile app integration

---

## [1.1.0] - 2024-10-30

### Changed
- **Major Update: Role-Based Access Control (RBAC)**
  - Updated from 3 roles to 4 roles: Admin, Staff, Manager, Accountant
  - Replaced `EMPLOYEE` role with `STAFF` role
  - Replaced `VIEWER` role with `ACCOUNTANT` role
  - Added new `MANAGER` role

### Added
- New endpoints:
  - `GET /api/orders/:id/invoice` - Get order invoice
  - `PATCH /api/purchases/:id` - Update purchase
  - `DELETE /api/purchases/:id` - Delete purchase
  - `DELETE /api/orders/:id` - Delete order
  - `GET /api/reports/summary` - Get report summary
  - `GET /api/reports/profit` - Get profit report
  - `GET /api/dashboard/overview` - Dashboard overview (alias)

### Updated
- **Auth Module**:
  - `POST /api/auth/register` now requires Admin role
- **User Module**:
  - `GET /api/users` now accessible by Admin and Manager
- **Product Module**:
  - `POST /api/products` now requires Admin or Manager
  - `PATCH /api/products/:id` now requires Admin or Manager
  - `GET /api/products` accessible by all roles
- **Order Module**:
  - `GET /api/orders` accessible by Admin, Manager, Accountant (Staff excluded)
  - `POST /api/orders` accessible by Staff and Admin
  - `PATCH /api/orders/:id/status` now Admin only
  - `DELETE /api/orders/:id` added (Admin only)
- **Purchase Module**:
  - `GET /api/purchases` accessible by Admin, Manager, Accountant
  - `POST /api/purchases` now requires Admin or Manager
  - Added update and delete endpoints (Admin only)
- **Transaction Module**:
  - All endpoints accessible by Admin, Manager, Accountant
- **Report Module**:
  - `GET /api/reports/export` now accessible by Admin and Accountant
  - Added profit report endpoint
- **Dashboard Module**:
  - All endpoints accessible by Admin, Manager, Accountant (Staff excluded)

### Database
- Updated seeder with 4 new roles:
  - Admin: `admin@taphoa.com` / `admin123`
  - Staff: `staff@taphoa.com` / `staff123`
  - Manager: `manager@taphoa.com` / `manager123`
  - Accountant: `accountant@taphoa.com` / `accountant123`

### Documentation
- Added `PERMISSIONS.md` with detailed permission matrix
- Updated all documentation files (.md) with new role information
- Updated API endpoint documentation with role requirements

---

## [Unreleased]

### Planned Features
- Email notifications for low stock
- Advanced analytics and charts
- Export to Excel functionality
- Batch operations for products
- Product variants support
- Advanced search with filters
- API rate limiting
- Two-factor authentication

---

**Note**: This is the initial release. Future versions will be documented here.

