const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Product {
  static async create(data) {
    return prisma.product.create({
      data: {
        ...data,
        shopId: BigInt(data.shopId),
        categoryId: BigInt(data.categoryId)
      }
    });
  }

  static async findById(id) {
    return prisma.product.findUnique({
      where: { id: BigInt(id) },
      include: {
        shop: true,
        category: true
      }
    });
  }

  static async update(id, data) {
    return prisma.product.update({
      where: { id: BigInt(id) },
      data: {
        ...data,
        categoryId: data.categoryId ? BigInt(data.categoryId) : undefined
      }
    });
  }

  static async delete(id) {
    return prisma.product.update({
      where: { id: BigInt(id) },
      data: { status: 0 }
    });
  }

  static async list(page, limit, filters) {
    const where = { status: 1 };

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
      where.sellingPrice = {
        ...where.sellingPrice,
        gte: filters.minPrice
      };
    }

    if (filters.maxPrice) {
      where.sellingPrice = {
        ...where.sellingPrice,
        lte: filters.maxPrice
      };
    }

    if (filters.inPromotion) {
      const now = new Date();
      where.AND = [
        { promotionStart: { lte: now } },
        { promotionEnd: { gte: now } }
      ];
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          shop: {
            select: {
              id: true,
              name: true,
              logo: true
            }
          },
          category: {
            select: {
              id: true,
              name: true
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async updateStock(id, quantity) {
    return prisma.product.update({
      where: { id: BigInt(id) },
      data: {
        stock: {
          increment: quantity
        }
      }
    });
  }

  static async findByShop(shopId, page = 1, limit = 10) {
    return this.list(page, limit, { shopId });
  }
}

module.exports = Product; 
