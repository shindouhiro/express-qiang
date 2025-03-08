const User = require('../models/user.model');
const Verification = require('../models/verification.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * /api/send-code:
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
    
    // 保存验证码到数据库
    await Verification.create(phone, code);

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
 * /api/register:
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
    const isValid = await Verification.verify(phone, code);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

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
 * /api/login:
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
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // 验证验证码
    const isValid = await Verification.verify(phone, code);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid verification code' });
    }

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
 * /api/profile:
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
 * /api/profile:
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
 * /api/users:
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
 * /api/users/{id}:
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
