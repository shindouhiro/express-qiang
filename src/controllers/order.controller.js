const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateOrderNo } = require('../utils/order');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: 订单管理接口
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         productId:
 *           type: integer
 *           format: int64
 *           description: 商品ID
 *         quantity:
 *           type: integer
 *           description: 购买数量
 *           minimum: 1
 *     CreateOrder:
 *       type: object
 *       required:
 *         - shopId
 *         - items
 *       properties:
 *         shopId:
 *           type: integer
 *           format: int64
 *           description: 店铺ID
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *           description: 订单商品列表
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           description: 订单ID
 *         orderNo:
 *           type: string
 *           description: 订单号
 *         shopId:
 *           type: integer
 *           format: int64
 *           description: 店铺ID
 *         userId:
 *           type: integer
 *           format: int64
 *           description: 用户ID
 *         totalAmount:
 *           type: number
 *           format: decimal
 *           description: 订单总金额
 *         status:
 *           type: integer
 *           description: 订单状态(0:待付款,1:待发货,2:待收货,3:已完成,4:已取消)
 *         paymentTime:
 *           type: string
 *           format: date-time
 *           description: 支付时间
 *         shippingTime:
 *           type: string
 *           format: date-time
 *           description: 发货时间
 *         completeTime:
 *           type: string
 *           format: date-time
 *           description: 完成时间
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 */

