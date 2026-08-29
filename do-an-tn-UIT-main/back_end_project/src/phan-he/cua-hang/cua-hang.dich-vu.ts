import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CuaHang, CuaHangDocument } from './schemas/cua-hang.schema';
import { TaoCuaHangDto } from './dto/tao-cua-hang.dto';

@Injectable()
export class DichVuCuaHang {
  private readonly logger = new Logger(DichVuCuaHang.name);

  constructor(
    @InjectModel(CuaHang.name) private cuaHangModel: Model<CuaHangDocument>,
  ) {}

  async tao(dto: TaoCuaHangDto): Promise<CuaHang> {
    const daCo = await this.cuaHangModel.findOne({ ma: dto.ma.toLowerCase() }).exec();
    if (daCo) {
      throw new ConflictException(`Mã cửa hàng "${dto.ma}" đã được sử dụng`);
    }

    const cuaHang = new this.cuaHangModel(dto);
    const saved = await cuaHang.save();
    this.logger.log(`Đã tạo cửa hàng: ${saved.ma} (${saved.ten})`);
    return saved;
  }

  async timTheoMa(ma: string): Promise<CuaHangDocument | null> {
    const chuanHoa = (ma || '').trim().toLowerCase();
    if (!chuanHoa) return null;
    return this.cuaHangModel.findOne({ ma: chuanHoa }).exec();
  }

  async timTheoId(id: string): Promise<CuaHangDocument | null> {
    return this.cuaHangModel.findById(id).exec();
  }

  async layTatCa(): Promise<CuaHang[]> {
    return this.cuaHangModel.find().sort({ createdAt: -1 }).exec();
  }

  /** Thông tin cửa hàng hiển thị cho web khách hàng — không lộ gói cước, ngày hết hạn. */
  async layThongTinCongKhai(ma: string) {
    const cuaHang = await this.timTheoMa(ma);
    if (!cuaHang || !cuaHang.isActive) {
      throw new NotFoundException('Không tìm thấy cửa hàng');
    }
    return {
      ma: cuaHang.ma,
      ten: cuaHang.ten,
      nganhHang: cuaHang.nganhHang,
      diaChi: cuaHang.diaChi,
      soDienThoai: cuaHang.soDienThoai,
    };
  }

  async capNhat(id: string, data: Partial<TaoCuaHangDto>): Promise<CuaHang> {
    const cuaHang = await this.cuaHangModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();
    if (!cuaHang) throw new NotFoundException('Không tìm thấy cửa hàng');
    return cuaHang;
  }
}
