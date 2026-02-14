# Production Dockerfile for ValueHills platform
# Multi-stage build for optimal performance and security

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Copy root package files for build dependencies
COPY package*.json ./
RUN npm install

# Copy frontend source and config
COPY frontend/ ./frontend/
COPY vite.config.js ./

# Build the application
RUN npm run build

# Stage 2: Production Server
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy backend package files
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend from Stage 1 to backend/dist
COPY --from=frontend-builder /app/frontend/dist ./backend/dist

# Install Prisma CLI for generating client (if needed at runtime)
# but it's better to generate it during build
RUN cd backend && npx prisma generate

EXPOSE 5000

# Run database migration and start server
# Note: In production, you might want to run migrations separately, 
# but this is included for convenience.
CMD ["sh", "-c", "cd backend && npx prisma migrate deploy && node index.js"]
