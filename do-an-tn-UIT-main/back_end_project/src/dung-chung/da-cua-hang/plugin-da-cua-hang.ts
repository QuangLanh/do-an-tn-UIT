import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Schema, Types } from 'mongoose';
import { boQuaLocHienTai, layNguCanh, layStoreIdHienTai } from './ngu-canh-cua-hang';

/**
 * Các thao tác truy vấn cần chèn điều kiện lọc theo cửa hàng.
 * `estimatedDocumentCount` cố tình không có mặt vì nó không nhận điều kiện lọc —
 * đừng dùng nó cho dữ liệu thuộc cửa hàng.
 */
const HOOK_TRUY_VAN = [
  'count',
  'countDocuments',
  'deleteMany',
  'deleteOne',
  'distinct',
  'find',
  'findOne',
  'findOneAndDelete',
  'findOneAndReplace',
  'findOneAndUpdate',
  'replaceOne',
  'updateMany',
  'updateOne',
] as const;

/**
 * Plugin tách dữ liệu theo cửa hàng.
 *
 * Gắn vào schema nào thì schema đó có thêm trường `storeId` bắt buộc, và:
 *  - mọi truy vấn tự động thêm điều kiện `storeId`
 *  - mọi bản ghi mới tự động được gán `storeId`
 *  - mọi aggregate được chèn `$match` ở đầu pipeline
 *
 * Nếu không có ngữ cảnh cửa hàng, plugin **ném lỗi** thay vì âm thầm trả dữ liệu
 * của tất cả cửa hàng. Đó là chủ ý: thà hỏng ngay lúc phát triển còn hơn rò rỉ
 * dữ liệu giữa hai khách hàng trên môi trường thật.
 */
export function pluginDaCuaHang(schema: Schema): void {
  schema.add({
    storeId: {
      type: Types.ObjectId,
      ref: 'CuaHang',
      required: true,
      index: true,
    },
  });

  const layStoreIdBatBuoc = (thaoTac: string): Types.ObjectId | null => {
    if (boQuaLocHienTai()) return null;

    const storeId = layStoreIdHienTai();
    if (storeId) return new Types.ObjectId(storeId);

    // Client có gửi mã cửa hàng nhưng middleware không tra ra được
    const maCuaHang = layNguCanh()?.maCuaHang;
    if (maCuaHang) {
      throw new NotFoundException(
        `Cửa hàng "${maCuaHang}" không tồn tại hoặc đã ngừng hoạt động.`,
      );
    }

    // Không có JWT, cũng không có mã cửa hàng — thiếu thông tin từ phía client.
    // Nếu gặp lỗi này ở một endpoint đã đăng nhập thì đó là lỗi lập trình:
    // thao tác toàn hệ thống phải được bọc trong chayBoQuaLoc().
    throw new BadRequestException(
      `Thiếu thông tin cửa hàng cho thao tác "${thaoTac}". ` +
        'Đăng nhập, hoặc truy cập qua đường dẫn của cửa hàng (header X-Store-Code).',
    );
  };

  for (const hook of HOOK_TRUY_VAN) {
    schema.pre(hook as any, function (this: any) {
      const storeId = layStoreIdBatBuoc(hook);
      if (!storeId) return;

      // Cho phép code gọi tự chỉ định storeId (script chuyển đổi, thống kê nội bộ)
      const dieuKien = this.getQuery ? this.getQuery() : {};
      if (dieuKien?.storeId === undefined) {
        this.where({ storeId });
      }
    });
  }

  // Gán storeId trước khi validate để trường required không báo lỗi
  schema.pre('validate', function (this: any) {
    if (this.storeId) return;
    const storeId = layStoreIdBatBuoc('save');
    if (storeId) this.storeId = storeId;
  });

  schema.pre('insertMany', function (next: any, docs: any[]) {
    try {
      const storeId = layStoreIdBatBuoc('insertMany');
      if (storeId && Array.isArray(docs)) {
        for (const doc of docs) {
          if (doc && !doc.storeId) doc.storeId = storeId;
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  });

  schema.pre('aggregate', function (this: any) {
    const storeId = layStoreIdBatBuoc('aggregate');
    if (!storeId) return;

    const pipeline = this.pipeline();
    const daCoMatch =
      pipeline.length > 0 &&
      pipeline[0]?.$match &&
      pipeline[0].$match.storeId !== undefined;

    if (!daCoMatch) {
      pipeline.unshift({ $match: { storeId } });
    }
  });
}
