const Shop = require('../models/shop.model');

/**
 * @swagger
 * /api/shops:
 *   post:
 *     summary: 创建店铺
 *     tags: [Shops]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - legal_name
 *               - id_card_no
 *             properties:
 *               name:
 *                 type: string
 *                 description: 店铺名称
 *               description:
 *                 type: string
 *                 description: 店铺描述
 *               logo:
 *                 type: string
 *                 description: 店铺logo URL
 *               legal_name:
 *                 type: string
 *                 description: 法人姓名
 *               id_card_no:
 *                 type: string
 *                 description: 法人身份证号
 *               id_card_front:
 *                 type: string
 *                 description: 身份证正面照片URL
 *               id_card_back:
 *                 type: string
 *                 description: 身份证反面照片URL
 *               business_license:
 *                 type: string
 *                 description: 营业执照照片URL
 *               business_permit:
 *                 type: string
 *                 description: 经营许可证照片URL
 *               wechat_qrcode:
 *                 type: string
 *                 description: 微信二维码URL
 *     responses:
 *       201:
 *         description: 店铺创建成功
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 */
exports.createShop = async (req, res) => {
  try {
    // 检查用户是否已有店铺
    const existingShop = await Shop.findByOwnerId(req.user.userId);
    if (existingShop) {
      return res.status(400).json({ message: 'User already has a shop' });
    }

    const shopId = await Shop.create({
      ...req.body,
      owner_id: req.user.userId
    });

    res.status(201).json({
      message: 'Shop created successfully',
      shopId
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating shop', error: error.message });
  }
};

/**
 * @swagger
 * /api/shops/{id}:
 *   get:
 *     summary: 获取店铺详情
 *     tags: [Shops]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 店铺ID
 *     responses:
 *       200:
 *         description: 成功获取店铺信息
 *       404:
 *         description: 店铺不存在
 */
exports.getShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shop', error: error.message });
  }
};

/**
 * @swagger
 * /api/shops/{id}:
 *   put:
 *     summary: 更新店铺信息
 *     tags: [Shops]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 店铺ID
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
 *               logo:
 *                 type: string
 *               legal_name:
 *                 type: string
 *               id_card_no:
 *                 type: string
 *               id_card_front:
 *                 type: string
 *               id_card_back:
 *                 type: string
 *               business_license:
 *                 type: string
 *               business_permit:
 *                 type: string
 *               wechat_qrcode:
 *                 type: string
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         description: 未授权
 *       403:
 *         description: 无权限
 *       404:
 *         description: 店铺不存在
 */
exports.updateShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    // 检查权限
    if (shop.ownerId !== BigInt(req.user.userId) && req.user.userType !== 2) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const success = await Shop.update(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    res.json({ message: 'Shop updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating shop', error: error.message });
  }
};

/**
 * @swagger
 * /api/shops/{id}/status:
 *   patch:
 *     summary: 更新店铺状态
 *     tags: [Shops]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 店铺ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: integer
 *                 description: 店铺状态(1:正常,0:关闭)
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         description: 未授权
 *       403:
 *         description: 无权限
 *       404:
 *         description: 店铺不存在
 */
exports.updateShopStatus = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    // 检查权限
    if (shop.ownerId !== BigInt(req.user.userId) && req.user.userType !== 2) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const success = await Shop.updateStatus(req.params.id, req.body.status);
    if (!success) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    res.json({ message: 'Shop status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating shop status', error: error.message });
  }
};

/**
 * @swagger
 * /api/shops/{id}/audit:
 *   patch:
 *     summary: 更新店铺审核状态（仅管理员）
 *     tags: [Shops]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 店铺ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - audit_status
 *             properties:
 *               audit_status:
 *                 type: integer
 *                 description: 审核状态(0:待审核,1:审核通过,2:审核拒绝)
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         description: 未授权
 *       403:
 *         description: 无权限
 *       404:
 *         description: 店铺不存在
 */
exports.updateShopAuditStatus = async (req, res) => {
  try {
    // 检查是否是管理员
    if (req.user.userType !== 2) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const success = await Shop.updateAuditStatus(req.params.id, req.body.audit_status);
    if (!success) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    res.json({ message: 'Shop audit status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating shop audit status', error: error.message });
  }
};

/**
 * @swagger
 * /api/shops:
 *   get:
 *     summary: 获取店铺列表
 *     tags: [Shops]
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *         description: 状态筛选
 *       - in: query
 *         name: audit_status
 *         schema:
 *           type: integer
 *         description: 审核状态筛选
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: 店铺名称搜索
 *     responses:
 *       200:
 *         description: 成功获取店铺列表
 */
exports.listShops = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      status: req.query.status !== undefined ? parseInt(req.query.status) : undefined,
      audit_status: req.query.audit_status !== undefined ? parseInt(req.query.audit_status) : undefined,
      name: req.query.name,
      owner_id: req.query.owner_id
    };

    const result = await Shop.list(page, limit, filters);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error listing shops', error: error.message });
  }
};

/**
 * @swagger
 * /api/shops/{id}:
 *   delete:
 *     summary: 删除店铺（仅管理员）
 *     tags: [Shops]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 店铺ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         description: 未授权
 *       403:
 *         description: 无权限
 *       404:
 *         description: 店铺不存在
 */
exports.deleteShop = async (req, res) => {
  try {
    // 检查是否是管理员
    if (req.user.userType !== 2) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const success = await Shop.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    res.json({ message: 'Shop deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting shop', error: error.message });
  }
}; 
