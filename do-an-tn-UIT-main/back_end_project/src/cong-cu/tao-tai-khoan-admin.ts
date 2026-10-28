import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { UngDungPhanHe } from '../ung-dung.phan-he';
import { DichVuNguoiDung } from '../phan-he/nguoi-dung/nguoi-dung.dich-vu';
import { DichVuCuaHang } from '../phan-he/cua-hang/cua-hang.dich-vu';
import { chayTrongNguCanh } from '../dung-chung/da-cua-hang/ngu-canh-cua-hang';
import { VaiTroNguoiDung } from '../dung-chung/liet-ke/vai-tro-nguoi-dung.enum';
import { NganhHang } from '../dung-chung/liet-ke/nganh-hang.enum';

/**
 * Tạo tài khoản admin đầu tiên cho một cửa hàng.
 *
 *   npm run tao-admin -- admin@taphoa.vn 123456 "Quản trị" cua-hang-mac-dinh
 *   npm run tao-admin                                   # dùng toàn bộ giá trị mặc định
 *
 * Cần script này vì `POST /auth/register` yêu cầu quyền admin
 * (`@VaiTro(ADMIN)`), nên không thể tự tạo tài khoản admin đầu tiên qua API —
 * bài toán con gà và quả trứng. Script chạy trực tiếp qua DichVuNguoiDung nên
 * mật khẩu vẫn được băm bcrypt đúng như khi tạo qua API.
 *
 * Cửa hàng chưa tồn tại thì script tạo luôn, để chạy được trên database trắng.
 */
async function taoTaiKhoanAdmin() {
  const logger = new Logger('TaoTaiKhoanAdmin');
  const app = await NestFactory.createApplicationContext(UngDungPhanHe, {
    logger: ['error', 'warn', 'log'],
  });

  const email = process.argv[2] || 'admin@taphoa.vn';
  const matKhau = process.argv[3] || '123456';
  const hoTen = process.argv[4] || 'Quản trị viên';
  const maCuaHang = (process.argv[5] || 'cua-hang-mac-dinh').trim().toLowerCase();

  const dichVuNguoiDung = app.get(DichVuNguoiDung);
  const dichVuCuaHang = app.get(DichVuCuaHang);

  try {
    let cuaHang = await dichVuCuaHang.timTheoMa(maCuaHang);
    if (!cuaHang) {
      cuaHang = (await dichVuCuaHang.tao({
        ma: maCuaHang,
        ten: 'Cửa hàng mặc định',
        nganhHang: NganhHang.TAP_HOA,
      })) as any;
      logger.log(`🏪 Đã tạo cửa hàng "${maCuaHang}"`);
    }
    const storeId = (cuaHang as any)._id.toString();

    // Người dùng mới phải được tạo trong ngữ cảnh cửa hàng để plugin đa cửa hàng
    // gán storeId; thiếu ngữ cảnh là plugin báo lỗi.
    const nguoiDung = await chayTrongNguCanh({ storeId }, () =>
      dichVuNguoiDung.create({
        email,
        password: matKhau,
        fullName: hoTen,
        role: VaiTroNguoiDung.ADMIN,
      } as any),
    );

    logger.log('──────────────────────────────────────────');
    logger.log('Đã tạo tài khoản admin:');
    logger.log(`  email     : ${nguoiDung.email}`);
    logger.log(`  mật khẩu  : ${matKhau}`);
    logger.log(`  quyền     : ${nguoiDung.role}`);
    logger.log(`  cửa hàng  : ${maCuaHang}`);
    logger.log('Đăng nhập web quản trị tại http://localhost:5173/login');
  } catch (loi) {
    const thongBao = (loi as Error).message;
    if (thongBao.includes('Email already exists')) {
      logger.warn(`Email ${email} đã tồn tại — dùng luôn tài khoản đó để đăng nhập.`);
    } else {
      logger.error(`Tạo tài khoản thất bại: ${thongBao}`);
      throw loi;
    }
  } finally {
    await app.close();
  }
}

taoTaiKhoanAdmin()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
