/*
  Warnings:

  - You are about to drop the column `resetToken` on the `users_auth` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[passwordResetToken]` on the table `users_auth` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pendingEmailToken]` on the table `users_auth` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "users_auth_resetToken_key";

-- AlterTable
ALTER TABLE "users_auth" DROP COLUMN "resetToken",
ADD COLUMN     "passwordResetToken" VARCHAR(255),
ADD COLUMN     "pendingEmailToken" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_passwordResetToken_key" ON "users_auth"("passwordResetToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_pendingEmailToken_key" ON "users_auth"("pendingEmailToken");
