/*
  Warnings:

  - Added the required column `userName` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "userName" VARCHAR(50) NOT NULL;
