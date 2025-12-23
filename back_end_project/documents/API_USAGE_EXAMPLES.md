# API Usage Examples

This document provides practical examples of how to use the API endpoints.

## Authentication

### Register a New User

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "secure123",
    "fullName": "John Doe"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "role": "staff"
  }
}
```

### Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "secure123"
  }'
```

### Customer Login (Phone Number)

```bash
curl -X POST http://localhost:4000/api/auth/customer/login \
  -H "Content-Type: application/json" \
  -d '{
    "soDienThoai": "0901234567",
    "ten": "Cô Lan"
  }'
```

### Customer Me

```bash
curl -X GET http://localhost:4000/api/auth/customer/me \
  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN"
```

## Products

### Create a Product

```bash
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Coca Cola 330ml",
    "sku": "COKE-330",
    "description": "Classic Coca Cola",
    "category": "Beverages",
    "purchasePrice": 8000,
    "salePrice": 12000,
    "stock": 100,
    "minStockLevel": 20,
    "unit": "bottle",
    "barcode": "8934563123456"
  }'
```

### Get All Products

```bash
curl -X GET "http://localhost:4000/api/products" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Shopping Lists (Customer)

### Create/Upsert Active Shopping List

```bash
curl -X POST http://localhost:4000/api/shopping-lists \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN" \
  -d '{
    "items": [
      { "productId": "507f1f77bcf86cd799439011", "quantity": 2 }
    ]
  }'
```

### Get Active Shopping List

```bash
curl -X GET http://localhost:4000/api/shopping-lists/active \
  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN"
```

### Complete Shopping List

```bash
curl -X PATCH http://localhost:4000/api/shopping-lists/SHOPPING_LIST_ID/complete \
  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN"
```

## Orders (Customer)

### Order History (Read-only)

```bash
curl -X GET http://localhost:4000/api/orders/history \
  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN"
```

### Get Products by Category

```bash
curl -X GET "http://localhost:4000/api/products?category=Beverages" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Low Stock Products

```bash
curl -X GET "http://localhost:4000/api/products/low-stock" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Product Stock

```bash
curl -X PATCH http://localhost:4000/api/products/507f1f77bcf86cd799439011/stock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "operation": "add",
    "quantity": 50
  }'
```

## Orders

### Create an Order

```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "quantity": 5
      },
      {
        "productId": "507f1f77bcf86cd799439012",
        "quantity": 3
      }
    ],
    "tax": 1200,
    "discount": 0,
    "customerName": "Nguyen Van A",
    "customerPhone": "0123456789",
    "paymentMethod": "cash",
    "notes": "Deliver before 5 PM"
  }'
```

Response:
```json
{
  "orderNumber": "ORD24103000001",
  "items": [...],
  "subtotal": 96000,
  "tax": 1200,
  "discount": 0,
  "total": 97200,
  "status": "completed",
  "customerName": "Nguyen Van A",
  "createdAt": "2024-10-30T10:30:00.000Z"
}
```

### Get Orders with Date Filter

```bash
curl -X GET "http://localhost:4000/api/orders?from=2024-10-01&to=2024-10-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Order Statistics

```bash
curl -X GET "http://localhost:4000/api/orders/statistics?from=2024-10-01&to=2024-10-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "totalRevenue": 5420000,
  "totalOrders": 45,
  "averageOrderValue": 120444.44
}
```

### Get Top Selling Products

```bash
curl -X GET "http://localhost:4000/api/orders/top-products?limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Purchases

### Create a Purchase

```bash
curl -X POST http://localhost:4000/api/purchases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "quantity": 200,
        "purchasePrice": 7500
      }
    ],
    "supplier": "ABC Trading Co.",
    "supplierContact": "0987654321",
    "notes": "Monthly stock replenishment"
  }'
```

### Get Purchase Statistics

```bash
curl -X GET "http://localhost:4000/api/purchases/statistics?from=2024-10-01&to=2024-10-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Purchase Recommendations

Get all purchase recommendations with priority levels:

```bash
curl -X GET "http://localhost:4000/api/purchases/recommendations" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "highPriority": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "productName": "Coca Cola 330ml",
      "currentStock": 15,
      "minStockLevel": 20,
      "averageDailySales": 12.5,
      "totalSoldLast30Days": 375,
      "recommendedQuantity": 95,
      "priority": "high",
      "reason": "Bán chạy và tồn kho thấp - cần nhập gấp",
      "suggestedPurchasePrice": 8000
    }
  ],
  "mediumPriority": [
    {
      "productId": "507f1f77bcf86cd799439012",
      "productName": "Nước suối 500ml",
      "currentStock": 25,
      "minStockLevel": 20,
      "averageDailySales": 5.2,
      "totalSoldLast30Days": 156,
      "recommendedQuantity": 42,
      "priority": "medium",
      "reason": "Tồn kho gần hết và có nhu cầu bán hàng",
      "suggestedPurchasePrice": 5000
    }
  ],
  "lowPriority": [
    {
      "productId": "507f1f77bcf86cd799439013",
      "productName": "Bánh quy xốp",
      "currentStock": 50,
      "minStockLevel": 10,
      "averageDailySales": 0.5,
      "totalSoldLast30Days": 15,
      "recommendedQuantity": 5,
      "priority": "low",
      "reason": "Bán chậm - nên nhập ít để tránh tồn kho",
      "suggestedPurchasePrice": 15000
    }
  ],
  "generatedAt": "2024-10-30T10:00:00.000Z"
}
```

