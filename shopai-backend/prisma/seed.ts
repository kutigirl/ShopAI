import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  await prisma.user.upsert({
    where: { email: 'demo@shopai.com' },
    update: {},
    create: {
      email: 'demo@shopai.com',
      password: hashedPassword,
      name: 'Học viên Demo',
    },
  });

  console.log('✅ Đã seed User demo: demo@shopai.com / 123456');

  const productCount = await prisma.product.count();
  if (productCount === 0) {
    await prisma.product.createMany({
      data: Array.from({ length: 20 }).map((_, i) => ({
        id: `backend_prod_${i}`,
        name: `Sản phẩm từ NestJS Server ${i}`,
        price: 1000000 + i * 10000,
        image: `https://picsum.photos/id/${200 + i}/400/400`,
      })),
    });
    console.log('✅ Đã seed 20 Product vào Database');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
