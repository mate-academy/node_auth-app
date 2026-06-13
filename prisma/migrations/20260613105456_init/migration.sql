/*
  Warnings:

  - You are about to drop the column `tokenHash` on the `change_email_tokens` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token]` on the table `change_email_tokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token` to the `change_email_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "change_email_tokens_tokenHash_key";

-- AlterTable
ALTER TABLE "change_email_tokens" DROP COLUMN "tokenHash",
ADD COLUMN     "token" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "change_email_tokens_token_key" ON "change_email_tokens"("token");
