/*
  Warnings:

  - A unique constraint covering the columns `[pendingEmail]` on the table `users_auth` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users_auth" ADD COLUMN     "pendingEmail" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_pendingEmail_key" ON "users_auth"("pendingEmail");
