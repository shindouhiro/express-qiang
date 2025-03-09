const prisma = require('../lib/prisma');

class User {
  static async create(userData) {
    const { phone, user_type: userType, nickname, avatar } = userData;
    
    const user = await prisma.user.create({
      data: {
        phone,
        userType,
        nickname,
        avatar,
        status: 1,
      },
    });
    return user.id;
  }

  static async findByPhone(phone) {
    const user = await prisma.user.findUnique({
      where: {
        phone,
      },
    });
    if (user) {
      user.id = user.id.toString();
    }
    return user;
  }

  static async findById(id) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (user) {
      user.id = user.id.toString();
    }
    return user;
  }

  static async update(id, userData) {
    const { nickname, avatar, status } = userData;
    try {
      await prisma.user.update({
        where: {
          id,
        },
        data: {
          nickname,
          avatar,
          status,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  static async delete(id) {
    try {
      await prisma.user.delete({
        where: {
          id,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  static async list(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          phone: true,
          userType: true,
          nickname: true,
          avatar: true,
          status: true,
          created_at: true,
          updated_at: true,
        },
        skip,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    return {
      users,
      total,
      page,
      limit,
    };
  }
}

module.exports = User;