const orderController = {
  /**
   * @swagger
   * /api/orders:
   *   post:
   *     summary: 创建新订单
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateOrder'
   *     responses:
   *       201:
   *         description: 订单创建成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Order'
   *       400:
   *         description: 无效的请求数据
   *       404:
   *         description: 商品不存在
   *       500:
   *         description: 服务器错误
   */
  async createOrder(req, res) {
    try {
      const { shopId, items } = req.body;
      const userId = req.user.id;

      // Validate input
      if (!shopId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: '无效的订单数据' });
      }

      // Calculate total amount and prepare order items
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            shop: true,
          },
        });

        if (!product) {
          return res.status(404).json({ message: `商品 ID ${item.productId} 不存在` });
        }

        if (product.shopId !== BigInt(shopId)) {
          return res.status(400).json({ message: '订单中包含其他店铺的商品' });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({ message: `商品 ${product.name} 库存不足` });
        }

        const itemTotal = Number(product.sellingPrice) * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          productId: product.id,
          productName: product.name,
          productPrice: product.sellingPrice,
          quantity: item.quantity,
          commissionRate: 0, // Will be updated based on commission rules
          commissionAmount: 0, // Will be calculated based on commission rate
        });
      }

      // Create order with items in a transaction
      const order = await prisma.$transaction(async (prisma) => {
        // Create the order
        const order = await prisma.order.create({
          data: {
            orderNo: generateOrderNo(),
            shopId: BigInt(shopId),
            userId: BigInt(userId),
            totalAmount,
            status: 0, // 待付款
            orderItems: {
              create: orderItems,
            },
          },
          include: {
            orderItems: true,
          },
        });

        // Update product stock
        for (const item of items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        return order;
      });

      res.status(201).json(order);
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ message: '创建订单失败' });
    }
  },

  /**
   * @swagger
   * /api/orders:
   *   get:
   *     summary: 获取订单列表
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: 页码
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: 每页数量
   *       - in: query
   *         name: status
   *         schema:
   *           type: integer
   *           enum: [0, 1, 2, 3, 4]
   *         description: 订单状态(0:待付款,1:待发货,2:待收货,3:已完成,4:已取消)
   *       - in: query
   *         name: shopId
   *         schema:
   *           type: integer
   *           format: int64
   *         description: 店铺ID
   *     responses:
   *       200:
   *         description: 成功获取订单列表
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Order'
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                     page:
   *                       type: integer
   *                     limit:
   *                       type: integer
   *                     totalPages:
   *                       type: integer
   *       500:
   *         description: 服务器错误
   */
  async getOrders(req, res) {
    try {
      const { page = 1, limit = 10, status, shopId } = req.query;
      const userId = req.user.id;

      const where = {
        userId: BigInt(userId),
      };

      if (status !== undefined) {
        where.status = parseInt(status);
      }

      if (shopId) {
        where.shopId = BigInt(shopId);
      }

      const orders = await prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                  specification: true,
                },
              },
            },
          },
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc',
        },
      });

      const total = await prisma.order.count({ where });

      res.json({
        data: orders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({ message: '获取订单列表失败' });
    }
  },

  /**
   * @swagger
   * /api/orders/{id}:
   *   get:
   *     summary: 获取订单详情
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *         description: 订单ID
   *     responses:
   *       200:
   *         description: 成功获取订单详情
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Order'
   *       404:
   *         description: 订单不存在
   *       500:
   *         description: 服务器错误
   */
  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const order = await prisma.order.findFirst({
        where: {
          id: BigInt(id),
          userId: BigInt(userId),
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                  specification: true,
                  description: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        return res.status(404).json({ message: '订单不存在' });
      }

      res.json(order);
    } catch (error) {
      console.error('Get order detail error:', error);
      res.status(500).json({ message: '获取订单详情失败' });
    }
  },

  /**
   * @swagger
   * /api/orders/{id}/status:
   *   patch:
   *     summary: 更新订单状态
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *         description: 订单ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - status
   *             properties:
   *               status:
   *                 type: integer
   *                 enum: [0, 1, 2, 3, 4]
   *                 description: 订单状态(0:待付款,1:待发货,2:待收货,3:已完成,4:已取消)
   *     responses:
   *       200:
   *         description: 订单状态更新成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Order'
   *       400:
   *         description: 无效的订单状态
   *       404:
   *         description: 订单不存在
   *       500:
   *         description: 服务器错误
   */
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.id;

      // Validate status
      const validStatuses = [0, 1, 2, 3, 4]; // 待付款,待发货,待收货,已完成,已取消
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: '无效的订单状态' });
      }

      const order = await prisma.order.findFirst({
        where: {
          id: BigInt(id),
          userId: BigInt(userId),
        },
      });

      if (!order) {
        return res.status(404).json({ message: '订单不存在' });
      }

      // Update status with appropriate timestamps
      const updateData = {
        status,
      };

      if (status === 1) { // 待发货
        updateData.paymentTime = new Date();
      } else if (status === 2) { // 待收货
        updateData.shippingTime = new Date();
      } else if (status === 3) { // 已完成
        updateData.completeTime = new Date();
      }

      const updatedOrder = await prisma.order.update({
        where: { id: BigInt(id) },
        data: updateData,
      });

      res.json(updatedOrder);
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ message: '更新订单状态失败' });
    }
  },

  /**
   * @swagger
   * /api/orders/{id}:
   *   delete:
   *     summary: 删除订单（软删除）
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *         description: 订单ID
   *     responses:
   *       200:
   *         description: 订单删除成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: 订单已删除
   *       400:
   *         description: 只能删除未支付的订单
   *       404:
   *         description: 订单不存在
   *       500:
   *         description: 服务器错误
   */
  async deleteOrder(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const order = await prisma.order.findFirst({
        where: {
          id: BigInt(id),
          userId: BigInt(userId),
        },
      });

      if (!order) {
        return res.status(404).json({ message: '订单不存在' });
      }

      if (order.status !== 0) {
        return res.status(400).json({ message: '只能删除未支付的订单' });
      }

      // Update order status to cancelled (4)
      await prisma.order.update({
        where: { id: BigInt(id) },
        data: { status: 4 },
      });

      res.json({ message: '订单已删除' });
    } catch (error) {
      console.error('Delete order error:', error);
      res.status(500).json({ message: '删除订单失败' });
    }
  },
};

module.exports = orderController; 
