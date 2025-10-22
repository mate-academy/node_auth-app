-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

<<<<<<< HEAD
-- Backfill RefreshToken from legacy Token table if present
INSERT INTO "RefreshToken" ("id","token","userId","expiresAt","revokedAt","createdAt")
SELECT "id","refresh","userId","expiresAt",NULL,"createdAt" FROM "Token";
=======
-- Conditional backfill from legacy Token table
INSERT INTO "RefreshToken" ("id","token","userId","expiresAt","createdAt")
SELECT "id","refresh","userId","expiresAt","createdAt" FROM "Token";
>>>>>>> 0fe3a41 (fix: migrations, auth flows, email, middlewares, 404_V2)
