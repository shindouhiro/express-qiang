const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Qiang Express API',
      version: '1.0.0',
      description: '强哥速递 API 文档',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: '开发服务器',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: '错误信息',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '用户ID',
            },
            phone: {
              type: 'string',
              description: '手机号',
            },
            user_type: {
              type: 'integer',
              description: '用户类型(1:普通用户,2:商家)',
            },
            nickname: {
              type: 'string',
              description: '昵称',
            },
            avatar: {
              type: 'string',
              description: '头像URL',
            },
            status: {
              type: 'integer',
              description: '状态(1:正常,0:禁用)',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: '创建时间',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: '更新时间',
            },
          },
        },
        Shop: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '店铺ID',
            },
            name: {
              type: 'string',
              description: '店铺名称',
            },
            description: {
              type: 'string',
              description: '店铺描述',
            },
            logo: {
              type: 'string',
              description: '店铺logo URL',
            },
            legal_name: {
              type: 'string',
              description: '法人姓名',
            },
            id_card_no: {
              type: 'string',
              description: '法人身份证号',
            },
            id_card_front: {
              type: 'string',
              description: '身份证正面照片URL',
            },
            id_card_back: {
              type: 'string',
              description: '身份证反面照片URL',
            },
            business_license: {
              type: 'string',
              description: '营业执照照片URL',
            },
            business_permit: {
              type: 'string',
              description: '经营许可证照片URL',
            },
            wechat_qrcode: {
              type: 'string',
              description: '微信二维码URL',
            },
            audit_status: {
              type: 'integer',
              description: '审核状态(0:待审核,1:审核通过,2:审核拒绝)',
            },
            status: {
              type: 'integer',
              description: '状态(1:正常,0:关闭)',
            },
            user_id: {
              type: 'integer',
              description: '店主用户ID',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: '创建时间',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: '更新时间',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'], // Path to the API docs
};

module.exports = swaggerJsdoc(options); 
