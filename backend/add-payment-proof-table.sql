-- Add PaymentProof table for manual payment approval system
CREATE TABLE IF NOT EXISTS PaymentProof (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    amount REAL NOT NULL,
    proofImageUrl TEXT NOT NULL,
    bankName TEXT,
    accountName TEXT,
    transactionRef TEXT,
    status TEXT DEFAULT 'PENDING',
    adminId INTEGER,
    adminNote TEXT,
    processedAt DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_proof_status ON PaymentProof(status);
CREATE INDEX IF NOT EXISTS idx_payment_proof_user ON PaymentProof(userId);
