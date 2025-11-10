# 🛒 Grocery Store Management System - Backend API

A comprehensive backend API for managing a grocery store, built with NestJS, MongoDB, and following Domain-Driven Design (DDD) principles.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Authentication & Authorization](#authentication--authorization)
- [API Endpoints](#api-endpoints)
- [Documentation](#documentation)
- [Contributing](#contributing)

## 🌟 Overview

This backend system provides a complete solution for managing grocery store operations including:
- Product inventory management
- Order processing (sales)
- Purchase management (stock replenishment)
- Financial reporting and analytics
- User management with role-based access control
- PDF report generation

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Four user roles: Admin, Staff, Manager, Accountant
- Secure password hashing with bcrypt

### 📦 Product Management
- Complete CRUD operations for products
- Category management
- Stock level tracking
- Low stock alerts
- Barcode support
- Product search functionality

### 🛍️ Order Management
- Create and manage sales orders
- Multi-item order support
- Automatic stock deduction
- Tax and discount calculations
- Order status tracking
- Revenue statistics and reports

### 📥 Purchase Management
- Purchase order creation
- Supplier management
- Automatic stock updates
- Cost tracking
- Purchase history and analytics
- **Smart purchase recommendations** based on sales data
  - High priority: Fast-selling products with low stock
  - Medium priority: Products approaching low stock levels
  - Low priority: Slow-selling products (suggest purchasing less)
  - Calculates recommended quantity based on sales velocity, lead time, and safety stock

### 💰 Transaction & Reporting
- Comprehensive financial summaries
- Revenue, cost, and profit calculations
- Monthly transaction reports
- Top-selling products analytics
- PDF report generation
- Inventory valuation reports

### 📊 Dashboard
- Real-time business metrics
- Today's and monthly summaries
- Sales trends visualization
- Low stock alerts
- Recent activity tracking

## 🚀 Tech Stack

- **Framework**: NestJS 10.x (TypeScript)
- **Database**: MongoDB Atlas (Cloud)
- **ODM**: Mongoose
- **Authentication**: JWT + Passport
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **PDF Generation**: PDFKit
- **Security**: bcrypt, CORS

## 🏗️ Architecture

This project follows **Domain-Driven Design (DDD)** principles:

```
src/
├── modules/           # Domain modules
│   ├── auth/         # Authentication logic
│   ├── user/         # User management
│   ├── product/      # Product domain
│   ├── order/        # Order domain
│   ├── purchase/     # Purchase domain
│   ├── transaction/  # Transaction aggregation
│   ├── report/       # Reporting & PDF
│   └── dashboard/    # Dashboard data
├── common/           # Shared resources
│   ├── decorators/   # Custom decorators
│   ├── guards/       # Auth & role guards
│   ├── filters/      # Exception filters
│   ├── enums/        # Shared enumerations
│   └── interfaces/   # Type definitions
├── config/           # Configuration files
│   ├── database.config.ts
│   └── jwt.config.ts
└── main.ts           # Application entry point
```

## 🎯 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd back_end_project
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Setup environment variables**
   
   Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your MongoDB Atlas credentials:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/taphoa
   JWT_SECRET=your_secret_key_here
   PORT=4000
   FRONTEND_URL=http://localhost:5173
   ```

4. **Run the application**
   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

5. **Access the API**
   - API: `http://localhost:4000/api`
   - Swagger Documentation: `http://localhost:4000/api/docs`

## 📚 API Documentation

Interactive API documentation is available via Swagger UI at:
```
http://localhost:4000/api/docs
```

The Swagger interface provides:
- Complete endpoint documentation
- Request/response schemas
- Try-it-out functionality
- Authentication testing

## 📁 Project Structure

```
back_end_project/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── dto/
│   │   │   ├── strategies/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   ├── user/
│   │   │   ├── dto/
│   │   │   ├── schemas/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   └── user.module.ts
│   │   ├── product/
│   │   ├── order/
│   │   ├── purchase/
│   │   ├── transaction/
│   │   ├── report/
│   │   └── dashboard/
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── enums/
│   │   │   ├── user-role.enum.ts
│   │   │   ├── order-status.enum.ts
│   │   │   └── transaction-type.enum.ts
│   │   └── interfaces/
│   │       └── jwt-payload.interface.ts
│   ├── config/
│   │   ├── database.config.ts
│   │   └── jwt.config.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts
├── .env
├── .env.example
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md
```

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT signing | `your_super_secret_key` |
| `JWT_EXPIRATION` | JWT token expiration time | `7d` |
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment mode | `development` / `production` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `PDF_STORAGE_PATH` | Path for PDF storage | `./uploads/pdfs` |
| `LOG_LEVEL` | Logging level | `debug` / `info` / `error` |

## 📜 Available Scripts

```bash
# Development
npm run start:dev        # Start development server with hot-reload

# Production
npm run build            # Build for production
npm run start:prod       # Start production server

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:cov         # Run tests with coverage
npm run test:e2e         # Run end-to-end tests

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
```

## 🔐 Authentication & Authorization

### User Roles

1. **Admin** - Full system access
   - Manage users and permissions
   - Full CRUD on all entities (products, orders, purchases)
   - View all reports and statistics
   - Export PDF reports

2. **Staff** - Sales staff access
   - Create new orders
   - Add products to orders
   - Calculate totals, discounts, print invoices
   - Cannot edit/delete orders created by others
   - Cannot view financial reports
   - Cannot manage users

3. **Manager** - Store management access
   - View and approve orders
   - Track inventory and purchases
   - Create and manage products
   - View comprehensive revenue, cost, and profit reports
   - Cannot create new accounts or manage permissions
   - Cannot delete orders

4. **Accountant** - Read-only financial access
   - View revenue, cost, and actual profit
   - View transaction history
   - Export reports (PDF/Excel)
   - Read-only access (no CRUD operations)

### Getting Started with Auth

1. **Register a new user**
   ```bash
   POST /api/auth/register
   {
     "email": "user@example.com",
     "password": "password123",
     "fullName": "John Doe"
   }
   ```

2. **Login**
   ```bash
   POST /api/auth/login
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```

3. **Use the token**
   
   Include the JWT token in subsequent requests:
   ```
   Authorization: Bearer <your_token>
   ```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (Admin only)
- `POST /api/auth/login` - User login (Public)
- `GET /api/auth/profile` - Get current user profile (All roles)

### Users
- `GET /api/users` - Get all users (Admin, Manager)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `POST /api/users` - Create new user (Admin only)
- `PATCH /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Products
- `GET /api/products` - Get all products (All roles)
- `GET /api/products/:id` - Get product by ID (All roles)
- `POST /api/products` - Create new product (Admin, Manager)
- `PATCH /api/products/:id` - Update product (Admin, Manager)
- `PATCH /api/products/:id/stock` - Update stock level (Admin, Manager)
- `DELETE /api/products/:id` - Delete product (Admin only)
- `GET /api/products/low-stock` - Get low stock products (All roles)
- `GET /api/products/categories` - Get all categories (All roles)

### Orders
- `GET /api/orders` - Get all orders (Admin, Manager, Accountant)
- `GET /api/orders/:id` - Get order by ID (All roles)
- `POST /api/orders` - Create new order (Staff, Admin)
- `PATCH /api/orders/:id/status` - Update order status (Admin only)
- `DELETE /api/orders/:id` - Delete order (Admin only)
- `GET /api/orders/:id/invoice` - Get order invoice (Staff, Manager, Accountant)
- `GET /api/orders/statistics` - Get order statistics (Admin, Manager, Accountant)
- `GET /api/orders/top-products` - Get top selling products (All roles)

### Purchases
- `GET /api/purchases` - Get all purchases (Admin, Manager, Accountant)
- `GET /api/purchases/:id` - Get purchase by ID (Admin, Manager, Accountant)
- `POST /api/purchases` - Create new purchase (Admin, Manager)
- `PATCH /api/purchases/:id` - Update purchase (Admin only)
- `DELETE /api/purchases/:id` - Delete purchase (Admin only)
- `GET /api/purchases/statistics` - Get purchase statistics (Admin, Manager, Accountant)
- `GET /api/purchases/suppliers` - Get all suppliers (All roles)
- `GET /api/purchases/recommendations` - Get purchase recommendations with priority levels (Admin, Manager)
- `GET /api/purchases/recommendations/high-priority` - Get high priority recommendations (Admin, Manager)
- `GET /api/purchases/recommendations/low-priority` - Get low priority recommendations (Admin, Manager)

### Transactions
- `GET /api/transactions/summary` - Get transaction summary (Admin, Manager, Accountant)
- `GET /api/transactions/monthly` - Get monthly transaction data (Admin, Manager, Accountant)

### Reports
- `GET /api/reports/summary` - Get report summary (Admin, Manager, Accountant)
- `GET /api/reports/revenue` - Get revenue report (Admin, Manager, Accountant)
- `GET /api/reports/profit` - Get profit report (Admin, Manager, Accountant)
- `GET /api/reports/export` - Export revenue report as PDF (Admin, Accountant)
- `GET /api/reports/inventory` - Get inventory report (Admin, Manager, Accountant)

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard overview (Admin, Manager, Accountant)
- `GET /api/dashboard/overview` - Get dashboard overview (Admin, Manager, Accountant)
- `GET /api/dashboard/top-products` - Get top products (Admin, Manager, Accountant)
- `GET /api/dashboard/orders-trend` - Get orders trend (Admin, Manager, Accountant)
- `GET /api/dashboard/recent-activity` - Get recent activity (Admin, Manager, Accountant)

## 🗄️ Database Schema

### User Collection
```typescript
{
  email: string (unique)
  password: string (hashed)
  fullName: string
  role: 'admin' | 'staff' | 'manager' | 'accountant'
  isActive: boolean
  phone?: string
  address?: string
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}
```

### Product Collection
```typescript
{
  name: string
  sku: string (unique)
  description?: string
  category: string
  purchasePrice: number
  salePrice: number
  stock: number
  minStockLevel: number
  unit?: string
  barcode?: string
  imageUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Order Collection
```typescript
{
  orderNumber: string (unique)
  items: [{
    product: ObjectId
    productName: string
    quantity: number
    price: number
    subtotal: number
  }]
  subtotal: number
  tax: number
  discount: number
  total: number
  status: 'pending' | 'completed' | 'cancelled'
  customerName?: string
  customerPhone?: string
  notes?: string
  paymentMethod?: string
  createdBy: ObjectId
  createdAt: Date
  updatedAt: Date
}
```

### Purchase Collection
```typescript
{
  purchaseNumber: string (unique)
  items: [{
    product: ObjectId
    productName: string
    quantity: number
    purchasePrice: number
    subtotal: number
  }]
  supplier: string
  supplierContact?: string
  total: number
  notes?: string
  status: string
  createdBy: ObjectId
  createdAt: Date
  updatedAt: Date
}
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add comments for complex logic
- Keep functions small and focused

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify your `MONGO_URI` in `.env`
   - Check MongoDB Atlas network access (whitelist IP)
   - Ensure correct username/password

2. **Port Already in Use**
   - Change `PORT` in `.env`
   - Kill process using the port: `lsof -ti:4000 | xargs kill`

3. **JWT Verification Failed**
   - Ensure `JWT_SECRET` is set correctly
   - Check if token is expired
   - Verify Bearer token format

## 📚 Documentation

All detailed documentation files are stored in the [`documents/`](./documents/) directory:

### Quick Start & Getting Started
- [QUICK_START_GUIDE.md](./documents/QUICK_START_GUIDE.md) - Get up and running in 5 minutes
- [GETTING_STARTED.md](./documents/GETTING_STARTED.md) - Detailed getting started guide
- [USER_GUIDE.md](./documents/USER_GUIDE.md) - User guide (Vietnamese)

### API & Technical
- [API_USAGE_EXAMPLES.md](./documents/API_USAGE_EXAMPLES.md) - API usage examples with curl and code
- [DEPLOYMENT_GUIDE.md](./documents/DEPLOYMENT_GUIDE.md) - Production deployment guide

### Architecture & Structure
- [PROJECT_STRUCTURE.md](./documents/PROJECT_STRUCTURE.md) - Project structure and DDD architecture
- [PERMISSIONS.md](./documents/PERMISSIONS.md) - Detailed RBAC permissions system

### History & Updates
- [CHANGELOG.md](./documents/CHANGELOG.md) - Version history and changes
- [UPDATE_SUMMARY.md](./documents/UPDATE_SUMMARY.md) - Summary of permission system updates

For a complete overview, see [documents/README.md](./documents/README.md).

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

For questions or support, please contact the development team.

---

**Happy Coding! 🚀**

