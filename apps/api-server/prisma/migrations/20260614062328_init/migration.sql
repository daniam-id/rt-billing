-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Household" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "houseNumber" TEXT NOT NULL,
    "headOfFamily" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BillType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "chargeType" TEXT NOT NULL,
    "ratePerUnit" DECIMAL NOT NULL,
    "unit" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BillRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "householdId" TEXT NOT NULL,
    "billTypeId" TEXT NOT NULL,
    "periodMonth" TEXT NOT NULL,
    "totalAmount" DECIMAL NOT NULL DEFAULT 0,
    "initialMeter" INTEGER,
    "finalMeter" INTEGER,
    "paymentStat" TEXT NOT NULL DEFAULT 'Pending',
    "paidAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BillRecord_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BillRecord_billTypeId_fkey" FOREIGN KEY ("billTypeId") REFERENCES "BillType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Household_houseNumber_key" ON "Household"("houseNumber");

-- CreateIndex
CREATE INDEX "Household_status_idx" ON "Household"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BillType_name_key" ON "BillType"("name");

-- CreateIndex
CREATE INDEX "BillRecord_householdId_periodMonth_paymentStat_idx" ON "BillRecord"("householdId", "periodMonth", "paymentStat");

-- CreateIndex
CREATE INDEX "BillRecord_periodMonth_idx" ON "BillRecord"("periodMonth");

-- CreateIndex
CREATE UNIQUE INDEX "BillRecord_householdId_billTypeId_periodMonth_key" ON "BillRecord"("householdId", "billTypeId", "periodMonth");
