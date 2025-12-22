/*
  Warnings:

  - You are about to drop the column `resetExpires` on the `tokens` table. All the data in the column will be lost.
  - You are about to drop the column `resetInterval` on the `tokens` table. All the data in the column will be lost.
  - You are about to drop the column `resetTokenHash` on the `tokens` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tokens" DROP COLUMN "resetExpires",
DROP COLUMN "resetInterval",
DROP COLUMN "resetTokenHash";

-- CreateTable
CREATE TABLE "reset_tokens" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "resetTokenHash" VARCHAR(255),
    "resetExpires" TIMESTAMPTZ(6),
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reset_tokens_user_id_key" ON "reset_tokens"("user_id");

-- AddForeignKey
ALTER TABLE "reset_tokens" ADD CONSTRAINT "reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
