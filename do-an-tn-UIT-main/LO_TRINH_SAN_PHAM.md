# Lộ trình sản phẩm — Từ đồ án đến sản phẩm bán được

> Bản web: https://claude.ai/code/artifact/fec60671-78ce-40ef-8128-105f0514750c
> Mã nguồn trang web: `LO_TRINH_SAN_PHAM.html` (cùng thư mục này)
> Chi tiết kỹ thuật từng mục: `DE_XUAT_CHUC_NANG.md` · Kịch bản kiểm thử: `KIEM_TRA_LUONG_NGHIEP_VU.md`
> Ước tính: **18–24 tuần**, một người làm bán thời gian. Cập nhật 29/08/2026.

---

## Tiến độ (cập nhật 30/08/2026)

| Giai đoạn | Tiến độ | Ghi chú |
|---|---|---|
| **0.5 — Nền tảng nhiều cửa hàng** | ✅ **Xong** | 10/10 collection tách theo `storeId`, đã chuyển đổi 511 bản ghi thật, đã kiểm chứng cách ly |
| **0 — Chặn máu** | 🟡 **1/12** | Mới xong: gắn guard cho API nhà cung cấp (bắt buộc phải làm kèm multi-tenant) |
| **1 — Làm cho tới** | ⬜ 0/8 | Chưa bắt đầu |
| **2 — Điều kiện cần để bán** | ⬜ 0/8 | Chưa bắt đầu |
| **3 — Đóng gói sản phẩm** | ⬜ 0/6 | Chưa bắt đầu (phần multi-tenant đã tách sang GĐ 0.5) |
| **4 — Pháp lý & mở rộng** | ⬜ — | Chưa tới lúc |

**Việc đã làm ngoài lộ trình:**

- Bộ tài liệu dự án: `GIOI_THIEU_DU_AN.md`, `DE_XUAT_CHUC_NANG.md`, `KIEM_TRA_LUONG_NGHIEP_VU.md`, `CLAUDE.md`.
- Sửa 11 lỗi TypeScript khiến `front_end_project` không build được, trong đó có một lỗi kiểu thật: `CreatePurchaseDto` bắt client gửi `purchaseNumber`/`status` mà backend từ chối. Cả 3 app hiện build sạch.
- Đổi `MONGO_URI` sang chuỗi không dùng SRV vì máy dev không phân giải được bản ghi SRV.
- Sửa mã lỗi khi thiếu/sai mã cửa hàng: 400 và 404 thay vì 500.

**Bước tiếp theo được khuyến nghị:** làm nốt 11 mục còn lại của giai đoạn 0. Trong đó ba mục dưới đây nên làm trước vì đang lộ dữ liệu hoặc làm sai dữ liệu ngay lúc này: chặn IDOR đơn khách, sửa `findByPhone`, và ẩn giá vốn khỏi API công khai.

---

## Đang đứng ở đâu

| Chỉ số | Giá trị |
|---|---|
| Nghiệp vụ cốt lõi đã có | ~70% |
| Lỗi phải sửa trước khi dám demo | 12 |
| Tính năng mọi tiệm đều cần nhưng chưa có | 6 |
| Cơ chế giao sản phẩm cho khách | chưa có |

Về mặt chức năng, hệ thống đã đi khá xa so với một đồ án thông thường: quản lý lô hàng và hạn sử dụng theo FEFO, gợi ý nhập hàng có hệ số mùa vụ, đổi/trả có ràng buộc nghiệp vụ, đơn online realtime. Đó là phần khó nhất và nó đã xong.

Chưa bán được vì ba lý do tách bạch:

1. **Dữ liệu có thể sai lệch** khi nhiều người dùng cùng lúc.
2. **Thiếu bốn thứ căn bản** chủ tiệm sẽ hỏi trong năm phút đầu: in bill, quét mã vạch, nhập hàng từ Excel, dùng được trên điện thoại.
3. **Chưa có cách giao sản phẩm** — mỗi cửa hàng hiện cần một bản cài riêng do bạn dựng tay.

