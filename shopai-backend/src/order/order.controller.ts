import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';

@ApiTags('Orders')
@Controller('api/orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đơn hàng mới (status PENDING)' })
  async create(@Body() dto: CreateOrderDto, @Req() req: any) {
    return this.orderService.createOrder(dto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Lịch sử đơn hàng của user đang đăng nhập' })
  async findMine(@Req() req: any) {
    return this.orderService.getOrdersForUser(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết một đơn hàng theo id' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.orderService.getOrderForUser(id, req.user.userId);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Thanh toán giả lập: PENDING -> PAID' })
  async pay(@Param('id') id: string, @Req() req: any) {
    return this.orderService.payOrder(id, req.user.userId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Hủy đơn hàng: status -> CANCELLED' })
  async cancel(@Param('id') id: string, @Req() req: any) {
    return this.orderService.cancelOrder(id, req.user.userId);
  }
}
