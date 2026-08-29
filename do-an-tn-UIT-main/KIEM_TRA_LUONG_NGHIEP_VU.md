# Kiểm tra luồng nghiệp vụ (Business Flow Test Plan)

> Bộ kịch bản kiểm thử thủ công cho toàn hệ thống, biên soạn từ logic thực tế trong mã nguồn.
> Mỗi ca kiểm thử có: **điều kiện tiền đề → các bước → kết quả mong đợi → nơi kiểm chứng (API/DB/UI)**.
> Cột "KQ" dùng để tick khi chạy thật: ✅ đạt · ❌ lỗi · ⏭ bỏ qua.

---

## 0. Chuẩn bị môi trường

| Bước | Việc cần làm | Kiểm chứng |
|---|---|---|
| 0.1 | `cd back_end_project && npm install && npm run start:dev` | Log `🚀 Application is running on: http://localhost:4000/api` |
| 0.2 | Mở `http://localhost:4000/api/docs` | Swagger hiển thị đủ 10+ nhóm API |
| 0.3 | `cd front_end_project && npm run dev` | `http://localhost:5173` mở trang đăng nhập |
| 0.4 | `cd customer_app && npm run dev` | `http://localhost:5174` hiện danh sách sản phẩm |
| 0.5 | `.env` có `NODE_ENV=development` | Cần thiết để OTP trả về trong response khi test đăng nhập khách |
| 0.6 | Có sẵn 1 tài khoản `admin` và 1 tài khoản `staff` (`isActive = true`) | `GET /users` (admin) |
| 0.7 | Có ít nhất 5 sản phẩm, trong đó 1 sản phẩm tồn = 0, 1 sản phẩm tồn ≤ `minStockLevel` | `GET /products` |

**Dữ liệu chốt trước khi test:** ghi lại `stock` của các sản phẩm sẽ dùng — hầu hết ca kiểm thử đều đối chiếu tồn kho trước/sau.

---

## 1. Luồng xác thực và phân quyền

| # | Ca kiểm thử | Các bước | Kết quả mong đợi | KQ |
|---|---|---|---|---|
| 1.1 | Đăng nhập đúng | Đăng nhập admin | Nhận `access_token`, chuyển tới `/dashboard`, `lastLogin` được cập nhật | ☐ |
| 1.2 | Sai mật khẩu | Nhập sai mật khẩu | 401 "Sai tên đăng nhập hoặc mật khẩu…", **trang không bị reload/redirect** (interceptor bỏ qua 401 của chính request login) | ☐ |
| 1.3 | Tài khoản bị khóa | Admin đặt `isActive = false` cho staff → staff đăng nhập | 401 "Tài khoản đã bị khóa" | ☐ |
| 1.4 | Token hết hạn / không hợp lệ | Sửa token trong `localStorage['auth-storage']` → gọi 1 API bất kỳ | Xóa phiên và tự chuyển về `/login` | ☐ |
| 1.5 | Staff vào trang chỉ dành admin | Đăng nhập staff → mở `/reports`, `/accounts`, `/customers`, `/backup` | Hiển thị màn hình 403 "Không có quyền truy cập" | ☐ |
| 1.6 | Staff gọi API admin | Staff gọi `DELETE /products/:id`, `PATCH /orders/:id/status`, `DELETE /purchases/:id` | 403 Forbidden | ☐ |
| 1.7 | Đổi mật khẩu | Staff thử `PUT /auth/profile` với `newPassword` | 403 "Chỉ quản trị viên mới được đổi mật khẩu." | ☐ |
| 1.8 | Đổi mật khẩu (admin) | Admin gửi `newPassword` **thiếu** `currentPassword` → rồi gửi `currentPassword` sai → rồi gửi đúng | Lần 1: 400 "Vui lòng nhập mật khẩu hiện tại…"; lần 2: 400 "Mật khẩu hiện tại không đúng."; lần 3: 200 và đăng nhập được bằng mật khẩu mới | ☐ |
| 1.9 | Gửi field lạ | POST bất kỳ với field không có trong DTO (vd `{"abc": 1}`) | 400 (do `forbidNonWhitelisted`) — xác nhận validation toàn cục hoạt động | ☐ |
| 1.10 | ⚠️ Kiểm tra rủi ro | Gọi `GET /suppliers`, `POST /suppliers`, `DELETE /suppliers/:id` **không kèm token** | **Hiện tại sẽ thành công** → ghi nhận lỗi bảo mật (xem `DE_XUAT_CHUC_NANG.md` mục A3) | ☐ |

---

## 2. Luồng quản lý sản phẩm

