import { SetMetadata } from '@nestjs/common';

export const KHOA_CONG_KHAI = 'isPublic';

/**
 * Decorator để đánh dấu endpoint là công khai (không cần authentication)
 * Sử dụng với BaoVeJwt để cho phép truy cập không cần JWT token
 */
export const CongKhai = () => SetMetadata(KHOA_CONG_KHAI, true);
