const db = require('../config/database');

class Verification {
  static async create(phone, code) {
    const [result] = await db.execute(
      'INSERT INTO verifications (phone, code, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))',
      [phone, code]
    );
    return result.insertId;
  }

  static async findLatestByPhone(phone) {
    const [codes] = await db.execute(
      'SELECT * FROM verifications WHERE phone = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [phone]
    );
    return codes[0];
  }

  static async verify(phone, code) {
    const verification = await this.findLatestByPhone(phone);
    if (!verification) {
      return false;
    }
    return verification.code === code;
  }
}

module.exports = Verification; 