| # | Ca kiểm thử | Các bước | Kết quả mong đợi | KQ |
|---|---|---|---|---|
| 2.1 | Tạo sản phẩm | Tạo sản phẩm mới đủ trường bắt buộc (name, sku, category, purchasePrice, salePrice) | 201, xuất hiện trong danh sách | ☐ |
| 2.2 | Trùng SKU | Tạo lại sản phẩm với **cùng SKU**, `stock = 5` | **Không báo lỗi**: tồn kho sản phẩm cũ tăng thêm 5, các trường mô tả bị ghi đè, log cảnh báo "Product existed (sku/barcode). Merged stock" | ☐ |
| 2.3 | Trùng barcode | Tạo sản phẩm SKU khác nhưng barcode trùng | Xử lý gộp tương tự 2.2 | ☐ |
| 2.4 | Thiếu SKU | Tạo sản phẩm với `sku = ""` | 400 "SKU is required" | ☐ |
| 2.5 | Tìm kiếm | Tìm theo tên / SKU / barcode | Trả đúng kết quả (dùng text index) | ☐ |
| 2.6 | Lọc hàng sắp hết | `GET /products?lowStock=true` | Chỉ trả sản phẩm có `stock ≤ minStockLevel` | ☐ |
| 2.7 | Điều chỉnh tồn kho | `PATCH /products/:id/stock` với ADD 10 → SUBTRACT 3 → SET 100 | Tồn kho lần lượt +10, −3, = 100 | ☐ |
| 2.8 | Trừ quá tồn | SUBTRACT lớn hơn tồn hiện có | 400 "Insufficient stock", tồn kho **không đổi** | ☐ |
| 2.9 | Xóa sản phẩm | Admin xóa 1 sản phẩm đã từng bán | Xóa thành công — **kiểm tra đơn hàng cũ**: `populate('items.product')` trả `null`, xem đơn cũ có còn hiển thị đúng tên hàng không (đã lưu `productName` nên phải còn) | ☐ |
| 2.10 | API công khai | Gọi `GET /products` **không token** | 200 — và kiểm tra response **có lộ `purchasePrice` (giá vốn) hay không** (hiện tại: có → ghi nhận, xem mục B9) | ☐ |

---

## 3. Luồng bán hàng tại quầy (POS)

**Tiền đề:** sản phẩm A tồn 20 (không có lô), sản phẩm B có 2 lô: lô 1 HSD gần (10 cái), lô 2 HSD xa (10 cái).

| # | Ca kiểm thử | Các bước | Kết quả mong đợi | KQ |
|---|---|---|---|---|
| 3.1 | Bán bình thường | Bán A×2, B×3, thanh toán tiền mặt | 201; `orderNumber` dạng `ORDyymmdd####`; `status = completed`; `paymentStatus = PAID`; `paidAt` có giá trị; `isOnline = false`; `createdBy` = user đang đăng nhập | ☐ |
| 3.2 | Trừ kho | Sau 3.1 kiểm tra tồn | A: 20 → 18 (trừ trực tiếp). B: 10 → 7, **trừ vào lô có HSD gần nhất trước (FEFO)**, lô HSD xa giữ nguyên | ☐ |
| 3.3 | Ghi giá vốn | Xem `items[].importPrice` của đơn vừa tạo | Bằng `purchasePrice` của sản phẩm tại thời điểm bán, **khác 0** | ☐ |
| 3.4 | Tính tiền | Đặt `tax`, `discount` | `total = subtotal + tax − discount`, `subtotal` = tổng `price × quantity` | ☐ |
| 3.5 | Bán vượt tồn | Bán A với số lượng > tồn | 400 "Insufficient stock", **không tạo đơn, tồn không đổi** | ☐ |
| 3.6 | Sản phẩm ngừng bán | Đặt `isActive = false` rồi bán | 400 "Product … inactive" | ☐ |
| 3.7 | Chặn bán hàng hết hạn | Tạo lô cho sản phẩm C có HSD ở quá khứ → bán C | 400 "Không thể bán sản phẩm … đã hết hạn. Vui lòng loại bỏ hàng hết hạn khỏi tồn kho trước." | ☐ |
| 3.8 | Bán ghi nợ | Bán với `isDebt = true` | `paymentStatus = DEBT`, `wasDebt = true`, **không có** `paidAt`; đơn xuất hiện ở `/orders/debts` | ☐ |
| 3.9 | Tự tạo khách hàng | Bán kèm SĐT chưa có trong hệ thống | Bản ghi mới trong collection `customers`; bán lần 2 với tên khác → tên khách được cập nhật, **không tạo bản ghi trùng** | ☐ |
| 3.10 | Realtime + cache | Mở dashboard ở tab khác → tạo đơn mới | Badge "đơn chờ xử lý" cập nhật qua WebSocket; số liệu dashboard đổi ngay (cache `dashboard:*` đã bị xóa) | ☐ |
| 3.11 | Tra barcode | `GET /products/barcode/:barcode` với mã có thật và mã không tồn tại | Lần lượt: 200 kèm giá bán/tồn; 404 "Không tìm thấy sản phẩm với barcode này" | ☐ |
| 3.12 | ⚠️ Đồng thời | Gửi 2 request bán cùng lúc sản phẩm chỉ còn 1 cái (dùng 2 tab hoặc script) | **Mong đợi đúng:** 1 thành công + 1 lỗi. **Nguy cơ hiện tại:** cả 2 cùng thành công, tồn kho âm → ghi nhận (mục A2) | ☐ |

