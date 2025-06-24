#!/bin/bash

# Quick AMD64 build for Docker Compose
# This builds specifically for AMD64 platform for deployment

echo "🐳 Building Ndimboni Backend for AMD64 platform..."

# First, ensure buildx is available and set up
docker buildx create --name ndimboni-builder --driver docker-container --bootstrap || true
docker buildx use ndimboni-builder

# Build for AMD64 platform
docker buildx build \
    --platform linux/amd64 \
    --target production \
    --tag sostene/ndimboini-api:latest \
    --load \
    .

echo "✅ Build complete! You can now use 'docker compose up' with the AMD64 image."
