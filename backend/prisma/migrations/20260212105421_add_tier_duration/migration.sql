-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "weeklyAmount" REAL NOT NULL DEFAULT 1333.33,
    "onboardingFee" REAL NOT NULL DEFAULT 3000,
    "maintenanceFee" REAL NOT NULL DEFAULT 100,
    "upgradeFee" REAL NOT NULL DEFAULT 0,
    "durationWeeks" INTEGER NOT NULL DEFAULT 45,
    "maxWithdrawal" REAL,
    "bvThreshold" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Tier" ("bvThreshold", "createdAt", "id", "maintenanceFee", "maxWithdrawal", "name", "onboardingFee", "upgradeFee", "weeklyAmount") SELECT "bvThreshold", "createdAt", "id", "maintenanceFee", "maxWithdrawal", "name", "onboardingFee", "upgradeFee", "weeklyAmount" FROM "Tier";
DROP TABLE "Tier";
ALTER TABLE "new_Tier" RENAME TO "Tier";
CREATE UNIQUE INDEX "Tier_name_key" ON "Tier"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
