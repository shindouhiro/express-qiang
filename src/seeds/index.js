const seedUsers = require('./users.seed');

async function seedAll() {
  try {
    console.log('Starting database seeding...');
    
    console.log('\nSeeding users...');
    await seedUsers();
    
    console.log('\nAll seeds completed successfully! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error running seeds:', error);
    process.exit(1);
  }
}

// 运行所有种子
seedAll(); 
