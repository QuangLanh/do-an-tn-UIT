# Giới thiệu dự án — Hệ thống quản lý cửa hàng tạp hóa

> Tài liệu mô tả **những chức năng đang thực sự có trong mã nguồn** tại thời điểm hiện tại (đọc trực tiếp từ code, không phải từ tài liệu cũ).
> Đề xuất bổ sung xem `DE_XUAT_CHUC_NANG.md`; kịch bản kiểm thử xem `KIEM_TRA_LUONG_NGHIEP_VU.md`.

---

## 1. Tổng quan

Hệ thống phục vụ vận hành một cửa hàng tạp hóa tại Việt Nam, gồm **3 ứng dụng độc lập**:

| Ứng dụng | Thư mục | Công nghệ | Người dùng |
|---|---|---|---|
| API nghiệp vụ | `back_end_project` | NestJS 11, MongoDB (Mongoose), JWT, Socket.IO, Swagger, PDFKit | — |
| Web quản trị | `front_end_project` | React 18 + Vite + TypeScript, TailwindCSS, Zustand, Recharts | Chủ cửa hàng (admin), nhân viên (staff) |
| Web khách hàng | `customer_app` | React 18 + Vite + TypeScript, TailwindCSS, Zustand | Khách mua hàng online |

Cơ sở dữ liệu dùng chung một MongoDB. Ba vai trò trong hệ thống: `admin`, `staff`, `customer`.

```
┌──────────────────┐        ┌──────────────────┐
│ Web quản trị     │        │ Web khách hàng   │
│ localhost:5173   │        │ localhost:5174   │
└────────┬─────────┘        └────────┬─────────┘
         │ REST + WebSocket           │ REST
         └────────────┬───────────────┘
                      ▼
          ┌──────────────────────────┐
          │  API NestJS :4000/api    │
          │  Swagger: /api/docs      │
          └────────────┬─────────────┘
                       ▼
                  MongoDB Atlas
```

## 2. Mô hình dữ liệu chính

| Collection | Schema | Vai trò |
|---|---|---|
| `products` | `Product` | Sản phẩm: SKU, barcode, giá nhập (`purchasePrice`), giá bán (`salePrice`), tồn kho (`stock`), tồn tối thiểu (`minStockLevel`), danh mục, NCC mặc định, hạn dùng theo tháng |
| `orders` | `Order` | Đơn bán / đổi / trả. Có `orderType` (SALE, EXCHANGE, RETURN), `status`, `paymentStatus` (PAID, DEBT, REFUNDED), `isOnline`, `relatedOrderCode`, `hasAfterSale` |
| `purchases` | `Purchase` | Phiếu nhập hàng: NCC, danh sách hàng đặt, số lượng đặt vs thực nhận, ngày SX/HSD, trạng thái `pending`/`received`/`cancelled` |
| `stockbatches` | `StockBatch` | **Lô hàng** — cơ sở cho FEFO và cảnh báo hạn sử dụng |
| `customers` | `KhachHang` | Khách hàng (theo số điện thoại), phân loại `thuong`/`tiem-nang`/`vip`, tổng chi tiêu, số lần mua |
| `users` | `User` | Tài khoản nội bộ (admin/staff), mật khẩu băm bcrypt |
| `nha-cung-cap` | `NhaCungCap` | Nhà cung cấp: mã, tên, SĐT, địa chỉ, người liên hệ |
| `lichsuthaotacs` | `LichSuThaoTac` | Nhật ký thao tác (audit log) |
| `otps` | `Otp` | Mã OTP đăng nhập khách hàng, TTL 5 phút |
| `shoppinglists` | `DanhSachMuaHang` | Danh sách mua sắm của khách (API đã có, **chưa có giao diện**) |

## 3. Chức năng đang có — Web quản trị

