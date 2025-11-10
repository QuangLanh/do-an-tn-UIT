import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ReportService } from './report.service';
import { TransactionService } from '../transaction/transaction.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    private readonly transactionService: TransactionService,
  ) {}

  @Get('summary')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Get report summary (Admin, Manager, Accountant)' })
  @ApiResponse({ status: 200, description: 'Return report summary' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  getSummary(@Query('from') from?: string, @Query('to') to?: string) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    return this.reportService.getRevenueReport(fromDate, toDate);
  }

  @Get('revenue')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Get revenue report (Admin, Manager, Accountant)' })
  @ApiResponse({ status: 200, description: 'Return revenue report' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  getRevenueReport(@Query('from') from?: string, @Query('to') to?: string) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    return this.reportService.getRevenueReport(fromDate, toDate);
  }

  @Get('profit')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Get profit report (Admin, Manager, Accountant)' })
  @ApiResponse({ status: 200, description: 'Return profit report' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async getProfitReport(@Query('from') from?: string, @Query('to') to?: string) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    const summary = await this.transactionService.getSummary(fromDate, toDate);
    return {
      revenue: summary.revenue,
      cost: summary.cost,
      profit: summary.profit,
      profitMargin: summary.profitMargin,
      generatedAt: new Date().toISOString(),
    };
  }

  @Get('export')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Export revenue report as PDF (Admin, Accountant)' })
  @ApiResponse({ status: 200, description: 'Return PDF file' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async exportRevenuePDF(
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    return this.reportService.exportRevenuePDF(res, fromDate, toDate);
  }

  @Get('inventory')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Get inventory report (Admin, Manager, Accountant)' })
  @ApiResponse({ status: 200, description: 'Return inventory report' })
  getInventoryReport() {
    return this.reportService.getInventoryReport();
  }
}

