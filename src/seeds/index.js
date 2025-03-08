const seedUsers = require('./users.seed');

async function seedAll() {
  try {
    // 按顺序执行所有种子
    await seedUsers();
    
    console.log('All seeds completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running seeds:', error);
    process.exit(1);
  }
}

// 运行所有种子
seedAll(); 
