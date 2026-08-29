import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { DichVuCuaHang } from '../../phan-he/cua-hang/cua-hang.dich-vu';
import { chayTrongNguCanh, NguCanhCuaHang } from './ngu-canh-cua-hang';

/**
 * Khởi tạo ngữ cảnh cửa hàng cho mỗi request.
 *
 * Middleware chạy TRƯỚC guard, nên ở đây mới chỉ suy ra được cửa hàng từ mã công khai
 * (`X-Store-Code` hoặc `?store=`) dùng cho web khách hàng. Với request có đăng nhập,
 * `ChienLuocJwt` sẽ ghi đè storeId lấy từ token — đối tượng ngữ cảnh được sửa tại chỗ
 * nên mọi tầng phía sau đều thấy giá trị đúng.
 */
@Injectable()
export class NguCanhCuaHangMiddleware implements NestMiddleware {
  private readonly logger = new Logger(NguCanhCuaHangMiddleware.name);

  constructor(private readonly dichVuCuaHang: DichVuCuaHang) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const maTuHeader = req.headers['x-store-code'];
    const maTuQuery = (req.query?.store as string) ?? '';
    const ma = String(
      (Array.isArray(maTuHeader) ? maTuHeader[0] : maTuHeader) || maTuQuery || '',
    ).trim();

    const nguCanh: NguCanhCuaHang = { storeId: null, maCuaHang: ma || null };

    if (ma) {
      try {
        const cuaHang = await this.dichVuCuaHang.timTheoMa(ma);
        if (cuaHang && cuaHang.isActive) {
          nguCanh.storeId = cuaHang._id.toString();
        } else {
          this.logger.warn(`Mã cửa hàng không hợp lệ hoặc đã ngừng hoạt động: ${ma}`);
        }
      } catch (error) {
        this.logger.error(`Lỗi tra cứu cửa hàng "${ma}": ${(error as Error).message}`);
      }
    }

    chayTrongNguCanh(nguCanh, () => next());
  }
}
