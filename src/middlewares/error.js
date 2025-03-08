const { ApiError } = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      message: err.message
    });
  }

  // 处理 Prisma 错误
  if (err.code === 'P2002') {
    return res.status(400).json({
      code: 400,
      message: '数据已存在'
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      code: 404,
      message: '记录不存在'
    });
  }

  // 处理验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      code: 400,
      message: err.message
    });
  }

  // 处理未知错误
  console.error('Error:', err);
  res.status(500).json({
    code: 500,
    message: process.env.NODE_ENV === 'production' ? '服务器错误' : err.message
  });
};

module.exports = errorHandler; 
