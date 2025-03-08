const db = require('../config/database');

const users = [
  {
    phone: '13800138001',
    user_type: 2, // 管理员
    nickname: '系统管理员',
    avatar: 'https://example.com/avatars/admin.jpg',
    status: 1,
    password: '123456',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    phone: '13800138002', 
    user_type: 2, // 商家
    nickname: '测试商家1',
    avatar: 'https://example.com/avatars/shop1.jpg',
    status: 1,
    password: '123456',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    phone: '13800138003',
    user_type: 2, // 商家
    nickname: '测试商家2',
    avatar: 'https://example.com/avatars/shop2.jpg',
    status: 1,
    password: '123456',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    phone: '13800138004',
    user_type: 1, // 普通用户
    nickname: '测试用户1',
    avatar: 'https://example.com/avatars/user1.jpg',
    status: 1,
    password: '123456',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    phone: '13800138005',
    user_type: 1, // 普通用户
    nickname: '测试用户2',
    avatar: 'https://example.com/avatars/user2.jpg',
    status: 1,
    password: '123456',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    phone: '13800138006',
    user_type: 1, // 普通用户
    nickname: '测试用户3',
    avatar: 'https://example.com/avatars/user3.jpg',
    status: 0, // 禁用状态
    password: '123456',
    created_at: new Date(),
    updated_at: new Date()
  }
];

async function seedUsers() {
  const connection = await db.getConnection();
  
  try {
    // 开始事务
    await connection.beginTransaction();

    // 暂时禁用外键检查
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

    // 清空相关表
    await connection.execute('TRUNCATE TABLE commission_logs');
    await connection.execute('TRUNCATE TABLE users');

    // 重新启用外键检查
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    // 插入用户数据
    for (const user of users) {
      await connection.execute(
        'INSERT INTO users (phone, user_type, nickname, avatar, status, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [user.phone, user.user_type, user.nickname, user.avatar, user.status, user.password, user.created_at, user.updated_at]
      );
    }

    // 提交事务
    await connection.commit();
    
    console.log('Users seeded successfully!');
  } catch (error) {
    // 如果出错，回滚事务
    await connection.rollback();
    console.error('Error seeding users:', error);
    throw error;
  } finally {
    // 释放连接
    connection.release();
    await db.end();
  }
}

// 如果直接运行此文件则执行种子
if (require.main === module) {
  seedUsers();
}

module.exports = seedUsers;
