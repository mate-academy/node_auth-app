/*
  Warnings:

  - A unique constraint covering the columns `[resetToken]` on the table `users_auth` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users_auth" ADD COLUMN     "resetToken" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_resetToken_key" ON "users_auth"("resetToken");
