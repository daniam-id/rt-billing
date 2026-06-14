# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /repo

# Copy workspace files first for better caching
COPY package.json ./
COPY apps/api-server/package.json ./apps/api-server/
COPY apps/admin-web/package.json ./apps/admin-web/

# Install all dependencies (npm workspaces)
RUN npm install --no-audit --no-fund

# Copy source
COPY apps/api-server ./apps/api-server
COPY apps/admin-web ./apps/admin-web

# Generate Prisma client
RUN cd apps/api-server && npx prisma generate

# Build API and web
RUN npm -w @rt-billing/api-server run build
RUN npm -w @rt-billing/admin-web run build

# --- API runtime ---
FROM node:20-alpine AS api
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /repo/package.json ./
COPY --from=builder /repo/apps/api-server/package.json ./apps/api-server/
COPY --from=builder /repo/apps/api-server/prisma ./apps/api-server/prisma
COPY --from=builder /repo/apps/api-server/dist ./apps/api-server/dist
COPY --from=builder /repo/apps/api-server/node_modules ./apps/api-server/node_modules
COPY --from=builder /repo/node_modules ./node_modules

WORKDIR /app/apps/api-server
EXPOSE 3001
CMD ["node", "dist/index.js"]

# --- Web runtime ---
FROM nginx:1.27-alpine AS web
COPY --from=builder /repo/apps/admin-web/out /usr/share/nginx/html
COPY apps/admin-web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
