#!/bin/bash

# 设置变量
DOCKER_REPO="shindouhiro/qiang"
VERSION=$(date +%Y%m%d%H%M)
PLATFORMS="linux/amd64,linux/arm64"

# 输出颜色设置
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Docker 登录状态
echo -e "${YELLOW}Checking Docker login status...${NC}"
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running or you don't have permission${NC}"
    exit 1
fi

# 检查是否登录到 Docker Hub
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}Please login to Docker Hub first${NC}"
    docker login
fi

# 创建并启用 buildx 构建器
echo -e "${YELLOW}Setting up Docker buildx...${NC}"
docker buildx create --name multiarch-builder --use || true
docker buildx inspect --bootstrap

# 构建并推送多架构镜像
echo -e "${GREEN}Building and pushing multi-architecture images...${NC}"
docker buildx build \
    --platform ${PLATFORMS} \
    --tag ${DOCKER_REPO}:latest \
    --tag ${DOCKER_REPO}:${VERSION} \
    --file Dockerfile \
    --push \
    .

# 验证推送的镜像
echo -e "${YELLOW}Verifying pushed images...${NC}"
docker buildx imagetools inspect ${DOCKER_REPO}:latest

# 清理构建缓存
echo -e "${YELLOW}Cleaning up...${NC}"
docker buildx prune -f

echo -e "${GREEN}Build and push completed successfully!${NC}"
echo -e "${GREEN}Image tags: ${NC}"
echo -e "  - ${DOCKER_REPO}:latest"
echo -e "  - ${DOCKER_REPO}:${VERSION}" 
