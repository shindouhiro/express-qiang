const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public routes
router.post('/send-code', userController.sendVerificationCode);
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);

// Admin only routes
router.get('/users', authenticate, authorize([2]), userController.listUsers);
router.delete('/users/:id', authenticate, authorize([2]), userController.deleteUser);

module.exports = router; 
