const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// 公开路由
router.get('/', shopController.listShops);
router.get('/:id', shopController.getShop);

// 需要认证的路由
router.post('/', authenticate, shopController.createShop);
router.put('/:id', authenticate, shopController.updateShop);
router.patch('/:id/status', authenticate, shopController.updateShopStatus);
router.patch('/:id/audit', authenticate, authorize([2]), shopController.updateShopAuditStatus);
router.delete('/:id', authenticate, authorize([2]), shopController.deleteShop);

module.exports = router; 
