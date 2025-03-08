const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: BigInt(decoded.id) },
      select: {
        id: true,
        phone: true,
        userType: true,
        status: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }

    if (user.status !== 1) {
      return res.status(403).json({ message: '账户已被禁用' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: '认证令牌已过期' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: '无效的认证令牌' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: '认证服务错误' });
  }
};

module.exports = {
  auth,
}; 
