const prisma = require('../lib/prisma');

class Shop {
  static async create(shopData) {
    const {
      name,
      description,
      logo,
      legal_name,
      id_card_no,
      id_card_front,
      id_card_back,
      business_license,
      business_permit,
      wechat_qrcode,
      owner_id
    } = shopData;

    const shop = await prisma.shop.create({
      data: {
        name,
        description,
        logo,
        legalName: legal_name,
        idCardNo: id_card_no,
        idCardFront: id_card_front,
        idCardBack: id_card_back,
        businessLicense: business_license,
        businessPermit: business_permit,
        wechatQrcode: wechat_qrcode,
        auditStatus: 0,
        status: 1,
        ownerId: owner_id
      }
    });

    return shop.id;
  }

  static async findById(id) {
    return await prisma.shop.findUnique({
      where: { id: BigInt(id) }
    });
  }

  static async findByOwnerId(ownerId) {
    return await prisma.shop.findFirst({
      where: { ownerId: BigInt(ownerId) }
    });
  }

  static async update(id, shopData) {
    const {
      name,
      description,
      logo,
      legal_name,
      id_card_no,
      id_card_front,
      id_card_back,
      business_license,
      business_permit,
      wechat_qrcode,
      audit_status,
      status
    } = shopData;

    try {
      await prisma.shop.update({
        where: { id: BigInt(id) },
        data: {
          name,
          description,
          logo,
          legalName: legal_name,
          idCardNo: id_card_no,
          idCardFront: id_card_front,
          idCardBack: id_card_back,
          businessLicense: business_license,
          businessPermit: business_permit,
          wechatQrcode: wechat_qrcode,
          auditStatus: audit_status !== undefined ? audit_status : undefined,
          status: status !== undefined ? status : undefined
        }
      });
      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }

  static async updateStatus(id, status) {
    try {
      await prisma.shop.update({
        where: { id: BigInt(id) },
        data: { status }
      });
      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }

  static async updateAuditStatus(id, auditStatus) {
    try {
      await prisma.shop.update({
        where: { id: BigInt(id) },
        data: { auditStatus }
      });
      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }

  static async list(page = 1, limit = 10, filters = {}) {
    const where = {};

    if (filters.status !== undefined) {
      where.status = filters.status;
    }
    if (filters.audit_status !== undefined) {
      where.auditStatus = filters.audit_status;
    }
    if (filters.name) {
      where.name = { contains: filters.name };
    }
    if (filters.owner_id) {
      where.ownerId = BigInt(filters.owner_id);
    }

    const [shops, total] = await Promise.all([
      prisma.shop.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.shop.count({ where })
    ]);

    return {
      shops,
      total,
      page,
      limit
    };
  }

  static async delete(id) {
    try {
      await prisma.shop.delete({
        where: { id: BigInt(id) }
      });
      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }
}

module.exports = Shop; 
