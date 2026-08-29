# Đề xuất chức năng cần bổ sung (Recommendation)

> Danh sách được rút ra từ việc đọc mã nguồn hiện tại. Mỗi mục nêu **vấn đề đang tồn tại → đề xuất → vị trí sửa → độ ưu tiên**.
> Ký hiệu độ ưu tiên: **P0** = phải làm trước khi vận hành thật · **P1** = nên có để hoàn thiện đồ án · **P2** = mở rộng/nâng cao.

---

## A. Nhóm P0 — Đúng đắn dữ liệu và an toàn

### A1. Bọc transaction cho các luồng ghi nhiều bước
**Vấn đề.** `DichVuDonHang.create()` lưu đơn trước, rồi trừ kho từng sản phẩm trong vòng lặp. Nếu sản phẩm thứ 3 lỗi (hết hàng, hết hạn), đơn đã lưu và 2 sản phẩm đầu đã bị trừ kho — dữ liệu sai lệch vĩnh viễn. `receiveGoods`, `createExchange`, `createReturn`, `huyDonHangKhach` có cùng vấn đề.
**Đề xuất.** Dùng `session` của Mongoose (`connection.startSession()` + `withTransaction`) cho toàn bộ khối "ghi đơn + trừ kho + trừ lô". MongoDB Atlas (replica set) hỗ trợ sẵn.
**Vị trí.** `don-hang.dich-vu.ts`, `nhap-hang.dich-vu.ts`, `stock-batch.dich-vu.ts` (các hàm phải nhận `session` tùy chọn).
**Ưu tiên: P0.**

### A2. Kiểm tra tồn kho theo kiểu atomic (chống bán âm khi đồng thời)
**Vấn đề.** Mẫu `findById` → so sánh `stock` → `save()` bị race condition: hai đơn cùng lúc cho sản phẩm còn 1 cái đều pass kiểm tra.
**Đề xuất.** Thay bằng cập nhật có điều kiện: `updateOne({_id, stock: {$gte: qty}}, {$inc: {stock: -qty}})`, nếu `modifiedCount === 0` thì báo hết hàng. Áp dụng tương tự cho `StockBatch.quantity`.
**Vị trí.** `san-pham.dich-vu.ts::updateStock`, `stock-batch.dich-vu.ts::deductFEFO`.
**Ưu tiên: P0.**

### A3. Gắn guard cho controller nhà cung cấp
**Vấn đề.** `nha-cung-cap.dieu-khien.ts` không có `@UseGuards(BaoVeJwt, BaoVeVaiTro)` — bất kỳ ai cũng tạo/sửa/xóa được nhà cung cấp.
**Đề xuất.** Thêm guard + `@VaiTro(ADMIN, STAFF)` cho đọc, `@VaiTro(ADMIN)` cho xóa; đồng thời chuyển xóa sang **soft delete** (`isActive = false`) vì phiếu nhập tham chiếu tới NCC.
**Ưu tiên: P0.**

### A4. Sinh mã chứng từ an toàn cho đơn hàng
**Vấn đề.** `generateOrderNumber/ExchangeNumber/ReturnNumber` dùng `countDocuments()` — trùng mã khi tạo đồng thời, và tái sử dụng mã sau khi xóa đơn (`orderNumber` là unique ⇒ lỗi 500 cho người dùng).
**Đề xuất.** Áp dụng đúng mẫu đã dùng cho phiếu nhập (quét mã lớn nhất trong ngày + retry lỗi 11000), hoặc tốt hơn: collection `counters` với `findOneAndUpdate($inc)`.
**Vị trí.** `don-hang.dich-vu.ts`.
**Ưu tiên: P0.**

### A5. Chuẩn hóa cấu hình môi trường
**Vấn đề.** CORS/WebSocket đọc `FRONTEND_URLS` nhưng `.env` chỉ có `FRONTEND_URL`; `customer_app` dùng song song `VITE_API_BASE_URL` và `VITE_API_URL`; `JWT_SECRET` có giá trị mặc định `'default_secret_change_in_production'` nếu thiếu biến.
**Đề xuất.** Thống nhất tên biến; thêm `.env.example` cho cả 3 app; validate biến môi trường lúc khởi động (Joi hoặc `class-validator` qua `ConfigModule.forRoot({validationSchema})`), **fail-fast** nếu thiếu `JWT_SECRET`/`MONGO_URI`.
**Ưu tiên: P0.**

