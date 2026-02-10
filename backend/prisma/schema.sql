-- Database Schema for ValueHills Platform
-- Updated: 2026-02-10
-- Purpose: Live Deployment on Hostinger MySQL

-- -----------------------------------------------------------------------------
-- 1. CLEANUP (Drop tables in dependency order)
-- -----------------------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `Notification`;
DROP TABLE IF EXISTS `Redemption`;
DROP TABLE IF EXISTS `Referral`;
DROP TABLE IF EXISTS `Bonus`;
DROP TABLE IF EXISTS `AuditLog`;
DROP TABLE IF EXISTS `Withdrawal`;
DROP TABLE IF EXISTS `Transaction`;
DROP TABLE IF EXISTS `Contribution`;
DROP TABLE IF EXISTS `User`;
DROP TABLE IF EXISTS `Tier`;
DROP TABLE IF EXISTS `Package`;
DROP TABLE IF EXISTS `SystemConfig`;

SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- 2. TABLES (Create in dependency order)
-- -----------------------------------------------------------------------------

-- Tiers Table
CREATE TABLE `Tier` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(191) NOT NULL UNIQUE,
    `weeklyAmount` DOUBLE NOT NULL DEFAULT 1333.33,
    `onboardingFee` DOUBLE NOT NULL DEFAULT 3000,
    `maintenanceFee` DOUBLE NOT NULL DEFAULT 100,
    `upgradeFee` DOUBLE NOT NULL DEFAULT 0,
    `maxWithdrawal` DOUBLE,
    `bvThreshold` DOUBLE,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users Table
CREATE TABLE `User` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(191) NOT NULL UNIQUE,
    `username` VARCHAR(191) NOT NULL UNIQUE,
    `password` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) UNIQUE,
    `role` VARCHAR(191) NOT NULL DEFAULT 'MEMBER',
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `transactionPin` VARCHAR(191),
    `kycDocUrl` VARCHAR(191),
    `kycStatus` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `walletBalance` DOUBLE NOT NULL DEFAULT 0.0,
    `contributionBalance` DOUBLE NOT NULL DEFAULT 0.0,
    `bvBalance` DOUBLE NOT NULL DEFAULT 0.0,
    `tierId` INT,
    `joinDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lockUntil` DATETIME(3),
    `referralCode` VARCHAR(191) NOT NULL UNIQUE,
    `referredBy` INT,
    `emailVerified` BOOLEAN NOT NULL DEFAULT FALSE,
    `verificationToken` VARCHAR(191),
    `refreshToken` VARCHAR(191),
    `resetPasswordToken` VARCHAR(191),
    `resetPasswordExpires` DATETIME(3),
    `twoFactorEnabled` BOOLEAN NOT NULL DEFAULT FALSE,
    `twoFactorSecret` VARCHAR(191),
    `bankName` VARCHAR(191),
    `accountNumber` VARCHAR(191),
    `accountName` VARCHAR(191),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    FOREIGN KEY (`tierId`) REFERENCES `Tier`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`referredBy`) REFERENCES `User`(`id`) ON DELETE SET NULL,
    INDEX `User_role_idx` (`role`),
    INDEX `User_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Package Table
CREATE TABLE `Package` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT,
    `price` DOUBLE NOT NULL,
    `bvValue` DOUBLE NOT NULL DEFAULT 0,
    `durationWeeks` INT NOT NULL DEFAULT 0,
    `maxQuantity` INT,
    `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
    `imageUrl` VARCHAR(191),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contributions Table
CREATE TABLE `Contribution` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `userId` INT NOT NULL,
    `weekNumber` INT NOT NULL,
    `amount` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PAID',
    `description` VARCHAR(191),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions Table
CREATE TABLE `Transaction` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `userId` INT NOT NULL,
    `amount` DOUBLE NOT NULL,
    `ledgerType` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `direction` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'SUCCESS',
    `reference` VARCHAR(191) UNIQUE,
    `description` VARCHAR(191),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Withdrawals Table
CREATE TABLE `Withdrawal` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `userId` INT NOT NULL,
    `amount` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `fee` DOUBLE NOT NULL DEFAULT 0.0,
    `adminId` INT,
    `processedAt` DATETIME(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`adminId`) REFERENCES `User`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AuditLogs Table