### 3.1. Xác thực và phân quyền
- Đăng nhập bằng email + mật khẩu, nhận JWT (mặc định hạn 7 ngày), lưu ở `localStorage`.
- Chặn tài khoản bị khóa (`isActive = false`).
- Route được bảo vệ bằng `TuyenBaoVe` theo **vai trò** và theo **quyền** (`create_order`, `view_reports`, `manage_users`…).
- Hết hạn / 401 → tự động xóa phiên và chuyển về trang đăng nhập.
- Cập nhật hồ sơ cá nhân; **đổi mật khẩu chỉ dành cho admin** và bắt buộc nhập mật khẩu hiện tại.

Ma trận quyền thực tế (theo `@VaiTro` ở backend):

| Nhóm chức năng | Admin | Staff |
|---|---|---|
| Sản phẩm: xem/tạo/sửa | ✔ | ✔ |
| Sản phẩm: xóa | ✔ | ✘ |
| Bán hàng, tạo đơn, đổi/trả | ✔ | ✔ |
| Đổi trạng thái đơn hàng | ✔ | ✘ |
| Xóa đơn hàng | ✔ | ✘ |
| Thu nợ, đổi trạng thái thanh toán | ✔ | ✔ |
| Nhập hàng: tạo, nhận hàng | ✔ | ✔ |
| Nhập hàng: sửa, xóa phiếu | ✔ | ✘ |
| Báo cáo, dashboard, giao dịch | ✔ | ✔ (UI chỉ mở báo cáo cho admin) |
| Sao lưu dữ liệu | ✔ | ✘ |
| Quản lý tài khoản nội bộ, khách hàng | ✔ | ✘ |
| Nhật ký thao tác | ✔ | ✔ |

### 3.2. Bảng điều khiển (`/dashboard`)
- Doanh thu / số đơn / lợi nhuận **hôm nay** và **tháng này**, tính theo đúng múi giờ `Asia/Ho_Chi_Minh` (không lệch khi server chạy UTC).
- Biểu đồ xu hướng 7 ngày (doanh thu, đơn, lợi nhuận).
- Top sản phẩm bán chạy.
- Cảnh báo: số sản phẩm sắp hết hàng, số lô sắp/đã hết hạn, số đơn ghi nợ và tổng tiền nợ.
- Kết quả được cache 60 giây trong bộ nhớ tiến trình, tự xóa cache khi có đơn mới/cập nhật.

### 3.3. Quản lý sản phẩm (`/products`)
- CRUD sản phẩm, tìm kiếm full-text (tên/SKU/barcode), lọc theo danh mục, lọc hàng sắp hết.
- Tải ảnh sản phẩm, mô tả rich text (react-quill).
- **Chống trùng**: SKU và barcode là unique; nếu tạo trùng thì hệ thống **cộng dồn tồn kho** vào sản phẩm cũ thay vì báo lỗi.
- Điều chỉnh tồn kho thủ công (ADD / SUBTRACT / SET).
- Công cụ CLI gộp sản phẩm trùng: `npm run dedupe:products`.

### 3.4. Bán hàng tại quầy (`/sales`, `/orders/new`)
- Chọn sản phẩm bằng dropdown tìm kiếm hoặc tra theo barcode.
- Tính tự động: tạm tính, thuế, giảm giá, tổng tiền.
- Ghi nhận **giá vốn tại thời điểm bán** (`importPrice`) vào từng dòng hàng để tính lãi chính xác về sau.
- Hỗ trợ **bán ghi nợ**: đơn có `paymentStatus = DEBT`, đánh dấu `wasDebt`.
- Tự động tạo/cập nhật hồ sơ khách hàng theo số điện thoại.
- **Chặn bán** sản phẩm còn tồn lô đã hết hạn (kiểm tra 2 lớp: trước khi tạo đơn và trong lúc trừ kho FEFO).
- Trừ tồn kho theo **FEFO** (lô hết hạn gần nhất trừ trước) khi sản phẩm có lô; nếu không có lô thì trừ trực tiếp `Product.stock`.
- Đơn tại quầy được tạo thẳng ở trạng thái `completed`.

