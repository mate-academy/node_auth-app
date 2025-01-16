/*
  Warnings:

  - Added the required column `access_token` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refresh_token` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "access_token" VARCHAR(255) NOT NULL,
ADD COLUMN     "refresh_token" VARCHAR(255) NOT NULL;
