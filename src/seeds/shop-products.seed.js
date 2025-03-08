const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // First, get all existing shops
    const shops = await prisma.shop.findMany();
    
    // Create products for each shop
    for (const shop of shops) {
      // Create multiple products for each shop
      const productsData = [
        {
          name: `${shop.name} - Product 1`,
          description: 'High quality product',
          specification: 'Standard size',
          originalPrice: 39.99,
          sellingPrice: 29.99,
          rewardAmount: 5.00,
          stock: 100,
          shopId: shop.id,
          categoryId: 1n, // Assuming category 1 exists
          status: 1, // 1 for active
          promotionStart: null,
          promotionEnd: null
        },
        {
          name: `${shop.name} - Product 2`,
          description: 'Premium quality item',
          specification: 'Large size',
          originalPrice: 49.99,
          sellingPrice: 39.99,
          rewardAmount: 7.00,
          stock: 50,
          shopId: shop.id,
          categoryId: 2n, // Assuming category 2 exists
          status: 1,
          promotionStart: null,
          promotionEnd: null
        },
        {
          name: `${shop.name} - Product 3`,
          description: 'Best seller item',
          specification: 'Medium size',
          originalPrice: 29.99,
          sellingPrice: 19.99,
          rewardAmount: 3.00,
          stock: 200,
          shopId: shop.id,
          categoryId: 3n, // Assuming category 3 exists
          status: 1,
          promotionStart: null,
          promotionEnd: null
        }
      ];

      // Create products for this shop
      await Promise.all(
        productsData.map(async (product) => {
          await prisma.product.create({
            data: product
          });
        })
      );

      console.log(`Created products for shop: ${shop.name}`);
    }

    console.log('Products seeding completed successfully');
  } catch (error) {
    console.error('Error seeding products:', error);
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
