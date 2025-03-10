const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Product = require('../models/product.model');
const Shop = require('../models/shop.model');
const { ApiError } = require('../utils/ApiError');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: 商品管理接口
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - shopId
 *         - categoryId
 *         - name
 *         - originalPrice
 *         - sellingPrice
 *         - rewardAmount
 *         - stock
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           description: 商品ID
 *         shopId:
 *           type: integer
 *           format: int64
 *           description: 店铺ID
 *         categoryId:
 *           type: integer
 *           format: int64
 *           description: 分类ID
 *         name:
 *           type: string
 *           maxLength: 100
 *           description: 商品名称
 *         description:
 *           type: string
 *           maxLength: 1000
 *           description: 商品描述
 *         specification:
 *           type: string
 *           maxLength: 255
 *           description: 规格说明
 *         originalPrice:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: 原价
 *         sellingPrice:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: 售价
 *         rewardAmount:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: 奖励金额
 *         stock:
 *           type: integer
 *           minimum: 0
 *           description: 库存
 *         promotionStart:
 *           type: string
 *           format: date-time
 *           description: 促销开始时间
 *         promotionEnd:
 *           type: string
 *           format: date-time
 *           description: 促销结束时间
 *         status:
 *           type: integer
 *           enum: [0, 1]
 *           description: 商品状态(0-下架 1-上架)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 */

class ProductController {
  /**
   * @swagger
   * /api/v1/products:
   *   post:
   *     summary: 创建商品
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - shopId
   *               - categoryId
   *               - name
   *               - originalPrice
   *               - sellingPrice
   *               - rewardAmount
   *               - stock
   *             properties:
   *               shopId:
   *                 type: integer
   *                 description: 店铺ID
   *               categoryId:
   *                 type: integer
   *                 description: 分类ID
   *               name:
   *                 type: string
   *                 maxLength: 100
   *                 description: 商品名称
   *               description:
   *                 type: string
   *                 maxLength: 1000
   *                 description: 商品描述
   *               specification:
   *                 type: string
   *                 maxLength: 255
   *                 description: 规格说明
   *               originalPrice:
   *                 type: number
   *                 minimum: 0
   *                 description: 原价
   *               sellingPrice:
   *                 type: number
   *                 minimum: 0
   *                 description: 售价
   *               rewardAmount:
   *                 type: number
   *                 minimum: 0
   *                 description: 奖励金额
   *               stock:
   *                 type: integer
   *                 minimum: 0
   *                 description: 库存
   *               promotionStart:
   *                 type: string
   *                 format: date-time
   *                 description: 促销开始时间
   *               promotionEnd:
   *                 type: string
   *                 format: date-time
   *                 description: 促销结束时间
   *               status:
   *                 type: integer
   *                 enum: [0, 1]
   *                 description: 商品状态(0-下架 1-上架)
   *     responses:
   *       201:
   *         description: 创建成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 0
   *                 data:
   *                   $ref: '#/components/schemas/Product'
   *                 message:
   *                   type: string
   *                   example: 创建商品成功
   *       400:
   *         description: 参数错误
   *       403:
   *         description: 无权操作
   *       404:
   *         description: 店铺不存在
   */
  async create(req, res) {
    const { shopId } = req.body;
    
    // 验证店铺是否存在且属于当前用户
    const shop = await Shop.findById(shopId);
    if (!shop) {
      throw new ApiError(404, '店铺不存在');
    }
    
    // 验证用户是否有权限操作该店铺
    const isOwner = shop.ownerId === BigInt(req.user.userId);
    const isManager = await Shop.isManager(req.user.userId, shopId);
    if (!isOwner && !isManager) {
      throw new ApiError(403, '无权操作该店铺');
    }

    const product = await Product.create(req.body);
    res.status(201).json({
      code: 0,
      data: product,
      message: '创建商品成功'
    });
  }

  /**
   * @swagger
   * /api/v1/products/{id}:
   *   put:
   *     summary: 更新商品
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: 商品ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 maxLength: 100
   *                 description: 商品名称
   *               description:
   *                 type: string
   *                 maxLength: 1000
   *                 description: 商品描述
   *               specification:
   *                 type: string
   *                 maxLength: 255
   *                 description: 规格说明
   *               originalPrice:
   *                 type: number
   *                 minimum: 0
   *                 description: 原价
   *               sellingPrice:
   *                 type: number
   *                 minimum: 0
   *                 description: 售价
   *               rewardAmount:
   *                 type: number
   *                 minimum: 0
   *                 description: 奖励金额
   *               stock:
   *                 type: integer
   *                 minimum: 0
   *                 description: 库存
   *               promotionStart:
   *                 type: string
   *                 format: date-time
   *                 description: 促销开始时间
   *               promotionEnd:
   *                 type: string
   *                 format: date-time
   *                 description: 促销结束时间
   *               status:
   *                 type: integer
   *                 enum: [0, 1]
   *                 description: 商品状态(0-下架 1-上架)
   *     responses:
   *       200:
   *         description: 更新成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 0
   *                 data:
   *                   $ref: '#/components/schemas/Product'
   *                 message:
   *                   type: string
   *                   example: 更新商品成功
   *       400:
   *         description: 参数错误
   *       403:
   *         description: 无权操作
   *       404:
   *         description: 商品不存在
   */
  async update(req, res) {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      throw new ApiError(404, '商品不存在');
    }

