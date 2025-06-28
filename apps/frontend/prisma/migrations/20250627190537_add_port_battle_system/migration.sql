-- CreateTable
CREATE TABLE "port_battles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "portName" TEXT NOT NULL,
    "meetupTime" DATETIME NOT NULL,
    "battleStartTime" DATETIME NOT NULL,
    "isDeepWater" BOOLEAN NOT NULL,
    "meetupLocation" TEXT NOT NULL,
    "brLimit" INTEGER NOT NULL,
    "commanderName" TEXT,
    "secondICName" TEXT,
    "reqCommanderName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "port_battles_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fleet_setups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "portBattleId" TEXT NOT NULL,
    "setupName" TEXT NOT NULL DEFAULT 'Main Fleet',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "setupOrder" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "fleet_setups_portBattleId_fkey" FOREIGN KEY ("portBattleId") REFERENCES "port_battles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fleet_roles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fleetSetupId" TEXT NOT NULL,
    "roleOrder" INTEGER NOT NULL,
    "shipName" TEXT NOT NULL,
    "brValue" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "fleet_roles_fleetSetupId_fkey" FOREIGN KEY ("fleetSetupId") REFERENCES "fleet_setups" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "port_battle_signups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fleetRoleId" TEXT NOT NULL,
    "captainName" TEXT NOT NULL,
    "clanName" TEXT NOT NULL,
    "shipName" TEXT NOT NULL,
    "books" INTEGER NOT NULL DEFAULT 1,
    "alternateShip" TEXT,
    "alternateBooks" INTEGER DEFAULT 1,
    "willingToScreen" BOOLEAN NOT NULL DEFAULT false,
    "comments" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "signupTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastEditTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "port_battle_signups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "port_battle_signups_fleetRoleId_fkey" FOREIGN KEY ("fleetRoleId") REFERENCES "fleet_roles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "screening_fleets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "portBattleId" TEXT NOT NULL,
    "fleetType" TEXT NOT NULL,
    "observation" TEXT,
    "shipsRequired" TEXT NOT NULL,
    "nation" TEXT NOT NULL,
    "commanderName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "screening_fleets_portBattleId_fkey" FOREIGN KEY ("portBattleId") REFERENCES "port_battles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "screening_signups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "screeningFleetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "captainName" TEXT NOT NULL,
    "clanName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "signupTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "screening_signups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "screening_signups_screeningFleetId_fkey" FOREIGN KEY ("screeningFleetId") REFERENCES "screening_fleets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "captains_codes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "portBattleId" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "maxUsage" INTEGER,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "captains_codes_portBattleId_fkey" FOREIGN KEY ("portBattleId") REFERENCES "port_battles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_strikes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "issuedBy" TEXT,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "removedBy" TEXT,
    "removedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_strikes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "clans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "region" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "discordId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "canCreatePortBattles" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_users" ("createdAt", "discordId", "email", "id", "updatedAt", "username") SELECT "createdAt", "discordId", "email", "id", "updatedAt", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_discordId_key" ON "users"("discordId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "port_battle_signups_userId_fleetRoleId_key" ON "port_battle_signups"("userId", "fleetRoleId");

-- CreateIndex
CREATE UNIQUE INDEX "screening_signups_userId_screeningFleetId_key" ON "screening_signups"("userId", "screeningFleetId");

-- CreateIndex
CREATE UNIQUE INDEX "captains_codes_code_key" ON "captains_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "clans_name_key" ON "clans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ports_name_key" ON "ports"("name");