---

## 4. Luồng nhập hàng

| # | Ca kiểm thử | Các bước | Kết quả mong đợi | KQ |
|---|---|---|---|---|
| 4.1 | Tạo phiếu nhập | Tạo phiếu 2 mặt hàng, chọn NCC | 201; mã `PURyymmdd####`; `status = pending`; `orderedQuantity` = số lượng đặt; **tồn kho KHÔNG thay đổi** | ☐ |
| 4.2 | Ghi log | Xem `/audit-logs` | Có bản ghi "Tạo phiếu nhập hàng" kèm tên NCC và tổng tiền | ☐ |
| 4.3 | Nhận hàng đủ | Mở modal "Nhận hàng thực tế", nhập đúng số đặt, giá nhập, NSX/HSD | 200; `status = received`; tồn kho **tăng đúng số nhận**; tạo `StockBatch` mới; `Product.purchasePrice` cập nhật theo giá nhập thực tế | ☐ |
| 4.4 | Nhận thiếu | Đặt 20, nhận 15 | Tồn +15; `item.quantity = 15`; `orderedQuantity = 20` (còn nguyên để đối chiếu); `total` tính lại theo số thực nhận | ☐ |
| 4.5 | Nhận 0 | Một dòng hàng nhận 0 | Không tạo lô, không cộng kho cho dòng đó, phiếu vẫn chuyển `received` | ☐ |
| 4.6 | HSD không hợp lệ | Nhập HSD ≤ NSX | 400 "Hạn sử dụng của … phải lớn hơn ngày sản xuất" | ☐ |
| 4.7 | Ngày sai định dạng | Bỏ trống hoặc nhập ngày rác | 400 "Ngày sản xuất/hạn sử dụng … không hợp lệ" | ☐ |
| 4.8 | Số lượng âm | Nhận `-1` | 400 "Số lượng nhận của … phải >= 0" | ☐ |
| 4.9 | Thiếu dòng hàng | Gửi checklist thiếu 1 sản phẩm có trong phiếu | 400 "Thiếu dữ liệu nhận hàng cho sản phẩm …" | ☐ |
| 4.10 | Nhận hàng 2 lần | Bấm "Xác nhận nhận hàng" lần thứ hai cho phiếu đã `received` | 400 "Chỉ phiếu ở trạng thái pending mới được nhận hàng" — **tồn kho không bị cộng đôi** | ☐ |
| 4.11 | Lịch sử giá nhập | `GET /purchases/price-history/:productId` | Liệt kê các lần nhập đã `received` kèm giá, số lô, NCC | ☐ |
| 4.12 | Snapshot NCC | Nhận hàng xong → đổi tên nhà cung cấp | Phiếu cũ vẫn giữ `supplierNameSnapshot` là tên tại thời điểm nhập | ☐ |
| 4.13 | Xóa phiếu đã nhận | Admin xóa phiếu `received` | **Hiện tại xóa được và KHÔNG hoàn lại tồn kho** → ghi nhận rủi ro nghiệp vụ | ☐ |
| 4.14 | Trùng mã phiếu | Tạo nhiều phiếu liên tiếp trong cùng ngày | Mã tăng dần, không trùng (có cơ chế retry 5 lần) | ☐ |

---

## 5. Luồng quản lý lô và hạn sử dụng

| # | Ca kiểm thử | Các bước | Kết quả mong đợi | KQ |
|---|---|---|---|---|
| 5.1 | Phân loại trạng thái | Tạo 4 lô cho 1 sản phẩm: HSD −5 ngày, +3 ngày, +20 ngày, +60 ngày | `expired`, `critical`, `near_expiry`, `normal` | ☐ |
| 5.2 | Trạng thái tổng của sản phẩm | Xem `GET /purchases/expiry-status` | Ưu tiên: có hàng hết hạn ⇒ `expired`; không thì có `critical` ⇒ `critical`; rồi tới `near_expiry`; còn lại `normal` | ☐ |
| 5.3 | Cảnh báo | `GET /purchases/expiry-warnings?days=7` | `expiredCount`, `criticalCount`, `expiringCount` khớp dữ liệu; các mục có `daysUntilExpiry` đúng | ☐ |
| 5.4 | Trang kiểm kê | Mở `/inventory` → xem chi tiết lô của 1 sản phẩm | Hiển thị đủ lô còn tồn, sắp xếp theo HSD tăng dần, kèm số phiếu nhập nguồn | ☐ |
| 5.5 | Chặn bán | Sản phẩm ở 5.1 (có lô hết hạn) → thử bán tại quầy và đặt online | Cả hai đều bị chặn 400 | ☐ |
| 5.6 | Loại bỏ hàng hết hạn | `POST /purchases/remove-expired` cho sản phẩm đó | Lô hết hạn về `quantity = 0`; `Product.stock` **giảm đúng bằng số bị loại**; có log "Loại bỏ hàng hết hạn" | ☐ |
| 5.7 | Bán lại sau khi loại bỏ | Bán lại sản phẩm đó | Thành công, trừ FEFO vào lô còn hạn gần nhất | ☐ |
| 5.8 | Loại bỏ khi không có hàng hết hạn | Gọi lại `remove-expired` | 400 "… không có hàng hết hạn cần loại bỏ" | ☐ |
| 5.9 | Đối chiếu tổng | So `Product.stock` với tổng `quantity` các lô của sản phẩm | Hai con số phải khớp sau mọi thao tác ở mục 3–5 (đây là bất biến quan trọng nhất của hệ thống) | ☐ |