    // 验证用户是否有权限操作该店铺
    const isOwner = product.shop.ownerId === BigInt(req.user.userId);
    const isManager = await Shop.isManager(req.user.userId, product.shopId);
    if (!isOwner && !isManager) {
      throw new ApiError(403, '无权操作该商品');
    }

    const updatedProduct = await Product.update(id, req.body);
    res.json({
      code: 0,
      data: updatedProduct,
      message: '更新商品成功'
    });
  }

  /**
   * @swagger
   * /api/v1/products/{id}:
   *   delete:
   *     summary: 删除商品
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: 商品ID
   *     responses:
   *       200:
   *         description: 删除成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 0
   *                 message:
   *                   type: string
   *                   example: 删除商品成功
   *       403:
   *         description: 无权操作
   *       404:
   *         description: 商品不存在
   */
  async delete(req, res) {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      throw new ApiError(404, '商品不存在');
    }

    // 验证用户是否有权限操作该店铺
    const isOwner = product.shop.ownerId === BigInt(req.user.userId);
    const isManager = await Shop.isManager(req.user.userId, product.shopId);
    if (!isOwner && !isManager) {
      throw new ApiError(403, '无权操作该商品');
    }

    await Product.delete(id);
    res.json({
      code: 0,
      message: '删除商品成功'
    });
  }

  /**
   * @swagger
   * /api/v1/products/{id}:
   *   get:
   *     summary: 获取商品详情
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: 商品ID
   *     responses:
   *       200:
   *         description: 获取成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 0
   *                 data:
   *                   $ref: '#/components/schemas/Product'
   *       404:
   *         description: 商品不存在
   */
  async getById(req, res) {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      throw new ApiError(404, '商品不存在');
    }

    res.json({
      code: 0,
      data: product
    });
  }

  /**
   * @swagger
   * /api/v1/products:
   *   get:
   *     summary: 获取商品列表
   *     tags: [Products]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: 页码
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         description: 每页数量
   *       - in: query
   *         name: shopId
   *         schema:
   *           type: integer
   *         description: 店铺ID
   *       - in: query
   *         name: categoryId
   *         schema:
   *           type: integer
   *         description: 分类ID
   *       - in: query
   *         name: status
   *         schema:
   *           type: integer
   *           enum: [0, 1]
   *         description: 商品状态(0-下架 1-上架)
   *       - in: query
   *         name: name
   *         schema:
   *           type: string
   *         description: 商品名称(模糊搜索)
   *       - in: query
   *         name: minPrice
   *         schema:
   *           type: number
   *           minimum: 0
   *         description: 最小价格
   *       - in: query
   *         name: maxPrice
   *         schema:
   *           type: number
   *           minimum: 0
   *         description: 最大价格
   *       - in: query
   *         name: inPromotion
   *         schema:
   *           type: boolean
   *         description: 是否在促销中
   *     responses:
   *       200:
   *         description: 获取成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 0
   *                 data:
   *                   type: object
   *                   properties:
   *                     products:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/Product'
   *                     total:
   *                       type: integer
   *                       description: 总记录数
   *                     page:
   *                       type: integer
   *                       description: 当前页码
   *                     limit:
   *                       type: integer
   *                       description: 每页数量
   */
  async list(req, res) {
    const {
      page = 1,
      limit = 10,
      shopId,
      categoryId,
      status,
      name,
      minPrice,
      maxPrice,
      inPromotion
    } = req.query;

    const filters = {
      shopId,
      categoryId,
      status: status !== undefined ? parseInt(status) : undefined,
      name,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      inPromotion: inPromotion === 'true'
    };

    const result = await Product.list(parseInt(page), parseInt(limit), filters);
    res.json({
      code: 0,
      data: result
    });
  }

  /**
   * @swagger
   * /api/v1/products/{id}/stock:
   *   patch:
   *     summary: 更新商品库存
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: 商品ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - quantity
   *             properties:
   *               quantity:
   *                 type: integer
   *                 description: 库存变更数量(正数增加，负数减少)
   *     responses:
   *       200:
   *         description: 更新成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 0
   *                 data:
   *                   $ref: '#/components/schemas/Product'
   *                 message:
   *                   type: string
   *                   example: 更新库存成功
   *       400:
   *         description: 库存不足
   *       403:
   *         description: 无权操作
   *       404:
   *         description: 商品不存在
   */
  async updateStock(req, res) {
    const { id } = req.params;
    const { quantity } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      throw new ApiError(404, '商品不存在');
    }

    // 验证用户是否有权限操作该店铺
    const isOwner = product.shop.ownerId === BigInt(req.user.userId);
    const isManager = await Shop.isManager(req.user.userId, product.shopId);
    if (!isOwner && !isManager) {
      throw new ApiError(403, '无权操作该商品');
    }

    // 验证库存是否足够（如果是减少库存的情况）
    if (quantity < 0 && product.stock + quantity < 0) {
      throw new ApiError(400, '库存不足');
    }

    const updatedProduct = await Product.updateStock(id, quantity);
    res.json({
      code: 0,
      data: updatedProduct,
      message: '更新库存成功'
    });
  }

  // 获取商品列表
  async getProducts(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        categoryId, 
        shopId,
        minPrice,
        maxPrice,
        status = 1 // 默认只显示上架商品
      } = req.query;

      // 构建查询条件
      const where = {
        status: parseInt(status)
      };

      if (categoryId) {
        where.categoryId = BigInt(categoryId);
      }

      if (shopId) {
        where.shopId = BigInt(shopId);
      }

      if (minPrice) {
        where.sellingPrice = {
          ...where.sellingPrice,
          gte: parseFloat(minPrice)
        };
      }

      if (maxPrice) {
        where.sellingPrice = {
          ...where.sellingPrice,
          lte: parseFloat(maxPrice)
        };
      }

      // 查询商品
      const products = await prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          },
          shop: {
            select: {
              id: true,
              name: true,
              logo: true
            }
          }
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        }
      });

      // 获取总数
      const total = await prisma.product.count({ where });

      res.json({
        data: products,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({ message: '获取商品列表失败' });
    }
  }

  // 获取商品详情
  async getProductById(req, res) {
    try {
      const { id } = req.params;

      const product = await prisma.product.findUnique({
        where: { id: BigInt(id) },
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          },
          shop: {
            select: {
              id: true,
              name: true,
              logo: true,
              description: true
            }
          }
        }
      });

      if (!product) {
        return res.status(404).json({ message: '商品不存在' });
      }

      res.json(product);
    } catch (error) {
      console.error('Get product detail error:', error);
      res.status(500).json({ message: '获取商品详情失败' });
    }
  }

  // 创建商品
  async createProduct(req, res) {
    try {
      const {
        name,
        categoryId,
        description,
        specification,
        originalPrice,
        sellingPrice,
        rewardAmount,
        stock
      } = req.body;

      // 获取店铺ID（从认证用户中）
      const shopId = req.user.shopId;

      const product = await prisma.product.create({
        data: {
          name,
          categoryId: BigInt(categoryId),
          shopId: BigInt(shopId),
          description,
          specification,
          originalPrice,
          sellingPrice,
          rewardAmount: rewardAmount || 0,
          stock,
          status: 1
        }
      });

      res.status(201).json(product);
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ message: '创建商品失败' });
    }
  }

  // 更新商品
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const shopId = req.user.shopId;

      // 检查商品是否存在且属于该店铺
      const product = await prisma.product.findFirst({
        where: {
          id: BigInt(id),
          shopId: BigInt(shopId)
        }
      });

      if (!product) {
        return res.status(404).json({ message: '商品不存在或无权限修改' });
      }

      // 更新商品
      const updatedProduct = await prisma.product.update({
        where: { id: BigInt(id) },
        data: {
          ...updateData,
          categoryId: updateData.categoryId ? BigInt(updateData.categoryId) : undefined
        }
      });

      res.json(updatedProduct);
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ message: '更新商品失败' });
    }
  }

  // 删除商品（软删除）
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const shopId = req.user.shopId;

      // 检查商品是否存在且属于该店铺
      const product = await prisma.product.findFirst({
        where: {
          id: BigInt(id),
          shopId: BigInt(shopId)
        }
      });

      if (!product) {
        return res.status(404).json({ message: '商品不存在或无权限删除' });
      }

      // 软删除商品（更新状态为0）
      await prisma.product.update({
        where: { id: BigInt(id) },
        data: { status: 0 }
      });

      res.json({ message: '商品已删除' });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({ message: '删除商品失败' });
    }
  }
}

module.exports = new ProductController();
