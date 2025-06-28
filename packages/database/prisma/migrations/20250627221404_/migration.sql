/*
  Warnings:

  - You are about to drop the column `cooldownUntil` on the `application_cooldowns` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `application_cooldowns` table. All the data in the column will be lost.
  - You are about to drop the column `additionalInfo` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `age` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `discordActivity` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `expectations` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `gameplayStyle` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `nwExperience` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `portBattleAvail` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `previousGuilds` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `previousRejection` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `realName` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `referredBy` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `voiceChatComfort` on the `applications` table. All the data in the column will be lost.
  - Added the required column `canReapplyAt` to the `application_cooldowns` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discordId` to the `application_cooldowns` table without a default value. This is not possible if the table is not empty.
  - Added the required column `applicantName` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `captainName` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentNation` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentRank` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `declarationAccuracy` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `declarationHonor` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `declarationRules` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discordId` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hoursInNavalAction` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isCrafter` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isPortBattleCommander` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `portBattleAvailability` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preferredRole` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signature` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `steamConnected` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeZone` to the `applications` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_application_cooldowns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discordId" TEXT NOT NULL,
    "canReapplyAt" DATETIME NOT NULL,
    "reason" TEXT NOT NULL,
    "overriddenBy" TEXT,
    "overriddenAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_application_cooldowns" ("createdAt", "id", "overriddenAt", "overriddenBy", "reason") SELECT "createdAt", "id", "overriddenAt", "overriddenBy", "reason" FROM "application_cooldowns";
DROP TABLE "application_cooldowns";
ALTER TABLE "new_application_cooldowns" RENAME TO "application_cooldowns";
CREATE UNIQUE INDEX "application_cooldowns_discordId_key" ON "application_cooldowns"("discordId");
CREATE TABLE "new_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "discordId" TEXT NOT NULL,
    "discordUsername" TEXT NOT NULL,
    "applicantName" TEXT NOT NULL,
    "email" TEXT,
    "captainName" TEXT NOT NULL,
    "preferredNickname" TEXT,
    "currentNation" TEXT NOT NULL,
    "timeZone" TEXT NOT NULL,
    "hoursInNavalAction" INTEGER NOT NULL,
    "steamConnected" BOOLEAN NOT NULL,
    "currentRank" TEXT NOT NULL,
    "previousCommands" TEXT,
    "preferredRole" TEXT NOT NULL,
    "isPortBattleCommander" BOOLEAN NOT NULL,
    "commanderExperience" TEXT,
    "isCrafter" BOOLEAN NOT NULL,
    "weeklyPlayTime" INTEGER NOT NULL,
    "portBattleAvailability" TEXT NOT NULL,
    "typicalSchedule" TEXT NOT NULL,
    "declarationAccuracy" BOOLEAN NOT NULL,
    "declarationHonor" BOOLEAN NOT NULL,
    "declarationRules" BOOLEAN NOT NULL,
    "signature" TEXT NOT NULL,
    "discordChannelId" TEXT,
    "applicationEmbed" TEXT,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_applications" ("applicationEmbed", "discordChannelId", "discordUsername", "id", "reviewedAt", "status", "submittedAt", "typicalSchedule", "updatedAt", "userId", "weeklyPlayTime") SELECT "applicationEmbed", "discordChannelId", "discordUsername", "id", "reviewedAt", "status", "submittedAt", "typicalSchedule", "updatedAt", "userId", "weeklyPlayTime" FROM "applications";
DROP TABLE "applications";
ALTER TABLE "new_applications" RENAME TO "applications";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
