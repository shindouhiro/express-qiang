const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Create basic categories
    const categories = [
      {
        name: '快递服务',
        description: '各类快递配送服务',
        status: 1
      },
      {
        name: '物流服务',
        description: '大件物流运输服务',
        status: 1
      },
      {
        name: '仓储服务',
        description: '仓库存储和管理服务',
        status: 1
      }
    ];

    // Create categories
    for (const category of categories) {
      await prisma.category.create({
        data: category
      });
    }

    console.log('Categories seeding completed successfully');
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 
