-- AlterTable
ALTER TABLE "users_auth" ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "social_accounts_auth" (
    "id" SERIAL NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "providerId" VARCHAR(255) NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_accounts_auth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "social_accounts_auth_provider_providerId_key" ON "social_accounts_auth"("provider", "providerId");

-- AddForeignKey
ALTER TABLE "social_accounts_auth" ADD CONSTRAINT "social_accounts_auth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users_auth"("id") ON DELETE CASCADE ON UPDATE CASCADE;
