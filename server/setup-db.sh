#!/bin/bash

# Database Setup Script for ValueHills Platform
# This script sets up the MySQL database for the ValueHills platform

echo "=========================================="
echo "ValueHills MySQL Database Setup"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}[1/5]${NC} Starting MySQL container..."
docker-compose up -d mysql

echo -e "${GREEN}[2/5]${NC} Waiting for MySQL to be ready..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker exec valuehills_mysql mysqladmin ping -h localhost -u root -prootpassword &> /dev/null; then
        echo -e "${GREEN}MySQL is ready!${NC}"
        break
    fi
    attempt=$((attempt + 1))
    echo "Waiting for MySQL... ($attempt/$max_attempts)"
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}MySQL failed to start. Check docker-compose logs.${NC}"
    exit 1
fi

echo -e "${GREEN}[3/5]${NC} Creating database and tables..."
docker exec -i valuehills_mysql mysql -u root -prootpassword < server/prisma/schema.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Database schema created successfully!${NC}"
else
    echo -e "${RED}Failed to create database schema.${NC}"
    exit 1
fi

echo -e "${GREEN}[4/5]${NC} Generating Prisma client..."
cd server && npm run generate 2>/dev/null || npx prisma generate

echo -e "${GREEN}[5/5]${NC} Setup complete!"
echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}Database Setup Complete!${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo -e "MySQL Database: valuehills"
echo -e "MySQL User: valuehills_user"
echo -e "MySQL Password: valuehills_password"
echo -e "MySQL Host: localhost"
echo -e "MySQL Port: 3306"
echo ""
echo -e "phpMyAdmin: http://localhost:8080"
echo -e "Username: root"
echo -e "Password: rootpassword"
echo ""
echo -e "To start the application:"
echo -e "  1. Start the server: cd server && npm run dev"
echo -e "  2. Start the frontend: npm run dev"
echo ""
