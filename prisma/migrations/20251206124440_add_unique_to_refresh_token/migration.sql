/*
  Warnings:

  - A unique constraint covering the columns `[refreshToken]` on the table `tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tokens_refreshToken_key" ON "public"."tokens"("refreshToken");