### 3.5. Quản lý đơn hàng (`/orders`, `/orders/list`)
- Danh sách đơn, lọc theo trạng thái, khoảng ngày, đơn online / tại quầy.
- Xem chi tiết, hóa đơn, xuất PDF/ảnh phía client (jspdf + html2canvas).
- Luồng trạng thái được kiểm soát chặt: `pending → shipping → completed`, hủy được ở `pending`/`shipping`, `completed`/`cancelled` là trạng thái kết thúc.
- Chuẩn hóa dữ liệu trạng thái cũ (`cho_xac_nhan`, `dang_van_chuyen`, `hoan_thanh`, `da_huy`…) về 4 trạng thái chuẩn.
- Sửa nhanh tên / số điện thoại khách trên đơn.
- **Badge realtime**: WebSocket namespace `/orders` phát `order.created` / `order.updated`, sidebar tự cập nhật số đơn online chờ xử lý mà không cần tải lại trang.

### 3.6. Đơn ghi nợ (`/orders/debts`)
- Danh sách toàn bộ đơn `paymentStatus = DEBT`, tổng công nợ.
- Thao tác **thu nợ** (`pay-debt`) → chuyển sang `PAID` và ghi `paidAt`.

### 3.7. Đổi / trả hàng (`/returns-exchanges`)
- Tra đơn gốc theo **mã đơn** hoặc **số điện thoại**.
- Điều kiện nghiệp vụ được kiểm tra tự động: đơn gốc phải là đơn bán (`ORD…`), đã `completed`, đã thanh toán đủ (không phải đơn ghi nợ), và **chưa từng phát sinh đổi/trả**.
- **Trả hàng**: tạo đơn `RET…` với tổng tiền âm, `paymentStatus = REFUNDED`; có tùy chọn `isRestocked` (nhập lại kho hay bỏ hàng hỏng); ghi lý do trả.
- **Đổi hàng**: tạo đơn `EXC…` gồm hàng trả (âm) và hàng đổi (dương), tự tính phần chênh lệch phải thu / phải hoàn.
- Đơn gốc được đánh dấu `hasAfterSale = true` để không đổi/trả lần hai.

### 3.8. Nhập hàng (`/purchases`, `/purchases/new`)
- Tạo phiếu nhập với nhiều mặt hàng, chọn NCC, ghi chú. Mã phiếu `PURyymmdd####` sinh an toàn (quét số lớn nhất trong ngày + retry khi trùng).
- **Phiếu mới luôn ở trạng thái `pending` và KHÔNG cộng kho.**
- **Nhận hàng thực tế** (checklist): nhập số lượng thực nhận, giá nhập thực tế, ngày sản xuất, hạn sử dụng, số lô cho từng mặt hàng. Khi xác nhận:
  - Kiểm tra HSD phải lớn hơn NSX, số lượng ≥ 0;
  - Cộng tồn kho theo số thực nhận;
  - **Tạo lô hàng (`StockBatch`)** tương ứng;
  - Cập nhật lại `purchasePrice` của sản phẩm theo giá nhập thực tế;
  - Giữ `orderedQuantity` để đối chiếu sai lệch đặt/nhận;
  - Ghi nhật ký thao tác.
- Lịch sử giá nhập theo từng sản phẩm.
- Thống kê chi phí nhập theo khoảng thời gian.

### 3.9. Gợi ý nhập hàng thông minh
Tính trên dữ liệu bán 30 ngày gần nhất, kết hợp **hệ số mùa vụ Việt Nam** (Tết ×1.3, cao điểm nắng nóng tháng 6–7 ×1.4, mùa mưa ×0.9, lễ cuối năm ×1.2):

- `averageDailySales` → `seasonalDemand = averageDailySales × hệ số mùa`
- `safetyStock = seasonalDemand × leadTime(7 ngày) × 1.5`
- `reorderPoint = seasonalDemand × leadTime + safetyStock`
- `recommendedQuantity = targetStock − tồn kho hiệu dụng`, trong đó **tồn kho hiệu dụng đã trừ hàng hết hạn**.

Kết quả chia 3 nhóm ưu tiên **HIGH / MEDIUM / LOW** kèm lý do bằng tiếng Việt ("Bán chạy, dưới ROP (mùa cao điểm ×1.4) – nhập gấp"…). Có API riêng cho từng nhóm.

