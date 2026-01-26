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

# Generate Prisma Client for the right platform
RUN cd server && npx prisma generate

EXPOSE 5000
CMD ["node", "server/index.js"]
