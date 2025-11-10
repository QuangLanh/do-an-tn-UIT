# Migration từ Mock sang API thực - Hướng dẫn

## ✅ Đã hoàn thành

Tất cả các repositories và services đã được migrate từ mock data (localStorage) sang API thực từ backend.

### 1. **Repositories đã migrate:**
- ✅ `RealProductRepository` - Thay thế `ProductRepository` (mock)
- ✅ `RealOrderRepository` - Thay thế `OrderRepository` (mock)
- ✅ `RealPurchaseRepository` - Thay thế `PurchaseRepository` (mock)

### 2. **Services đã migrate:**
- ✅ `RealAuthService` - Thay thế `AuthService` (mock users)

### 3. **API Factories đã cập nhật:**
- ✅ `productApi` - Sử dụng `RealProductRepository`
- ✅ `orderApi` - Sử dụng `RealOrderRepository`
- ✅ `purchaseApi` - Sử dụng `RealPurchaseRepository`
- ✅ `authStore` - Sử dụng `RealAuthService`

## 📋 Cách sử dụng

### Authentication

Frontend bây giờ sẽ gọi API thực từ backend:
- **Login endpoint**: `POST /api/auth/login`
- **Profile endpoint**: `GET /api/auth/profile`

**Lưu ý**: Backend sử dụng `email` để đăng nhập, nhưng frontend có thể nhận `username`. Code đã tự động map `username` → `email` nếu cần.

### Products, Orders, Purchases

Tất cả các operations (CRUD) bây giờ đều gọi API thực từ backend thông qua `apiService`.

## 🔧 Cấu hình

### Environment Variables

Đảm bảo backend đang chạy và cấu hình API URL:

```bash
# .env file hoặc environment variable
VITE_API_BASE_URL=http://localhost:4000/api
```

Default URL đã được set trong `apiClient.ts`:
```typescript
const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
```

### Backend CORS

Backend đã được cấu hình CORS để chấp nhận requests từ frontend:
- Frontend URL: `http://localhost:5173` (Vite default)
- CORS đã được enable trong `back_end_project/src/main.ts`

## 🧪 Testing

### 1. Khởi động Backend
```bash
cd back_end_project
yarn start:dev
# Backend chạy tại http://localhost:4000
```

### 2. Khởi động Frontend
```bash
cd front_end_project
yarn dev
# Frontend chạy tại http://localhost:5173
```

### 3. Kiểm tra kết nối
1. Mở browser DevTools → Network tab
2. Đăng nhập vào ứng dụng
3. Kiểm tra các API calls:
   - `POST /api/auth/login` - Đăng nhập
   - `GET /api/products` - Lấy danh sách sản phẩm
   - `GET /api/orders` - Lấy danh sách đơn hàng
   - etc.

## ⚠️ Lưu ý quan trọng

### 1. Token Storage
Token được lưu trong `localStorage` với key `auth-storage` dưới dạng:
```json
{
  "state": {
    "user": {
      "token": "jwt_token_here",
      "id": "...",
      "email": "...",
      ...
    }
  }
}
```

### 2. Mapping dữ liệu
- Backend sử dụng `purchasePrice`, frontend sử dụng `importPrice` → đã được map tự động
- Backend sử dụng `_id`, frontend sử dụng `id` → đã được map tự động
- Backend trả về `access_token`, frontend lưu thành `token` → đã được map tự động

### 3. Error Handling
Tất cả các repositories đều có error handling và logging. Kiểm tra browser console để xem chi tiết lỗi nếu có.

## 🔄 Rollback (nếu cần)

Nếu muốn rollback về mock data (tạm thời), chỉ cần thay đổi import trong các file API factories:

```typescript
// Thay đổi từ:
import { RealProductRepository } from '@/domains/products/repositories/RealProductRepository'

// Thành:
import { ProductRepository } from '@/domains/products/repositories/ProductRepository'

// Và thay:
const productRepository = new RealProductRepository()
// Thành:
const productRepository = new ProductRepository()
```

## 📝 Files đã thay đổi

1. `front_end_project/src/domains/products/repositories/RealProductRepository.ts` - **NEW**
2. `front_end_project/src/domains/orders/repositories/RealOrderRepository.ts` - **NEW**
3. `front_end_project/src/domains/purchases/repositories/RealPurchaseRepository.ts` - **NEW**
4. `front_end_project/src/domains/users/services/RealAuthService.ts` - **NEW**
5. `front_end_project/src/infra/api/productApi.ts` - **UPDATED**
6. `front_end_project/src/infra/api/orderApi.ts` - **UPDATED**
7. `front_end_project/src/infra/api/purchaseApi.ts` - **UPDATED**
8. `front_end_project/src/store/authStore.ts` - **UPDATED**

## ✨ Kết quả

✅ Frontend bây giờ hoàn toàn kết nối với backend API thực
✅ Không còn sử dụng localStorage mock data
✅ Tất cả CRUD operations đều gọi API từ backend
✅ Authentication sử dụng JWT tokens từ backend

