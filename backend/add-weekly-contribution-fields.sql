-- Add weekly contribution tracking fields
ALTER TABLE Contribution ADD COLUMN weekStartDate DATETIME;
ALTER TABLE Contribution ADD COLUMN weekEndDate DATETIME;
ALTER TABLE Contribution ADD COLUMN paidAt DATETIME;
ALTER TABLE Contribution ADD COLUMN lateFee REAL DEFAULT 0;

-- Update status enum to include LATE
-- SQLite doesn't have enum, so status is TEXT and can accept any value
