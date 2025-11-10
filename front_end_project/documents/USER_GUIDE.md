# 📖 HƯỚNG DẪN SỬ DỤNG HỆ THỐNG QUẢN LÝ TẠP HÓA

## 🚀 Bước 1: Cài đặt và chạy

### Cài đặt Node.js
Đảm bảo bạn đã cài đặt Node.js phiên bản 16 trở lên:
```bash
node --version  # Kiểm tra phiên bản Node.js
```

### Cài đặt dependencies
```bash
yarn
```

### Chạy ứng dụng
```bash
yarn dev
```

Mở trình duyệt và truy cập: `http://localhost:5173`

## 👤 Bước 2: Đăng nhập

### Chọn tài khoản phù hợp:

#### 🔑 Tài khoản Admin (Toàn quyền)
- Username: `admin`
- Password: `admin123`
- Quyền hạn:
  - ✅ Xem tất cả trang
  - ✅ Thêm, sửa, xóa sản phẩm
  - ✅ Xem báo cáo

#### 👨‍💻 Tài khoản Nhân viên
- Username: `employee`
- Password: `employee123`
- Quyền hạn:
  - ✅ Xem dashboard
  - ✅ Thêm và sửa sản phẩm
  - ❌ KHÔNG được xóa sản phẩm
  - ❌ KHÔNG xem được báo cáo

#### 👨‍💼 Tài khoản Kế toán
- Username: `accountant`
- Password: `accountant123`
- Quyền hạn:
  - ✅ Xem dashboard
  - ✅ Xem báo cáo
  - ❌ KHÔNG được sửa sản phẩm

## 📊 Bước 3: Sử dụng Dashboard

Dashboard là trang chủ khi đăng nhập thành công.

### Các thông tin hiển thị:

1. **4 Card thống kê trên cùng:**
   - Doanh thu hôm nay
   - Lợi nhuận hôm nay
   - Đơn hàng hôm nay
   - Số sản phẩm sắp hết hàng

2. **Biểu đồ doanh thu 7 ngày:**
   - Đường xanh lá: Doanh thu
   - Đường xanh dương: Lợi nhuận
   - Hover để xem chi tiết

3. **Biểu đồ Top 5 sản phẩm bán chạy:**
   - Cột màu tím hiển thị số lượng bán

4. **3 Card thống kê tháng:**
   - Tổng doanh thu tháng
   - Tổng lợi nhuận tháng
   - Tổng số sản phẩm

## 📦 Bước 4: Quản lý sản phẩm

### Xem danh sách sản phẩm
1. Click menu **"Sản phẩm"** ở sidebar
2. Danh sách hiển thị với các cột:
   - Tên sản phẩm
   - Danh mục
   - Giá nhập
   - Giá bán
   - Tồn kho (có màu cảnh báo)
   - Đơn vị
   - Thao tác (Sửa/Xóa)

### Tìm kiếm sản phẩm
- Dùng ô tìm kiếm ở trên bảng
- Tìm theo: Tên, Danh mục, Nhà cung cấp
- Kết quả tự động lọc

### Thêm sản phẩm mới
1. Click nút **"Thêm sản phẩm"** (màu xanh)
2. Điền form:
   - Tên sản phẩm (bắt buộc)
   - Danh mục (bắt buộc)
   - Giá nhập (bắt buộc, số dương)
   - Giá bán (bắt buộc, phải > giá nhập)
   - Tồn kho (bắt buộc)
   - Đơn vị (kg, hộp, chai...)
   - Nhà cung cấp (bắt buộc)
   - Mô tả (tùy chọn)
3. Click **"Thêm mới"**

### Sửa sản phẩm
1. Click icon ✏️ (Sửa) ở cột "Thao tác"
2. Form sẽ hiện với thông tin cũ
3. Chỉnh sửa các trường cần thiết
4. Click **"Cập nhật"**

### Xóa sản phẩm (CHỈ ADMIN)
1. Click icon 🗑️ (Xóa) ở cột "Thao tác"
2. Xác nhận xóa trong popup
3. Sản phẩm sẽ bị xóa vĩnh viễn

⚠️ **Lưu ý:** Nhân viên KHÔNG thấy nút xóa!

## 🏪 Bước 5: Quản lý tồn kho

### Xem cảnh báo tồn kho
1. Click menu **"Tồn kho"** ở sidebar
2. Xem 4 card thống kê:
   - Tổng giá trị tồn kho
   - Số sản phẩm sắp hết hàng
   - Số sản phẩm tồn kho rất thấp
   - Số sản phẩm hết hàng

### Hiểu các mức cảnh báo
- 🔴 **Hết hàng:** Tồn kho = 0
- 🟠 **Rất thấp:** Tồn kho ≤ 5
- 🟡 **Thấp:** Tồn kho < 10

### Bảng cảnh báo tồn kho
Hiển thị các sản phẩm cần nhập hàng với:
- Tên sản phẩm và icon cảnh báo
- Tồn kho hiện tại
- Mức độ cảnh báo
- **Đề xuất nhập thêm** (tính toán tự động)
- Giá trị cần nhập

### Bảng tồn kho tất cả sản phẩm
- Xem tổng quan tồn kho toàn bộ
- Sản phẩm < 10 sẽ hiển thị màu đỏ

## 📈 Bước 6: Xem và xuất báo cáo

⚠️ **Chỉ Admin và Kế toán** được truy cập trang này!