### 3.10. Kiểm kê & hạn sử dụng (`/inventory`)
- Xem tồn kho, giá trị tồn, hàng dưới định mức.
- Xem **chi tiết từng lô** của một sản phẩm: số lượng, NSX, HSD, số ngày còn lại, số phiếu nhập nguồn.
- Phân loại trạng thái hạn dùng: `expired` (đã hết hạn) → `critical` (≤ 7 ngày) → `near_expiry` (≤ 30 ngày) → `normal`.
- **Loại bỏ hàng hết hạn**: trừ khỏi lô, trừ tồn kho sản phẩm, ghi nhật ký. Đây là điều kiện bắt buộc để bán lại sản phẩm đó.

### 3.11. Nhà cung cấp (`/nha-cung-cap`)
- CRUD nhà cung cấp (mã, tên, SĐT, email, địa chỉ, người liên hệ), bật/tắt hoạt động.
- Phiếu nhập lưu `supplierId` + **snapshot tên NCC** tại thời điểm nhập để lịch sử không đổi khi NCC đổi tên.

### 3.12. Khách hàng (`/customers`)
- Danh sách khách hàng, thông tin liên hệ, tổng chi tiêu, số lần mua.
- **Phân loại tự động**: Thường (< 500K), Tiềm năng (500K – 2M), VIP (> 2M) — chạy qua API `POST /customers/classify`.
- **Đồng bộ khách hàng từ đơn hàng cũ** (`POST /customers/sync-from-orders`) cho dữ liệu phát sinh trước khi có module khách hàng.

### 3.13. Báo cáo (`/reports`)
- Báo cáo doanh thu / chi phí / lợi nhuận / biên lợi nhuận theo khoảng ngày.
- Báo cáo bán hàng theo ngày (mặc định 30 ngày) cho biểu đồ.
- Top sản phẩm theo doanh thu và lợi nhuận thực (có trừ hàng trả).
- Báo cáo tồn kho: tổng giá trị vốn tồn, doanh thu tiềm năng, danh sách hàng dưới định mức.
- Xuất PDF báo cáo doanh thu (PDFKit).
- Thống kê giao dịch theo tháng cả năm (`/transactions/monthly`).

Cách tính lợi nhuận: `lợi nhuận = doanh thu − giá vốn hàng đã bán (COGS)`, lấy từ `importPrice` trên từng dòng đơn; đơn cũ thiếu giá vốn được bù bằng giá nhập hiện tại của sản phẩm, cuối cùng mới fallback 75% giá bán.

### 3.14. Quản trị hệ thống
- **Tài khoản nội bộ** (`/accounts`): tạo/sửa/xóa user, đổi vai trò, khóa tài khoản.
- **Nhật ký thao tác** (`/audit-logs`): phân trang, lọc theo loại đối tượng và hành động. Hiện đang ghi log cho: tạo phiếu nhập, nhận hàng, xóa phiếu nhập, loại bỏ hàng hết hạn.
- **Sao lưu dữ liệu** (`/backup`): tải file JSON gồm sản phẩm, đơn hàng, phiếu nhập.
- Giao diện hỗ trợ **dark mode**, sidebar thu gọn, ErrorBoundary, spinner toàn cục có độ trễ 250 ms (tránh nháy).

## 4. Chức năng đang có — Web khách hàng

- **Danh sách sản phẩm**: tìm kiếm, lọc danh mục, phân trang, ảnh sản phẩm; API sản phẩm là public nên xem hàng không cần đăng nhập.
- **Chi tiết sản phẩm**: giá, tồn kho, mô tả, thêm vào giỏ.
- **Giỏ hàng**: thêm/xóa/sửa số lượng, tính tổng tiền, lưu bền vững ở `localStorage` (`customer-cart-storage`).
- **Đặt hàng**: nhập tên, SĐT, địa chỉ, email, ghi chú, chọn phương thức thanh toán (tiền mặt / chuyển khoản).
  - **Cho phép đặt hàng không cần đăng nhập (guest checkout)**.
  - Kiểm tra tồn kho và hạn sử dụng ngay khi tạo đơn; trừ kho theo FEFO.
  - Đơn tạo ra ở trạng thái `pending`, `paymentStatus = DEBT`, `isOnline = true`; hồ sơ khách được tạo/cập nhật tự động.
