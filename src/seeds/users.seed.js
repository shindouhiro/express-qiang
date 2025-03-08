const db = require('../config/database');

const users = [
  {
    phone: '13800138001',
    user_type: 2, // 管理员
    nickname: '系统管理员',
    avatar: 'https://example.com/avatars/admin.jpg',
    status: 1
  },
  {
    phone: '13800138002',
    user_type: 2, // 商家
    nickname: '测试商家1',
    avatar: 'https://example.com/avatars/shop1.jpg',
    status: 1
  },
  {
    phone: '13800138003',
    user_type: 2, // 商家
    nickname: '测试商家2',
    avatar: 'https://example.com/avatars/shop2.jpg',
    status: 1
  },
  {
    phone: '13800138004',
    user_type: 1, // 普通用户
    nickname: '测试用户1',
    avatar: 'https://example.com/avatars/user1.jpg',
    status: 1
  },
  {
    phone: '13800138005',
    user_type: 1, // 普通用户
    nickname: '测试用户2',
    avatar: 'https://example.com/avatars/user2.jpg',
    status: 1
  },
  {
    phone: '13800138006',
    user_type: 1, // 普通用户
    nickname: '测试用户3',
    avatar: 'https://example.com/avatars/user3.jpg',
    status: 0 // 禁用状态
  }
];

async function seedUsers() {
  try {
    // 清空用户表
    await db.execute('TRUNCATE TABLE users');
    
    // 插入用户数据
    for (const user of users) {
      await db.execute(
        'INSERT INTO users (phone, user_type, nickname, avatar, status) VALUES (?, ?, ?, ?, ?)',
        [user.phone, user.user_type, user.nickname, user.avatar, user.status]
      );
    }
    
    console.log('Users seeded successfully!');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await db.end();
  }
}

// 如果直接运行此文件则执行种子
if (require.main === module) {
  seedUsers();
}

module.exports = seedUsers; 
