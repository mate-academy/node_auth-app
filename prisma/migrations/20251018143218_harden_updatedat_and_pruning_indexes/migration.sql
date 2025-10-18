/*
  Warnings:

  - Added the required column `updatedAt` to the `PasswordReset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PasswordReset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PasswordReset" ("createdAt", "expiresAt", "id", "token", "userId") SELECT "createdAt", "expiresAt", "id", "token", "userId" FROM "PasswordReset";
DROP TABLE "PasswordReset";
ALTER TABLE "new_PasswordReset" RENAME TO "PasswordReset";
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "PasswordReset"("token");
CREATE INDEX "PasswordReset_userId_idx" ON "PasswordReset"("userId");
CREATE INDEX "PasswordReset_expiresAt_idx" ON "PasswordReset"("expiresAt");
CREATE TABLE "new_RefreshToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RefreshToken" ("createdAt", "expiresAt", "id", "revokedAt", "token", "userId") SELECT "createdAt", "expiresAt", "id", "revokedAt", "token", "userId" FROM "RefreshToken";
DROP TABLE "RefreshToken";
ALTER TABLE "new_RefreshToken" RENAME TO "RefreshToken";
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