- **Đăng nhập bằng OTP**: yêu cầu mã 6 số theo SĐT (định dạng bắt buộc 10 số bắt đầu bằng 0), hết hạn 5 phút, dùng một lần. Ở môi trường `development`, OTP được trả về ngay để tiện thử nghiệm.
- **Lịch sử đơn hàng**: xem đơn của mình (khi đã đăng nhập) hoặc tra cứu theo số điện thoại (khách vãng lai).
- **Chi tiết đơn + hủy đơn**: chỉ hủy được khi đơn còn `pending`; hệ thống hoàn kho tự động (tạo lô hoàn trả).
- **Cập nhật hồ sơ** (tên, email, địa chỉ) sau khi đăng nhập.
- Badge/thông báo số đơn đang chờ xử lý.

## 5. Điểm kỹ thuật đáng chú ý

| Chủ đề | Cách hiện thực |
|---|---|
| Quản lý lô & FEFO | `StockBatch` + `deductFEFO()`; `Product.stock` vẫn là con số tổng, hai đường ghi luôn được đồng bộ |
| Chặn bán hàng hết hạn | Kiểm tra `getProductExpiryStatusMap(7)` ở POS/đổi hàng/đơn khách + throw lần hai trong `deductFEFO` |
| Realtime | Socket.IO gateway `/orders`, chỉ admin/staff kết nối, dùng để làm mới badge |
| Hiệu năng | Cache in-memory TTL 60s cho dashboard/báo cáo/giao dịch, tự invalidate khi có đơn |
| Múi giờ | Mọi mốc ngày của dashboard/giao dịch được dựng bằng chuỗi ISO có hậu tố `+07:00` |
| Toàn vẹn dữ liệu | Unique index `sku`, `barcode` (sparse), `orderNumber`, `purchaseNumber`; retry khi trùng mã phiếu nhập |
| Validation | `ValidationPipe` toàn cục với `whitelist` + `forbidNonWhitelisted` (thừa field ⇒ 400) |
| Tài liệu API | Swagger đầy đủ tại `/api/docs`, có Bearer auth |

## 6. Chạy hệ thống

```bash
# 1) Backend
cd back_end_project && npm install && npm run start:dev     # http://localhost:4000/api

# 2) Web quản trị
cd front_end_project && npm install && npm run dev          # http://localhost:5173

# 3) Web khách hàng
cd customer_app && npm install && npm run dev               # http://localhost:5174

# (tùy chọn) nạp dữ liệu sản phẩm mẫu — LƯU Ý: xóa sạch collection products
cd back_end_project && npm run seed
```

Biến môi trường backend (`back_end_project/.env`): `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRATION`, `PORT`, `NODE_ENV`.
Nếu chạy frontend ở origin khác `5173`/`5174`, phải khai báo `FRONTEND_URLS` (dạng danh sách, ngăn cách bằng dấu phẩy) — CORS và WebSocket đều đọc biến này.

## 7. Phạm vi chưa có

Những nội dung sau **chưa được hiện thực** (chi tiết và thứ tự ưu tiên xem `DE_XUAT_CHUC_NANG.md`):

- Không có bất kỳ test tự động nào (unit / e2e).
- Không có transaction MongoDB: tạo đơn gồm nhiều bước ghi (trừ kho từng sản phẩm) không thể rollback nếu lỗi giữa chừng.
- Danh sách mua sắm (`/shopping-lists`) có API nhưng chưa có giao diện.
- Chưa gửi SMS/email thật (OTP chỉ hiện trong log/response dev).
- Chưa có thanh toán trực tuyến, chưa có quản lý vận chuyển.
- Controller `suppliers` chưa gắn guard xác thực.
- Nhật ký thao tác mới bao phủ phân hệ nhập hàng, chưa bao phủ đơn hàng/sản phẩm/tài khoản.
- `GET /reports/backup` chỉ xuất JSON 3 collection, không phải sao lưu toàn bộ CSDL.