Ba lý do đó chính là ba giai đoạn đầu dưới đây.

---

## Quyết định kiến trúc — ĐÃ CHỐT

**Mô hình: một hệ thống, nhiều cửa hàng (multi-tenant).**

Thêm `storeId` vào toàn bộ collection, mỗi cửa hàng là một tenant. Sửa lỗi một lần là tất cả khách được vá; chi phí hạ tầng chia đều nên bán được giá thấp cho tiệm nhỏ.

Ràng buộc bắt buộc đi kèm: **chặn lọc `storeId` ở tầng truy vấn**, không dựa vào việc lập trình viên nhớ thêm điều kiện lọc ở từng câu query. Một lần rò rỉ dữ liệu giữa hai tenant là sự cố nghiêm trọng với sản phẩm thương mại.

**Hệ quả về lộ trình:** phần này chuyển từ giai đoạn 3 lên **làm ngay từ đầu**, vì nó chạm vào mọi schema — càng để muộn càng đắt.

### Tính đến chuyện tách ngành hàng khác (vật liệu xây dựng, …)

Định hướng mở rộng sang ngành khác ảnh hưởng tới thiết kế ngay từ bây giờ. Nguyên tắc:

- Cửa hàng có trường **ngành hàng** (`nganhHang`: tạp hóa, vật liệu xây dựng, …) để về sau bật/tắt tính năng và đổi thuật ngữ theo ngành.
- **Không nhét khái niệm riêng của tạp hóa vào lõi.** Hạn sử dụng và lô hàng là đặc thù thực phẩm; vật liệu xây dựng thì không cần nhưng lại cần đơn vị quy đổi (bao/tấn/m³), công nợ nhà thầu, báo giá. Nên tính năng theo ngành phải bật được bằng cấu hình, không phải bằng nhánh `if` rải rác trong code.
- Đơn vị quy đổi (thùng/lốc/lon ở tạp hóa, bao/tấn/m³ ở vật liệu) là **dùng chung cho cả hai ngành** — nên làm cho tổng quát ngay từ giai đoạn 2.
- Ngược lại, **đừng xây khung đa ngành trước khi bán được cho ngành đầu tiên.** Chỉ cần giữ cho lõi không bị khóa cứng vào tạp hóa là đủ.

---

## Giai đoạn 0 — Chặn máu (2–3 tuần)

Nhóm duy nhất mà một lỗi thôi cũng đủ giết sản phẩm: chủ tiệm phát hiện tồn kho sai một lần là mất niềm tin vĩnh viễn.

| | Lỗi | Hậu quả với cửa hàng thật | Vị trí | Ước tính |
|---|---|---|---|---|
| ✅ | API nhà cung cấp không có xác thực | Bất kỳ ai cũng thêm/sửa/xóa nhà cung cấp | `nha-cung-cap.dieu-khien.ts` | xong |
| ⬜ | Xem và hủy được đơn của người khác chỉ với ID | Lộ tên, SĐT, địa chỉ khách; ai cũng hủy được đơn | `don-hang.dieu-khien.ts` | 1 ngày |
| ⬜ | Tìm đơn theo SĐT trả về toàn bộ đơn | Nhân viên tra cứu thấy đơn của mọi khách khác | `findByPhone()` dòng 512 | 1 giờ |
| ⬜ | API sản phẩm công khai trả cả giá vốn | Khách xem web thấy giá nhập của cửa hàng | `san-pham.dieu-khien.ts` | 3 giờ |
| ⬜ | Không có transaction khi tạo đơn / nhận hàng | Lỗi giữa chừng để lại đơn đã lưu nhưng kho trừ thiếu | `don-hang.dich-vu.ts` | 4 ngày |
| ⬜ | Kiểm tra tồn kho không atomic | Hai máy bán cùng lúc món cuối đều thành công, tồn kho âm | `san-pham.dich-vu.ts` | 2 ngày |
| ⬜ | Sinh mã đơn bằng `countDocuments()` | Trùng mã sau khi xóa đơn ⇒ lỗi 500 giữa lúc bán hàng | `don-hang.dich-vu.ts` | 1 ngày |
| ⬜ | Còn endpoint đăng nhập khách chỉ bằng SĐT | Bỏ qua toàn bộ OTP — biết số là vào được tài khoản | `auth/customer/login` | 2 giờ |
| ⬜ | Không giới hạn tần suất gửi OTP | Bị spam, tốn tiền SMS khi đã đấu nhà cung cấp thật | `xac-thuc.dich-vu.ts` | 4 giờ |
| ⬜ | Xóa phiếu nhập đã nhận không hoàn kho | Tồn kho phồng lên không rõ nguyên nhân | `nhap-hang.dich-vu.ts` | 4 giờ |
| ⬜ | Hủy đơn qua đổi trạng thái không hoàn kho | Hàng đã hủy vẫn bị trừ khỏi kho | `updateStatus()` | 4 giờ |
| ⬜ | Trả hàng nhiều hơn số đã mua | Tồn kho tăng khống, doanh thu âm bất thường | `createReturn()` | 1 ngày |