### A6. Bộ test tự động tối thiểu
**Vấn đề.** Không có file `*.spec.ts` nào; `npm test` và `npm run test:e2e` đều lỗi (thiếu cả `test/jest-e2e.json`).
**Đề xuất.** Ưu tiên unit test cho phần logic thuần: `assertAfterSaleEligible`, `normalizeStatusForRule`, máy trạng thái `updateStatus`, `getExpiryStatus`, `calculateRecommendedQuantity`/`determinePriority`, `xacDinhLoaiKhachHang`. Sau đó e2e cho 3 luồng chính (bán hàng, nhập–nhận hàng, đặt hàng online) bằng `mongodb-memory-server`.
**Ưu tiên: P0** (bắt buộc với đồ án tốt nghiệp có phần kiểm thử).

### A7. Bảo vệ endpoint OTP
**Vấn đề.** `POST /auth/customer/request-otp` là public, không giới hạn tần suất → spam OTP; `POST /auth/customer/login` (đăng nhập chỉ bằng SĐT, không cần OTP) vẫn còn hoạt động và **bỏ qua toàn bộ xác thực**.
**Đề xuất.** Thêm rate limit (`@nestjs/throttler`) cho request-otp và verify-otp; giới hạn số lần nhập sai OTP; **gỡ bỏ** endpoint `customer/login` đã đánh dấu `@deprecated` cùng `authApi.login` phía client.
**Ưu tiên: P0.**

### A8. Chặn truy cập đơn hàng của người khác (IDOR)
**Vấn đề.** `GET /orders/customer/:id`, `GET /orders/customer/by-phone?phone=…` và `POST /orders/customer/:id/cancel` đều gắn `@CongKhai()`. Chỉ cần biết một `_id` đơn hàng hoặc một số điện thoại là **xem được toàn bộ thông tin đơn (tên, địa chỉ, email, sản phẩm) và hủy được đơn** của người khác.
**Đề xuất.**
- Giữ public cho luồng guest nhưng bắt buộc kèm **mã tra cứu** (ví dụ `orderNumber` + 4 số cuối SĐT) thay vì chỉ `_id`;
- Với khách đã đăng nhập: yêu cầu JWT và đối chiếu `soDienThoai` trong token với đơn;
- Endpoint hủy đơn: bắt buộc xác thực hoặc kiểm tra khớp SĐT.

**Vị trí.** `don-hang.dieu-khien.ts` (dòng ~103–130), `don-hang.dich-vu.ts::huyDonHangKhach`.
**Ưu tiên: P0.**

---

## B. Nhóm P1 — Hoàn thiện nghiệp vụ

### B1. Sổ công nợ theo khách hàng
**Hiện tại.** Chỉ có danh sách đơn `DEBT` rời rạc; không có tổng nợ theo khách, không có lịch sử thanh toán từng phần.
**Đề xuất.** Trang "Công nợ khách hàng": nhóm theo SĐT, tổng dư nợ, hạn nợ, thanh toán **một phần** (thêm collection `DebtPayment` hoặc mảng `payments[]` trên đơn), cảnh báo nợ quá hạn, in giấy xác nhận nợ.
**Ưu tiên: P1.**

### B2. Cho phép đổi/trả một phần và nhiều lần
**Hiện tại.** `assertAfterSaleEligible` chặn đơn đã có bất kỳ đổi/trả nào (`hasAfterSale`), nên khách mua 10 món trả 1 món thì không thể trả tiếp món khác.
**Đề xuất.** Thay cờ boolean bằng **theo dõi số lượng đã trả trên từng dòng hàng** (`returnedQuantity`), điều kiện kiểm tra: `số trả thêm ≤ số đã mua − số đã trả`. Bổ sung thời hạn đổi/trả (ví dụ 7 ngày kể từ `paidAt`).
**Ưu tiên: P1.**

### B3. Giao diện Danh sách mua sắm cho khách
**Hiện tại.** Backend `danh-sach-mua-hang` đầy đủ (tạo, xem ACTIVE, sửa, xóa, hoàn thành) nhưng không có màn hình nào gọi tới.
**Đề xuất.** Thêm trang "Danh sách mua sắm" trong `customer_app`: lưu danh sách cần mua, một chạm chuyển toàn bộ sang giỏ hàng, đánh dấu hoàn thành. Đây là chức năng đã có sẵn API — chi phí thấp, giá trị demo cao.
**Ưu tiên: P1.**

### B4. Mở rộng nhật ký thao tác (audit log)
**Hiện tại.** Chỉ ghi log cho nhập hàng (tạo/nhận/xóa) và loại bỏ hàng hết hạn.
**Đề xuất.** Ghi log cho: tạo/hủy/đổi trạng thái đơn hàng, thu nợ, đổi/trả, tạo–sửa–xóa sản phẩm, điều chỉnh tồn kho thủ công, tạo–khóa tài khoản, đăng nhập thất bại. Nên làm bằng **Nest Interceptor** dùng chung thay vì gọi `dichVuLichSu.log()` rải rác.
**Ưu tiên: P1.**

