import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LichSuThaoTacDocument = LichSuThaoTac & Document;

@Schema({ timestamps: true })
export class LichSuThaoTac {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  userFullName: string;

  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  entityType: string;

  @Prop()
  entityId?: string;

  @Prop()
  entityName?: string;

  @Prop()
  details?: string;
}

export const LichSuThaoTacSchema = SchemaFactory.createForClass(LichSuThaoTac);
LichSuThaoTacSchema.index({ createdAt: -1 });
LichSuThaoTacSchema.index({ entityType: 1 });
LichSuThaoTacSchema.index({ userId: 1 });
