import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UngDungDichVu } from './ung-dung.dich-vu';

@ApiTags('health')
@Controller()
export class UngDungDieuKhien {
  constructor(private readonly ungDungDichVu: UngDungDichVu) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  getHello(): object {
    return this.ungDungDichVu.layThongTinChaoMung();
  }

  @Get('health')
  @ApiOperation({ summary: 'Application health status' })
  healthCheck(): object {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}

