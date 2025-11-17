import { Injectable } from '@nestjs/common';

@Injectable()
export class UngDungDichVu {
  layThongTinChaoMung(): object {
    return {
      message: 'Chào mừng đến với API Quản lý Cửa hàng Tạp hóa',
      version: '1.0.0',
      documentation: '/api/docs',
    };
  }
}

