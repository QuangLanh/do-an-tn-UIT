import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Get dashboard overview (Admin, Manager, Accountant)' })
  @ApiResponse({ status: 200, description: 'Return dashboard summary' })
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('overview')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Get dashboard overview (Admin, Manager, Accountant)' })
  @ApiResponse({ status: 200, description: 'Return dashboard overview' })
  getOverview() {
    return this.dashboardService.getSummary();
  }

  @Get('top-products')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Get top products (Admin, Manager, Accountant)' })
  @ApiResponse({ status: 200, description: 'Return top products' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTopProducts(@Query('limit') limit?: number) {
    return this.dashboardService.getTopProducts(limit ? +limit : 10);
  }

  @Get('orders-trend')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Get orders trend (Admin, Manager, Accountant)' })
  @ApiResponse({ status: 200, description: 'Return orders trend' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  getOrdersTrend(@Query('days') days?: number) {
    return this.dashboardService.getOrdersTrend(days ? +days : 30);
  }

  @Get('recent-activity')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Get recent activity (Admin, Manager, Accountant)' })
  @ApiResponse({ status: 200, description: 'Return recent activity' })
  getRecentActivity() {
    return this.dashboardService.getRecentActivity();
  }
}

