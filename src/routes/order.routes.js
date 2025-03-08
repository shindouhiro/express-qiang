const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const orderController = require('../controllers/order.controller');

// Create a new order
router.post('/', auth, orderController.createOrder);

// Get order list with pagination and filters
router.get('/', auth, orderController.getOrders);

// Get order detail by id
router.get('/:id', auth, orderController.getOrderById);

// Update order status
router.patch('/:id/status', auth, orderController.updateOrderStatus);

// Soft delete order
router.delete('/:id', auth, orderController.deleteOrder);

module.exports = router; 
