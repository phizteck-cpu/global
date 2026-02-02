# Production Dockerfile for ValueHills platform
# Multi-stage build for optimal performance and security

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production Server
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy server files
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

COPY server/ ./server/
COPY --from=frontend-builder /app/dist ./dist

# Install Prisma CLI globally for migrations
RUN npm install -g prisma

# Generate Prisma Client for PostgreSQL
RUN cd server && npx prisma generate

EXPOSE 5000

# Run database migration and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node server/index.js"]
