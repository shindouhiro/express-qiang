const prisma = require('../lib/prisma');

const userShops = [
  {
    // 系统管理员作为总部店长
    userId: 1,
    shopId: 1,
    role: 2, // 店长
    status: 1 // 正常
  },
  {
    // 测试商家1作为北京店店长
    userId: 2,
    shopId: 2,
    role: 2,
    status: 1
  },
  {
    // 测试商家2作为上海店店长
    userId: 3,
    shopId: 3,
    role: 2,
    status: 1
  },
  {
    // 测试用户1作为深圳店店长
    userId: 4,
    shopId: 4,
    role: 2,
    status: 1
  },
  {
    // 测试用户2作为广州店店长
    userId: 5,
    shopId: 5,
    role: 2,
    status: 1
  },
  {
    // 测试用户3作为北京店店员
    userId: 6,
    shopId: 2,
    role: 1, // 店员
    status: 1
  },
  {
    // 测试用户3也是上海店店员
    userId: 6,
    shopId: 3,
    role: 1,
    status: 1
  }
];

async function seedUserShops() {
  try {
    console.log('Cleaning up user_shops table...');
    await prisma.userShop.deleteMany();
    
    console.log('Seeding user-shop relationships...');
    for (const userShop of userShops) {
      await prisma.userShop.create({
        data: userShop
      });
    }
    
    console.log('User-shop relationships seeded successfully!');
  } catch (error) {
    console.error('Error seeding user-shop relationships:', error);
    throw error;
  }
}

// 如果直接运行此文件则执行种子
if (require.main === module) {
  seedUserShops()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = seedUserShops; 