### B5. Phân trang và lọc phía server
**Hiện tại.** `GET /orders`, `GET /products`, `GET /purchases` trả **toàn bộ** bản ghi rồi `populate('items.product')`; báo cáo còn tải hết đơn rồi tính trong bộ nhớ. Dữ liệu tăng lên sẽ chậm và tốn RAM.
**Đề xuất.** Thêm `page`/`limit`/`sort` cho các endpoint danh sách (theo mẫu đã có ở `audit-logs`), chuyển thống kê sang **aggregation pipeline** thay vì vòng lặp JavaScript, thêm index cho `paymentStatus`, `orderType + createdAt`.
**Ưu tiên: P1.**

### B6. Hoàn thiện xuất báo cáo
**Hiện tại.** PDF chỉ có 3 dòng tổng, chữ ASCII (font mặc định PDFKit **không hiển thị được dấu tiếng Việt**); chưa có xuất Excel.
**Đề xuất.** Nhúng font Unicode (Roboto/Noto Sans) vào PDFKit; bổ sung bảng chi tiết theo ngày và top sản phẩm; thêm xuất Excel (`exceljs`) cho báo cáo doanh thu và báo cáo tồn kho. Gỡ dependency `puppeteer` nếu không dùng (nặng ~300MB).
**Ưu tiên: P1.**

### B7. Sao lưu / phục hồi dữ liệu đúng nghĩa
**Hiện tại.** `GET /reports/backup` chỉ xuất JSON 3 collection (thiếu users, customers, suppliers, batches, audit logs) và **không có chức năng phục hồi**.
**Đề xuất.** Xuất đủ collection kèm metadata phiên bản; thêm `POST /reports/restore` (chỉ admin, có xác nhận 2 bước); hoặc hướng dẫn `mongodump/mongorestore` định kỳ.
**Ưu tiên: P1.**

### B8. Thông báo realtime đầy đủ hơn
**Hiện tại.** Socket chỉ dùng để làm mới badge số đơn chờ; khách hàng không nhận được thông báo nào.
**Đề xuất.** Phát thêm sự kiện cảnh báo tồn kho thấp / hàng sắp hết hạn cho admin; namespace riêng cho khách để cập nhật trạng thái đơn (đang giao, hoàn thành). Kèm gửi email/Zalo OA khi đơn đổi trạng thái.
**Ưu tiên: P1.**

### B9. Bổ sung tồn kho vào API sản phẩm công khai
**Vấn đề.** `GET /products` là public và trả **toàn bộ** trường, gồm `purchasePrice` (giá vốn) — lộ thông tin kinh doanh ra web khách hàng.
**Đề xuất.** Tạo response DTO riêng cho endpoint public: chỉ trả `name, sku, category, salePrice, stock, unit, imageUrl, description`.
**Ưu tiên: P1** (thực chất gần P0 về mặt bảo mật thương mại).

---

## C. Nhóm P2 — Nâng cao, mở rộng

### C1. Thanh toán trực tuyến
Tích hợp VNPay / MoMo / QR VietQR cho `customer_app`; thêm `paymentStatus` trung gian `PENDING_PAYMENT`, webhook xác nhận, đối soát giao dịch.

### C2. Quản lý giao hàng
Trạng thái con cho `shipping` (đã lấy hàng, đang giao, giao thất bại), gán shipper, phí vận chuyển theo khu vực, xác nhận giao hàng bằng ảnh/chữ ký.

### C3. Khuyến mãi và giá bán linh hoạt
Mã giảm giá, giảm theo % / số tiền, mua X tặng Y, giá theo nhóm khách (đã có phân loại VIP nhưng **chưa dùng để giảm giá**), combo sản phẩm, chương trình có thời hạn.

### C4. Tích điểm khách hàng thân thiết
Đã có `tongChiTieu`, `soLanMua`, `loaiKhachHang` — mới chỉ dùng để hiển thị. Bổ sung: tích/tiêu điểm, hạng thành viên tự động cập nhật sau mỗi đơn (hiện phải bấm "phân loại lại" thủ công).

### C5. Nâng cấp dự báo nhập hàng
Hệ số mùa vụ đang **cứng trong code**. Đề xuất: đưa vào cấu hình sửa được trên UI; tính theo từng danh mục thay vì toàn cửa hàng; dùng trung bình trượt/hồi quy trên dữ liệu thực tế của cửa hàng; tính thêm lead time thực tế theo từng nhà cung cấp (dữ liệu đã có trong phiếu nhập).

### C6. Quản lý hàng hỏng / hao hụt
Hiện chỉ có "loại bỏ hàng hết hạn". Bổ sung phiếu xuất hủy có lý do (vỡ, mất, khuyến mãi nội bộ), báo cáo tỷ lệ hao hụt theo tháng, ảnh hưởng đến giá vốn.

