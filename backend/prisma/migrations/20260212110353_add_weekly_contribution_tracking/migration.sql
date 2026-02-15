-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contribution" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PAID',
    "description" TEXT,
    "weekStartDate" DATETIME,
    "weekEndDate" DATETIME,
    "paidAt" DATETIME,
    "lateFee" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Contribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Contribution" ("amount", "createdAt", "description", "id", "status", "userId", "weekNumber") SELECT "amount", "createdAt", "description", "id", "status", "userId", "weekNumber" FROM "Contribution";
DROP TABLE "Contribution";
ALTER TABLE "new_Contribution" RENAME TO "Contribution";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