Ba dòng đầu (sau mục đã xong) được xếp lên trước vì chúng đang lộ dữ liệu thật ngay lúc này, và mỗi mục chỉ tốn vài giờ.

**Điều kiện qua:** chạy hết kịch bản trong `KIEM_TRA_LUONG_NGHIEP_VU.md`, đặc biệt mục 13 (end-to-end 14 bước) và bất biến quan trọng nhất — **tồn kho sản phẩm luôn bằng tổng số lượng các lô**. Chưa đạt thì chưa demo cho bất kỳ ai.

---

## Giai đoạn 0.5 — Nền tảng nhiều cửa hàng ✅ ĐÃ DỰNG XONG (30/08/2026)

Chen lên trước giai đoạn 0 vì mọi thứ sau đó đều xây trên nền này.

| Hạng mục | Nội dung | Trạng thái |
|---|---|---|
| Schema `CuaHang` | Mã, tên, ngành hàng, địa chỉ, SĐT, gói cước, ngày hết hạn dùng thử, trạng thái | ✅ `phan-he/cua-hang/` |
| `storeId` trên mọi collection | Product, Order, Purchase, StockBatch, KhachHang, User, NhaCungCap, LichSuThaoTac, DanhSachMuaHang, Otp | ✅ 10/10 |
| Ngữ cảnh tenant | `storeId` trong JWT, lưu theo request bằng `AsyncLocalStorage` | ✅ `dung-chung/da-cua-hang/ngu-canh-cua-hang.ts` |
| Chặn ở tầng truy vấn | Mongoose plugin tự chèn `storeId` vào mọi `find/count/update/delete/aggregate`; thiếu ngữ cảnh thì **ném lỗi** thay vì trả dữ liệu mọi cửa hàng | ✅ `plugin-da-cua-hang.ts` |
| Sửa unique index | `sku`, `barcode`, `orderNumber`, `purchaseNumber`, `soDienThoai`, `code` chuyển thành index ghép với `storeId` | ✅ |
| Web khách hàng nhận diện cửa hàng | Mã cửa hàng trên URL `/s/<ma>`, dùng làm `basename` của React Router + header `X-Store-Code` | ✅ |
| Script chuyển dữ liệu cũ | Tạo cửa hàng mặc định, gán `storeId`, xóa index unique cũ | ✅ `npm run migrate:multi-store` |
| Đăng ký / dùng thử / gói cước | Chỉ mới có trường dữ liệu, chưa có luồng nghiệp vụ | ⏳ Giai đoạn 3 |

**Cách chạy chuyển đổi trên dữ liệu hiện có:**

```bash
cd back_end_project
npm run migrate:multi-store -- tap-hoa-minh-anh "Tạp hóa Minh Anh"
```

Chạy lại nhiều lần vẫn an toàn — chỉ đụng vào bản ghi còn thiếu `storeId`.
Sau đó web khách hàng truy cập tại `http://localhost:5174/s/tap-hoa-minh-anh`.

