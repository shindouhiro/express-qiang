const prisma = require('../lib/prisma');
const seedUsers = require('./users.seed');
const seedShops = require('./shops.seed');

async function seedAll() {
  try {
    console.log('Starting database seeding...');
    
    console.log('\nSeeding users...');
    await seedUsers();
    
    console.log('\nSeeding shops...');
    await seedShops();
    
    console.log('\nAll seeds completed successfully! 🎉');
  } catch (error) {
    console.error('\n❌ Error running seeds:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此文件则执行种子
if (require.main === module) {
  seedAll()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
} 