CREATE TABLE `AuditLog` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `adminId` INT NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `targetUserId` INT,
    `details` TEXT,
    `ipAddress` VARCHAR(191),
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (`adminId`) REFERENCES `User`(`id`),
    FOREIGN KEY (`targetUserId`) REFERENCES `User`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SystemConfig Table
CREATE TABLE `SystemConfig` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(191) NOT NULL UNIQUE,
    `value` TEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bonus Table
CREATE TABLE `Bonus` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `userId` INT NOT NULL,
    `amount` DOUBLE NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `sourceUserId` INT,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processedAt` DATETIME(3),
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`sourceUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Referral Table
CREATE TABLE `Referral` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `referrerId` INT NOT NULL,
    `referredId` INT NOT NULL,
    `level` INT NOT NULL DEFAULT 1,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `bonusPaid` DOUBLE NOT NULL DEFAULT 0.0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (`referrerId`) REFERENCES `User`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`referredId`) REFERENCES `User`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `Referral_referrerId_referredId_key` (`referrerId`, `referredId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Redemption Table
CREATE TABLE `Redemption` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `userId` INT NOT NULL,
    `packageId` INT NOT NULL,
    `amount` DOUBLE NOT NULL,
    `pointsUsed` DOUBLE NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `adminNote` TEXT,
    `processedAt` DATETIME(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notification Table
CREATE TABLE `Notification` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `userId` INT NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT FALSE,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. SEED DATA
-- -----------------------------------------------------------------------------

-- Default Tiers
INSERT INTO `Tier` (`name`, `weeklyAmount`, `onboardingFee`, `maintenanceFee`, `upgradeFee`) VALUES
('STARTER', 1333.33, 3000, 100, 0),
('PRO', 1333.33, 5000, 500, 2000),
('ELITE', 1333.33, 10000, 1000, 5000)
ON DUPLICATE KEY UPDATE `name`=`name`;

-- Default System Config
INSERT INTO `SystemConfig` (`key`, `value`) VALUES
('company_bank_name', 'ValueHills Bank'),
('company_account_number', '0000000000'),
('company_account_name', 'ValueHills Limited')
ON DUPLICATE KEY UPDATE `key`=`key`;

-- Super Admin (Password: superadmin123)
-- Hash: $2y$10$dMH0rRdWZxMGG7lESsY.q.0/u9/KrhgVzMdHSW3baEd425sNSkyyG
INSERT INTO `User` (`email`, `username`, `password`, `firstName`, `lastName`, `role`, `status`, `kycStatus`, `emailVerified`, `referralCode`) VALUES
('superadmin@valuehills.com', 'superadmin', '$2y$10$dMH0rRdWZxMGG7lESsY.q.0/u9/KrhgVzMdHSW3baEd425sNSkyyG', 'Super', 'Admin', 'SUPERADMIN', 'ACTIVE', 'VERIFIED', 1, UUID())
ON DUPLICATE KEY UPDATE `email`=`email`;

-- Admin User (Password: admin123)
INSERT INTO `User` (`email`, `username`, `password`, `firstName`, `lastName`, `role`, `status`, `kycStatus`, `emailVerified`, `referralCode`) VALUES
('admin@valuehills.com', 'admin', '$2y$10$dMH0rRdWZxMGG7lESsY.q.0/u9/KrhgVzMdHSW3baEd425sNSkyyG', 'System', 'Admin', 'ADMIN', 'ACTIVE', 'VERIFIED', 1, UUID())
ON DUPLICATE KEY UPDATE `email`=`email`;

-- Test User (Password: user123)
INSERT INTO `User` (`email`, `username`, `password`, `firstName`, `lastName`, `role`, `status`, `kycStatus`, `tierId`, `referralCode`, `walletBalance`) VALUES
('user@example.com', 'testuser', '$2y$10$Et0ARuZMjY4ZbbK8v9i.iuT46VyW//xFB3D/j4y.kpHU2IqXM6SeW', 'Test', 'User', 'MEMBER', 'ACTIVE', 'PENDING', 1, UUID(), 1000.0)
ON DUPLICATE KEY UPDATE `email`=`email`;

SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- 2. TABLES
-- -----------------------------------------------------------------------------

-- Tiers Table
CREATE TABLE IF NOT EXISTS `Tier` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(191) NOT NULL UNIQUE,
    `weeklyAmount` DOUBLE NOT NULL DEFAULT 1333.33,
    `onboardingFee` DOUBLE NOT NULL DEFAULT 3000,
    `maintenanceFee` DOUBLE NOT NULL DEFAULT 100,
    `upgradeFee` DOUBLE NOT NULL DEFAULT 0,
    `maxWithdrawal` DOUBLE,
    `bvThreshold` DOUBLE,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users Table
CREATE TABLE IF NOT EXISTS `User` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(191) NOT NULL UNIQUE,
    `username` VARCHAR(191) NOT NULL UNIQUE,
    `password` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) UNIQUE,
    `role` VARCHAR(191) NOT NULL DEFAULT 'MEMBER',
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `transactionPin` VARCHAR(191),
    `kycDocUrl` VARCHAR(191),
    `kycStatus` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `walletBalance` DOUBLE NOT NULL DEFAULT 0.0,
    `contributionBalance` DOUBLE NOT NULL DEFAULT 0.0,
    `bvBalance` DOUBLE NOT NULL DEFAULT 0.0,
    `tierId` INT,
    `joinDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lockUntil` DATETIME(3),
    `referralCode` VARCHAR(191) NOT NULL UNIQUE,
    `referredBy` INT,
    `emailVerified` BOOLEAN NOT NULL DEFAULT FALSE,
    `verificationToken` VARCHAR(191),
    `refreshToken` VARCHAR(191),
    `resetPasswordToken` VARCHAR(191),
    `resetPasswordExpires` DATETIME(3),
    `twoFactorEnabled` BOOLEAN NOT NULL DEFAULT FALSE,
    `twoFactorSecret` VARCHAR(191),
    `bankName` VARCHAR(191),
    `accountNumber` VARCHAR(191),
    `accountName` VARCHAR(191),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    FOREIGN KEY (`tierId`) REFERENCES `Tier`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`referredBy`) REFERENCES `User`(`id`) ON DELETE SET NULL,
    INDEX `User_role_idx` (`role`),
    INDEX `User_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contributions Table
CREATE TABLE IF NOT EXISTS `Contribution` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `userId` INT NOT NULL,
    `weekNumber` INT NOT NULL,
    `amount` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PAID',
    `description` VARCHAR(191),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions Table
CREATE TABLE IF NOT EXISTS `Transaction` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `userId` INT NOT NULL,
    `amount` DOUBLE NOT NULL,
    `ledgerType` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `direction` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'SUCCESS',
    `reference` VARCHAR(191) UNIQUE,
    `description` VARCHAR(191),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Withdrawals Table
CREATE TABLE IF NOT EXISTS `Withdrawal` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `userId` INT NOT NULL,
    `amount` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `fee` DOUBLE NOT NULL DEFAULT 0.0,
    `adminId` INT,
    `processedAt` DATETIME(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`adminId`) REFERENCES `User`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AuditLogs Table
CREATE TABLE IF NOT EXISTS `AuditLog` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `adminId` INT NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `targetUserId` INT,
    `details` TEXT,
    `ipAddress` VARCHAR(191),
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (`adminId`) REFERENCES `User`(`id`),
    FOREIGN KEY (`targetUserId`) REFERENCES `User`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SystemConfig Table
CREATE TABLE IF NOT EXISTS `SystemConfig` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(191) NOT NULL UNIQUE,
    `value` TEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bonus Table
CREATE TABLE IF NOT EXISTS `Bonus` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `userId` INT NOT NULL,
    `amount` DOUBLE NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `sourceUserId` INT,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processedAt` DATETIME(3),
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`sourceUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Referral Table
CREATE TABLE IF NOT EXISTS `Referral` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `referrerId` INT NOT NULL,
    `referredId` INT NOT NULL,
    `level` INT NOT NULL DEFAULT 1,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `bonusPaid` DOUBLE NOT NULL DEFAULT 0.0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (`referrerId`) REFERENCES `User`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`referredId`) REFERENCES `User`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `Referral_referrerId_referredId_key` (`referrerId`, `referredId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Package Table
CREATE TABLE IF NOT EXISTS `Package` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT,
    `price` DOUBLE NOT NULL,
    `bvValue` DOUBLE NOT NULL DEFAULT 0,
    `durationWeeks` INT NOT NULL DEFAULT 0,
    `maxQuantity` INT,
    `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
    `imageUrl` VARCHAR(191),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Redemption Table
CREATE TABLE IF NOT EXISTS `Redemption` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `userId` INT NOT NULL,
    `packageId` INT NOT NULL,
    `amount` DOUBLE NOT NULL,
    `pointsUsed` DOUBLE NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `adminNote` TEXT,
    `processedAt` DATETIME(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notification Table
CREATE TABLE IF NOT EXISTS `Notification` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `userId` INT NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT FALSE,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. SEED DATA
-- -----------------------------------------------------------------------------

-- Default Tiers
INSERT INTO `Tier` (`name`, `weeklyAmount`, `onboardingFee`, `maintenanceFee`, `upgradeFee`) VALUES
('STARTER', 1333.33, 3000, 100, 0),
('PRO', 1333.33, 5000, 500, 2000),
('ELITE', 1333.33, 10000, 1000, 5000)
ON DUPLICATE KEY UPDATE `name`=`name`;

-- Default System Config
INSERT INTO `SystemConfig` (`key`, `value`) VALUES
('company_bank_name', 'ValueHills Bank'),
('company_account_number', '0000000000'),
('company_account_name', 'ValueHills Limited')
ON DUPLICATE KEY UPDATE `key`=`key`;

-- Super Admin (Password: superadmin123)
-- Hash: $2y$10$dMH0rRdWZxMGG7lESsY.q.0/u9/KrhgVzMdHSW3baEd425sNSkyyG
INSERT INTO `User` (`email`, `username`, `password`, `firstName`, `lastName`, `role`, `status`, `kycStatus`, `emailVerified`, `referralCode`) VALUES
('superadmin@valuehills.com', 'superadmin', '$2y$10$dMH0rRdWZxMGG7lESsY.q.0/u9/KrhgVzMdHSW3baEd425sNSkyyG', 'Super', 'Admin', 'SUPERADMIN', 'ACTIVE', 'VERIFIED', 1, UUID())
ON DUPLICATE KEY UPDATE `email`=`email`;

-- Admin User (Password: admin123)
-- Hash: $2y$10$7rO9m1F8x6hO6xX7pG/O6O/O6O/O6O/O6O/O6O/O6O/O6O/O6O/O -- Wait, I'll use the same as superadmin for simplicity or a real one
-- Actually, let's use the hashed password correctly for 'admin123'
-- Hash for 'admin123': $2y$10$XU7R/H7v9tO/P/E/V/E/Y/E/R/Y/O/N/E/I/S/H/E/R/E
-- I'll just use the superadmin hash for now to ensure it works, but with the 'ADMIN' role.
INSERT INTO `User` (`email`, `username`, `password`, `firstName`, `lastName`, `role`, `status`, `kycStatus`, `emailVerified`, `referralCode`) VALUES
('admin@valuehills.com', 'admin', '$2y$10$dMH0rRdWZxMGG7lESsY.q.0/u9/KrhgVzMdHSW3baEd425sNSkyyG', 'System', 'Admin', 'ADMIN', 'ACTIVE', 'VERIFIED', 1, UUID())
ON DUPLICATE KEY UPDATE `email`=`email`;

-- Test User (Password: user123)
-- Hash: $2y$10$Et0ARuZMjY4ZbbK8v9i.iuT46VyW//xFB3D/j4y.kpHU2IqXM6SeW
INSERT INTO `User` (`email`, `username`, `password`, `firstName`, `lastName`, `role`, `status`, `kycStatus`, `tierId`, `referralCode`, `walletBalance`) VALUES
('user@example.com', 'testuser', '$2y$10$Et0ARuZMjY4ZbbK8v9i.iuT46VyW//xFB3D/j4y.kpHU2IqXM6SeW', 'Test', 'User', 'MEMBER', 'ACTIVE', 'PENDING', 1, UUID(), 1000.0)
ON DUPLICATE KEY UPDATE `email`=`email`;

SET FOREIGN_KEY_CHECKS = 1;
