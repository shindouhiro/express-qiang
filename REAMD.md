计

## 用户表 (users)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | bigint | 主键 |
| phone | varchar(11) | 手机号 |
| password | varchar(255) | 密码 |
| user_type | tinyint | 用户类型(1:普通用户,2:商家) |
| nickname | varchar(50) | 昵称 |
| avatar | varchar(255) | 头像 |
| status | tinyint | 状态(1:正常,0:禁用) |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

## 店铺表 (shops)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | bigint | 主键 |
| name | varchar(101) | 店铺名称 |
| description | text | 店铺描述 |
| logo | varchar(256) | 店铺logo |
| legal_name | varchar(51) | 法人姓名 |
| id_card_no | varchar(19) | 法人身份证号 |
| id_card_front | varchar(256) | 身份证正面照片 |
| id_card_back | varchar(255) | 身份证反面照片 |
| business_license | varchar(255) | 营业执照照片 |
| business_permit | varchar(255) | 经营许可证照片 |
| wechat_qrcode | varchar(255) | 微信二维码 |
| audit_status | tinyint | 审核状态(0:待审核,1:审核通过,2:审核拒绝) |
| status | tinyint | 状态(1:正常,0:关闭) |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

## 商品表 (products)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | bigint | 主键 |
| shop_id | bigint | 店铺ID |
| category_id | bigint | 商品分类ID |
| name | varchar(100) | 商品名称 |
| description | text | 商品描述 |
| specification | varchar(255) | 商品规格 |
| original_price | decimal(10,2) | 原价 |
| selling_price | decimal(10,2) | 售卖价 |
| reward_amount | decimal(10,2) | 奖励金 |
| stock | int | 现货库存 |
| promotion_start | datetime | 活动开始时间 |
| promotion_end | datetime | 活动结束时间 |
| status | tinyint | 状态(1:正常,0:下架) |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

## 佣金规则表 (commission_rules)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | bigint | 主键 |
| shop_id | bigint | 店铺ID |
| product_id | bigint | 商品ID(0表示店铺通用规则) |
| rate | decimal(5,2) | 佣金比例 |
| status | tinyint | 状态(1:启用,0:禁用) |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

## 订单表 (orders)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | bigint | 主键 |
| order_no | varchar(32) | 订单号 |
| shop_id | bigint | 店铺ID |
| user_id | bigint | 用户ID |
| total_amount | decimal(10,2) | 订单总金额 |
| status | tinyint | 订单状态(0:待付款,1:待发货,2:待收货,3:已完成,4:已取消) |
| payment_time | datetime | 支付时间 |
| shipping_time | datetime | 发货时间 |
| complete_time | datetime | 完成时间 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

## 订单商品表 (order_items)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | bigint | 主键 |
| order_id | bigint | 订单ID |
| product_id | bigint | 商品ID |
| product_name | varchar(100) | 商品名称 |
| product_price | decimal(10,2) | 商品单价 |
| quantity | int | 购买数量 |
| commission_rate | decimal(5,2) | 佣金比例 |
| commission_amount | decimal(10,2) | 佣金金额 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

## 提现申请表 (withdrawals)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | bigint | 主键 |
| user_id | bigint | 用户ID |
| amount | decimal(10,2) | 提现金额 |
| openid | varchar(50) | 微信openid |
| status | tinyint | 状态(0:待审核,1:审核通过,2:审核拒绝,3:已打款) |
| remark | varchar(255) | 备注说明 |
| audit_time | datetime | 审核时间 |
| payment_time | datetime | 打款时间 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

## 佣金流水表 (commission_logs)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | bigint | 主键 |
| user_id | bigint | 用户ID |
| order_id | bigint | 关联订单ID |
| withdrawal_id | bigint | 关联提现ID |
| amount | decimal(10,2) | 变动金额 |
| balance | decimal(10,2) | 变动后余额 |
| type | tinyint | 类型(1:订单佣金,2:提现) |
| created_at | datetime | 创建时间 |

## 收入明细表 (income_details)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | bigint | 主键 |
| user_id | bigint | 用户ID |
| order_id | bigint | 关联订单ID |
| amount | decimal(10,2) | 收入金额 |
| type | tinyint | 类型(1:商品奖励,2:佣金收入) |
| status | tinyint | 状态(0:待结算,1:已结算) |
| remark | varchar(255) | 备注说明 |
| created_at | datetime | 创建时间 |
| updated_at | datetime
