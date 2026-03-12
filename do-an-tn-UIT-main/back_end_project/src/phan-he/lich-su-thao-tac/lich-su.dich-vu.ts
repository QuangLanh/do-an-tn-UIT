import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LichSuThaoTac, LichSuThaoTacDocument } from './schemas/lich-su.schema';

export interface GhiLogDto {
  userId?: string;
  userFullName: string;
  action: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  details?: string;
}

@Injectable()
export class DichVuLichSuThaoTac {
  constructor(
    @InjectModel(LichSuThaoTac.name)
    private lichSuModel: Model<LichSuThaoTacDocument>,
  ) {}

  async log(data: GhiLogDto): Promise<void> {
    await this.lichSuModel.create({
      userId: data.userId ? new Types.ObjectId(data.userId) : undefined,
      userFullName: data.userFullName,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      entityName: data.entityName,
      details: data.details,
    });
  }

  async findAll(query?: {
    page?: number;
    limit?: number;
    entityType?: string;
    action?: string;
  }): Promise<{ data: LichSuThaoTac[]; total: number; page: number; limit: number }> {
    const page = query?.page || 1;
    const limit = Math.min(query?.limit || 20, 100);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query?.entityType) filter.entityType = query.entityType;
    if (query?.action) filter.action = new RegExp(query.action, 'i');

    const [data, total] = await Promise.all([
      this.lichSuModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.lichSuModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit };
  }
}
