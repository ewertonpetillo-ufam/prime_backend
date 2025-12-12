# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy package files
COPY package*.json ./

# Copy patches directory from builder stage if it exists (needed for postinstall)
# Create patches directory first to ensure it exists
RUN mkdir -p patches
# Copy patches from builder stage using BuildKit mount (requires DOCKER_BUILDKIT=1)
# This approach won't fail if the directory doesn't exist
RUN --mount=type=bind,from=builder,source=/app/patches,target=/tmp/patches-source,readonly \
    if [ -d /tmp/patches-source ] && [ -n "$(ls -A /tmp/patches-source 2>/dev/null)" ]; then \
        cp -r /tmp/patches-source/* ./patches/ && \
        echo "✓ Patches directory copied from builder stage"; \
    else \
        echo "⚠ No patches directory found, patch-package will be skipped during postinstall"; \
    fi

# Install patch-package globally so postinstall script can run
RUN npm install -g patch-package

# Install only production dependencies
# postinstall will automatically run patch-package if patches exist
RUN npm ci --only=production --legacy-peer-deps

# Remove patch-package to reduce image size (patches already applied)
RUN npm uninstall -g patch-package || true

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Change ownership
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:4000/api/v1 || exit 1

# Start the application
CMD ["node", "dist/main.js"]
