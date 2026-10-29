import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './product/product.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ProductModule,
    AiModule,
    AuthModule,
    OrderModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
