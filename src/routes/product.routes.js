const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { body, query, param } = require('express-validator');

// 创建商品
router.post(
  '/',
  auth(),
  [
    body('shopId').notEmpty().withMessage('店铺ID不能为空'),
    body('categoryId').notEmpty().withMessage('分类ID不能为空'),
    body('name').notEmpty().withMessage('商品名称不能为空').isLength({ max: 100 }).withMessage('商品名称最多100个字符'),
    body('description').optional().isLength({ max: 1000 }).withMessage('商品描述最多1000个字符'),
    body('specification').optional().isLength({ max: 255 }).withMessage('规格说明最多255个字符'),
    body('originalPrice').notEmpty().withMessage('原价不能为空').isFloat({ min: 0 }).withMessage('原价必须大于等于0'),
    body('sellingPrice').notEmpty().withMessage('售价不能为空').isFloat({ min: 0 }).withMessage('售价必须大于等于0'),
    body('rewardAmount').notEmpty().withMessage('奖励金额不能为空').isFloat({ min: 0 }).withMessage('奖励金额必须大于等于0'),
    body('stock').notEmpty().withMessage('库存不能为空').isInt({ min: 0 }).withMessage('库存必须大于等于0'),
    body('promotionStart').optional().isISO8601().withMessage('促销开始时间格式不正确'),
    body('promotionEnd').optional().isISO8601().withMessage('促销结束时间格式不正确'),
    body('status').optional().isInt({ min: 0, max: 1 }).withMessage('状态值不正确')
  ],
  validate,
  productController.create
);

// 更新商品
router.put(
  '/:id',
  auth(),
  [
    param('id').notEmpty().withMessage('商品ID不能为空'),
    body('name').optional().isLength({ max: 100 }).withMessage('商品名称最多100个字符'),
    body('description').optional().isLength({ max: 1000 }).withMessage('商品描述最多1000个字符'),
    body('specification').optional().isLength({ max: 255 }).withMessage('规格说明最多255个字符'),
    body('originalPrice').optional().isFloat({ min: 0 }).withMessage('原价必须大于等于0'),
    body('sellingPrice').optional().isFloat({ min: 0 }).withMessage('售价必须大于等于0'),
    body('rewardAmount').optional().isFloat({ min: 0 }).withMessage('奖励金额必须大于等于0'),
    body('stock').optional().isInt({ min: 0 }).withMessage('库存必须大于等于0'),
    body('promotionStart').optional().isISO8601().withMessage('促销开始时间格式不正确'),
    body('promotionEnd').optional().isISO8601().withMessage('促销结束时间格式不正确'),
    body('status').optional().isInt({ min: 0, max: 1 }).withMessage('状态值不正确')
  ],
  validate,
  productController.update
);

// 删除商品
router.delete(
  '/:id',
  auth(),
  [
    param('id').notEmpty().withMessage('商品ID不能为空')
  ],
  validate,
  productController.delete
);

// 获取商品详情
router.get(
  '/:id',
  [
    param('id').notEmpty().withMessage('商品ID不能为空')
  ],
  validate,
  productController.getById
);

// 获取商品列表
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须大于等于1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('shopId').optional().isInt().withMessage('店铺ID格式不正确'),
    query('categoryId').optional().isInt().withMessage('分类ID格式不正确'),
    query('status').optional().isInt({ min: 0, max: 1 }).withMessage('状态值不正确'),
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('最小价格必须大于等于0'),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('最大价格必须大于等于0'),
    query('inPromotion').optional().isBoolean().withMessage('促销状态格式不正确')
  ],
  validate,
  productController.list
);

// 更新商品库存
router.patch(
  '/:id/stock',
  auth(),
  [
    param('id').notEmpty().withMessage('商品ID不能为空'),
    body('quantity').notEmpty().withMessage('数量不能为空').isInt().withMessage('数量必须为整数')
  ],
  validate,
  productController.updateStock
);

module.exports = router; 