---

## 6. Luồng trạng thái đơn hàng online

**Tiền đề:** đã đặt 1 đơn từ `customer_app` (trạng thái `pending`).

| # | Ca kiểm thử | Các bước | Kết quả mong đợi | KQ |
|---|---|---|---|---|
| 6.1 | pending → shipping | Admin đổi trạng thái | 200; `paymentStatus` chuyển/giữ `DEBT` | ☐ |
| 6.2 | shipping → completed | Admin đổi tiếp | 200; **tự động** `paymentStatus = PAID` và ghi `paidAt` | ☐ |
| 6.3 | Nhảy cóc | Đơn `pending` → đổi thẳng sang `completed` | 400 "Không được chuyển từ pending sang completed. Chỉ được chuyển sang: shipping, cancelled." | ☐ |
| 6.4 | Trạng thái kết thúc | Đơn `completed` → đổi sang bất kỳ | 400 "Đơn hàng đã hoàn thành, không thể đổi trạng thái." | ☐ |
| 6.5 | Hủy ở shipping | Đơn `shipping` → `cancelled` | 200 — **lưu ý:** hàm `updateStatus` **không hoàn kho**; chỉ luồng khách tự hủy mới hoàn kho. Ghi nhận nếu đây là sai lệch nghiệp vụ | ☐ |
| 6.6 | Quyền | Staff gọi `PATCH /orders/:id/status` | 403 (chỉ admin) | ☐ |
| 6.7 | Dữ liệu cũ | Sửa tay 1 đơn trong DB thành `status = "cho_xac_nhan"` → mở danh sách và đổi trạng thái | Hiển thị như `pending` (badge "Chờ xử lý"), cho phép chuyển sang `shipping` | ☐ |
| 6.8 | Lọc online/offline | `GET /orders?isOnline=true` và `?isOnline=false` | Đơn từ customer app nằm ở nhóm online; đơn POS nằm ở nhóm offline; đơn cũ không có `isOnline` được xếp theo `customerAddress`/`createdBy` | ☐ |
| 6.9 | Badge realtime | Mở admin ở tab A, đặt đơn mới ở tab B | Số trên badge sidebar tăng mà **không cần F5** | ☐ |
| 6.10 | Sửa thông tin khách | `PATCH /orders/:id/customer-info` đổi tên + SĐT | Chỉ 2 trường đó thay đổi, các trường khác giữ nguyên | ☐ |

---

## 7. Luồng công nợ

| # | Ca kiểm thử | Các bước | Kết quả mong đợi | KQ |
|---|---|---|---|---|
| 7.1 | Danh sách nợ | Mở `/orders/debts` | Liệt kê mọi đơn `paymentStatus = DEBT` (cả POS ghi nợ lẫn đơn online chưa hoàn thành), tổng tiền nợ đúng | ☐ |
| 7.2 | Thu nợ | Bấm "Thu nợ" một đơn | `paymentStatus = PAID`, `paidAt` được ghi, đơn biến khỏi danh sách nợ | ☐ |
| 7.3 | Ảnh hưởng báo cáo | Xem dashboard trước và sau khi thu nợ | Tổng nợ giảm; doanh thu/lợi nhuận cập nhật (cache đã invalidate) | ☐ |
| 7.4 | Đơn nợ và đổi/trả | Thử trả hàng cho một đơn từng ghi nợ (`wasDebt = true`) dù đã thu nợ xong | 400 "Đơn hàng mua thiếu hoặc chưa thanh toán đầy đủ, không thể đổi/trả." — xác nhận đây là quy tắc **cố ý** | ☐ |
| 7.5 | Thanh toán một phần | Thử ghi nhận khách trả 50% | **Không hỗ trợ** → ghi nhận thiếu chức năng (mục B1) | ☐ |

---

