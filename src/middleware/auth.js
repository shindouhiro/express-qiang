const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/ApiError');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, '未提供认证令牌');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: BigInt(decoded.id) },
      select: {
        id: true,
        email: true,
        role: true,
        status: true
      }
    });

    if (!user) {
      throw new ApiError(401, '用户不存在');
    }

    if (user.status !== 1) {
      throw new ApiError(401, '用户已被禁用');
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, '无效的认证令牌'));
    } else {
      next(error);
    }
  }
};

module.exports = auth; 