**Đã chuyển đổi trên dữ liệu thật (30/08/2026):** 511 bản ghi được gán `storeId` (287 sản phẩm, 121 đơn hàng, 32 phiếu nhập, 20 khách hàng, 7 lô hàng, 5 tài khoản, 5 nhà cung cấp, 33 nhật ký, 1 danh sách mua hàng), 6 index unique cũ đã xóa, không còn bản ghi nào thiếu `storeId`.

**Kiểm chứng cách ly (đã chạy):** tạo cửa hàng thứ hai và gọi cùng một API — cửa hàng cũ trả về 287 sản phẩm, cửa hàng mới trả về **0**. Các trường hợp lỗi cũng trả đúng mã: thiếu mã cửa hàng → 400, mã cửa hàng sai → 404.

**Còn phải kiểm chứng bằng tài khoản thật:** đăng nhập hai tài khoản thuộc hai cửa hàng khác nhau, đối chiếu đơn hàng, công nợ, báo cáo, và tra cứu theo mã đơn / số điện thoại.

---

## Giai đoạn 1 — Làm cho tới (3–4 tuần)

⬜ **Chưa bắt đầu** — 0/8 mục.

Đã tồn tại nhưng dừng ở mức đủ bảo vệ đồ án, chưa đủ để một cửa hàng dùng hằng ngày trong sáu tháng.

| Hạng mục | Hiện tại | Cần thành | Ước tính |
|---|---|---|---|
| Công nợ | Chỉ đánh dấu đơn nợ, thu nợ toàn phần | Sổ nợ theo khách, tổng dư nợ, **trả từng phần**, hạn nợ, nhắc nợ | 5 ngày |
| Đổi / trả hàng | Mỗi đơn chỉ đổi/trả một lần, không giới hạn thời gian | Trả từng phần nhiều lần theo số lượng còn lại, có hạn đổi trả | 4 ngày |
| Cách tính lợi nhuận | Ba nơi tính giá vốn khác nhau, có nơi lấy tạm 75% giá bán | Một nguồn duy nhất — hai màn hình không được ra hai con số | 3 ngày |
| Danh sách đơn / sản phẩm | Trả toàn bộ bản ghi rồi lọc ở trình duyệt | Phân trang, sắp xếp, lọc phía server; báo cáo dùng aggregation | 5 ngày |
| Nhật ký thao tác | Chỉ ghi phân hệ nhập hàng | Phủ đơn hàng, sản phẩm, kho, tài khoản, đăng nhập — dùng interceptor chung | 3 ngày |
| Xuất báo cáo | PDF ba dòng, chữ không dấu; không có Excel | PDF nhúng font tiếng Việt, có bảng chi tiết; thêm xuất Excel | 3 ngày |
| Phân loại khách | Phải bấm nút "phân loại lại" thủ công | Tự cập nhật hạng sau mỗi đơn hoàn thành | 1 ngày |
| Sao lưu | Xuất JSON 3 collection, không phục hồi được | Xuất đủ dữ liệu, có phục hồi, sao lưu tự động hằng đêm | 3 ngày |

**Điều kiện qua:** đưa vào chạy thử tại **một tiệm quen, miễn phí**, ít nhất hai tuần. Đây là lần đầu hệ thống gặp dữ liệu thật và thói quen thật — phần lớn yêu cầu của giai đoạn 2 sẽ đến từ đây chứ không phải từ suy đoán.

---

## Giai đoạn 2 — Điều kiện cần để bán (5–7 tuần)

⬜ **Chưa bắt đầu** — 0/8 mục.

Không phải tính năng "hay thì có". Chủ tiệm so sánh bạn với KiotViet hay Sapo, và đây là thứ họ kiểm tra trước khi hỏi giá.

