import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, Matches, ValidateIf } from 'class-validator';

/**
 * DTO cập nhật thông tin cá nhân cho Admin/Staff.
 * - fullName, phone: Admin và Nhân viên đều được sửa.
 * - newPassword: chỉ Quản trị viên (admin) mới được đổi mật khẩu; bắt buộc gửi currentPassword để xác thực.
 */
export class CapNhatProfileNhanVienDto {
  @ApiProperty({ example: 'Nguyễn Văn A', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: '0123456789', required: false })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.phone !== undefined && o.phone !== '')
  @Matches(/^0\d{9}$/, { message: 'Số điện thoại phải đúng 10 số, bắt đầu bằng 0 (ví dụ: 0123456789)' })
  phone?: string;

  @ApiProperty({ description: 'Mật khẩu hiện tại (bắt buộc khi đổi mật khẩu)', required: false })
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @ApiProperty({ description: 'Mật khẩu mới (chỉ admin được đổi)', required: false })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới tối thiểu 6 ký tự' })
  newPassword?: string;
}
