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

# Install patch-package globally (needed for postinstall script)
# Even though there are no patches, the postinstall script still tries to run patch-package
RUN npm install -g patch-package

# Install only production dependencies
# Note: postinstall script runs patch-package, but it will do nothing if no patches exist
RUN npm ci --only=production --legacy-peer-deps

# Remove patch-package to reduce image size (not needed after postinstall)
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