## 8. Luồng đổi / trả hàng

**Tiền đề:** đơn `ORD…` đã `completed`, `PAID`, `wasDebt = false`, chưa từng đổi/trả.

| # | Ca kiểm thử | Các bước | Kết quả mong đợi | KQ |
|---|---|---|---|---|
| 8.1 | Tra đơn gốc | Tìm theo mã đơn | Hiện đúng đơn kèm danh sách hàng đã mua | ☐ |
| 8.2 | ⚠️ Tra theo SĐT | Tìm theo số điện thoại | **Hiện tại trả về TẤT CẢ đơn hàng** bất kể SĐT (`findByPhone` là hàm tạm) → ghi nhận lỗi (mục D3) | ☐ |
| 8.3 | Trả hàng có nhập kho | Trả 2 sản phẩm, `isRestocked = true` | Tạo đơn `RETyymmdd####`; `total` **âm**; `paymentStatus = REFUNDED`; `status = completed`; tồn kho **tăng lại**; sinh lô `RETURN-…` HSD +365 ngày | ☐ |
| 8.4 | Trả hàng hỏng | Trả với `isRestocked = false` | Đơn trả được tạo nhưng **tồn kho không tăng** | ☐ |
| 8.5 | Lý do trả | Ghi lý do | `returnReason` lưu đúng; bỏ trống → mặc định "Khách yêu cầu trả hàng" | ☐ |
| 8.6 | Đổi hàng | Trả 1 món giá 20.000, đổi lấy món giá 35.000 | Đơn `EXCyymmdd####`; `total = +15.000`; `paymentStatus = PAID`; hàng trả cộng kho, hàng đổi trừ kho (FEFO) | ☐ |
| 8.7 | Đổi hàng rẻ hơn | Đổi lấy món rẻ hơn | `total` **âm**, `paymentStatus = REFUNDED` | ☐ |
| 8.8 | Chặn đổi/trả lần 2 | Thực hiện đổi/trả lần nữa trên cùng đơn gốc | 400 "Đơn hàng đã phát sinh đổi/trả trước đó."; đơn gốc có `hasAfterSale = true` | ☐ |
| 8.9 | Đơn chưa hoàn thành | Trả hàng cho đơn `pending`/`shipping` | 400 "Chỉ cho phép đổi/trả khi đơn hàng đã hoàn thành." | ☐ |
| 8.10 | Đơn không phải đơn bán | Thử trả hàng cho một đơn `EXC…` hoặc `RET…` | 400 "Chỉ cho phép đổi/trả đối với đơn bán gốc (mã ORD)." | ☐ |
| 8.11 | Sản phẩm ngoài đơn | Trả sản phẩm không có trong đơn gốc | 400 "Sản phẩm không thuộc đơn …" | ☐ |
| 8.12 | Đổi hàng hết hạn | Đổi lấy sản phẩm đang có lô hết hạn | 400 chặn bán hàng hết hạn | ☐ |
| 8.13 | Đổi hàng không đủ tồn | Đổi lấy sản phẩm số lượng > tồn | 400 "Sản phẩm … không đủ số lượng. Còn: X" | ☐ |
| 8.14 | ⚠️ Trả quá số đã mua | Mua 2 nhưng trả 5 | **Hiện tại không chặn** → tồn kho tăng khống, doanh thu âm bất thường → ghi nhận lỗi (mục B2) | ☐ |
| 8.15 | Ảnh hưởng báo cáo | Xem báo cáo doanh thu trước/sau khi trả hàng | Doanh thu giảm đúng phần trả; nếu `isRestocked` thì giá vốn cũng được trừ tương ứng | ☐ |

---

## 9. Luồng đặt hàng của khách (customer_app)

