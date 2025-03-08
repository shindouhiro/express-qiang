const request = require('supertest');
const app = require('../app');
const db = require('../config/database');

describe('Authentication API', () => {
  let verificationCode;
  const testPhone = '13800138000';
  
  // 在所有测试结束后关闭数据库连接
  afterAll(async () => {
    await db.end();
  });

  // 测试发送验证码
  describe('POST /api/send-code', () => {
    it('should send verification code successfully', async () => {
      const response = await request(app)
        .post('/api/send-code')
        .send({ phone: testPhone });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Verification code sent successfully');
      expect(response.body.code).toMatch(/^\d{6}$/);
      
      // 保存验证码用于后续测试
      verificationCode = response.body.code;
    });

    it('should fail without phone number', async () => {
      const response = await request(app)
        .post('/api/send-code')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Phone number is required');
    });
  });

  // 测试注册
  describe('POST /api/register', () => {
    it('should register new user successfully', async () => {
      const userData = {
        phone: testPhone,
        code: verificationCode,
        user_type: 1,
        nickname: '测试用户',
        avatar: 'https://example.com/avatar.jpg'
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.userId).toBeDefined();
    });

    it('should fail with invalid verification code', async () => {
      const userData = {
        phone: testPhone,
        code: '000000',
        user_type: 1,
        nickname: '测试用户',
        avatar: 'https://example.com/avatar.jpg'
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid verification code');
    });
  });

  // 测试登录
  describe('POST /api/login', () => {
    it('should get new verification code for login', async () => {
      const response = await request(app)
        .post('/api/send-code')
        .send({ phone: testPhone });

      expect(response.status).toBe(200);
      verificationCode = response.body.code;
    });

    it('should login successfully', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          phone: testPhone,
          code: verificationCode
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.phone).toBe(testPhone);
    });

    it('should fail with invalid verification code', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          phone: testPhone,
          code: '000000'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid verification code');
    });

    it('should fail with non-existent phone number', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          phone: '13900139000',
          code: '123456'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('User not found');
    });
  });
}); 
