/*
  Warnings:

  - A unique constraint covering the columns `[activationToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "users_activationToken_key" ON "users"("activationToken");
