const db = require('../config/database');

class User {
  static async create(userData) {
    const { phone, user_type, nickname, avatar } = userData;
    
    const [result] = await db.execute(
      'INSERT INTO users (phone, user_type, nickname, avatar, status) VALUES (?, ?, ?, ?, 1)',
      [phone, user_type, nickname, avatar]
    );
    return result.insertId;
  }

  static async findByPhone(phone) {
    const [users] = await db.execute('SELECT * FROM users WHERE phone = ?', [phone]);
    return users[0];
  }

  static async findById(id) {
    const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return users[0];
  }

  static async update(id, userData) {
    const { nickname, avatar, status } = userData;
    const [result] = await db.execute(
      'UPDATE users SET nickname = ?, avatar = ?, status = ? WHERE id = ?',
      [nickname, avatar, status, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async list(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [users] = await db.execute(
      'SELECT id, phone, user_type, nickname, avatar, status, created_at, updated_at FROM users LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [total] = await db.execute('SELECT COUNT(*) as count FROM users');
    return {
      users,
      total: total[0].count,
      page,
      limit
    };
  }
}

module.exports = User; 
