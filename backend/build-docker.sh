#!/bin/bash

# Ndimboni Multi-Platform Docker Build Script
# Builds Docker images for both ARM64 (M1/M2 Macs) and AMD64 (Intel/Cloud)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="sostene/ndimboini-api"
TAG=${1:-latest}
PLATFORMS="linux/amd64,linux/arm64"

echo -e "${BLUE}🚀 Ndimboni Multi-Platform Docker Build${NC}"
echo -e "${BLUE}======================================${NC}"

# Check if Docker buildx is available
if ! docker buildx version > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker buildx is required for multi-platform builds${NC}"
    echo -e "${YELLOW}💡 Please update Docker Desktop to the latest version${NC}"
    exit 1
fi

# Check if builder instance exists, create if not
if ! docker buildx inspect ndimboni-builder > /dev/null 2>&1; then
    echo -e "${YELLOW}📦 Creating new buildx builder instance...${NC}"
    docker buildx create --name ndimboni-builder --driver docker-container --bootstrap
fi

# Use the builder instance
echo -e "${YELLOW}🔧 Using buildx builder instance...${NC}"
docker buildx use ndimboni-builder

# Build for specific platform (AMD64 only)
build_amd64() {
    echo -e "${GREEN}🔨 Building for AMD64 (Intel/Cloud)...${NC}"
    docker buildx build \
        --platform linux/amd64 \
        --target production \
        --tag ${IMAGE_NAME}:${TAG} \
        --tag ${IMAGE_NAME}:amd64-${TAG} \
        --load \
        .
    echo -e "${GREEN}✅ AMD64 build completed!${NC}"
}

# Build for specific platform (ARM64 only)
build_arm64() {
    echo -e "${GREEN}🔨 Building for ARM64 (M1/M2 Macs)...${NC}"
    docker buildx build \
        --platform linux/arm64 \
        --target production \
        --tag ${IMAGE_NAME}:arm64-${TAG} \
        --load \
        .
    echo -e "${GREEN}✅ ARM64 build completed!${NC}"
}

# Build and push multi-platform
build_multiplatform() {
    echo -e "${GREEN}🔨 Building for multiple platforms: ${PLATFORMS}...${NC}"
    docker buildx build \
        --platform ${PLATFORMS} \
        --target production \
        --tag ${IMAGE_NAME}:${TAG} \
        --push \
        .
    echo -e "${GREEN}✅ Multi-platform build completed and pushed!${NC}"
}

# Build locally for current platform
build_local() {
    echo -e "${GREEN}🔨 Building for current platform...${NC}"
    docker build \
        --target production \
        --tag ${IMAGE_NAME}:${TAG} \
        .
    echo -e "${GREEN}✅ Local build completed!${NC}"
}

# Main menu
echo -e "${YELLOW}Choose build option:${NC}"
echo "1) Build for AMD64 only (recommended for cloud deployment)"
echo "2) Build for ARM64 only (for M1/M2 Macs)"
echo "3) Build for current platform only"
echo "4) Build and push multi-platform (requires Docker Hub login)"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        build_amd64
        ;;
    2)
        build_arm64
        ;;
    3)
        build_local
        ;;
    4)
        echo -e "${YELLOW}🔐 Please ensure you're logged into Docker Hub:${NC}"
        echo "docker login"
        read -p "Press Enter to continue or Ctrl+C to cancel..."
        build_multiplatform
        ;;
    *)
        echo -e "${RED}❌ Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 Build process completed successfully!${NC}"
echo -e "${BLUE}💡 You can now run: docker-compose up -d${NC}"
