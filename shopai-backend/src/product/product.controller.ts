import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductService } from './product.service';

@ApiTags('Products')
@Controller('api/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả sản phẩm' })
  getProducts() {
    return this.productService.getAllProducts();
  }

  @Post()
  @ApiOperation({ summary: 'Tạo sản phẩm mới (chứng minh ValidationPipe)' })
  createProduct(@Body() dto: CreateProductDto) {
    return { message: 'Dữ liệu hợp lệ, đã nhận sản phẩm', data: dto };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết sản phẩm theo id' })
  getProductById(@Param('id') id: string) {
    return this.productService.getProductById(id);
  }
}
