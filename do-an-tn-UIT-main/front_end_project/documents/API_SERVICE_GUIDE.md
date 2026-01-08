# 📡 Centralized API Service

Hệ thống API tập trung để call tất cả backend endpoints, bọc nhiều tầng để tránh gọi API nhiều chỗ.

## 🎯 Mục đích

- **Tập trung**: Tất cả API endpoints được định nghĩa ở 1 nơi
- **Đơn giản**: UI chỉ cần gọi method, không cần biết URL
- **Bảo trì dễ**: Thay đổi URL chỉ cần sửa 1 file config
- **Type-safe**: TypeScript hỗ trợ auto-complete

## 📁 Cấu trúc

```
infra/api/
├── config/
│   └── apiEndpoints.ts      # Tất cả API endpoints
├── services/
│   ├── baseApiService.ts    # Base service với generic methods
│   └── apiService.ts        # Main API service wrapper
├── hooks/
│   └── useApi.ts            # React hooks để dùng API dễ hơn
├── apiClient.ts             # Axios client với interceptors
└── index.ts                 # Export chính
```

## 🚀 Cách sử dụng

### 1. Import API Service

```typescript
import { apiService } from '@/infra/api'
```

### 2. Sử dụng trong Component

#### Cách 1: Direct Call

```typescript
const loadProducts = async () => {
  try {
    const products = await apiService.products.list()
    setProducts(products)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

#### Cách 2: Với Params

```typescript
// Tự động build query string, không cần tự tạo
const products = await apiService.products.list({
  category: 'electronics',
  search: 'keyword',
  lowStock: true,
})

const orders = await apiService.orders.list({
  from: '2024-10-01',
  to: '2024-10-31',
  status: 'completed',
})
```

#### Cách 3: Sử dụng Hook

```typescript
import { useApiCall } from '@/infra/api/hooks/useApi'

const { data, loading, error, execute } = useApiCall(
  apiService.products.list
)

useEffect(() => {
  execute()
}, [execute])
```

### 3. Các Module Available

#### Auth
```typescript
apiService.auth.login(credentials)
apiService.auth.register(userData)
apiService.auth.getProfile()
```

#### Users
```typescript
apiService.users.list()
apiService.users.detail(id)
apiService.users.create(userData)
apiService.users.update(id, userData)
apiService.users.delete(id)
```

#### Products
```typescript
apiService.products.list(params?)
apiService.products.detail(id)
apiService.products.create(productData)
apiService.products.update(id, productData)
apiService.products.delete(id)
apiService.products.updateStock(id, stockData)
apiService.products.lowStock()
apiService.products.categories()
```

#### Orders
```typescript
apiService.orders.list(params?)
apiService.orders.detail(id)
apiService.orders.create(orderData)
apiService.orders.updateStatus(id, statusData)
apiService.orders.delete(id)
apiService.orders.invoice(id)
apiService.orders.statistics(params?)
apiService.orders.topProducts(limit?)
```

#### Purchases
```typescript
apiService.purchases.list(params?)
apiService.purchases.detail(id)
apiService.purchases.create(purchaseData)
apiService.purchases.update(id, purchaseData)
apiService.purchases.delete(id)
apiService.purchases.statistics(params?)
apiService.purchases.suppliers()
apiService.purchases.recommendations()
apiService.purchases.highPriorityRecommendations()
apiService.purchases.lowPriorityRecommendations()
```

#### Transactions
```typescript
apiService.transactions.summary(params?)
apiService.transactions.monthly(year?)
```

#### Reports
```typescript
apiService.reports.summary(params?)
apiService.reports.revenue(params?)
apiService.reports.profit(params?)
apiService.reports.export(params?) // Download PDF
apiService.reports.inventory()
```

#### Dashboard
```typescript
apiService.dashboard.summary()
apiService.dashboard.overview()
apiService.dashboard.topProducts(limit?)
apiService.dashboard.ordersTrend(days?)
apiService.dashboard.recentActivity()
```

## 🔧 Cấu hình

### Thay đổi Base URL

File: `apiClient.ts`
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
```

Hoặc tạo file `.env`:
```env
VITE_API_BASE_URL=http://localhost:4000/api
```

### Thêm Endpoint Mới

1. Thêm vào `config/apiEndpoints.ts`:
```typescript
export const API_ENDPOINTS = {
  // ... existing
  newModule: {
    list: () => '/new-module',
    detail: (id: string) => `/new-module/${id}`,
  },
}
```

2. Thêm method vào `services/apiService.ts`:
```typescript
export class ApiService extends BaseApiService {
  // ... existing
  newModule = {
    list: () => this.get(API_ENDPOINTS.newModule.list()),
    detail: (id: string) => this.get(API_ENDPOINTS.newModule.detail(id)),
  }
}
```

## 📝 Notes

- Tất cả requests tự động thêm JWT token từ localStorage
- Tự động handle 401 errors và redirect to login
- Tất cả methods trả về Promise với typed response
- Download files tự động trigger browser download

## 🔄 Migration từ Old API

Nếu đang dùng `productApi`, `orderApi`, etc:

**Trước:**
```typescript
import { productApi } from '@/infra/api/productApi'
const products = await productApi.getAllProducts.execute()
```

**Sau:**
```typescript
import { apiService } from '@/infra/api'
const products = await apiService.products.list()
```

Old APIs vẫn hoạt động để backward compatibility, nhưng khuyến khích dùng `apiService` mới.

