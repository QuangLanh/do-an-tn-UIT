import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NhaCungCap, TaiLieuNhaCungCap } from './nha-cung-cap.thuc-the';
import { TaoNhaCungCapDto } from './tao-nha-cung-cap.dto';

@Injectable()
export class DichVuNhaCungCap {
  constructor(@InjectModel(NhaCungCap.name) private modelNhaCungCap: Model<TaiLieuNhaCungCap>) {}

  async taoMoi(dto: TaoNhaCungCapDto): Promise<NhaCungCap> {
    const moi = new this.modelNhaCungCap(dto);
    return moi.save();
  }

  async layTatCa(): Promise<NhaCungCap[]> {
    return this.modelNhaCungCap.find().exec();
  }
}