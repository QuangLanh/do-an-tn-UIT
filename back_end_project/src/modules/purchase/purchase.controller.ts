import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PurchaseService } from './purchase.service';
import { PurchaseRecommendationService } from './purchase-recommendation.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('purchases')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('purchases')
export class PurchaseController {
  constructor(
    private readonly purchaseService: PurchaseService,
    private readonly recommendationService: PurchaseRecommendationService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create new purchase (Admin, Manager)' })
  @ApiResponse({ status: 201, description: 'Purchase created successfully' })
  create(
    @Body() createPurchaseDto: CreatePurchaseDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.purchaseService.create(createPurchaseDto, userId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Get all purchases (Admin, Manager, Accountant)' })
  @ApiResponse({ status: 200, description: 'Return all purchases' })
  @ApiQuery({ name: 'supplier', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  findAll(@Query() query: any) {
    return this.purchaseService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get purchase statistics' })
  @ApiResponse({ status: 200, description: 'Return purchase statistics' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  getStatistics(@Query('from') from?: string, @Query('to') to?: string) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    return this.purchaseService.getStatistics(fromDate, toDate);
  }

  @Get('suppliers')
  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiResponse({ status: 200, description: 'Return all suppliers' })
  getSuppliers() {
    return this.purchaseService.getSuppliers();
  }

  @Get('recommendations')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Get purchase recommendations based on sales data (Admin, Manager)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return purchase recommendations with priority levels',
  })
  getRecommendations() {
    return this.recommendationService.getRecommendations();
  }

  @Get('recommendations/high-priority')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Get high priority purchase recommendations (Admin, Manager)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return products that need urgent restocking',
  })
  getHighPriorityRecommendations() {
    return this.recommendationService.getHighPriorityRecommendations();
  }

  @Get('recommendations/low-priority')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Get low priority purchase recommendations (Admin, Manager)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return products that should purchase less (slow sellers)',
  })
  getLowPriorityRecommendations() {
    return this.recommendationService.getLowPriorityRecommendations();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Get purchase by ID (Admin, Manager, Accountant)' })
  @ApiResponse({ status: 200, description: 'Return purchase' })
  findOne(@Param('id') id: string) {
    return this.purchaseService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update purchase (Admin only)' })
  @ApiResponse({ status: 200, description: 'Purchase updated successfully' })
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.purchaseService.update(id, updateData);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete purchase (Admin only)' })
  @ApiResponse({ status: 200, description: 'Purchase deleted successfully' })
  remove(@Param('id') id: string) {
    return this.purchaseService.remove(id);
  }
}

