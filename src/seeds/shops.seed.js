const prisma = require('../lib/prisma');

const shops = [
  {
    name: '强哥快递总部',
    description: '强哥快递官方直营店，提供最优质的快递服务',
    logo: 'https://example.com/logos/qiang-hq.jpg',
    legalName: '系统管理员',
    idCardNo: '110101199001011234',
    idCardFront: 'https://example.com/id-cards/front1.jpg',
    idCardBack: 'https://example.com/id-cards/back1.jpg',
    businessLicense: 'https://example.com/licenses/license1.jpg',
    businessPermit: 'https://example.com/permits/permit1.jpg',
    wechatQrcode: 'https://example.com/qrcodes/wechat1.jpg',
    auditStatus: 1, // 已审核通过
    status: 1, // 正常营业
    ownerId: 1 // 管理员用户 13800138001
  },
  {
    name: '强哥快递北京店',
    description: '位于北京市朝阳区的强哥快递连锁店',
    logo: 'https://example.com/logos/beijing.jpg',
    legalName: '测试商家1',
    idCardNo: '110101199001011235',
    idCardFront: 'https://example.com/id-cards/front2.jpg',
    idCardBack: 'https://example.com/id-cards/back2.jpg',
    businessLicense: 'https://example.com/licenses/license2.jpg',
    businessPermit: 'https://example.com/permits/permit2.jpg',
    wechatQrcode: 'https://example.com/qrcodes/wechat2.jpg',
    auditStatus: 1, // 已审核通过
    status: 1, // 正常营业
    ownerId: 2 // 商家用户1 13800138002
  },
  {
    name: '强哥快递上海店',
    description: '位于上海市浦东新区的强哥快递连锁店',
    logo: 'https://example.com/logos/shanghai.jpg',
    legalName: '测试商家2',
    idCardNo: '110101199001011236',
    idCardFront: 'https://example.com/id-cards/front3.jpg',
    idCardBack: 'https://example.com/id-cards/back3.jpg',
    businessLicense: 'https://example.com/licenses/license3.jpg',
    businessPermit: 'https://example.com/permits/permit3.jpg',
    wechatQrcode: 'https://example.com/qrcodes/wechat3.jpg',
    auditStatus: 1, // 已审核通过
    status: 1, // 正常营业
    ownerId: 3 // 商家用户2 13800138003
  },
  {
    name: '强哥快递深圳店',
    description: '位于深圳市南山区的强哥快递连锁店',
    logo: 'https://example.com/logos/shenzhen.jpg',
    legalName: '测试用户1',
    idCardNo: '110101199001011237',
    idCardFront: 'https://example.com/id-cards/front4.jpg',
    idCardBack: 'https://example.com/id-cards/back4.jpg',
    businessLicense: 'https://example.com/licenses/license4.jpg',
    businessPermit: 'https://example.com/permits/permit4.jpg',
    wechatQrcode: 'https://example.com/qrcodes/wechat4.jpg',
    auditStatus: 0, // 待审核
    status: 0, // 未营业
    ownerId: 4 // 普通用户1 13800138004
  },
  {
    name: '强哥快递广州店',
    description: '位于广州市天河区的强哥快递连锁店',
    logo: 'https://example.com/logos/guangzhou.jpg',
    legalName: '测试用户2',
    idCardNo: '110101199001011238',
    idCardFront: 'https://example.com/id-cards/front5.jpg',
    idCardBack: 'https://example.com/id-cards/back5.jpg',
    businessLicense: 'https://example.com/licenses/license5.jpg',
    businessPermit: 'https://example.com/permits/permit5.jpg',
    wechatQrcode: 'https://example.com/qrcodes/wechat5.jpg',
    auditStatus: 2, // 审核拒绝
    status: 0, // 未营业
    ownerId: 5 // 普通用户2 13800138005
  }
];

async function seedShops() {
  try {
    console.log('Cleaning up shops table...');
    await prisma.shop.deleteMany();
    
    console.log('Seeding shops...');
    for (const shop of shops) {
      await prisma.shop.create({
        data: shop
      });
    }
    
    console.log('Shops seeded successfully!');
  } catch (error) {
    console.error('Error seeding shops:', error);
    throw error;
  }
}

// 如果直接运行此文件则执行种子
if (require.main === module) {
  seedShops()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = seedShops; 
