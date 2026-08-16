/*
  Warnings:

  - A unique constraint covering the columns `[resetPasswordJti]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "resetPasswordJti" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_resetPasswordJti_key" ON "users"("resetPasswordJti");
