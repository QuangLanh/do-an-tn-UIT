# Hướng dẫn chạy dự án sau khi clone

Dự án gồm 3 ứng dụng cài đặt độc lập (không dùng workspace — phải `npm install` trong từng thư mục):

| Thư mục | Vai trò | Địa chỉ dev |
|---|---|---|
| `back_end_project` | API NestJS + MongoDB | http://localhost:4000/api (Swagger: `/api/docs`) |
| `front_end_project` | Web quản trị (admin/staff) | http://localhost:5173 |
| `customer_app` | Web khách hàng | http://localhost:5174 |

Bạn **không cần** tài khoản MongoDB Atlas. Chạy MongoDB trên máy mình là đủ.

---

## 1. Cài MongoDB trên máy

Tải **MongoDB Community Server** + **MongoDB Compass**: https://www.mongodb.com/try/download/community

Trên Windows, bộ cài mặc định chạy MongoDB như một Windows Service ở `localhost:27017`, bật sẵn mỗi lần khởi động máy. Mở Compass, bấm **Connect** với chuỗi mặc định `mongodb://localhost:27017` để kiểm tra.

Không cần cấu hình replica set — code không dùng transaction nào.

## 2. Tạo file `.env` cho backend

File `.env` không nằm trong git. Tạo `back_end_project/.env` với nội dung:

```env
MONGO_URI="mongodb://localhost:27017/taphoa"
JWT_SECRET="doi_thanh_chuoi_bat_ky_cua_ban_cang_dai_cang_tot"
JWT_EXPIRATION=7d
PORT=4000
NODE_ENV=development
FRONTEND_URLS=http://localhost:5173,http://localhost:5174
```

Lưu ý `FRONTEND_URLS` (số nhiều) — CORS và Socket.IO đọc biến này. Origin nào không có trong danh sách sẽ bị từ chối.

Hai app frontend chạy được với giá trị mặc định, không cần `.env`. Nếu muốn khai báo rõ:

- `front_end_project/.env` → `VITE_API_BASE_URL=http://localhost:4000/api`
- `customer_app/.env` → `VITE_API_BASE_URL=http://localhost:4000/api` **và** `VITE_API_URL=http://localhost:4000` (biến thứ hai không có `/api`, chỉ dùng để ghép tiền tố cho `imageUrl`)

## 3. Cài thư viện và nạp dữ liệu

```bash
cd back_end_project
npm install
```

Chọn **một** trong hai cách lấy dữ liệu:

**Cách A — dữ liệu mẫu (có sẵn trong repo, không cần gì thêm)**

```bash
npm run seed -- cua-hang-mac-dinh
```

Script tạo cửa hàng `cua-hang-mac-dinh` và nạp 270 sản phẩm từ `du-lieu-san-pham.json`. Chưa có đơn hàng / phiếu nhập / tài khoản đăng nhập — xem bước 5 để tạo tài khoản.

**Cách B — dữ liệu thật do người giao dự án gửi kèm**

Nếu bạn nhận được thư mục `du-lieu-mau/` (chứa `products.json`, `orders.json`, `stores.json`, `users.json`, …), đặt nó vào `back_end_project/` rồi:

```bash
npm run import:json
```

Script in ra danh sách cửa hàng có trong dữ liệu khi xong. Mặc định nó bỏ qua collection nào đã có dữ liệu; muốn nạp lại từ đầu thì thêm `--ghi-de`.

Cũng có thể nạp bằng Compass nếu thích làm tay: chọn database `taphoa` → **Create Collection** đúng tên file (`products`, `orders`, `stores`, …) → **Add Data → Import JSON**. Các file này ở dạng Extended JSON nên Compass đọc đúng `ObjectId` và `Date`; đừng sửa tay `{"$oid": …}` thành chuỗi, liên kết giữa các bảng sẽ đứt.

Index không cần nạp — Mongoose tự tạo lại (kể cả các unique index ghép với `storeId`) ở lần chạy backend đầu tiên.

## 4. Chạy 3 ứng dụng

Mở 3 terminal:

```bash
cd back_end_project  && npm run start:dev
cd front_end_project && npm install && npm run dev
cd customer_app      && npm install && npm run dev
```

## 5. Tạo tài khoản đăng nhập

Nếu đã nạp `users.json` (cách B) thì dùng luôn tài khoản có trong đó, bỏ qua bước này.

Với dữ liệu mẫu (cách A), chạy trong `back_end_project/`:

```bash
npm run tao-admin
```

Script tạo tài khoản `admin@taphoa.vn` / `123456` quyền `admin` cho cửa hàng `cua-hang-mac-dinh`, và tạo luôn cửa hàng nếu chưa có. Muốn đổi thì truyền tham số:

```bash
npm run tao-admin -- email@cua-ban.vn matkhaumoi "Tên Của Bạn" ma-cua-hang
```

Chạy lại với cùng email thì script chỉ báo đã tồn tại, không ghi đè gì.

Đừng dùng `POST /api/auth/register` để tạo tài khoản đầu tiên — endpoint đó có `@VaiTro(ADMIN)`, phải đăng nhập bằng một admin sẵn có mới gọi được. Sau khi đã có admin thì dùng nó (hoặc trang quản lý người dùng trên web) để thêm nhân viên.

Đăng nhập web quản trị tại http://localhost:5173/login

Web khách hàng dùng đường dẫn theo mã cửa hàng: http://localhost:5174/s/cua-hang-mac-dinh

## 6. Xuất dữ liệu để bàn giao lại

```bash
npm run export:json           # ra thư mục du-lieu-mau/
npm run export:json -- noi-khac
```

`users.json` chứa mật khẩu đã băm bcrypt, `customers.json` chứa số điện thoại thật — đừng đẩy thư mục này lên repo công khai.

---

## Vướng ở đâu thì xem chỗ này

| Hiện tượng | Nguyên nhân |
|---|---|
| `[da-cua-hang] Thiếu ngữ cảnh cửa hàng` | Request không có JWT và cũng không có `X-Store-Code` / `?store=`. Đây là cơ chế chặn rò rỉ dữ liệu giữa các cửa hàng, không phải bug. |
| Frontend gọi API bị CORS | `.env` khai `FRONTEND_URL` (số ít) thay vì `FRONTEND_URLS`. |
| Web khách hàng không thấy sản phẩm | Sai mã cửa hàng trong URL `/s/<ma-cua-hang>`. Kiểm tra collection `stores` xem `ma` là gì. |
| Ảnh sản phẩm không hiện | Thiếu `VITE_API_URL` (không có `/api`) trong `customer_app/.env`. |
| `npm run build` lỗi type | Đúng — `tsc` chạy trước `vite build`, lỗi type là chặn build. |
| Gọi `/api/auth/register` bị 401/403 | Endpoint này chỉ admin gọi được. Tạo admin đầu tiên bằng `npm run tao-admin`. |
| `npm test` lỗi | Dự án không có test nào; script Jest khai trong `package.json` nhưng không có file `*.spec.ts`. |
| OTP đăng nhập khách hàng | Không có nhà cung cấp SMS. Khi `NODE_ENV=development`, mã OTP trả về ngay trong response của `request-otp`; ngoài ra chỉ thấy trong log server. |

Đọc thêm `CLAUDE.md` ở thư mục gốc — mô tả khá chi tiết kiến trúc, quy ước đặt tên tiếng Việt và các điểm dễ gây bất ngờ trong nghiệp vụ.
