import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('api/health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Kiểm tra trạng thái máy chủ (Health Check)' })
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