| # | Ca kiểm thử | Các bước | Kết quả mong đợi | KQ |
|---|---|---|---|---|
| 9.1 | Xem hàng không đăng nhập | Mở trang chủ, lọc danh mục, tìm kiếm, xem chi tiết | Hoạt động bình thường (API sản phẩm public) | ☐ |
| 9.2 | Giỏ hàng | Thêm, tăng/giảm số lượng, xóa, thêm trùng sản phẩm | Cộng dồn số lượng đúng, tổng tiền đúng; **F5 vẫn còn giỏ hàng** (`localStorage`) | ☐ |
| 9.3 | Đặt hàng khách vãng lai | Không đăng nhập, điền tên/SĐT/địa chỉ, đặt | 201; đơn `pending`, `DEBT`, `isOnline = true`; **tồn kho trừ ngay**; hồ sơ khách được tạo tự động kèm email/địa chỉ | ☐ |
| 9.4 | Đặt hàng vượt tồn | Đặt số lượng > tồn | 400 "Sản phẩm … không đủ số lượng. Còn lại: X" | ☐ |
| 9.5 | Giỏ rỗng | Gọi API với `items = []` | 400 "Đơn hàng phải có ít nhất 1 sản phẩm" | ☐ |
| 9.6 | Yêu cầu OTP | Nhập SĐT hợp lệ | 200; ở `NODE_ENV=development` mã OTP hiện trong toast/console và log server | ☐ |
| 9.7 | SĐT sai định dạng | `123`, `0912345`, `1912345678` | 400 "Số điện thoại phải có đúng 10 số và bắt đầu bằng 0" (chặn ở cả client và server) | ☐ |
| 9.8 | OTP sai | Nhập sai mã | 401 "Mã OTP không hợp lệ hoặc đã hết hạn" | ☐ |
| 9.9 | OTP dùng lại | Dùng lại mã đã xác thực thành công | 401 (`used = true`) | ☐ |
| 9.10 | OTP hết hạn | Chờ > 5 phút rồi nhập | 401 | ☐ |
| 9.11 | Yêu cầu OTP mới | Gọi request-otp 2 lần | Mã cũ bị xóa (`deleteMany`), chỉ mã mới nhất còn hiệu lực | ☐ |
| 9.12 | Đơn của tôi | Đăng nhập rồi mở "Đơn hàng của tôi" | Liệt kê đúng đơn theo SĐT trong token | ☐ |
| 9.13 | Tra cứu theo SĐT | Không đăng nhập, tra `by-phone` | Trả về đơn của SĐT đó | ☐ |
| 9.14 | Khách hủy đơn | Hủy đơn `pending` | 200; `status = cancelled`; **tồn kho được hoàn** (tạo lô `RETURN-…`); ghi lý do vào `notes` | ☐ |
| 9.15 | Hủy đơn đang giao | Hủy đơn `shipping` | 400 "Chỉ có thể hủy đơn hàng ở trạng thái chờ xử lý" | ☐ |
| 9.16 | Cập nhật hồ sơ | Đổi tên/email/địa chỉ | Lưu thành công, hiển thị lại đúng | ☐ |
| 9.17 | ⚠️ Xem đơn người khác | Lấy `_id` một đơn bất kỳ → gọi `GET /orders/customer/:id` **không token** | **Hiện tại trả đầy đủ thông tin khách** → ghi nhận lỗi IDOR (mục A8) | ☐ |
| 9.18 | ⚠️ Hủy đơn người khác | Gọi `POST /orders/customer/:id/cancel` không token cho đơn của người khác | **Hiện tại hủy được** → ghi nhận lỗi (mục A8) | ☐ |

---

## 10. Luồng gợi ý nhập hàng

| # | Ca kiểm thử | Các bước | Kết quả mong đợi | KQ |
|---|---|---|---|---|
| 10.1 | Sinh gợi ý | `GET /purchases/recommendations` | Trả 3 nhóm `highPriority`/`mediumPriority`/`lowPriority`, kèm `currentMonth` và `currentSeasonLabel` đúng tháng hiện tại | ☐ |
| 10.2 | Hệ số mùa vụ | Đối chiếu `seasonalFactor` với bảng trong `goi-y-nhap-hang.dich-vu.ts` | Tháng 2 = 1.3, tháng 6–7 = 1.4, tháng 10–11 = 0.9, tháng 12 = 1.2 | ☐ |
| 10.3 | Hàng bán chạy sắp hết | Tạo ≥ 20 lượt bán trong 30 ngày cho 1 sản phẩm rồi hạ tồn xuống dưới ROP | Sản phẩm vào nhóm **HIGH**, lý do "Bán chạy, dưới ROP… – nhập gấp" | ☐ |
| 10.4 | Tồn rất thấp | Đặt `stock ≤ 50% minStockLevel` cho sản phẩm có phát sinh bán | HIGH, lý do "Tồn kho rất thấp – nhập gấp" | ☐ |
| 10.5 | Hàng bán chậm | Sản phẩm bán < 10 cái/30 ngày | LOW, lý do "Bán chậm – nhập ít để tránh tồn kho" | ☐ |
| 10.6 | Hàng đủ tồn | Sản phẩm tồn cao, không bán | Không xuất hiện trong gợi ý (`recommendedQuantity = 0` và không phải HIGH) | ☐ |
| 10.7 | Trừ hàng hết hạn | Sản phẩm tồn 100 nhưng 80 đã hết hạn | `currentStock` trong gợi ý = **20** (tồn hiệu dụng), không phải 100 | ☐ |
| 10.8 | Công thức ROP | Kiểm tra 1 dòng bất kỳ | `reorderPoint = ceil(seasonalDemand × 7 + safetyStock)`, `safetyStock = ceil(seasonalDemand × 7 × 1.5)` | ☐ |
| 10.9 | Chỉ tính đơn hoàn thành | Tạo đơn `pending` cho 1 sản phẩm | Đơn đó **không** ảnh hưởng `totalSoldLast30Days` | ☐ |
| 10.10 | Tạo phiếu từ gợi ý | Từ trang nhập hàng, chọn gợi ý → tạo phiếu | Số lượng và giá nhập gợi ý được điền sẵn | ☐ |

