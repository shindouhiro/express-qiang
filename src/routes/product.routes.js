const express = require('express');
const router = express.Router();
const Product = require('../models/product.model');
const auth = require('../middleware/auth');
const { ApiError } = require('../utils/ApiError');
const { serializeBigInt } = require('../utils/serializer');

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     tags: [Products]
 *     summary: Get products list with pagination and filters
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: shopId
 *         schema:
 *           type: string
 *         description: Filter by shop ID
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by product name
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: inPromotion
 *         schema:
 *           type: boolean
 *         description: Filter for products currently in promotion
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Server Error
 */
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      shopId: req.query.shopId,
      categoryId: req.query.categoryId,
      name: req.query.name,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
      inPromotion: req.query.inPromotion === 'true',
      status: req.query.status ? parseInt(req.query.status) : undefined
    };

    const result = await Product.list(page, limit, filters);
    res.json(serializeBigInt(result));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Product not found
 */
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new ApiError(404, '商品不存在');
    }
    res.json(serializeBigInt(product));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     tags: [Products]
 *     summary: Create a new product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - shopId
 *               - categoryId
 *               - originalPrice
 *               - sellingPrice
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *               shopId:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               description:
 *                 type: string
 *               specification:
 *                 type: string
 *               originalPrice:
 *                 type: number
 *               sellingPrice:
 *                 type: number
 *               rewardAmount:
 *                 type: number
 *               stock:
 *                 type: integer
 *               promotionStart:
 *                 type: string
 *                 format: date-time
 *               promotionEnd:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', auth, async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(serializeBigInt(product));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update a product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               specification:
 *                 type: string
 *               originalPrice:
 *                 type: number
 *               sellingPrice:
 *                 type: number
 *               rewardAmount:
 *                 type: number
 *               stock:
 *                 type: integer
 *               promotionStart:
 *                 type: string
 *                 format: date-time
 *               promotionEnd:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
router.put('/:id', auth, async (req, res, next) => {
  try {
    const product = await Product.update(req.params.id, req.body);
    res.json(serializeBigInt(product));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
router.delete('/:id', auth, async (req, res, next) => {
  try {
    await Product.delete(req.params.id);
    res.json({ message: '商品已删除' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/products/{id}/stock:
 *   patch:
 *     tags: [Products]
 *     summary: Update product stock
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *                 description: Amount to add to stock (negative for reduction)
 *     responses:
 *       200:
 *         description: Stock updated successfully
 *       404:
 *         description: Product not found
 */
router.patch('/:id/stock', auth, async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const product = await Product.updateStock(req.params.id, quantity);
    res.json(serializeBigInt(product));
  } catch (error) {
    next(error);
  }
});

module.exports = router; 