### Get High Priority Recommendations

Get only products that need urgent restocking:

```bash
curl -X GET "http://localhost:4000/api/purchases/recommendations/high-priority" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Low Priority Recommendations

Get products that should purchase less (slow sellers):

```bash
curl -X GET "http://localhost:4000/api/purchases/recommendations/low-priority" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Transactions

### Get Transaction Summary

```bash
curl -X GET "http://localhost:4000/api/transactions/summary?from=2024-10-01&to=2024-10-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "revenue": 5420000,
  "cost": 3200000,
  "profit": 2220000,
  "profitMargin": 40.96,
  "totalOrders": 45,
  "totalPurchases": 12,
  "averageOrderValue": 120444.44,
  "averagePurchaseValue": 266666.67
}
```

### Get Monthly Data

```bash
curl -X GET "http://localhost:4000/api/transactions/monthly?year=2024" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Reports

### Get Revenue Report

```bash
curl -X GET "http://localhost:4000/api/reports/revenue?from=2024-10-01&to=2024-10-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Export Revenue Report as PDF

```bash
curl -X GET "http://localhost:4000/api/reports/revenue/export?from=2024-10-01&to=2024-10-31" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output revenue-report.pdf
```

### Get Inventory Report

```bash
curl -X GET "http://localhost:4000/api/reports/inventory" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "totalProducts": 150,
  "totalStockValue": 45000000,
  "potentialRevenue": 67500000,
  "lowStockCount": 8,
  "lowStockProducts": [
    {
      "name": "Product A",
      "currentStock": 5,
      "minStockLevel": 10
    }
  ]
}
```

## Dashboard

### Get Dashboard Summary

```bash
curl -X GET "http://localhost:4000/api/dashboard/summary" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "today": {
    "revenue": 240000,
    "orders": 8,
    "profit": 96000
  },
  "thisMonth": {
    "revenue": 5420000,
    "orders": 45,
    "profit": 2220000,
    "profitMargin": 40.96
  },
  "alerts": {
    "lowStockCount": 3,
    "lowStockProducts": [...]
  }
}
```

### Get Orders Trend

```bash
curl -X GET "http://localhost:4000/api/dashboard/orders-trend?days=7" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
[
  {
    "date": "2024-10-24",
    "revenue": 180000,
    "orders": 6,
    "profit": 72000
  },
  {
    "date": "2024-10-25",
    "revenue": 240000,
    "orders": 8,
    "profit": 96000
  }
]
```

## User Management (Admin Only)

### Get All Users

```bash
curl -X GET "http://localhost:4000/api/users" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Update User Role

```bash
curl -X PATCH http://localhost:4000/api/users/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "role": "admin"
  }'
```

### Delete User

```bash
curl -X DELETE http://localhost:4000/api/users/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "timestamp": "2024-10-30T10:30:00.000Z",
  "path": "/api/products",
  "method": "POST",
  "message": "Validation failed"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "timestamp": "2024-10-30T10:30:00.000Z",
  "path": "/api/products",
  "method": "GET",
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "timestamp": "2024-10-30T10:30:00.000Z",
  "path": "/api/users",
  "method": "GET",
  "message": "Forbidden resource"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "timestamp": "2024-10-30T10:30:00.000Z",
  "path": "/api/products/invalid-id",
  "method": "GET",
  "message": "Product not found"
}
```

## Testing with Postman

1. Import the API collection from Swagger
2. Create an environment with:
   - `base_url`: http://localhost:4000/api
   - `token`: (will be set after login)
3. Use the Pre-request Script to auto-include the token:
   ```javascript
   pm.request.headers.add({
     key: 'Authorization',
     value: 'Bearer ' + pm.environment.get('token')
   });
   ```

## Testing with JavaScript/TypeScript

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Login and set token
const login = async () => {
  const response = await api.post('/auth/login', {
    email: 'user@example.com',
    password: 'password123',
  });
  
  api.defaults.headers.common['Authorization'] = 
    `Bearer ${response.data.access_token}`;
  
  return response.data;
};

// Create an order
const createOrder = async () => {
  const response = await api.post('/orders', {
    items: [
      { productId: '507f1f77bcf86cd799439011', quantity: 5 }
    ],
    customerName: 'John Doe',
    paymentMethod: 'cash',
  });
  
  return response.data;
};

// Get dashboard summary
const getDashboard = async () => {
  const response = await api.get('/dashboard/summary');
  return response.data;
};
```