---

## 11. Luồng báo cáo, dashboard, thống kê

| # | Ca kiểm thử | Các bước | Kết quả mong đợi | KQ |
|---|---|---|---|---|
| 11.1 | Đối chiếu dashboard | Cộng tay doanh thu các đơn `completed` + `PAID` hôm nay | Khớp với ô "Hôm nay" trên dashboard | ☐ |
| 11.2 | Múi giờ | Tạo đơn lúc 23:30 giờ VN, xem lại dashboard | Đơn tính vào **ngày hôm đó** theo giờ VN, không nhảy sang ngày khác | ☐ |
| 11.3 | Lợi nhuận | Kiểm tra 1 đơn cụ thể | `lợi nhuận = total − Σ(importPrice × quantity)` | ☐ |
| 11.4 | Đơn cũ thiếu giá vốn | Sửa tay 1 đơn trong DB thành `importPrice = 0` rồi mở lại danh sách đơn | Giá vốn được **bù tự động** từ `purchasePrice` hiện tại của sản phẩm | ☐ |
| 11.5 | Đơn trả trong báo cáo | Xem báo cáo khoảng thời gian có đơn trả | Doanh thu bị trừ; nếu `isRestocked` thì giá vốn cũng bị trừ | ☐ |
| 11.6 | Cache 60s | Gọi `/dashboard/summary` 2 lần liên tiếp | Lần 2 nhanh hơn rõ rệt; sau khi tạo đơn mới, số liệu đổi ngay (invalidate) | ☐ |
| 11.7 | Biểu đồ 7 ngày | Xem `dashboard/orders-trend` | Đủ 7 điểm, ngày định dạng `YYYY-MM-DD`, ngày không có đơn = 0 | ☐ |
| 11.8 | Thống kê tháng | `GET /transactions/monthly?year=2026` | Đủ 12 tháng, tên tháng tiếng Việt | ☐ |
| 11.9 | Báo cáo tồn kho | `GET /reports/inventory` | `totalStockValue = Σ(stock × giá vốn)`, `potentialRevenue = Σ(stock × giá bán)`, danh sách hàng dưới định mức đúng | ☐ |
| 11.10 | Xuất PDF | `GET /reports/export` | Tải được file PDF; **kiểm tra chữ tiếng Việt có bị mất dấu không** (hiện tại nhãn là tiếng Anh, PDFKit chưa nhúng font Unicode) | ☐ |
| 11.11 | So sánh chéo | So `dashboard/top-products` với `reports/top-products` | Nếu lệch nhau → do 2 nguồn tính khác nhau (mục D4), ghi nhận | ☐ |
| 11.12 | Sao lưu | `/backup` (admin) | Tải file JSON gồm products/orders/purchases; ghi nhận **thiếu** users/customers/suppliers/batches | ☐ |

---

## 12. Luồng khách hàng & nhà cung cấp & nhật ký

| # | Ca kiểm thử | Các bước | Kết quả mong đợi | KQ |
|---|---|---|---|---|
| 12.1 | Tạo khách trùng SĐT | Tạo 2 khách cùng số điện thoại | 409 "Số điện thoại đã được sử dụng" | ☐ |
| 12.2 | Đồng bộ từ đơn cũ | `POST /customers/sync-from-orders` | Trả `{created, updated}`; khách mới được tạo từ SĐT trong đơn, không tạo trùng | ☐ |
| 12.3 | Phân loại khách | `POST /customers/classify` sau khi có khách chi > 2 triệu | Khách đó thành `vip`; 500K–2M → `tiem-nang`; < 500K → `thuong`; `tongChiTieu`, `soLanMua` cập nhật (đơn `cancelled` bị loại) | ☐ |
| 12.4 | Phân loại tự động? | Bán thêm cho khách VIP rồi xem lại **không** bấm phân loại | Hạng **không tự cập nhật** → ghi nhận (mục C4) | ☐ |
| 12.5 | CRUD nhà cung cấp | Tạo/sửa/xóa NCC | Mã NCC là unique; sau khi xóa, kiểm tra phiếu nhập cũ còn hiển thị tên NCC (nhờ snapshot) | ☐ |
| 12.6 | Nhật ký thao tác | Mở `/audit-logs`, lọc theo `entityType = purchase` | Phân trang đúng, sắp xếp mới nhất trước, hiển thị người thực hiện | ☐ |
| 12.7 | Phạm vi nhật ký | Tạo đơn hàng / sửa sản phẩm / khóa tài khoản rồi xem nhật ký | **Không có bản ghi** → xác nhận phạm vi audit hiện chỉ phủ nhập hàng (mục B4) | ☐ |

---