### Xem báo cáo
1. Click menu **"Báo cáo"** ở sidebar
2. Báo cáo hiển thị:
   - 3 card tổng quan: Tổng doanh thu, Tổng lợi nhuận, Tỷ suất lợi nhuận
   - Bảng Top 10 sản phẩm bán chạy
   - Bảng doanh thu 10 ngày gần nhất
   - Phần phân tích và nhận xét tự động

### Xuất PDF
1. Click nút **"Xuất PDF"** (màu xanh lá) ở góc trên phải
2. Chờ hệ thống tạo file (3-5 giây)
3. File PDF tự động download với tên: `bao-cao-YYYY-MM-DD.pdf`
4. PDF bao gồm toàn bộ nội dung trang báo cáo

💡 **Mẹo:** PDF có thể xuất cả trong Dark mode!

## 🎨 Bước 7: Tùy chỉnh giao diện

### Bật/tắt Dark Mode
- Click icon 🌙 (Moon) hoặc ☀️ (Sun) ở góc trên phải
- Theme sẽ chuyển đổi mượt mà
- Tự động lưu lựa chọn của bạn

### Đóng/mở Sidebar
- Click icon ☰ (Menu) ở góc trên trái
- Trên mobile: Sidebar tự động đóng sau khi chọn menu
- Trên desktop: Sidebar luôn hiển thị

### Responsive
- **Mobile:** Sidebar overlay, thu gọn bảng
- **Tablet:** Layout tối ưu cho màn hình trung bình
- **Desktop:** Hiển thị đầy đủ tính năng

## 🔔 Bước 8: Thông báo (Toast)

Hệ thống tự động hiển thị thông báo khi:
- ✅ Thêm/sửa/xóa sản phẩm thành công
- ❌ Có lỗi xảy ra
- ⏳ Đang xử lý (loading)
- 🔐 Không có quyền thực hiện thao tác

Thông báo xuất hiện ở **góc trên phải** và tự động biến mất sau 3-4 giây.

## 🚪 Bước 9: Đăng xuất

1. Click icon 🚪 (Logout) ở góc trên phải
2. Hệ thống sẽ đưa bạn về trang đăng nhập
3. Cần đăng nhập lại để sử dụng tiếp

## ❓ Câu hỏi thường gặp (FAQ)

### Q: Dữ liệu lưu ở đâu?
**A:** Dữ liệu được lưu trong `localStorage` của trình duyệt. Khi clear cache sẽ mất dữ liệu.

### Q: Làm sao để reset về dữ liệu ban đầu?
**A:** 
1. Mở DevTools (F12)
2. Tab Application → Storage → Local Storage
3. Xóa key `grocery_products`
4. Refresh trang

### Q: Tại sao không thấy nút "Xóa sản phẩm"?
**A:** Chỉ Admin mới có quyền xóa. Đăng nhập với tài khoản `admin/admin123`.

### Q: Tại sao không vào được trang Báo cáo?
**A:** Chỉ Admin và Kế toán được xem báo cáo. Nhân viên không có quyền.

### Q: Giá bán phải lớn hơn giá nhập bao nhiêu?
**A:** Hệ thống chỉ yêu cầu giá bán > giá nhập. Tùy bạn quyết định tỷ suất lợi nhuận.

### Q: Tại sao có sản phẩm bị đánh dấu đỏ?
**A:** Những sản phẩm có tồn kho < 10 sẽ được cảnh báo bằng màu đỏ/cam để dễ nhận biết.

### Q: Làm sao biểu đồ tính toán dữ liệu?
**A:** Đây là **mock data** (dữ liệu giả lập). Trong thực tế sẽ kết nối API backend thật.

### Q: PDF có bao gồm biểu đồ không?
**A:** Có! PDF capture toàn bộ nội dung trang báo cáo, bao gồm cả bảng và text.

### Q: Có thể in trực tiếp không cần PDF?
**A:** Bạn có thể dùng Ctrl+P để in trực tiếp từ trình duyệt.

### Q: Dark mode có áp dụng cho PDF không?
**A:** Có! PDF sẽ giữ nguyên theme đang dùng khi xuất.

## 🆘 Xử lý sự cố

### Lỗi: Cannot find module
```bash
rm -rf node_modules yarn.lock
yarn
```

### Lỗi: Port already in use
```bash
yarn dev --port 3000
```

### Lỗi: TypeScript errors
```bash
yarn build --force
```

### UI bị vỡ, không đúng màu
- Clear cache trình duyệt
- Hard refresh: Ctrl+Shift+R (Windows) hoặc Cmd+Shift+R (Mac)

### Sidebar không đóng trên mobile
- Refresh lại trang
- Thử trên trình duyệt khác

## 💡 Tips & Tricks

1. **Sử dụng tìm kiếm:** Thay vì scroll, dùng ô tìm kiếm để nhanh hơn
2. **Keyboard shortcuts:** 
   - `Escape` để đóng modal
   - `Enter` để submit form
3. **Dark mode tiết kiệm pin:** Dùng dark mode khi làm việc lâu
4. **Bookmark các trang:** Lưu link trực tiếp đến trang hay dùng
5. **Xuất PDF định kỳ:** Nên xuất báo cáo cuối tháng để lưu trữ

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy:
1. Đọc kỹ hướng dẫn này
2. Kiểm tra phần FAQ
3. Xem file `README.md` để biết thêm chi tiết kỹ thuật
4. Xem file `FEATURES.md` để biết danh sách tính năng đầy đủ

---

**Chúc bạn sử dụng hệ thống hiệu quả! 🎉**

