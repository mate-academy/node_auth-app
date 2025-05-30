/*
  Warnings:

  - You are about to drop the column `activationToken` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_activationToken_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "activationToken",
ADD COLUMN     "passwordResetToken" TEXT,
ADD COLUMN     "passwordResetTokenExpires" TIMESTAMP(3);
