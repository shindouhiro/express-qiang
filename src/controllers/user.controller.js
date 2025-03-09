// 导入用户模型
const User = require('../models/user.model');
// 导入JWT工具
const jwt = require('jsonwebtoken');
// 导入密码加密工具
const bcrypt = require('bcryptjs');
// 导入随机密码生成工具
const crypto = require('crypto');

// 生成随机密码的函数
const generateRandomPassword = () => {
  return crypto.randomBytes(8).toString('hex');
};

// 使用Map存储验证码，key为手机号，value为{code, expireTime}
const verificationCodes = new Map();
// 验证码有效期（5分钟）
const CODE_EXPIRE_TIME = 5 * 60 * 1000;

/**
 * @swagger
 * /api/v1/users/send-code:
 *   post:
 *     summary: 发送手机验证码
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 description: 手机号
 *                 example: "13800138000"
 *     responses:
 *       200:
 *         description: 验证码发送成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Verification code sent successfully"
 *                 code:
 *                   type: string
 *                   description: 验证码（仅测试环境返回）
 *                   example: "123456"
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// 生成随机验证码
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 发送验证码
exports.sendVerificationCode = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }
    
    // 生成6位随机验证码
    const code = generateVerificationCode();
    
    // 保存验证码到内存，设置过期时间
    verificationCodes.set(phone, {
      code,
      expireTime: Date.now() + CODE_EXPIRE_TIME
    });

    // TODO: 实际项目中这里需要调用短信服务发送验证码
    // 现在为了测试，直接返回验证码
    res.json({
      message: 'Verification code sent successfully',
      code // 实际项目中不要返回验证码
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending verification code', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: 用户注册
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - code
 *               - user_type
 *             properties:
 *               phone:
 *                 type: string
 *                 description: 手机号
 *                 example: "13800138000"
 *               code:
 *                 type: string
 *                 description: 验证码
 *                 example: "123456"
 *               user_type:
 *                 type: integer
 *                 description: 用户类型(1:普通用户,2:商家)
 *                 example: 1
 *               nickname:
 *                 type: string
 *                 description: 昵称
 *                 example: "张三"
 *               avatar:
 *                 type: string
 *                 description: 头像URL
 *                 example: "https://example.com/avatar.jpg"
 *     responses:
 *       201:
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                 userId:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: 验证码无效或手机号已注册
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
exports.register = async (req, res) => {
  try {
    const { phone, code, user_type, nickname, avatar } = req.body;
    
    // 检查用户是否已存在
    const existingUser = await User.findByPhone(phone);
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    // 验证验证码
    const verification = verificationCodes.get(phone);
    if (!verification || verification.code !== code || Date.now() > verification.expireTime) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    
    // 验证成功后删除验证码
    verificationCodes.delete(phone);

    const userId = await User.create({
      phone,
      user_type,
      nickname,
      avatar
    });

    res.status(201).json({
      message: 'User registered successfully',
      userId
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: 用户登录
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - code
 *             properties:
 *               phone:
 *                 type: string
 *                 description: 手机号
 *                 example: "13800138000"
 *               code:
 *                 type: string
 *                 description: 验证码
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 验证码无效或用户不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
exports.login = async (req, res) => {
  try {
    const { phone, code } = req.body;
    
    // 先检查用户是否存在
    const user = await User.findByPhone(phone);

    // 验证验证码
    const verification = verificationCodes.get(phone);
    if (!verification || verification.code !== code || Date.now() > verification.expireTime) {
      return res.status(401).json({ message: 'Invalid or expired verification code' });
    }
    
    // 验证成功后删除验证码
    verificationCodes.delete(phone);

    // 如果用户不存在，则创建新用户
    if (!user) {
      const userId = await User.create({
        phone,
        user_type: 1, // 默认创建普通用户
        nickname: `用户${phone.substr(-4)}`, // 使用手机号后4位作为默认昵称
        avatar: '', // 默认空头像
      });
      // 重新获取创建的用户信息
      const newUser = await User.findById(userId);
      if (!newUser) {
        return res.status(500).json({ message: 'Error creating user' });
      }
      const token = jwt.sign(
        { userId: newUser.id, userType: newUser.user_type },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: newUser.id,
          phone: newUser.phone,
          nickname: newUser.nickname,
          avatar: newUser.avatar,
          userType: newUser.user_type,
          passwrod: '123456'
        }
      });
    }

    // 已存在用户的登录流程
    const token = jwt.sign(
      { userId: user.id, userType: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        userType: user.user_type
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
};
/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     summary: 获取用户个人信息
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取用户信息
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 用户不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/users/profile:
 *   put:
 *     summary: 更新用户个人信息
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: 昵称
 *               avatar:
 *                 type: string
 *                 description: 头像URL
 *               status:
 *                 type: integer
 *                 description: 状态(1:正常,0:禁用)
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *       401:
 *         description: 未授权
 *       404:
 *         description: 用户不存在
 */
exports.updateProfile = async (req, res) => {
  try {
    const { nickname, avatar, status } = req.body;
    const success = await User.update(req.user.userId, { nickname, avatar, status });
    
    if (!success) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: 获取用户列表（仅管理员）
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
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
 *     responses:
 *       200:
 *         description: 成功获取用户列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 total:
 *                   type: integer
 *                   description: 总用户数
 *                 page:
 *                   type: integer
 *                   description: 当前页码
 *                 limit:
 *                   type: integer
 *                   description: 每页数量
 *       401:
 *         description: 未授权
 *       403:
 *         description: 无权限访问
 */
exports.listUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await User.list(page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error listing users', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   delete:
 *     summary: 删除用户（仅管理员）
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *       401:
 *         description: 未授权
 *       403:
 *         description: 无权限访问
 *       404:
 *         description: 用户不存在
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await User.delete(id);
    
    if (!success) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};
