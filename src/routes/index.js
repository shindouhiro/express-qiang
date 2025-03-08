const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const shopRoutes = require('./shop.routes');
const productRoutes = require('./product.routes');

router.use('/auth', authRoutes);
router.use('/shops', shopRoutes);
router.use('/products', productRoutes);

module.exports = router; 