| Tính năng | Vì sao bắt buộc | Ước tính |
|---|---|---|
| In hóa đơn máy in nhiệt K80 | Khách mua xong phải có bill; `/invoice` hiện chỉ trả JSON | 5 ngày |
| Quét mã vạch bằng máy quét và camera | Không ai gõ tay tên hàng khi có 5 khách đứng đợi | 3 ngày |
| Nhập danh mục hàng từ Excel | Tiệm có 500–2000 mặt hàng; nhập tay là lý do bỏ phần mềm ngay tuần đầu | 5 ngày |
| Giao diện dùng được trên điện thoại và tablet | Nhiều tiệm bán bằng điện thoại, không có máy tính ở quầy | 7 ngày |
| Ca làm việc và kiểm quỹ | Chủ cần biết ca nào bán bao nhiêu, tiền mặt thừa thiếu bao nhiêu | 5 ngày |
| Đơn vị quy đổi (thùng/lốc/lon — bao/tấn/m³) | Đặc thù tạp hóa, và **dùng lại được cho vật liệu xây dựng** | 4 ngày |
| Khuyến mãi và giá theo nhóm khách | Đã có hạng VIP nhưng chưa dùng để giảm giá | 6 ngày |
| Thanh toán chuyển khoản bằng QR | Tỷ lệ chuyển khoản ở tiệm nhỏ giờ rất cao | 3 ngày |

**Điều kiện qua:** **ba cửa hàng dùng thật**, không phải bạn bè dùng thử cho vui, trong ít nhất một tháng — và không tiệm nào bỏ giữa chừng.

---

## Giai đoạn 3 — Đóng gói thành sản phẩm (3–4 tuần)

⬜ **Chưa bắt đầu** — 0/6 mục.

Nhẹ hơn kế hoạch ban đầu vì phần multi-tenant đã làm ở giai đoạn 0.5.

| Hạng mục | Nội dung | Ước tính |
|---|---|---|
| Đăng ký, dùng thử, gói cước | Tự tạo cửa hàng, dùng thử 14–30 ngày, hết hạn thì khóa ghi nhưng vẫn cho xem và xuất dữ liệu | 6 ngày |
| Hướng dẫn khởi tạo | Wizard: tạo cửa hàng → nhập hàng từ Excel → tạo tài khoản nhân viên → bán thử một đơn | 4 ngày |
| Khách tự lấy lại dữ liệu | Xuất toàn bộ dữ liệu bất cứ lúc nào — xóa nỗi sợ "giao dữ liệu cho người lạ" khi chốt hợp đồng | 3 ngày |
| Trang giới thiệu và bảng giá | Landing page, ảnh chụp màn hình thật, bảng giá, tài khoản demo dùng ngay không cần đăng ký | 5 ngày |
| Hạ tầng vận hành | VPS, tên miền, SSL, CI/CD, theo dõi lỗi, cảnh báo server chết, sao lưu tự động và **có thử phục hồi** | 5 ngày |
| Tài liệu và hỗ trợ | Hướng dẫn có ảnh, vài video ngắn, kênh Zalo hỗ trợ, cam kết thời gian phản hồi | 4 ngày |

---

## Giai đoạn 4 — Sau khi có khách trả tiền (liên tục)

⬜ **Chưa tới lúc** — chỉ làm khi có khách trả tiền yêu cầu.

Mọi thứ ở đây đều hấp dẫn và đều là cái bẫy nếu làm sớm.

- **Hóa đơn điện tử** theo Nghị định 123 / Thông tư 78 — bắt buộc nếu bán cho hộ kinh doanh có mã số thuế; tích hợp qua Viettel, VNPT hoặc MISA.
- **Bảo vệ dữ liệu cá nhân** theo Nghị định 13/2023 — bạn đang lưu tên, SĐT, địa chỉ khách của cửa hàng.
- **Điều khoản sử dụng, chính sách bảo mật, hợp đồng mẫu** — nêu rõ trách nhiệm khi mất dữ liệu.
- **Nhánh ngành vật liệu xây dựng** — báo giá, công nợ nhà thầu, giao hàng công trình, đơn vị m³/tấn. Chỉ mở khi ngành tạp hóa đã có khách trả tiền ổn định.
- **Nhiều chi nhánh, chuyển hàng giữa kho** — khách lớn hơn, trả tiền nhiều hơn.
- **App di động cho chủ tiệm** — chỉ làm sau khi bản web đã có người trả tiền.
- **Tích điểm, chăm sóc khách hàng, thanh toán online** cho trang khách hàng.
- **Nâng cấp dự báo nhập hàng** — hệ số mùa vụ đang cứng trong code, nên đưa ra cấu hình và tính riêng theo ngành hàng.

