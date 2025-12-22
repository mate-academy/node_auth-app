-- AlterTable
ALTER TABLE "tokens" ADD COLUMN     "resetExpires" TIMESTAMPTZ(6),
ADD COLUMN     "resetTokenHash" VARCHAR(255),
ALTER COLUMN "updatedAt" DROP DEFAULT;
