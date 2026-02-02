-- Database Schema for ValueHills Platform
-- MySQL Database

-- Create Database (run this first in phpMyAdmin)
-- CREATE DATABASE valuehills CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Users Table
CREATE TABLE IF NOT EXISTS User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    username VARCHAR(191) NOT NULL UNIQUE,
    password VARCHAR(191) NOT NULL,
    firstName VARCHAR(191) NOT NULL,
    lastName VARCHAR(191) NOT NULL,
    phone VARCHAR(191) UNIQUE,
    role VARCHAR(191) NOT NULL DEFAULT 'MEMBER',
    status VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    transactionPin VARCHAR(191),
    kycDocUrl VARCHAR(191),
    kycStatus VARCHAR(191) NOT NULL DEFAULT 'PENDING',
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
    FOREIGN KEY (tierId) REFERENCES Tier(id),
    FOREIGN KEY (referredBy) REFERENCES User(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tiers Table
CREATE TABLE IF NOT EXISTS Tier (
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

-- Contributions Table
CREATE TABLE IF NOT EXISTS Contribution (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    weekNumber INT NOT NULL,
    amount DOUBLE NOT NULL,
    status VARCHAR(191) NOT NULL DEFAULT 'PAID',
    description VARCHAR(191),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions Table
CREATE TABLE IF NOT EXISTS Transaction (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    amount DOUBLE NOT NULL,
    ledgerType VARCHAR(191) NOT NULL,
    type VARCHAR(191) NOT NULL,
    direction VARCHAR(191) NOT NULL,
    status VARCHAR(191) NOT NULL DEFAULT 'SUCCESS',
    reference VARCHAR(191) UNIQUE,
    description VARCHAR(191),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Withdrawals Table
CREATE TABLE IF NOT EXISTS Withdrawal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    amount DOUBLE NOT NULL,
    status VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    fee DOUBLE NOT NULL DEFAULT 0.0,
    adminId INT,
    processedAt DATETIME,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (adminId) REFERENCES User(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AuditLogs Table
CREATE TABLE IF NOT EXISTS AuditLog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    adminId INT NOT NULL,
    action VARCHAR(191) NOT NULL,
    targetUserId INT,
    details VARCHAR(191),
    ipAddress VARCHAR(191),
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adminId) REFERENCES User(id),
    FOREIGN KEY (targetUserId) REFERENCES User(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SystemConfig Table
CREATE TABLE IF NOT EXISTS SystemConfig (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(191) NOT NULL UNIQUE,
    value VARCHAR(191) NOT NULL,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Indexes for Better Performance
CREATE INDEX idx_user_email ON User(email);
CREATE INDEX idx_user_username ON User(username);
CREATE INDEX idx_user_referralCode ON User(referralCode);
CREATE INDEX idx_user_role ON User(role);
CREATE INDEX idx_contribution_userId ON Contribution(userId);
CREATE INDEX idx_transaction_userId ON Transaction(userId);
CREATE INDEX idx_transaction_reference ON Transaction(reference);
CREATE INDEX idx_withdrawal_userId ON Withdrawal(userId);
CREATE INDEX idx_withdrawal_status ON Withdrawal(status);
CREATE INDEX idx_auditlog_adminId ON AuditLog(adminId);
CREATE INDEX idx_auditlog_timestamp ON AuditLog(timestamp);

-- Insert Default Tiers
INSERT INTO Tier (name, weeklyAmount, onboardingFee, maintenanceFee, upgradeFee) VALUES
('STARTER', 1333.33, 3000, 100, 0),
('PRO', 2666.66, 5000, 150, 2000),
('ELITE', 4000.00, 8000, 200, 3000)
ON DUPLICATE KEY UPDATE name=name;

-- Insert Default System Config
INSERT INTO SystemConfig (`key`, value) VALUES
('company_bank_name', ''),
('company_account_number', ''),
('company_account_name', '')
ON DUPLICATE KEY UPDATE `key`=`key`;

-- Insert Admin User (Password: MyPassword123 - bcrypt hash)
INSERT INTO User (email, username, password, firstName, lastName, role, status, kycStatus) VALUES
('admin@valuehills.com', 'admin', '$2a$10$ewvJmGiybJZpB8ooTR57YenEK5uYHHaXggNI/QvBwRuVx/6Ykr64i', 'System', 'Administrator', 'SUPERADMIN', 'ACTIVE', 'VERIFIED')
ON DUPLICATE KEY UPDATE username=username;

-- Insert a Sample Member User (Password: user123 - bcrypt hash)
INSERT INTO User (email, username, password, firstName, lastName, role, status, kycStatus, tierId, referralCode) VALUES
('member@example.com', 'member', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/nMskyB.5NURGHsCWdFMqG', 'John', 'Doe', 'MEMBER', 'ACTIVE', 'VERIFIED', 1, 'REF-INITIAL-001')
ON DUPLICATE KEY UPDATE username=username;