---

## Cột mốc kiểm chứng

Đừng đo tiến độ bằng số tính năng đã code. Đo bằng bốn câu hỏi có thật:

| Mốc | Câu hỏi phải trả lời được |
|---|---|
| Hết GĐ 0 + 0.5 | **Dữ liệu có đáng tin không?** Tồn kho khớp tuyệt đối sau mọi thao tác; hai cửa hàng không nhìn thấy dữ liệu của nhau. |
| Hết GĐ 1 | **Một tiệm quen dùng được hai tuần không?** Miễn phí, bạn ngồi cạnh quan sát. Ghi lại mọi lần họ khựng lại — đó là danh sách việc thật. |
| Hết GĐ 2 | **Ba tiệm lạ dùng một tháng mà không bỏ không?** Nếu có tiệm bỏ, hỏi cho ra lý do trước khi viết thêm bất kỳ dòng code nào. |
| Hết GĐ 3 | **Có ai trả tiền không?** Khách đầu tiên trả tiền quan trọng hơn mọi tính năng ở giai đoạn 4. |

---

## Những việc đừng làm

- **Đừng đổi database.** Đã cân nhắc và đã chốt: chi phí viết lại quá lớn so với lợi ích, và MongoDB vốn hợp với mô hình đơn hàng có mảng nhúng ở đây.
- **Đừng xây khung đa ngành trước khi bán được cho ngành đầu tiên.** Giữ lõi không khóa cứng vào tạp hóa là đủ; trừu tượng hóa sớm sẽ làm chậm mọi thứ mà chưa đổi lấy được đồng nào.
- **Đừng làm app mobile trước khi bản web có khách trả tiền.** Nhân đôi khối lượng bảo trì trong khi chưa chứng minh được có người mua.
- **Đừng làm đa chi nhánh khi chưa có khách đầu tiên.** Tiệm một cửa hàng là thị trường bạn nhắm tới.
- **Đừng cạnh tranh bằng số lượng tính năng.** KiotViet, Sapo, Nhanh.vn đã đi trước nhiều năm. Chỗ trống nằm ở tiệm nhỏ thấy các phần mềm đó quá phức tạp và quá đắt — lợi thế của bạn phải là **đơn giản và rẻ**, và mọi tính năng thêm vào đều làm mòn lợi thế đó.
- **Đừng hứa hóa đơn điện tử khi chưa tích hợp.** Đây là phần có ràng buộc pháp lý, sai là khách chịu hậu quả thật.

---

## Chi phí vận hành cần tính vào giá bán

| Khoản | Ghi chú | Ước tính / tháng |
|---|---|---|
| VPS 4GB RAM | Backend + MongoDB self-host cho vài chục cửa hàng đầu | 300–600k |
| MongoDB Atlas (nếu không self-host) | M0 miễn phí không dùng cho sản phẩm thật; M10 trở lên mới có sao lưu tự động | ~1.4tr |
| Tên miền + SSL | SSL dùng Let's Encrypt miễn phí | ~25k |
| SMS OTP | Chỉ phát sinh khi trang khách hàng có người dùng thật | 300–800đ / tin |
| Theo dõi lỗi, sao lưu ngoài | Sentry bản miễn phí đủ dùng giai đoạn đầu | 0–200k |

Với chi phí này, mức giá quanh **150–300 nghìn/tháng cho một cửa hàng** là khả thi, và chỉ cần khoảng mười khách là hòa vốn hạ tầng. Con số đó cũng là lý do mô hình nhiều tenant trên một hệ thống là lựa chọn đúng.