### C7. Kiểm kê định kỳ
Phiếu kiểm kê: nhập số đếm thực tế, so với sổ sách, tự sinh bút toán điều chỉnh và log chênh lệch — thay cho việc sửa `stock` thủ công như hiện nay.

### C8. Hỗ trợ nhiều chi nhánh / nhiều kho
Thêm `branchId` vào `Product`/`StockBatch`/`Order`/`Purchase`, phân quyền theo chi nhánh, báo cáo hợp nhất.

### C9. Ứng dụng di động / PWA cho khách
`customer_app` mới là web thuần. Bổ sung manifest + service worker (PWA) để cài trên điện thoại và xem sản phẩm khi mạng yếu; hoặc React Native.

### C10. Nâng cấp POS
Quét barcode bằng camera/máy quét USB (API `products/barcode/:barcode` đã có), in hóa đơn nhiệt K80, ngăn kéo tiền, phím tắt bàn phím, chế độ ngoại tuyến tạm thời.

---

## D. Nhóm chất lượng mã nguồn

| # | Vấn đề | Đề xuất | Ưu tiên |
|---|---|---|---|
| D1 | `productModel` để `public` trong `DichVuSanPham` và bị truy cập qua `(this.dichVuSanPham as any).productModel` ở `enrichOrdersWithCost` | Bổ sung hàm `layGiaVonTheoIds(ids)` trong `DichVuSanPham`, đóng lại `private` | P1 |
| D2 | Trùng logic tính giá vốn ở 3 nơi (`don-hang`, `bao-cao`, `giao-dich`) với fallback khác nhau (`0` vs `75% giá bán`) ⇒ hai màn hình cho hai con số lợi nhuận khác nhau | Gom về một service `DichVuGiaVon` duy nhất, thống nhất quy tắc fallback | P1 |
| D3 | `findByPhone()` trong `don-hang.dich-vu.ts` trả **toàn bộ đơn** (`return this.findAll(); /* Tạm */`) — endpoint tìm đơn theo SĐT của admin đang sai | Lọc đúng theo `customerPhone` | P0 |
| D4 | `getTopProducts` (aggregate) không bù giá vốn nên lệch với `getTopProductsReport` | Dùng chung một nguồn dữ liệu | P1 |
| D5 | `console.log` còn trong `bang-dieu-khien.dich-vu.ts` (`Ngày tính toán: …`) | Chuyển sang `Logger.debug` | P2 |
| D6 | Cache `cacheNho` là biến toàn cục theo tiến trình | Chuyển sang `CacheModule` của Nest (dễ thay Redis khi scale) | P2 |
| D7 | `TrangDoiTraHang.tsx` 1344 dòng, `TrangKiemKe.tsx` 901 dòng | Tách component con + custom hook cho phần gọi API | P2 |
| D8 | Ba kiểu gọi API song song ở admin (`apiService`, use-case `linh-vuc`, `apiClient` trực tiếp) | Thống nhất về `apiService` + `API_ENDPOINTS`; các use-case chỉ giữ nơi có logic nghiệp vụ thật | P2 |
| D9 | `window.location.reload()` để reset form sau khi bán hàng | Reset state cục bộ, giữ trải nghiệm mượt | P2 |
| D10 | Tài liệu trong `documents/` còn mô tả 4 vai trò (Admin/Manager/Accountant/Staff) trong khi code chỉ có 3 | Cập nhật lại tài liệu theo code | P1 |
| D11 | Chưa có index cho `Order.paymentStatus`, `Order.customerPhone + createdAt` | Bổ sung index phục vụ trang công nợ và tra cứu | P1 |
| D12 | Không có CI | Thêm GitHub Actions: `npm ci` + `lint` + `build` cho cả 3 app, chạy test khi đã có | P2 |

---

## E. Lộ trình gợi ý

| Giai đoạn | Nội dung | Kết quả đạt được |
|---|---|---|
| **1 — Ổn định** (P0) | A1, A2, A3, A4, A5, A7, A8, D3 | Không còn sai lệch tồn kho, không lộ endpoint, không trùng mã chứng từ |
| **2 — Kiểm thử** (P0) | A6 + kịch bản trong `KIEM_TRA_LUONG_NGHIEP_VU.md` | Có phần kiểm thử để trình bày trong báo cáo đồ án |
| **3 — Hoàn thiện nghiệp vụ** (P1) | B1, B2, B3, B4, B9, B6 | Đủ tính năng cho một cửa hàng vận hành thật |
| **4 — Hiệu năng & vận hành** (P1) | B5, B7, B8, D1, D2, D11 | Chạy ổn với dữ liệu lớn, có sao lưu/phục hồi |
| **5 — Mở rộng** (P2) | C1–C10, D5–D12 | Hướng phát triển sau đồ án |
