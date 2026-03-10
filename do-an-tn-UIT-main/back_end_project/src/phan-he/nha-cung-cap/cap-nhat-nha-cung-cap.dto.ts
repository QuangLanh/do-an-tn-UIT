import { PartialType } from '@nestjs/swagger';
import { TaoNhaCungCapDto } from './tao-nha-cung-cap.dto';

// PartialType giúp kế thừa toàn bộ các trường của form Tạo (name, phone, contact...), 
// nhưng biến chúng thành không bắt buộc (có thể sửa 1 hoặc nhiều trường).
export class CapNhatNhaCungCapDto extends PartialType(TaoNhaCungCapDto) {}