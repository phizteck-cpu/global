-- Database Schema for ValueHills Platform
-- Updated: 2026-02-06
-- Source: server/prisma/schema.prisma

-- -----------------------------------------------------------------------------
-- 1. CONFIGURATION
-- -----------------------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;

-- CREATE DATABASE valuehills CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. TABLES
-- -----------------------------------------------------------------------------

-- Tiers Table (Create First as Users reference it)
CREATE TABLE IF NOT EXISTS `Tier` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(191) NOT NULL UNIQUE,
    weeklyAmount DOUBLE NOT NULL DEFAULT 1333.33,
    onboardingFee DOUBLE NOT NULL DEFAULT 3000,
    maintenanceFee DOUBLE NOT NULL DEFAULT 100,
    upgradeFee DOUBLE NOT NULL DEFAULT 0,
    maxWithdrawal DOUBLE,
    bvThreshold DOUBLE,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users Table
CREATE TABLE IF NOT EXISTS `User` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    username VARCHAR(191) NOT NULL UNIQUE,
    password VARCHAR(191) NOT NULL,
    firstName VARCHAR(191) NOT NULL,
    lastName VARCHAR(191) NOT NULL,
    phone VARCHAR(191) UNIQUE,
    role VARCHAR(191) NOT NULL DEFAULT 'MEMBER', -- MEMBER, ADMIN, SUPERADMIN, ACCOUNTANT, FINANCE_ADMIN, OPS_ADMIN, SUPPORT_ADMIN
    KEY idx_user_role (role),
    status VARCHAR(191) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED, PENDING, PENDING_KYC, REJECTED
    transactionPin VARCHAR(191),
    kycDocUrl VARCHAR(191),
    kycStatus VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    
    -- Security & Verification Fields
    emailVerified BOOLEAN NOT NULL DEFAULT FALSE,
    verificationToken VARCHAR(191),
    refreshToken VARCHAR(191),
    resetPasswordToken VARCHAR(191),
    resetPasswordExpires DATETIME,
    
    -- 2FA Support
    twoFactorEnabled BOOLEAN NOT NULL DEFAULT FALSE,
    twoFactorSecret VARCHAR(191),
    
    walletBalance DOUBLE NOT NULL DEFAULT 0.0,
    contributionBalance DOUBLE NOT NULL DEFAULT 0.0,
    bvBalance DOUBLE NOT NULL DEFAULT 0.0,
    tierId INT,
    joinDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lockUntil DATETIME,
    referralCode VARCHAR(191) NOT NULL UNIQUE,
    referredBy INT,
    bankName VARCHAR(191),
    accountNumber VARCHAR(191),
    accountName VARCHAR(191),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tierId) REFERENCES `Tier`(id),
    FOREIGN KEY (referredBy) REFERENCES `User`(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contributions Table
CREATE TABLE IF NOT EXISTS `Contribution` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    weekNumber INT NOT NULL,
    amount DOUBLE NOT NULL,
    status VARCHAR(191) NOT NULL DEFAULT 'PAID',
    description VARCHAR(191),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES `User`(id) ON DELETE CASCADE,
    KEY idx_contribution_userId (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions Table
CREATE TABLE IF NOT EXISTS `Transaction` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    amount DOUBLE NOT NULL,
    ledgerType VARCHAR(191) NOT NULL, -- COOPERATIVE, COMPANY, VIRTUAL
    type VARCHAR(191) NOT NULL, -- CONTRIBUTION, ONBOARDING_FEE, MAINTENANCE_FEE, UPGRADE_FEE, WITHDRAWAL_FEE, EARNINGS, FUNDING, ADJUSTMENT
    direction VARCHAR(191) NOT NULL, -- IN, OUT
    status VARCHAR(191) NOT NULL DEFAULT 'SUCCESS',
    reference VARCHAR(191) UNIQUE,
    description VARCHAR(191),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES `User`(id) ON DELETE CASCADE,
    KEY idx_transaction_userId (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Withdrawals Table
CREATE TABLE IF NOT EXISTS `Withdrawal` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    amount DOUBLE NOT NULL,
    status VARCHAR(191) NOT NULL DEFAULT 'PENDING', -- PENDING, ADMIN_REVIEW, QUEUED, APPROVED, COMPLETED, REJECTED
    fee DOUBLE NOT NULL DEFAULT 0.0,
    adminId INT,
    processedAt DATETIME,
    notes VARCHAR(191),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES `User`(id) ON DELETE CASCADE,
    FOREIGN KEY (adminId) REFERENCES `User`(id),
    KEY idx_withdrawal_userId (userId),
    KEY idx_withdrawal_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AuditLogs Table
CREATE TABLE IF NOT EXISTS `AuditLog` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    adminId INT NOT NULL,
    action VARCHAR(191) NOT NULL,
    targetUserId INT,
    details VARCHAR(191),
    ipAddress VARCHAR(191),
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adminId) REFERENCES `User`(id),
    FOREIGN KEY (targetUserId) REFERENCES `User`(id),
    KEY idx_auditlog_adminId (adminId),
    KEY idx_auditlog_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SystemConfig Table
CREATE TABLE IF NOT EXISTS `SystemConfig` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(191) NOT NULL UNIQUE,
    value VARCHAR(191) NOT NULL,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- BONUS & REFERRAL SYSTEM TABLES
-- -----------------------------------------------------------------------------

-- Bonus Table (for referral and BV bonuses)
CREATE TABLE IF NOT EXISTS `Bonus` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    amount DOUBLE NOT NULL,
    type VARCHAR(191) NOT NULL, -- REFERRAL, BV_BONUS, MATCHING, DIRECT, INDIRECT
    sourceUserId INT,
    status VARCHAR(191) NOT NULL DEFAULT 'PENDING', -- PENDING, PROCESSED, CANCELLED
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processedAt DATETIME,
    FOREIGN KEY (userId) REFERENCES `User`(id) ON DELETE CASCADE,
    FOREIGN KEY (sourceUserId) REFERENCES `User`(id) ON DELETE SET NULL,
    KEY idx_bonus_userId (userId),
    KEY idx_bonus_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Referral Table (for network tracking)
CREATE TABLE IF NOT EXISTS `Referral` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    referrerId INT NOT NULL,
    referredId INT NOT NULL,
    level INT NOT NULL DEFAULT 1, -- 1, 2, 3 for direct, indirect referral levels
    status VARCHAR(191) NOT NULL DEFAULT 'PENDING', -- PENDING, ACTIVE, COMPLETED
    bonusPaid DOUBLE NOT NULL DEFAULT 0.0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referrerId) REFERENCES `User`(id) ON DELETE CASCADE,
    FOREIGN KEY (referredId) REFERENCES `User`(id) ON DELETE CASCADE,
    UNIQUE KEY unique_referral (referrerId, referredId),
    KEY idx_referral_referrerId (referrerId),
    KEY idx_referral_referredId (referredId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- PACKAGE & REDEMPTION SYSTEM TABLES
-- -----------------------------------------------------------------------------

-- Package Table (for package management)
CREATE TABLE IF NOT EXISTS `Package` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    description VARCHAR(191),
    price DOUBLE NOT NULL,
    bvValue DOUBLE NOT NULL DEFAULT 0,
    durationWeeks INT NOT NULL DEFAULT 0,
    maxQuantity INT,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    imageUrl VARCHAR(191),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Redemption Table (for inventory/redemptions)
CREATE TABLE IF NOT EXISTS `Redemption` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    packageId INT NOT NULL,
    amount DOUBLE NOT NULL,
    pointsUsed DOUBLE NOT NULL DEFAULT 0,
    status VARCHAR(191) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, COMPLETED
    adminNote VARCHAR(191),
    processedAt DATETIME,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES `User`(id) ON DELETE CASCADE,
    FOREIGN KEY (packageId) REFERENCES `Package`(id) ON DELETE CASCADE,
    KEY idx_redemption_userId (userId),
    KEY idx_redemption_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- INVENTORY SYSTEM TABLE
-- -----------------------------------------------------------------------------

-- Inventory Table (for admin inventory management)
CREATE TABLE IF NOT EXISTS `Inventory` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    description VARCHAR(191),
    quantity INT NOT NULL DEFAULT 0,
    price DOUBLE NOT NULL,
    category VARCHAR(191),
    status VARCHAR(191) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, OUT_OF_STOCK, DISCONTINUED
    imageUrl VARCHAR(191),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_inventory_category (category),
    KEY idx_inventory_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- NOTIFICATION SYSTEM TABLE
-- -----------------------------------------------------------------------------

-- Notification Table (for user alerts)
CREATE TABLE IF NOT EXISTS `Notification` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    type VARCHAR(191) NOT NULL, -- BONUS, CONTRIBUTION, WITHDRAWAL, SYSTEM, ADMIN, REFERRAL
    title VARCHAR(191) NOT NULL,
    message VARCHAR(191) NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES `User`(id) ON DELETE CASCADE,
    KEY idx_notification_userId (userId),
    KEY idx_notification_read (`read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. SEED DATA
-- -----------------------------------------------------------------------------

-- Insert Default Tiers
INSERT INTO `Tier` (name, weeklyAmount, onboardingFee, maintenanceFee, upgradeFee) VALUES
('STARTER', 1333.33, 3000, 100, 0),
('PRO', 2666.66, 5000, 150, 2000),
('ELITE', 4000.00, 8000, 200, 3000)
ON DUPLICATE KEY UPDATE name=name;

-- Insert Default System Config
INSERT INTO `SystemConfig` (`key`, value) VALUES
('company_bank_name', ''),
('company_account_number', ''),
('company_account_name', '')
ON DUPLICATE KEY UPDATE `key`=`key`;

-- Insert Admin User (Password: MyPassword123)
-- Hash: $2a$10$ewvJmGiybJZpB8ooTR57YenEK5uYHHaXggNI/QvBwRuVx/6Ykr64i
INSERT INTO `User` (email, username, password, firstName, lastName, role, status, kycStatus) VALUES
('admin@valuehills.com', 'admin', '$2a$10$ewvJmGiybJZpB8ooTR57YenEK5uYHHaXggNI/QvBwRuVx/6Ykr64i', 'System', 'Administrator', 'SUPERADMIN', 'ACTIVE', 'VERIFIED')
ON DUPLICATE KEY UPDATE username=username;

-- Insert Finance Admin (Password: Finance123)
-- Hash: $2a$10$hashedpasswordplaceholder123456789
INSERT INTO `User` (email, username, password, firstName, lastName, role, status, kycStatus) VALUES
('finance@valuehills.com', 'finance_admin', '$2a$10$hashedpasswordplaceholder123456789', 'Finance', 'Admin', 'FINANCE_ADMIN', 'ACTIVE', 'VERIFIED')
ON DUPLICATE KEY UPDATE username=username;

-- Insert Operations Admin (Password: Ops123)
-- Hash: $2a$10$hashedpasswordplaceholder987654321
INSERT INTO `User` (email, username, password, firstName, lastName, role, status, kycStatus) VALUES
('ops@valuehills.com', 'ops_admin', '$2a$10$hashedpasswordplaceholder987654321', 'Operations', 'Admin', 'OPS_ADMIN', 'ACTIVE', 'VERIFIED')
ON DUPLICATE KEY UPDATE username=username;

-- Insert Sample Member (Password: user123)
-- Hash: $2a$10$0VjXwt4QqzdGozGra2LlyuVk1Isra35kNYeQLu28NUTacVUThaSf2
INSERT INTO `User` (email, username, password, firstName, lastName, role, status, kycStatus, tierId, referralCode) VALUES
('member@example.com', 'member', '$2a$10$0VjXwt4QqzdGozGra2LlyuVk1Isra35kNYeQLu28NUTacVUThaSf2', 'John', 'Doe', 'MEMBER', 'ACTIVE', 'VERIFIED', 1, 'REF-INITIAL-001')
ON DUPLICATE KEY UPDATE username=username;

-- Insert Sample Inventory Items
INSERT INTO `Inventory` (name, description, quantity, price, category, status) VALUES
('Gift Card $50', '$50 Amazon Gift Card', 100, 50, 'GIFT_CARDS', 'ACTIVE'),
('Gift Card $100', '$100 Amazon Gift Card', 50, 100, 'GIFT_CARDS', 'ACTIVE'),
('Electronics Voucher', '$200 Electronics Store Voucher', 25, 200, 'VOUCHERS', 'ACTIVE'),
('Travel Package', 'Weekend Getaway Package', 10, 500, 'TRAVEL', 'ACTIVE')
ON DUPLICATE KEY UPDATE name=name;

SET FOREIGN_KEY_CHECKS = 1;
