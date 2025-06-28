-- AlterTable
ALTER TABLE "screening_fleets" ADD COLUMN "meetupLocation" TEXT;
ALTER TABLE "screening_fleets" ADD COLUMN "secondICName" TEXT;

-- CreateTable
CREATE TABLE "blacklist_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discordId" TEXT,
    "name" TEXT,
    "reason" TEXT NOT NULL,
    "addedBy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "removedBy" TEXT,
    "removedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "command_structure_roles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "permissions" TEXT NOT NULL,
    "assignedUserId" TEXT,
    "flagCountry" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "command_structure_roles_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
