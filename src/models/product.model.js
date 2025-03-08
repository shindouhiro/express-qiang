const prisma = require('../lib/prisma');

class Product {
  static async create(productData) {
    const {
      shopId,
      categoryId,
      name,
      description,
      specification,
      originalPrice,
      sellingPrice,
      rewardAmount,
      stock,
      promotionStart,
      promotionEnd,
      status = 1
    } = productData;

    return await prisma.product.create({
      data: {
        shopId: BigInt(shopId),
        categoryId: BigInt(categoryId),
        name,
        description,
        specification,
        originalPrice,
        sellingPrice,
        rewardAmount,
        stock,
        promotionStart,
        promotionEnd,
        status
      }
    });
  }

  static async findById(id) {
    return await prisma.product.findUnique({
      where: { id: BigInt(id) },
      include: {
        shop: true
      }
    });
  }

  static async update(id, productData) {
    const {
      name,
      description,
      specification,
      originalPrice,
      sellingPrice,
      rewardAmount,
      stock,
      promotionStart,
      promotionEnd,
      status
    } = productData;

    try {
      return await prisma.product.update({
        where: { id: BigInt(id) },
        data: {
          name,
          description,
          specification,
          originalPrice,
          sellingPrice,
          rewardAmount,
          stock,
          promotionStart,
          promotionEnd,
          status
        }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  static async list(page = 1, limit = 10, filters = {}) {
    const where = {};

    if (filters.shopId) {
      where.shopId = BigInt(filters.shopId);
    }
    if (filters.categoryId) {
      where.categoryId = BigInt(filters.categoryId);
    }
    if (filters.status !== undefined) {
      where.status = filters.status;
    }
    if (filters.name) {
      where.name = { contains: filters.name };
    }
    if (filters.minPrice) {
      where.sellingPrice = { ...where.sellingPrice, gte: filters.minPrice };
    }
    if (filters.maxPrice) {
      where.sellingPrice = { ...where.sellingPrice, lte: filters.maxPrice };
    }
    if (filters.inPromotion) {
      const now = new Date();
      where.AND = [
        { promotionStart: { lte: now } },
        { promotionEnd: { gte: now } }
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          shop: true
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    return {
      products,
      total,
      page,
      limit
    };
  }

  static async delete(id) {
    try {
      await prisma.product.delete({
        where: { id: BigInt(id) }
      });
      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }

  static async updateStock(id, quantity) {
    try {
      return await prisma.product.update({
        where: { id: BigInt(id) },
        data: {
          stock: {
            increment: quantity
          }
        }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  static async findByShop(shopId, page = 1, limit = 10) {
    return this.list(page, limit, { shopId });
  }
}

module.exports = Product; 
