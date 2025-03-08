const prisma = require('../lib/prisma');

const users = [
  {
    phone: '13800138001',
    userType: 2, // 管理员
    nickname: '系统管理员',
    avatar: 'https://example.com/avatars/admin.jpg',
    status: 1,
    password: '123456'
  },
  {
    phone: '13800138002', 
    userType: 2, // 商家
    nickname: '测试商家1',
    avatar: 'https://example.com/avatars/shop1.jpg',
    status: 1,
    password: '123456'
  },
  {
    phone: '13800138003',
    userType: 2, // 商家
    nickname: '测试商家2',
    avatar: 'https://example.com/avatars/shop2.jpg',
    status: 1,
    password: '123456'
  },
  {
    phone: '13800138004',
    userType: 1, // 普通用户
    nickname: '测试用户1',
    avatar: 'https://example.com/avatars/user1.jpg',
    status: 1,
    password: '123456'
  },
  {
    phone: '13800138005',
    userType: 1, // 普通用户
    nickname: '测试用户2',
    avatar: 'https://example.com/avatars/user2.jpg',
    status: 1,
    password: '123456'
  },
  {
    phone: '13800138006',
    userType: 1, // 普通用户
    nickname: '测试用户3',
    avatar: 'https://example.com/avatars/user3.jpg',
    status: 0, // 禁用状态
    password: '123456'
  }
];

async function seedUsers() {
  try {
    console.log('Cleaning up users table...');
    await prisma.user.deleteMany();
    
    console.log('Seeding users...');
    for (const user of users) {
      await prisma.user.create({
        data: user
      });
    }
    
    console.log('Users seeded successfully!');
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

// 如果直接运行此文件则执行种子
if (require.main === module) {
  seedUsers()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = seedUsers;
