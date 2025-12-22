/*
  Warnings:

  - The `activationToken` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "activationToken",
ADD COLUMN     "activationToken" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "users_activationToken_key" ON "users"("activationToken");
