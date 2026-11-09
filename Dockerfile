# syntax=docker/dockerfile:1

# ============================================
# Stage 1: Build
# ============================================
FROM node:24.15-alpine3.23 AS builder

WORKDIR /app

# Install dependencies first for better caching
COPY package.json package-lock.json ./

RUN npm ci

# Copy application source
COPY . .

# Build production assets
RUN npm run build


# ============================================
# Stage 2: Production
# ============================================
FROM nginx/nginx-unprivileged:1.31.7-alpine3.24 AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/security-headers.conf

# Copy only production build files
COPY --from=builder --chown=101:101 /app/dist/ /usr/share/nginx/html/

# Nginx unprivileged listens on 8080
EXPOSE 8080

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
