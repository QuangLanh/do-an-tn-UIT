import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DichVuCuaHang } from './cua-hang.dich-vu';
import { TaoCuaHangDto } from './dto/tao-cua-hang.dto';
import { BaoVeJwt } from '../../dung-chung/bao-ve/bao-ve-jwt';
import { BaoVeVaiTro } from '../../dung-chung/bao-ve/bao-ve-vai-tro';
import { VaiTro } from '../../dung-chung/trang-tri/vai-tro.trang-tri';
import { CongKhai } from '../../dung-chung/trang-tri/cong-khai.trang-tri';
import { VaiTroNguoiDung } from '../../dung-chung/liet-ke/vai-tro-nguoi-dung.enum';
import { NguoiDungHienTai } from '../../dung-chung/trang-tri/nguoi-dung-hien-tai.trang-tri';

@ApiTags('cua-hang')
@Controller('stores')
export class DieuKhienCuaHang {
  constructor(private readonly dichVuCuaHang: DichVuCuaHang) {}

  /**
   * Web khách hàng gọi endpoint này để hiển thị tên cửa hàng theo mã trên URL.
   * Công khai vì khách vãng lai chưa đăng nhập.
   */
  @Get('public/:ma')
  @CongKhai()
  @ApiOperation({ summary: 'Thông tin công khai của cửa hàng theo mã (không cần đăng nhập)' })
  layThongTinCongKhai(@Param('ma') ma: string) {
    return this.dichVuCuaHang.layThongTinCongKhai(ma);
  }

  /** Cửa hàng của người đang đăng nhập. */
  @Get('me')
  @UseGuards(BaoVeJwt, BaoVeVaiTro)
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thông tin cửa hàng của tài khoản đang đăng nhập' })
  layCuaHangCuaToi(@NguoiDungHienTai('storeId') storeId: string) {
    return this.dichVuCuaHang.timTheoId(storeId);
  }

  @Patch('me')
  @UseGuards(BaoVeJwt, BaoVeVaiTro)
  @VaiTro(VaiTroNguoiDung.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin cửa hàng (chủ cửa hàng)' })
  capNhatCuaHangCuaToi(
    @NguoiDungHienTai('storeId') storeId: string,
    @Body() dto: Partial<TaoCuaHangDto>,
  ) {
    // Không cho tự đổi mã và gói cước từ đây
    const { ma, goiCuoc, ...duocPhep } = dto as any;
    return this.dichVuCuaHang.capNhat(storeId, duocPhep);
  }

  /**
   * Tạo cửa hàng mới.
   *
   * Tạm thời để công khai phục vụ khởi tạo và script chuyển đổi dữ liệu.
   * Giai đoạn 3 (đăng ký / dùng thử) sẽ thay bằng luồng đăng ký có xác thực email.
   */
  @Post()
  @CongKhai()
  @ApiOperation({ summary: 'Tạo cửa hàng mới' })
  tao(@Body() dto: TaoCuaHangDto) {
    return this.dichVuCuaHang.tao(dto);
  }
}
