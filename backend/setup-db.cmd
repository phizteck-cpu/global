@echo off
REM Database Setup Script for ValueHills Platform (Windows)
REM This script sets up the MySQL database for the ValueHills platform

echo ==========================================
echo ValueHills MySQL Database Setup
echo ==========================================

echo [1/5] Starting MySQL container...
docker-compose up -d mysql

if %errorlevel% neq 0 (
    echo Failed to start MySQL container. Make sure Docker is running.
    exit /b 1
)

echo [2/5] Waiting for MySQL to be ready...
set max_attempts=30
set attempt=0

:wait_loop
if %attempt% geq %max_attempts% (
    echo MySQL failed to start. Check docker-compose logs.
    exit /b 1
)

docker exec valuehills_mysql mysqladmin ping -h localhost -u root -prootpassword >nul 2>&1
if %errorlevel% equ 0 (
    echo MySQL is ready!
    goto mysql_ready
)

set /a attempt=%attempt%+1
echo Waiting for MySQL... (%attempt%/%max_attempts%)
timeout /t 2 /nobreak >nul
goto wait_loop

:mysql_ready
echo [3/5] Creating database and tables...
docker exec -i valuehills_mysql mysql -u root -prootpassword < backend/prisma/schema.sql

if %errorlevel% neq 0 (
    echo Failed to create database schema.
    exit /b 1
)
echo Database schema created successfully!

echo [4/5] Generating Prisma client...
cd backend
npx prisma generate

echo [5/5] Setup complete!
echo.
echo ==========================================
echo Database Setup Complete!
echo ==========================================
echo.
echo MySQL Database: valuehills
echo MySQL User: valuehills_user
echo MySQL Password: valuehills_password
echo MySQL Host: localhost
echo MySQL Port: 3306
echo.
echo phpMyAdmin: http://localhost:8080
echo Username: root
echo Password: rootpassword
echo.
echo To start the application:
echo  1. Start the server: cd backend && npm start
echo  2. Start the frontend: npm run dev
echo.
