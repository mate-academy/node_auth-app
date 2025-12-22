/*
  Warnings:

  - You are about to drop the column `userId` on the `tokens` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `tokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `tokens` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tokens" DROP CONSTRAINT "tokens_userId_fkey";

-- AlterTable
ALTER TABLE "tokens" DROP COLUMN "userId",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tokens_user_id_key" ON "tokens"("user_id");

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