## 13. Kiểm tra tích hợp xuyên suốt (end-to-end)

Chạy trọn vẹn một chu trình và đối chiếu số liệu ở từng mốc. Đây là kịch bản nên dùng để demo/bảo vệ đồ án.

| Bước | Hành động | Cần kiểm chứng |
|---|---|---|
| 1 | Admin tạo nhà cung cấp + 1 sản phẩm mới (tồn 0) | Sản phẩm hiện trong danh sách, tồn = 0 |
| 2 | Tạo phiếu nhập 100 cái, giá nhập 10.000 | Phiếu `pending`, **tồn vẫn 0** |
| 3 | Nhận hàng: thực nhận 95, giá 10.500, HSD +60 ngày | Tồn = 95; có 1 lô; `purchasePrice = 10.500`; audit log ghi nhận |
| 4 | Gợi ý nhập hàng | Sản phẩm này không còn nằm nhóm HIGH |
| 5 | Bán tại quầy 10 cái, giá bán 15.000, có SĐT khách | Tồn = 85; lô còn 85; đơn `completed/PAID`; `importPrice = 10.500`; khách được tạo |
| 6 | Xem dashboard | Doanh thu +150.000; lợi nhuận +45.000 (150.000 − 105.000) |
| 7 | Khách đặt online 5 cái | Tồn = 80; đơn `pending`, `isOnline = true`; badge admin tăng |
| 8 | Admin chuyển `shipping` → `completed` | `paymentStatus = PAID`, doanh thu tăng tiếp |
| 9 | Khách trả 2 cái (có nhập kho) | Tồn = 82; đơn `RET…` total âm; doanh thu giảm đúng phần trả |
| 10 | Thử trả tiếp 1 cái nữa | Bị chặn "đã phát sinh đổi/trả trước đó" |
| 11 | Bán ghi nợ 3 cái rồi thu nợ | Tồn = 79; đơn chuyển từ `DEBT` sang `PAID`; tổng nợ về 0 |
| 12 | Sửa HSD lô về quá khứ, thử bán | Bị chặn; sau khi `remove-expired` thì tồn = 0 và bán báo hết hàng |
| 13 | Xuất báo cáo doanh thu khoảng thời gian test | Số liệu khớp với tính tay ở các bước trên |
| 14 | Đối chiếu bất biến cuối cùng | `Product.stock` = Σ `quantity` các lô; không có tồn kho âm; không có mã đơn/phiếu trùng |

---

## 14. Bảng tổng hợp rủi ro đã biết (kết quả mong đợi là **phát hiện lỗi**)

| Ca | Mô tả | Mức độ | Tham chiếu đề xuất |
|---|---|---|---|
| 1.10 | API nhà cung cấp không có xác thực | Cao | A3 |
| 3.12 | Race condition khi bán đồng thời ⇒ tồn kho âm | Cao | A2 |
| 3.5 / 4.x | Không có transaction ⇒ lỗi giữa chừng để lại dữ liệu dở dang | Cao | A1 |
| 8.2 | Tìm đơn theo SĐT trả về toàn bộ đơn | Cao | D3 |
| 9.17, 9.18 | Xem / hủy đơn của người khác chỉ với `_id` | Cao | A8 |
| 8.14 | Trả nhiều hơn số đã mua | Trung bình | B2 |
| 4.13 | Xóa phiếu nhập đã nhận không hoàn kho | Trung bình | — |
| 6.5 | Hủy đơn qua `updateStatus` không hoàn kho | Trung bình | A1/B4 |
| 2.10 | API public lộ giá vốn | Trung bình | B9 |
| 11.10 | PDF không hỗ trợ tiếng Việt có dấu | Thấp | B6 |
| 12.7 | Nhật ký thao tác phủ chưa đủ | Thấp | B4 |
| — | Không có test tự động | Cao | A6 |

---

## 15. Gợi ý tự động hóa

Sau khi chạy tay xong bộ kịch bản trên, nên chuyển các ca **in đậm rủi ro** thành test tự động:

```bash
# Backend: tạo file cạnh service, ví dụ
# src/phan-he/don-hang/don-hang.dich-vu.spec.ts
npx jest src/phan-he/don-hang/don-hang.dich-vu.spec.ts
```

Thứ tự ưu tiên viết test:
1. `assertAfterSaleEligible` — 6 nhánh điều kiện (mục 8.8–8.11).
2. `updateStatus` / `normalizeStatusForRule` — máy trạng thái (mục 6.1–6.7).
3. `getExpiryStatus` + `getProductExpiryStatusMap` — ngưỡng ngày (mục 5.1–5.2).
4. `calculateRecommendedQuantity` + `determinePriority` — công thức ROP (mục 10.3–10.8).
5. `xacDinhLoaiKhachHang` — ngưỡng phân loại khách (mục 12.3).
6. e2e với `mongodb-memory-server` cho kịch bản mục 13.
