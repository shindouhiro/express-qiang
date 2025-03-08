# 部署指南

## 目录
- [环境要求](#环境要求)
- [部署准备](#部署准备)
- [开发环境部署](#开发环境部署)
- [生产环境部署](#生产环境部署)
- [数据库迁移](#数据库迁移)
- [常见问题](#常见问题)

## 环境要求

### 系统要求
- Docker Engine 20.10.0 或更高版本
- Docker Compose 2.0.0 或更高版本
- 至少 4GB RAM
- 至少 20GB 可用磁盘空间

### 端口要求
- 4000: Node.js 应用
- 3306: MySQL 数据库（生产环境仅内部访问）

## 部署准备

1. 安装 Docker 和 Docker Compose
```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. 克隆项目代码
```bash
git clone <repository_url>
cd qiang-express
```

3. 配置环境变量
```bash
# 开发环境
cp .env.example .env

# 生产环境
cp .env.example .env.production
# 修改生产环境配置，特别是密码和密钥
vim .env.production
```

## 开发环境部署

1. 启动服务
```bash
docker-compose up --build
```

2. 验证服务状态
```bash
# 检查容器状态
docker-compose ps

# 检查应用日志
docker-compose logs -f app

# 检查数据库日志
docker-compose logs -f db
```

## 生产环境部署

1. 使用生产环境配置文件启动服务
```bash
# 使用生产配置启动
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps
```

2. 检查服务健康状态
```bash
# 检查应用健康状态
curl http://localhost:4000/api/health

# 查看容器健康状态
docker inspect --format='{{json .State.Health}}' qiang-express-app-1
```

3. 查看日志
```bash
# 应用日志
docker-compose -f docker-compose.prod.yml logs -f app

# 数据库日志
docker-compose -f docker-compose.prod.yml logs -f db
```

## 数据库迁移

1. 进入应用容器
```bash
docker-compose -f docker-compose.prod.yml exec app sh
```

2. 运行数据库迁移
```bash
# 生成迁移文件（如果有模型更改）
npx prisma migrate dev

# 部署迁移（生产环境）
npx prisma migrate deploy
```

## 常见问题

### 1. 数据库连接失败
- 检查数据库容器是否正常运行
- 验证环境变量中的数据库配置
- 确保数据库初始化完成

```bash
# 检查数据库容器状态
docker-compose -f docker-compose.prod.yml ps db

# 检查数据库日志
docker-compose -f docker-compose.prod.yml logs db
```

### 2. 应用启动失败
- 检查环境变量配置
- 查看应用日志
- 验证端口是否被占用

```bash
# 检查端口占用
netstat -tulpn | grep 4000

# 查看详细错误日志
docker-compose -f docker-compose.prod.yml logs app
```

### 3. 性能问题
- 检查资源使用情况
```bash
# 查看容器资源使用
docker stats

# 检查日志中的慢查询
docker-compose -f docker-compose.prod.yml exec db mysql -u root -p -e "SHOW VARIABLES LIKE '%slow_query%';"
```

### 4. 备份数据
```bash
# 备份数据库
docker-compose -f docker-compose.prod.yml exec db mysqldump -u root -p qiang_qiang > backup.sql

# 还原数据库
docker-compose -f docker-compose.prod.yml exec -T db mysql -u root -p qiang_qiang < backup.sql
```

## 安全建议

1. 生产环境配置
- 修改所有默认密码
- 使用强密码策略
- 限制数据库访问来源
- 配置 SSL/TLS

2. 定期维护
- 更新 Docker 镜像
- 备份数据
- 检查日志
- 监控系统资源

3. 防火墙配置
```bash
# 只允许必要的端口访问
sudo ufw allow 4000/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

## 监控和日志

1. 设置日志轮转
```bash
# 在 docker-compose.prod.yml 中添加日志配置
logging:
  driver: "json-file"
  options:
    max-size: "100m"
    max-file: "3"
```

2. 监控命令
```bash
# 监控容器状态
watch docker ps

# 监控资源使用
docker stats

# 查看实时日志
tail -f logs/app.log
```

## 扩展和维护

1. 扩展服务
```bash
# 增加应用实例数量
docker-compose -f docker-compose.prod.yml up -d --scale app=3
```

2. 更新应用
```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose -f docker-compose.prod.yml up -d --build
```

3. 清理资源
```bash
# 清理未使用的镜像和容器
docker system prune -a

# 清理未使用的卷
docker volume prune
``` 
